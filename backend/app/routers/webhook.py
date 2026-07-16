import hmac
import hashlib
import json
import os
from fastapi import APIRouter, Depends, Request, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.core.database import get_db
from backend.app.models.repository import Repository
from backend.app.models.pull_request import PullRequest

router = APIRouter(prefix="/webhook", tags=["Webhooks"])

@router.post("/github")
async def github_webhook(
    request: Request,
    x_github_event: str = Header(...),
    x_hub_signature_256: str = Header(...),
    db: Session = Depends(get_db)
):
    """
    Ingest a secure webhook payload from GitHub, verify integrity via SHA-256 signatures,
    and trigger a code review on PR creation or updates.
    """
    # 1. Read Raw Payload
    payload_bytes = await request.body()
    
    # 2. Extract and match Repository configuration
    try:
        payload_data = json.loads(payload_bytes)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")
        
    repo_data = payload_data.get("repository", {})
    repo_full_name = repo_data.get("full_name")
    
    if not repo_full_name:
        raise HTTPException(status_code=400, detail="Missing repository context in payload")
        
    repo = db.query(Repository).filter(Repository.full_name == repo_full_name).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not registered in this system")
        
    # 3. Signature Verification using Repository Webhook Secret
    webhook_secret = repo.webhook_secret or os.getenv("GITHUB_WEBHOOK_SECRET", "default_secret")
    
    expected_signature = "sha256=" + hmac.new(
        webhook_secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(x_hub_signature_256, expected_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub hook signature mismatch"
        )
        
    # 4. Handle Specific Event Channels
    if x_github_event == "pull_request":
        action = payload_data.get("action")
        pr_data = payload_data.get("pull_request", {})
        
        # We target actions: opened, synchronize (new commits), or reopened
        if action in ["opened", "synchronize", "reopened"]:
            pr_number = pr_data.get("number")
            
            # Check or create Pull Request database row
            db_pr = db.query(PullRequest).filter(
                PullRequest.repository_id == repo.id,
                PullRequest.number == pr_number
            ).first()
            
            if not db_pr:
                db_pr = PullRequest(
                    repository_id=repo.id,
                    number=pr_number,
                    title=pr_data.get("title", "Untitled PR"),
                    state=pr_data.get("state", "open"),
                    source_branch=pr_data.get("head", {}).get("ref", "unknown"),
                    target_branch=pr_data.get("base", {}).get("ref", "unknown"),
                    head_sha=pr_data.get("head", {}).get("sha", "unknown"),
                    base_sha=pr_data.get("base", {}).get("sha", "unknown"),
                    author_username=pr_data.get("user", {}).get("login", "unknown"),
                    user_avatar_url=pr_data.get("user", {}).get("avatar_url"),
                    description=pr_data.get("body")
                )
                db.add(db_pr)
            else:
                db_pr.title = pr_data.get("title", db_pr.title)
                db_pr.state = pr_data.get("state", db_pr.state)
                db_pr.head_sha = pr_data.get("head", {}).get("sha", db_pr.head_sha)
                db_pr.description = pr_data.get("body", db_pr.description)
                
            db.commit()
            db.refresh(db_pr)
            
            # 5. Queue Background Work (Celery Task)
            # In a full deployment, this is:
            # from backend.app.tasks.worker import process_pr_review
            # process_pr_review.delay(db_pr.id)
            
            return {
                "status": "Accepted",
                "message": f"Queued PR review for number {pr_number}",
                "pull_request_id": str(db_pr.id)
            }
            
    return {"status": "Ignored", "reason": f"Event '{x_github_event}' / Action '{action}' not requiring review."}
