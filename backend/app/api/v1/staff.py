"""
Arogya Link — api/v1/staff.py
================================
Staff management and profile endpoints.

Endpoints:
  - GET /staff/me                 : Get current user's profile and role.
  - GET /staff                    : List all staff profiles (Admin only).
  - POST /staff/{user_id}/deactivate : Deactivate staff profile (Admin only).
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import AuthUser, get_current_user, require_admin
from app.models.staff import StaffProfile

router = APIRouter(prefix="/staff", tags=["staff"])


class StaffProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    role: str | None = None
    active: bool

    model_config = ConfigDict(from_attributes=True)


@router.get("/me", response_model=StaffProfileResponse)
async def get_my_profile(
    user: AuthUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Return the profile info for the currently authenticated staff member."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "active": user.active,
    }


@router.get("", response_model=list[StaffProfileResponse])
async def list_staff_profiles(
    admin: AuthUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[StaffProfile]:
    """List all staff profiles (Admin only)."""
    result = await db.execute(select(StaffProfile))
    profiles = result.scalars().all()
    return list(profiles)


@router.post("/{user_id}/deactivate")
async def deactivate_staff(
    user_id: str,
    admin: AuthUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Deactivate a staff profile by user_id (Admin only)."""
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format for user_id.",
        )

    stmt = select(StaffProfile).where(StaffProfile.id == target_uuid)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found.",
        )

    profile.active = False
    await db.commit()

    return {"message": f"Staff member {user_id} has been deactivated."}
