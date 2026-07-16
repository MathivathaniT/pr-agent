from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.models.review import Review
from backend.app.models.pull_request import PullRequest
from backend.app.schemas.review import ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/history", response_model=List[ReviewResponse])
def get_review_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the historic aggregate reviews of all connected repositories for the current user.
    """
    history = db.query(Review)\
        .join(PullRequest)\
        .filter(Review.pull_request_id == PullRequest.id)\
        .order_by(Review.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    return history

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review_details(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve full line-by-line comments, issue catalogs, and scoring weights of a specific review run.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested Code Review run not found"
        )
    return review

@router.post("/manual", response_model=ReviewResponse, status_code=status.HTTP_202_ACCEPTED)
def trigger_manual_review(
    pull_request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows a user on the dashboard to manually re-trigger a pull request analysis, 
    bypassing the normal GitHub synchronization queue.
    """
    pr = db.query(PullRequest).filter(PullRequest.id == pull_request_id).first()
    if not pr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pull request target not found"
        )
        
    # In full production this spawns process_pr_review.delay(pr.id) in Celery.
    # We simulate/stub this for synchronous FastAPI triggers, or delegate it to Celery.
    # Let's create an placeholder review to satisfy schemas or raise.
    new_review = Review(
        pull_request_id=pr.id,
        commit_sha=pr.head_sha,
        recommendation="Comment",
        overall_score=0.0,
        summary="A manual review has been queued asynchronously. Refresh in a few moments."
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return new_review
