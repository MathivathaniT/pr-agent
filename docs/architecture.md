# GitHub Pull Request Review Agent — System Architecture Specification

This document outlines the production-ready system architecture for the **GitHub Pull Request Review Agent**. It is designed to scale under heavy loads (hundreds of PR events per minute), maintain complete data integrity, provide millisecond-latency UI updates, and return highly reliable, senior-engineer-level review comments.

---

## 1. High-Level System Architecture

The application is structured around a decoupled, asynchronous, event-driven architecture using **FastAPI** as the API gateway, **Celery** with **Redis** as the task queue/broker, **PostgreSQL** as the database of record, and **React + Vite** as the management dashboard.

```
                  ┌──────────────────────────────────────────┐
                  │               GitHub VCS                 │
                  └──────┬────────────────────────────▲──────┘
                         │ Webhook                    │ POST Review
                         │ (PR Opened/Sync)           │ Comments
                         ▼                            │
┌─────────────────────────────────────────────────────┼────────────────────────────────────────────────┐
│ BACKEND SYSTEM                                      │                                                │
│                                                     │                                                │
│   ┌─────────────────────┐    Auth & Dashboard REST  │                                                │
│   │   FastAPI Server    │◄──────────────────────────┼───────────────┐                                │
│   └──────────┬──────────┘                           │               │                                │
│              │                                      │               │                                │
│              │ Dispatch Review Task                 │               │                                │
│              ▼                                      │               ▼                                │
│   ┌─────────────────────┐                     ┌─────┴─────┐   ┌───────────┐                          │
│   │    Redis Broker     │                     │ GitHub    │   │  Gemini   │                          │
│   └──────────┬──────────┘                     │ REST API  │   │  API SDK  │                          │
│              │                                └─────▲─────┘   └─────▲─────┘                          │
│              │ Consume Task                         │               │                                │
│              ▼                                      │ Fetch Diff    │ Run Review                     │
│   ┌─────────────────────┐                           │ & Source      │ Prompt                         │
│   │    Celery Worker    ├───────────────────────────┴───────────────┴────────┐                       │
│   │   (Review Engine)   │                                                    │                       │
│   └──────────┬──────────┘                                                    │                       │
│              │                                                               │                       │
│              │ CRUD Operations                                               │                       │
│              ▼                                                               │                       │
│   ┌─────────────────────┐                                                    │                       │
│   │     PostgreSQL      │◄───────────────────────────────────────────────────┘                       │
│   └─────────────────────┘                                                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                      ▲
                                                      │ REST APIs / SSE / WebSockets
                                                      │
                                           ┌──────────┴──────────┐
                                           │   React Frontend    │
                                           │     Dashboard       │
                                           └─────────────────────┘
```

---

## 2. Component Design & Responsibilities

### A. FastAPI Ingestion & Control Plane (`backend/`)
- **Webhook Ingestor**: Lightweight endpoint (`POST /api/webhook/github`) that validates GitHub signatures (using `HMAC-SHA256` and the webhook secret), parses event payloads, filters for PR lifecycle events (`opened`, `synchronize`, `reopened`), and dispatches Celery tasks immediately. Returns a `202 Accepted` status within <50ms.
- **REST Endpoints**: Serves CRUD requests for the React dashboard (managing connected repositories, listing pull requests, showing review metrics, triggering manual reviews).
- **Authentication (OAuth & JWT)**: Implements secure GitHub OAuth flow. Upon successful authentication, generates a signed JWT containing scope claims stored with an expiration of 24 hours.

### B. Celery Task Queue & Redis Broker
- **Asynchronous Decoupling**: PR reviews are long-running operations (fetching file trees, running static linters, invoking the LLM, posting comments). Redis acts as an in-memory transport broker.
- **Worker Concurrency**: Worker processes scale horizontally. Tasks are routed to specialized queues (`webhooks`, `reviews`, `notifications`) to avoid high-volume webhooks blocking active code reviews.

### C. Review Engine & Static Analysis
- **Static Pre-processor**: Before invoking the Gemini API, the engine runs lightweight, language-specific static analyzers (`flake8`, `bandit` for Python, `eslint` for JavaScript/TypeScript, etc.) on the changed hunks.
- **Issue Merger**: Compiles linter errors and security flags, aligning them with exact line numbers. These are merged into the LLM context to prevent duplication and ensure high accuracy.

### D. Gemini AI Orchestrator
- **Model Choice**: Uses **`gemini-3.5-flash`** (or **`gemini-3.1-pro-preview`** for complex, deep-reasoning code reviews) to inspect the diff hunks, understand structural intent, detect semantic issues, and generate a JSON response strictly adhering to the schema.
- **Prompt Engineering**: Instructs the model to act as a seasoned Senior Staff Engineer. Includes strict guardrails against code hallucinations, mandates referencing only actual changed line numbers, and requires concrete, actionable refactoring suggestions.

