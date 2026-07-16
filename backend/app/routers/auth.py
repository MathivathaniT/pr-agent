from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid

from backend.app.core.database import get_db
from backend.app.core.security import create_access_token, get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "mock_client_id")

@router.get("/config")
def get_auth_config():
    """
    Exposes OAuth configuration constants for frontend construction.
    """
    return {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": os.getenv("GITHUB_REDIRECT_URI", "http://localhost:3000/auth/callback"),
        "scopes": "repo,read:org,user"
    }

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve the current logged-in user profile using validation tokens.
    """
    return current_user

@router.post("/mock-login", response_model=Token)
def mock_login(db: Session = Depends(get_db)):
    """
    Staging & Developer sandbox OAuth route creating a default admin engineer account
    so recruiters or developers can access the dashboard instantly without credentials configuration.
    """
    # Seed a standard sandbox profile
    admin_user = db.query(User).filter(User.username == "sandbox_engineer").first()
    if not admin_user:
        admin_user = User(
            github_id=999999,
            username="sandbox_engineer",
            email="mathivathanitharanikumar@gmail.com",
            avatar_url="https://avatars.githubusercontent.com/u/999999?v=4",
            encrypted_oauth_token="mock_oauth_token_val",
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
    access_token = create_access_token(
        subject=admin_user.username,
        user_id=admin_user.id
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
