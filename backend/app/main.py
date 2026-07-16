from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import auth, repository, review, webhook

app = FastAPI(
    title="GitHub Pull Request Review Agent API",
    description="Enterprise-ready, asynchronous, AI-driven pull request audit agent",
    version="1.0.0"
)

# Configure cross-origin resources for modular React Dashboard clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to dashboard domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect system routers
app.include_router(auth.router, prefix="/api")
app.include_router(repository.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(webhook.router, prefix="/api")

@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Standard deployment node check confirming that the server and ingress pathways are alive.
    """
    return {
        "status": "healthy",
        "service": "GitHub Pull Request Review Agent Backend",
        "api_version": "1.0.0"
    }
