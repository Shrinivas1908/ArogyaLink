"""
Arogya Link — tests/test_auth_boundary.py
===========================================
Authentication boundary integration tests.

Per Phase 1 plan (Person 3):
  - Requesting protected route without header returns 401.
  - Requesting with malformed bearer token returns 401.
  - Requesting with expired token returns 401.
  - Requesting with valid token returns 200.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import jwt
import pytest
from fastapi.testclient import TestClient

from app.main import create_app

client = TestClient(create_app())


def test_protected_route_missing_token():
    """Requesting a protected route without Authorization header must return 401."""
    r = client.get("/health/protected")
    assert r.status_code == 401
    assert "Missing or malformed Authorization bearer token" in r.json()["message"]


def test_protected_route_malformed_token():
    """Requesting with a non-Bearer token scheme must return 401."""
    headers = {"Authorization": "Basic YWRtaW46cGFzc3dvcmQ="}
    r = client.get("/health/protected", headers=headers)
    assert r.status_code == 401
    assert "Missing or malformed Authorization bearer token" in r.json()["message"]


@patch("app.core.deps.get_jwks")
def test_protected_route_invalid_jwt_signature(mock_get_jwks):
    """Requesting with an invalid token signature must return 401."""
    # Mock JWKS returning dummy key
    mock_get_jwks.return_value = {
        "keys": [
            {
                "kid": "test-kid",
                "kty": "RSA",
                "alg": "RS256",
                "n": "dummy-modulus",
                "e": "AQAB",
            }
        ]
    }

    headers = {"Authorization": "Bearer invalid.token.value"}
    r = client.get("/health/protected", headers=headers)
    assert r.status_code == 401
    assert "Invalid token" in r.json()["message"]


@patch("app.core.deps.get_jwks")
@patch("jwt.decode")
@patch("jwt.get_unverified_header")
@patch("jwt.algorithms.RSAAlgorithm.from_jwk")
def test_protected_route_expired_token(mock_from_jwk, mock_get_header, mock_decode, mock_get_jwks):
    """Requesting with an expired token must return 401."""
    mock_get_jwks.return_value = {
        "keys": [
            {
                "kid": "test-kid",
                "kty": "RSA",
                "n": "dummy-modulus",
                "e": "AQAB",
            }
        ]
    }
    mock_get_header.return_value = {"kid": "test-kid"}
    mock_from_jwk.return_value = "dummy-public-key"
    
    # Force ExpiredSignatureError
    mock_decode.side_effect = jwt.ExpiredSignatureError("Token has expired.")

    headers = {"Authorization": "Bearer expired.token.jwt"}
    r = client.get("/health/protected", headers=headers)
    assert r.status_code == 401
    assert "Token has expired" in r.json()["message"]


@patch("app.core.deps.get_jwks")
@patch("jwt.decode")
@patch("jwt.get_unverified_header")
@patch("jwt.algorithms.RSAAlgorithm.from_jwk")
def test_protected_route_valid_token(mock_from_jwk, mock_get_header, mock_decode, mock_get_jwks):
    """Requesting with a valid token must return 200 OK and return user details."""
    mock_get_jwks.return_value = {"keys": [{"kid": "test-kid"}]}
    mock_get_header.return_value = {"kid": "test-kid"}
    mock_from_jwk.return_value = "dummy-public-key"
    
    # Mock decoded claims payload
    mock_decode.return_value = {
        "sub": "user-uuid-1234",
        "email": "doctor@arogyasetu.in",
        "aud": "authenticated"
    }

    headers = {"Authorization": "Bearer valid.token.jwt"}
    r = client.get("/health/protected", headers=headers)
    
    assert r.status_code == 200
    data = r.json()
    assert data["authenticated"] is True
    assert data["user_id"] == "user-uuid-1234"
    assert data["user_email"] == "doctor@arogyasetu.in"
