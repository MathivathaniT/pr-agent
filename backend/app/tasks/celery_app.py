import os
from celery import Celery

# Celery application configuration using Redis as the transactional message broker
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "github_agent_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["backend.app.tasks.worker"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    # Separate queues for high-priority webhook triage vs deep analysis review jobs
    task_routes={
        "backend.app.tasks.worker.process_pr_review": {"queue": "reviews"},
        "backend.app.tasks.worker.post_github_status": {"queue": "notifications"}
    }
)
