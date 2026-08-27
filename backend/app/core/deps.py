"""
Arogya Link — core/deps.py
============================
FastAPI dependency injection utilities.

Per Phase 1 plan (Person 2):
  - Implement get_current_user() as a FastAPI dependency.
  - Extract Bearer token from Authorization header.
  - Validate JWT signature, aud=authenticated, and exp claims.
  - Fetch and cache Supabase JWKS to avoid network round-trips on every request.
  - Raise 401 Unauthorized for missing, malformed, or expired tokens.
"""

from __future__ import annotations

import time
from typing import Any

import httpx
import jwt
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.staff import StaffProfile

# HTTPBearer extracts Authorization: Bearer <JWT>
security = HTTPBearer(auto_error=False)

# In-memory JWKS cache
_JWKS_CACHE: dict[str, Any] = {}
_JWKS_CACHE_EXPIRY: float = 0.0
_CACHE_LIFETIME_SECS: float = 3600.0  # Cache keys for 1 hour


class AuthUser(BaseModel):
    """Authenticated user info parsed from Supabase JWT claims and DB staff profile."""
    id: str
    email: str
    role: str | None = None
    full_name: str | None = None
    active: bool = True


async def get_jwks() -> dict[str, Any]:
    """Fetch and cache JWKS keys from the Supabase Auth JWKS endpoint."""
    global _JWKS_CACHE, _JWKS_CACHE_EXPIRY
    now = time.time()

    if _JWKS_CACHE and now < _JWKS_CACHE_EXPIRY:
        return _JWKS_CACHE

    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_URL is not configured in backend settings.",
        )

    jwks_url = f"{settings.supabase_url}/rest/v1/auth/v1/jwks"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"apikey": settings.supabase_anon_key}
            r = await client.get(jwks_url, headers=headers)
            r.raise_for_status()
            keys_data = r.json()
            _JWKS_CACHE = keys_data
            _JWKS_CACHE_EXPIRY = now + _CACHE_LIFETIME_SECS
            return _JWKS_CACHE
    except Exception as e:
        # Fallback to expired cache if fetch fails, else raise
        if _JWKS_CACHE:
            return _JWKS_CACHE
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch Supabase JWKS keys: {e}",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> AuthUser:
    """FastAPI dependency: extracts and validates the Supabase access token.
    Also looks up the staff profile in PostgreSQL to populate role and active status.

    Raises:
        HTTPException: 401 if missing, malformed, or expired.
        HTTPException: 403 if deactivated.
    """
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        # 1. Fetch JWKS keys
        jwks = await get_jwks()
        
        # 2. Get the signing key matching kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise jwt.PyJWTError("Token header is missing 'kid'.")

        public_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break

        if not public_key:
            raise jwt.PyJWTError("Matching public key not found in JWKS.")

        # 3. Decode and verify token claims
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.supabase_jwt_aud,
            options={"require": ["exp", "aud", "sub"]},
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id or not email:
            raise jwt.PyJWTError("Token payload missing required user claims.")

        # 4. Fetch staff profile role and active status
        if db is not None:
            try:
                user_uuid = uuid.UUID(user_id)
                stmt = select(StaffProfile).where(StaffProfile.id == user_uuid)
                result = await db.execute(stmt)
                profile = result.scalar_one_or_none()
                if profile is not None:
                    if not profile.active:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail="Staff account is deactivated.",
                        )
                    return AuthUser(
                        id=user_id,
                        email=email,
                        role=profile.role,
                        full_name=profile.full_name,
                        active=profile.active,
                    )
            except HTTPException:
                raise
            except Exception:
                pass

        return AuthUser(id=user_id, email=email)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_doctor(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Dependency that restricts access to users with 'doctor' or 'admin' role."""
    if current_user.role not in ("doctor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor or Admin access required.",
        )
    return current_user


async def require_admin(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Dependency that restricts access to users with 'admin' role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user

