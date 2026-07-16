<div align="center">
  <a href="https://github.com/MathivathaniT/pr-agent">
    <img src="https://readme-typing-svg.demolab.com/?font=Inter&weight=800&size=45&pause=1000&color=3B82F6&center=true&vCenter=true&width=1000&height=100&lines=GitHub+Pull+Request+Review+Agent;AI-Powered+Code+Reviews;Automate+Your+Workflow" alt="Animated Title" />
  </a>

  <p align="center">
    <b>Elevating Code Quality Through Intelligent, Automated AI Reviews</b>
  </p>

  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/AI-Gemini-8E75B2?logo=google&logoColor=white" alt="Gemini AI" />
  </p>
</div>

---

## 📑 Table of Contents
<details>
<summary>Click to expand</summary>

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [System Architecture](#-system-architecture)
- [Workflow](#-workflow)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [AI Review Capabilities](#-ai-review-capabilities)
- [Security Features](#-security-features)
- [Performance Optimizations](#-performance-optimizations)
- [Future Enhancements](#-future-enhancements)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)
- [Contact](#-contact)

</details>

## 🌟 Project Overview
**Problem:** Code reviews are often time-consuming, prone to human error, and inconsistent. Reviewers spend significant time catching basic syntax errors, code smells, or security vulnerabilities instead of focusing on complex business logic.

**Solution:** The **GitHub Pull Request Review Agent** is an automated, AI-driven assistant that integrates seamlessly into your GitHub workflow. Upon PR creation, the agent instantly analyzes code changes, provides line-by-line feedback, detects vulnerabilities, and highlights performance bottlenecks. 

**Target Audience:** Software Engineering Teams, Open Source Maintainers, and Individual Developers looking to accelerate their review cycles and enforce code quality standards.

**Business Value:** Reduces PR lifecycle time by up to 40%, minimizes technical debt, prevents security vulnerabilities before they reach production, and frees up senior engineering hours for more impactful work.

## 🚀 Features
- 🤖 **AI-Powered Pull Request Reviews:** Automatically parses diffs and generates contextual feedback.
- 🛡️ **Security Vulnerability Detection:** Identifies OWASP top 10 vulnerabilities and insecure patterns.
- ⚡ **Performance Optimization Suggestions:** Highlights inefficient loops, memory leaks, and suboptimal queries.
- 🧹 **Code Smell Detection:** Enforces SOLID principles, clean naming conventions, and DRY code.
- 🐙 **GitHub Integration:** Listens to webhook events and posts reviews directly on GitHub PRs.
- 💬 **Automated Review Comments:** Places inline comments on specific lines of code.
- 📊 **Review History Dashboard:** A clean UI to track historical reviews, metrics, and PR states.
- 🌍 **Multi-language Support:** Capable of reviewing Python, TypeScript, JavaScript, Java, Go, and more.
- 📈 **Repository Analytics:** Visualizes code health and team review velocity over time.
- 🔐 **Authentication:** Secure user login and GitHub App authentication flows.

## 📸 Screenshots

*A sleek dashboard for managing your repositories and checking AI review logs.*
<p align="center">
  <img src="/docs/images/dashboard.png" alt="Dashboard Placeholder" width="800" />
</p>

*Deep dive into a specific pull request review provided by the agent.*
<p align="center">
  <img src="/docs/images/review.png" alt="Review Placeholder" width="800" />
</p>

*Historical timeline of automated comments and AI insights.*
<p align="center">
  <img src="/docs/images/history.png" alt="History Placeholder" width="800" />
</p>

## 🏗️ System Architecture

```mermaid
graph TD;
    Developer[Developer] -->|Creates PR| GitHub[GitHub Repository]
    GitHub -->|Triggers Webhook| Webhook[Webhook Receiver]
    Webhook --> Backend[Node.js / Express Backend]
    Backend -->|Fetches Diff| GitHubAPI[GitHub API]
    GitHubAPI --> Backend
    Backend -->|Sends Context| AIEngine[Gemini AI Engine]
    AIEngine -->|Generates Review| Backend
    Backend -->|Stores Metadata| Database[(PostgreSQL Database)]
    Backend -->|Posts Comments| GitHubComments[GitHub PR Comments]
```

## 🔄 Workflow
1. **Pull Request Created:** A developer opens a Pull Request on a tracked GitHub repository.
2. **Webhook Triggered:** GitHub sends a webhook payload to the agent's endpoint.
3. **Diff Extraction:** The backend securely communicates with the GitHub API to fetch the PR diff and file contents.
4. **AI Analysis:** The code diffs are passed to the Gemini AI Engine with specialized prompt templates.
5. **Report Generation:** The AI detects smells, bugs, and performance issues, returning structured JSON.
6. **Comment Posting:** The backend authenticates via GitHub and posts inline comments and a general review summary.
7. **Dashboard Update:** The review metadata is persisted to the database and reflected in the React Dashboard in real-time.

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Redis (Caching/Queue) |
| **AI** | Google Gemini AI API |
| **Authentication** | JWT, GitHub OAuth |
| **Deployment** | Docker, Vercel (Frontend), AWS/Railway (Backend) |
| **Version Control** | Git, GitHub |

## 📁 Folder Structure
```text
github-pull-request-review-agent/
├── backend/                  # Express API Backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # GitHub & AI logic
│   │   ├── models/           # Database schemas
│   │   ├── routes/           # API Endpoints
│   │   └── utils/            # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── src/                      # React Frontend
│   ├── components/           # UI Components (Dashboard, Settings, etc.)
│   ├── styles/               # Tailwind & Global CSS
│   ├── App.tsx               # Entry Component
│   └── main.tsx              # React DOM mounting
├── docs/                     # Architecture & Assets
│   └── images/               # Screenshots
├── .env.example              # Environment variables template
├── package.json              # Root/Frontend dependencies
├── vite.config.ts            # Vite bundler configuration
└── README.md                 # Project Documentation
```

## 🛠️ Installation

Follow these steps to set up the project locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MathivathaniT/pr-agent.git
   cd pr-agent
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure Environment Variables:**
   Rename `.env.example` to `.env` in the root and backend directories, and fill in the required keys (see table below).

5. **Run the Backend (API & Webhooks):**
   ```bash
   cd backend
   npm run dev
   ```

6. **Run the Frontend (Dashboard):**
   Open a new terminal window in the root directory:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `GITHUB_TOKEN` | Personal Access Token or App Token for posting reviews | `ghp_xxxxx...` |
| `GEMINI_API_KEY` | Google Gemini API Key for AI inference | `AIzaSy...` |
| `DATABASE_URL` | Connection string for PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `super_secret_string` |
| `REDIS_URL` | Redis URL for Celery/Queue tasks (Optional) | `redis://localhost:6379/0` |

## 💡 Usage
1. Open the dashboard by navigating to `http://localhost:5173`.
2. Login using your GitHub account (or standard credentials).
3. Connect the repositories you wish the AI to track.
4. Set up the webhook in your GitHub Repository settings pointing to `https://your-domain.com/api/webhooks/github`.
5. Create a new Pull Request in your repository and watch the AI agent analyze and comment on your code automatically!

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhooks/github` | Receives GitHub PR events. |
| `GET` | `/api/reviews/:id` | Fetches details of a specific AI review. |
| `GET` | `/api/repos` | Lists all tracked repositories. |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT. |
| `GET` | `/api/analytics` | Returns repository and review metrics. |

## 🧠 AI Review Capabilities
Our highly tuned Gemini prompts empower the agent to detect:

- **Code Smells:** Long methods, deep nesting, duplicate code, and complex conditions.
- **Security Issues:** SQL injection vulnerabilities, XSS, insecure cryptography, and exposed secrets.
- **Performance Problems:** Inefficient Big-O time complexity algorithms, unnecessary memory allocations, and n+1 query problems.
- **Readability & Maintainability:** Suggests better variable names, simpler logic flows, and enforces DRY.
- **SOLID Principles:** Flags violations of Single Responsibility, Open-Closed, etc.
- **Naming Conventions:** Ensures variables and functions match community language standards (e.g., camelCase vs snake_case).
- **Error Handling:** Identifies swallowed exceptions and missing edge-case validations.
- **Memory & Concurrency:** Spots race conditions, deadlocks, and memory leaks.
- **Documentation & Testing:** Highlights missing docstrings and un-tested complex logic.

## 🛡️ Security Features
- **Webhook Signature Verification:** Ensures payloads truly originate from GitHub using HMAC.
- **Token Encryption:** GitHub access tokens are encrypted at rest in the database.
- **Rate Limiting:** Protects endpoints from abuse and DDoS attacks.
- **Least Privilege:** The GitHub bot requests only the minimal permissions necessary (`pull_requests: write`).

## ⚡ Performance Optimizations
- **Asynchronous Processing:** Webhooks return `200 OK` instantly while AI inference runs in a background job queue.
- **Diff Chunking:** Extremely large PRs are truncated or chunked to respect LLM context windows and reduce latency.
- **Response Caching:** Repeated analysis queries are cached in Redis to save API costs.

## 🛣️ Future Enhancements
- [ ] Support for GitLab and BitBucket.
- [ ] Integration with Slack and Discord for review notifications.
- [ ] Custom rule definition (allow teams to specify custom prompts per repo).
- [ ] Auto-generate unit tests for changed files.
- [ ] Implement advanced RAG (Retrieval-Augmented Generation) to understand the entire repository context.

## 🧪 Testing

- **Unit Testing:** Tests individual utilities and components using `Vitest`.
- **Integration Testing:** Tests the API endpoints and database models using `Supertest`.
- **API/Webhook Testing:** Mocks GitHub payloads to verify the processing pipeline.

Run tests via:
```bash
npm run test
```

## 🚢 Deployment

### Docker Deployment
A `docker-compose.yml` file is provided for isolated, reproducible deployments.
```bash
docker-compose up -d --build
```

### Production Deployment
- **Frontend:** Automatically deployable to Vercel or Netlify via GitHub integrations.
- **Backend:** Suitable for AWS ECS, Heroku, or Railway. Ensure `DATABASE_URL` and `REDIS_URL` point to managed instances.

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure you write tests for any new features and follow the existing code style.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgements
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Node.js](https://nodejs.org/)

## 📬 Contact
**MathivathaniT**

- LinkedIn: [Your LinkedIn Profile](#)
- GitHub: [MathivathaniT](https://github.com/MathivathaniT)
- Email: [your.email@example.com](mailto:your.email@example.com)
- Portfolio: [Your Portfolio Website](#)

---
*If you find this project useful, please consider giving it a ⭐ on GitHub!*
