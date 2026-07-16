<div align="center">
  
# ┌──────────────────────────────────────────────┐
# │                                              │
# │       GitHub Pull Request Review Agent       │
# │                                              │
# └──────────────────────────────────────────────┘

An AI-powered assistant that automatically reviews your GitHub Pull Requests.
</div>

## 🌟 Overview
This project is an automated agent that analyzes your GitHub PRs, providing intelligent feedback, code reviews, and suggestions to streamline your development workflow.

## 🚀 Features
- **Automated Code Review:** Instantly reviews code changes on pull requests.
- **AI-Powered Insights:** Uses Gemini AI to understand context and detect issues.
- **Dashboard Interface:** Includes a modern React frontend to manage repositories, view reviews, and check analytics.

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Vite, Framer Motion
- **Backend:** Node.js / Express, TypeScript
- **AI Integration:** Google GenAI API

## 💻 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Gemini API Key

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` or `.env.local` and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing
The project uses Vitest for testing. To run the test suite:
```bash
npm run test
```
To run tests in watch mode:
```bash
npm run test:watch
```
