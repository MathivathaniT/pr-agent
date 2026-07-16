# GitHub Pull Request Review Agent — Folder Structure Specification

This document presents the standardized, enterprise-grade folder structure for the **GitHub Pull Request Review Agent**. It separates the decoupled Python backend, the interactive React/Vite dashboard, database models, background queues, and containerized deployment specs.

---

## 1. Directory Tree Layout

```
.
├── backend/                       # Python FastAPI Enterprise Stack
│   ├── app/
│   │   ├── main.py                # FastAPI Application Entry
│   │   ├── core/                  # Security, Config & Session Management
│   │   │   ├── config.py          # Settings validation (Pydantic)
│   │   │   ├── security.py        # Token validation (JWT, bcrypt)
│   │   │   └── database.py        # SQLAlchemy Engine, Session & Base class
│   │   ├── models/                # SQLAlchemy Relational Models (Declarative)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── repository.py
│   │   │   ├── pull_request.py
│   │   │   ├── review.py
│   │   │   ├── comment.py
│   │   │   ├── issue.py
│   │   │   ├── llm_response.py
│   │   │   └── audit_log.py
│   │   ├── schemas/               # Pydantic Serialization/Validation Models
│   │   │   ├── user.py
│   │   │   ├── repository.py
│   │   │   ├── pull_request.py
│   │   │   ├── review.py
│   │   │   ├── comment.py
│   │   │   └── issue.py
│   │   ├── routers/               # API Controllers (Gated by JWT/OAuth)
│   │   │   ├── auth.py            # GitHub OAuth Flow & Session Setup
│   │   │   ├── webhook.py         # Signature validation & Webhook ingestion
│   │   │   ├── review.py          # Manual review triggers & detailed views
│   │   │   └── repository.py      # Repo configurations & activation
│   │   ├── services/              # External Integrations & Business Logic
│   │   │   ├── github_service.py  # REST client for commits, reviews, comments
│   │   │   ├── gemini_service.py  # Orchestration with the @google/genai SDK
│   │   │   └── linter_service.py  # Static linter execution (flake8, bandit)
│   │   ├── agents/                # AI Agent Layer
│   │   │   └── review_agent.py    # Logic merging linters, prompts & LLM JSON
│   │   ├── prompts/               # Structured Engineering Prompts
│   │   │   └── review_prompts.py  # Highly tuned system & instruction prompts
│   │   ├── utils/                 # General Helpers
│   │   │   ├── crypto.py          # AES-256 state encryption
│   │   │   └── logger.py          # Structured json logging
│   │   └── tasks/                 # Background Job Engine
│   │       ├── celery_app.py      # Celery Init (Redis Broker configuration)
│   │       └── worker.py          # Webhook & Review consumer definitions
│   ├── requirements.txt           # Python backend dependencies
│   └── alembic.ini                # DB Migrations root config
│
├── src/                           # React + Vite Frontend App
│   ├── main.tsx                   # Frontend entrypoint
│   ├── index.css                  # Tailwinds integration & custom styles
│   ├── App.tsx                    # Shell containing layout, router & state
│   ├── types.ts                   # Unified UI Type Declarations
│   └── components/                # Modular Dashboard Views & UI Elements
│       ├── Layout.tsx             # Workspace navigation & top navbar
│       ├── Dashboard.tsx          # Real-time KPIs, active PRs & health meters
│       ├── Repositories.tsx       # Repo toggle board with custom Webhook keys
│       ├── PullRequests.tsx       # Full list of reviews and active streams
│       ├── ReviewDetails.tsx      # In-depth file browser & diff code highlights
│       ├── Analytics.tsx          # Quality, security and performance trend charts
│       ├── Settings.tsx           # Credentials configuration & prompt settings
│       └── WebhookSimulator.tsx   # Interactive testing workbench for reviews
│
├── docker/                        # Multi-Container Orchestration Specs
│   ├── Dockerfile.backend         # Multi-stage production build for FastAPI
│   ├── Dockerfile.frontend        # Multi-stage nginx-hosted React SPA build
│   └── docker-compose.yml         # Dev/Prod local staging orchestrator
│
├── docs/                          # Architecture & Setup Guides
│   ├── architecture.md            # Decoupled high-level diagram & flow
│   └── folder_structure.md        # Current structure & folder roles
│
└── package.json                   # Full-Stack Active Dev Server
```

---

## 2. Design Decisions & Decoupling Strategy

1. **Strict Decoupling of Frontend & Backend**:
   - `backend/` holds all domain-specific python code. This isolates dependencies and guarantees clean builds.
   - `src/` holds our React dashboard, keeping assets lightweight and fast-loading.

2. **Database Domain Breakdown (`backend/app/models/`)**:
   - Isolating database models into separate files rather than a single massive `models.py` allows for excellent modularity, avoids circular import problems in SQLAlchemy, and makes schema definition highly maintainable.

3. **Separation of Services vs. Agents**:
   - **Services** are stateless SDK wrappers (e.g., calling the Gemini endpoint, executing the linter, making a GitHub REST call).
   - **Agents** are stateful coordinators that compile linter outputs, decide prompt instructions, parse JSON outputs, and orchestrate responses.

4. **Task Isolation in Celery**:
   - By creating a separate `tasks/` directory, the FastAPI web nodes never run code-review operations. They merely enqueue lightweight payloads into Redis, protecting API responsiveness.
