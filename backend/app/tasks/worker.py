import uuid
from celery.utils.log import get_task_logger

from backend.app.tasks.celery_app import celery_app
from backend.app.core.database import SessionLocal
from backend.app.agents.review_agent import ReviewAgent

logger = get_task_logger(__name__)

@celery_app.task(name="backend.app.tasks.worker.process_pr_review", bind=True, max_retries=3, default_retry_delay=60)
def process_pr_review(self, pr_id_str: str):
    """
    Asynchronous Celery consumer that pulls a Pull Request event from the task queue,
    creates a transaction session context, executes the code review agent,
    and updates database states.
    """
    logger.info(f"Starting async PR review processing for PR ID: {pr_id_str}")
    
    db = SessionLocal()
    try:
        pr_uuid = uuid.UUID(pr_id_str)
        agent = ReviewAgent(db=db)
        
        # Process complete review (static analysis + Gemini + GitHub annotations)
        review = agent.process_pull_request_review(pull_request_id=pr_uuid)
        
        logger.info(f"Successfully finalized review {review.id} with score {review.overall_score}")
        return {"status": "SUCCESS", "review_id": str(review.id), "score": review.overall_score}
        
    except Exception as exc:
        logger.error(f"Error executing pull request review: {str(exc)}")
        db.rollback()
        # Exponential backoff and retry in case of transient GitHub or Gemini rate-limiting failures
        raise self.retry(exc=exc)
        
    finally:
        db.close()