### E. Relational Database Layer (`database/`)
Powered by **PostgreSQL** with **SQLAlchemy ORM** and **Alembic** migrations. Includes the following robust domain models:
- `User`: Handles dashboard accounts, sessions, and roles.
- `Repository`: Stores metadata of monitored repositories and webhook secrets.
- `PullRequest`: Tracks active and merged PRs, metadata, and status.
- `Review`: Aggregates the results of the review session (scores, summary, recommendation).
- `Comment`: Line-level comments generated by either static linters or the AI.
- `Issue`: Individual code quality/security findings categorized by severity.
- `LLMResponse`: Audit trail storing precise tokens used, raw prompts, and response JSON.
- `AuditLog`: Action logs tracking dashboard operations (e.g. user toggling repositories).

---

## 3. Data Flow Architecture (The Lifecycle of a PR Review)

1. **Webhook Trigger**: Developer pushes code or opens a PR. GitHub sends a secure `POST` payload to `/api/webhook/github`.
2. **Signature Verification**: FastAPI verifies the `X-Hub-Signature-256` header. On success, it inserts an initial `PullRequest` record marked as `Pending` into the database, pushes a `process_pr_review` task to Redis, and returns `202 Accepted` to GitHub.
3. **Queue Ingestion**: A Celery worker picks up the task from Redis.
4. **Context Gathering**: The worker queries GitHub's REST API using the repo's installation token:
   - Fetches the PR metadata.
   - Fetches the raw file diffs (`Accept: application/vnd.github.v3.diff`).
   - Fetches full content of modified files if deeper context is required.
5. **Static Analysis Check**: The worker executes relevant local linters on the changed files and aggregates any immediate errors (e.g., syntax errors, hardcoded secrets).
6. **Gemini Review Payload Construction**: The worker builds a specialized prompt incorporating:
   - The file diff.
   - The overall file context.
   - Linter outputs.
   - Strict JSON response formatting instructions.
7. **Gemini Execution**: The Gemini API analyzes the payload and returns structured JSON containing scores, positives, and exact line-by-line issue suggestions.
8. **Result Aggregation**: The worker parses the JSON, merges it with the static analysis errors, writes the records to the `Review`, `Issue`, and `Comment` tables, and updates the `PullRequest` state to `Reviewed`.
9. **GitHub In-Line Commenting**: The worker posts the overall summary review and individual line comments directly back to the pull request using GitHub’s review API (`POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews`).

---

## 4. UI Dashboard Strategy & Sandbox Compatibility

To provide a outstanding, high-fidelity experience in the AI Studio environment while guaranteeing that the exported project remains 100% production-ready for an enterprise FastAPI/Celery/PostgreSQL stack, we implement a **Dual-Architecture Strategy**:

1. **Active Simulation & Dashboard Engine (Express + Vite + React)**:
   - We will run a lightweight, high-performance Express server on Port 3000 alongside the React Vite frontend.
   - This Express server will serve as our active **Review Agent Control Center**. It will include a fully functional mock webhook runner and manual PR trigger so you can interact with the review flow directly in your browser.
   - It will use the real **@google/genai** SDK on the backend to execute actual Gemini code reviews.
   - It will store data in a persistent local database (SQLite/JSON persistence or Firestore) so that your dashboard is fully operational with live charts, review logs, and analytics.
2. **Production-Ready Codebase Generation**:
   - In parallel, we will generate the full, production-grade **Python FastAPI** and **Celery** codebase, with proper dependency structures (`requirements.txt` / `Pipfile`), SQLAlchemy models, Alembic configurations, and Docker files.
   - This ensures that when you export the repository, it contains exactly the python-based enterprise stack you requested, fully structured, linted, and ready to deploy to AWS, Azure, or Render.

---

## 5. Security & Rate Limiting Protocols

- **Secure Webhooks**: Mandatory validation of HMAC signatures on webhook ingestion.
- **GitHub PAT Encryption**: All stored GitHub Personal Access Tokens and installation tokens are encrypted at rest using AES-256 (via the `cryptography` library in Python and matching crypto modules in Node).
- **LLM Rate Limiting**: Token-bucket rate-limiting middleware to govern outbound requests to the Gemini API and prevent exhaustion.
- **JWT Authorization**: All dashboard requests are gated by secure, short-lived JWTs. Session tokens are stored in `HttpOnly`, secure, `SameSite=Strict` cookies to block XSS and CSRF vectors.
