from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.repository import Repository
from backend.app.schemas.repository import RepositoryResponse, RepositoryCreate, RepositoryUpdate

router = APIRouter(prefix="/repositories", tags=["Repositories"])

@router.get("/", response_model=List[RepositoryResponse])
def list_repositories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all repositories belonging to the current user.
    """
    repos = db.query(Repository).filter(Repository.owner_id == current_user.id).all()
    return repos

@router.post("/", response_model=RepositoryResponse, status_code=status.HTTP_21_CREATED)
def connect_repository(
    repo_data: RepositoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Connect a new GitHub repository to the agent and register an internal webhook handler.
    """
    # Check if already registered
    existing_repo = db.query(Repository).filter(
        Repository.full_name == repo_data.full_name
    ).first()
    
    if existing_repo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository is already registered and monitored"
        )
        
    db_repo = Repository(
        github_repo_id=repo_data.github_repo_id,
        name=repo_data.name,
        full_name=repo_data.full_name,
        owner_id=current_user.id,
        is_active=repo_data.is_active,
        branches_whitelist=repo_data.branches_whitelist,
        custom_review_instructions=repo_data.custom_review_instructions,
        webhook_secret=repo_data.webhook_secret
    )
    
    db.add(db_repo)
    db.commit()
    db.refresh(db_repo)
    return db_repo

@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(
    repo_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details of a specific monitored repository.
    """
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.owner_id == current_user.id
    ).first()
    
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found or access denied"
        )
    return repo

@router.put("/{repo_id}", response_model=RepositoryResponse)
def update_repository(
    repo_id: uuid.UUID,
    repo_update: RepositoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update monitoring status, branch whitelist, or custom system prompts for code review.
    """
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.owner_id == current_user.id
    ).first()
    
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found or access denied"
        )
        
    update_dict = repo_update.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(repo, key, value)
        
    db.commit()
    db.refresh(repo)
    return repo
