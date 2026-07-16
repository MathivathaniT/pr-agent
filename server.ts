import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Standard Database Simulation (stored in standard JSON storage to resist system restarts)
const DB_FILE = path.join(process.cwd(), "db_state.json");

interface Repository {
  id: string;
  name: string;
  fullName: string;
  isActive: boolean;
  branchesWhitelist: string;
  customReviewInstructions: string;
  webhookSecret: string;
  created_at: string;
}

interface PullRequest {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  state: string;
  sourceBranch: string;
  targetBranch: string;
  headSha: string;
  baseSha: string;
  authorUsername: string;
  userAvatarUrl?: string;
  description?: string;
  created_at: string;
}

interface ReviewIssue {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Security' | 'Performance' | 'Bug' | 'Style' | 'Documentation' | 'Maintainability';
  filePath: string;
  lineNumber?: number;
  title: string;
  description: string;
  suggestion?: string;
  isResolved: boolean;
}

interface ReviewComment {
  id: string;
  filePath: string;
  lineNumber?: number;
  body: string;
  source: string;
}

interface Review {
  id: string;
  pullRequestId: string;
  commitSha: string;
  recommendation: 'Approve' | 'Comment' | 'Request Changes';
  overallScore: number;
  maintainabilityScore: number;
  securityScore: number;
  performanceScore: number;
  readabilityScore: number;
  testingScore: number;
  summary: string;
  positiveObservations?: string;
  criticalIssuesSummary?: string;
  recommendedFixes?: string;
  created_at: string;
  issues: ReviewIssue[];
  comments: ReviewComment[];
}

interface DbState {
  repositories: Repository[];
  pullRequests: PullRequest[];
  reviews: Review[];
}

const INITIAL_REPOSITORIES: Repository[] = [
  {
    id: "repo-1",
    name: "user-service-api",
    fullName: "enterprise-labs/user-service-api",
    isActive: true,
    branchesWhitelist: "main, release/*",
    customReviewInstructions: "We strictly enforce SOLID principles and PEP8 compliance. Do not allow hardcoded secrets or raw query string configurations under any circumstance.",
    webhookSecret: "whsec_user_service_672891",
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "repo-2",
    name: "auth-gateway",
    fullName: "enterprise-labs/auth-gateway",
    isActive: true,
    branchesWhitelist: "master, dev",
    customReviewInstructions: "Ensure complete token lifecycle hygiene is checked. Highlight any vulnerabilities that might permit token leak or XSS injection.",
    webhookSecret: "whsec_auth_gw_118279",
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_PRS: PullRequest[] = [
  {
    id: "pr-1",
    repositoryId: "repo-1",
    number: 104,
    title: "feat: add user register API with dynamic query parameters",
    state: "open",
    sourceBranch: "feat/user-signup",
    targetBranch: "main",
    headSha: "8a6eef9d2719a9cb02bc562095f97b5e1b6fde42",
    baseSha: "2b9a7f3d1428c8cb01ac562095f90b5e1b6fce10",
    authorUsername: "junior_dev_bob",
    userAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    description: "Adds a fast registration endpoint. Implemented raw database lookup using python string interpolation to query database rapidly. Needs quick merge.",
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "pr-2",
    repositoryId: "repo-2",
    number: 89,
    title: "fix: bypass token expiration checks for offline staging testing",
    state: "open",
    sourceBranch: "fix/jwt-bypass-staging",
    targetBranch: "master",
    headSha: "cf89100223de9fa38c8bc5190b5e1b6fde3382c",
    baseSha: "ab90119223de9fa38c8bc5190b5e1b6fde3382b",
    authorUsername: "external_contractor_alice",
    userAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    description: "Temporarily disables JWT expire checks so offline testing remains functional on staging servers. Please do not merge into prod.",
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    pullRequestId: "pr-1",
    commitSha: "8a6eef9d2719a9cb02bc562095f97b5e1b6fde42",
    recommendation: "Request Changes",
    overallScore: 4.8,
    maintainabilityScore: 5.5,
    securityScore: 2.0,
    performanceScore: 6.0,
    readabilityScore: 6.5,
    testingScore: 4.0,
    created_at: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    summary: "The code adds dynamic registration but introduces a **Critical Security Vulnerability** (SQL Injection) due to using string formatting instead of parameterized query arguments. Testing coverage is also absent for validation helper methods.",
    positiveObservations: "• Code is cleanly modularized into a single route function file.\n• Routing patterns use standardized RESTful endpoints.",
    criticalIssuesSummary: "• **SQL Injection Vector**: Raw values parsed from user forms are formatted directly into PostgreSQL queries inside `UserService.py` on line 18.",
    recommendedFixes: "1. Replace dynamic query string formatting (`f'SELECT * FROM users WHERE email={email}'`) with proper parameterized cursor arguments (`db.execute('SELECT * FROM users WHERE email = %s', (email,))`).\n2. Add test cases executing registration requests with invalid email patterns and special SQL injection characters.",
    issues: [
      {
        id: "iss-1",
        severity: "Critical",
        category: "Security",
        filePath: "UserService.py",
        lineNumber: 18,
        title: "SQL Injection Susceptibility",
        description: "The parameter `email` is concatenated directly into SQL statement: `query = f\"SELECT * FROM users WHERE email='{email}'\"`. Attackers can escape this quoting context.",
        suggestion: "Use database execute parameters: `cursor.execute(\"SELECT * FROM users WHERE email = %s\", (email,))`",
        isResolved: false,
      },
      {
        id: "iss-2",
        severity: "High",
        category: "Bug",
        filePath: "UserService.py",
        lineNumber: 32,
        title: "Missing Exception Boundary",
        description: "Executing cursor query can fail if connection pool gets exhausted or unique constraints break, resulting in unhandled 500 error on frontend clients.",
        suggestion: "Wrap db cursor transactions in an explicit `try ... except DatabaseError` block and roll back transactions safely.",
        isResolved: false,
      }
    ],
    comments: [
      {
        id: "comm-1",
        filePath: "UserService.py",
        lineNumber: 18,
        body: "### ⚠️ **SQL Injection Vulnerability** [Critical - Security]\n\nRaw string interpolation interpolates unvalidated variables straight into SQL.\n\n💡 **Suggestion:**\n```python\ncursor.execute(\"SELECT * FROM users WHERE email = %s\", (email,))\n```",
        source: "AI_AGENT"
      }
    ]
  },
  {
    id: "rev-2",
    pullRequestId: "pr-2",
    commitSha: "cf89100223de9fa38c8bc5190b5e1b6fde3382c",
    recommendation: "Request Changes",
    overallScore: 3.5,
    maintainabilityScore: 4.5,
    securityScore: 1.0,
    performanceScore: 8.0,
    readabilityScore: 7.0,
    testingScore: 2.0,
    created_at: new Date(Date.now() - 11.5 * 3600 * 1000).toISOString(),
    summary: "Disabling token expiration verification leaves the system open to **Replay Attacks** and bypass authorization mechanisms. This is a severe threat even inside staging networks.",
    positiveObservations: "• Clean modular configuration switch setup.",
    criticalIssuesSummary: "• **Hardcoded JWT verification bypass**: The validation helper completely skips decoding boundaries.",
    recommendedFixes: "1. Instead of bypassing the check completely inside the core validation function, configure an environment variables based fallback context where an explicit sandbox signature secret is utilized for developers.",
    issues: [
      {
        id: "iss-3",
        severity: "Critical",
        category: "Security",
        filePath: "auth_helper.js",
        lineNumber: 24,
        title: "JWT Authentication Bypass",
        description: "The line `if (env === 'staging') return true;` effectively short-circuits key signature validation.",
        suggestion: "Remove this bypass. Always validate claims and token signatures regardless of environment strings.",
        isResolved: false,
      }
    ],
    comments: [
      {
        id: "comm-2",
        filePath: "auth_helper.js",
        lineNumber: 24,
        body: "### ⚠️ **Authentication Bypass** [Critical - Security]\n\nBypassing cryptographic signatures inside staging results in vulnerability leakage to testing targets.\n\n💡 **Suggestion:**\n```javascript\n// Rely on valid staging credentials instead of a wildcard staging string bypass\nconst payload = jwt.verify(token, STAGING_SECRET);\n```",
        source: "AI_AGENT"
      }
    ]
  }
];

function loadDb(): DbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read database state, fallback to seed:", e);
  }
  
  const state: DbState = {
    repositories: INITIAL_REPOSITORIES,
    pullRequests: INITIAL_PRS,
    reviews: INITIAL_REVIEWS
  };
  saveDb(state);
  return state;
}

function saveDb(state: DbState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist database state:", e);
  }
}

export async function createServerApp() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Real-time API routing
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", engine: "Vite + Express Simulation Backend" });
  });

  app.get("/api/repositories", (req, res) => {
    const db = loadDb();
    res.json(db.repositories);
  });

  app.post("/api/repositories", (req, res) => {
    const db = loadDb();
    const { name, fullName, branchesWhitelist, customReviewInstructions } = req.body;
    
    if (!name || !fullName) {
      res.status(400).json({ error: "Missing required properties" });
      return;
    }

    const newRepo: Repository = {
      id: "repo-" + Date.now(),
      name,
      fullName,
      isActive: true,
      branchesWhitelist: branchesWhitelist || "main",
      customReviewInstructions: customReviewInstructions || "",
      webhookSecret: "whsec_" + Math.random().toString(36).substring(7),
      created_at: new Date().toISOString()
    };

    db.repositories.push(newRepo);
    saveDb(db);
    res.status(201).json(newRepo);
  });

  app.put("/api/repositories/:id", (req, res) => {
    const db = loadDb();
    const repo = db.repositories.find(r => r.id === req.params.id);
    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const { isActive, branchesWhitelist, customReviewInstructions } = req.body;
    if (isActive !== undefined) repo.isActive = isActive;
    if (branchesWhitelist !== undefined) repo.branchesWhitelist = branchesWhitelist;
    if (customReviewInstructions !== undefined) repo.customReviewInstructions = customReviewInstructions;

    saveDb(db);
    res.json(repo);
  });

  app.get("/api/pull-requests", (req, res) => {
    const db = loadDb();
    res.json(db.pullRequests);
  });

  app.get("/api/reviews/history", (req, res) => {
    const db = loadDb();
    res.json(db.reviews);
  });

  app.get("/api/reviews/:id", (req, res) => {
    const db = loadDb();
    const review = db.reviews.find(r => r.id === req.params.id);
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    res.json(review);
  });

  // Dynamic review agent execution using Gemini!
  app.post("/api/review/manual", async (req, res) => {
    const db = loadDb();
    const { pullRequestId, customDiffText } = req.body;

    const pr = db.pullRequests.find(p => p.id === pullRequestId);
    if (!pr) {
      res.status(404).json({ error: "Pull Request not found" });
      return;
    }

    const repo = db.repositories.find(r => r.id === pr.repositoryId);
    const customInstructions = repo ? repo.customReviewInstructions : "";

    // 1. Diffs to parse
    const diffToAnalyze = customDiffText || `diff --git a/UserService.py b/UserService.py
index a12345b..c67890d 100644
--- a/UserService.py
+++ b/UserService.py
@@ -15,8 +15,10 @@ class UserService:
     def get_user_by_email(self, email):
         # Rapid user retrieval logic
         # Query strings formatted directly
-        query = "SELECT * FROM users WHERE email = '" + email + "'"
-        return self.db.execute_raw(query)
+        query = f"SELECT * FROM users WHERE email = '{email}'"
+        results = self.db.execute_raw(query)
+        if not results:
+            return None
+        return results[0]
`;

    // 2. Fetch API key
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      // Mock analytical response if key isn't provided yet
      const mockNewReview: Review = {
        id: "rev-" + Date.now(),
        pullRequestId,
        commitSha: pr.headSha,
        recommendation: "Request Changes",
        overallScore: 5.2,
        maintainabilityScore: 6.0,
        securityScore: 3.0,
        performanceScore: 7.0,
        readabilityScore: 6.0,
        testingScore: 4.0,
        created_at: new Date().toISOString(),
        summary: "### 💡 Sandbox Mock Review\nConfigure your **GEMINI_API_KEY** in the secrets settings to run live AI-powered PR reviews.\n\nThis is a mock analysis for preview demonstration purposes. Your code is clean but SQL injection risk still persists on line 18.",
        positiveObservations: "• Added safe return boundary checking on empty result rows.",
        criticalIssuesSummary: "• Hardcoded SQL injection susceptibility remains unresolved in string query format.",
        recommendedFixes: "1. Upgrade DB connection wrapper to use parameterized tuple variables.",
        issues: [
          {
            id: "iss-mock-" + Date.now(),
            severity: "Critical",
            category: "Security",
            filePath: "UserService.py",
            lineNumber: 18,
            title: "Dynamic SQL Concatenation",
            description: "Direct formatting of query strings makes parsing boundaries insecure against input-based SQL injections.",
            suggestion: "Use parameterized execute arguments instead of interpolation.",
            isResolved: false
          }
        ],
        comments: [
          {
            id: "comm-mock-" + Date.now(),
            filePath: "UserService.py",
            lineNumber: 18,
            body: "### ⚠️ **SQL Injection susceptibility** [Critical - Security]\n\nString formatting on raw queries poses injection hazard.\n\n💡 **Suggestion:**\n```python\ncursor.execute(\"SELECT * FROM users WHERE email = %s\", (email,))\n```",
            source: "AI_AGENT"
          }
        ]
      };

      db.reviews.push(mockNewReview);
      saveDb(db);
      res.status(200).json(mockNewReview);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      const systemPrompt = `You are a Senior Staff Engineer, DevOps Expert, and security researcher reviewing a code submission on GitHub.
Your review must be objective, highly actionable, clear, and trace back to specific line numbers in the provided code diff.
You must respond with a single valid JSON object containing the exact properties listed in the user's prompt schema. Do not output anything else (no markdown wrappers except inside json string values).`;

      const userPrompt = `Analyze the following pull request code changes.
The repo context contains special review instructions: "${customInstructions}".

Here is the PR Diff to analyze:
\`\`\`diff
${diffToAnalyze}
\`\`\`

You must respond with a single valid JSON object of the following JSON Schema:
{
  "summary": "Overall markdown summary of the pull request containing positive observations, architectural notes, and a list of structural concerns.",
  "overall_score": 8.5,
  "maintainability_score": 8.0,
  "security_score": 9.0,
  "performance_score": 7.5,
  "readability_score": 8.0,
  "testing_score": 7.0,
  "recommendation": "Request Changes", // "Approve", "Comment", "Request Changes"
  "positive_observations": "Bullet points listing outstanding aspects of the code (good testing, clean refactor, robust checks).",
  "critical_issues_summary": "Summary of critical defects, architectural problems, or security hazards.",
  "recommended_fixes": "Markdown summary listing the most important structural modifications needed before merging.",
  "issues": [
    {
      "severity": "High", // "Low", "Medium", "High", "Critical"
      "category": "Security", // "Security", "Performance", "Bug", "Style", "Documentation", "Maintainability"
      "file": "UserService.py",
      "line": 18,
      "title": "SQL Injection vulnerability",
      "description": "Raw string concatenation is used to interpolate email parameter inside raw SQL strings.",
      "suggestion": "Utilize parameterized cursor parameters: cursor.execute('SELECT * FROM users WHERE email = %s', (email,))"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const responseText = response.text || "{}";
      const cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedReview = JSON.parse(cleanJsonStr);

      const generatedIssues: ReviewIssue[] = (parsedReview.issues || []).map((iss: any, idx: number) => ({
        id: "iss-gen-" + Date.now() + "-" + idx,
        severity: iss.severity || "Medium",
        category: iss.category || "Bug",
        filePath: iss.file || "UserService.py",
        lineNumber: iss.line || 18,
        title: iss.title || "Code review alert",
        description: iss.description || "",
        suggestion: iss.suggestion || "",
        isResolved: false
      }));

      const generatedComments: ReviewComment[] = generatedIssues.map(iss => ({
        id: "comm-gen-" + Date.now() + "-" + Math.random().toString(36).substring(4),
        filePath: iss.filePath,
        lineNumber: iss.lineNumber,
        body: `### ⚠️ **${iss.title}** [${iss.severity} - ${iss.category}]\n\n${iss.description}\n\n💡 **Suggestion:**\n\`\`\`\n${iss.suggestion}\n\`\`\``,
        source: "AI_AGENT"
      }));

      const newReview: Review = {
        id: "rev-" + Date.now(),
        pullRequestId,
        commitSha: pr.headSha,
        recommendation: parsedReview.recommendation || "Comment",
        overallScore: parsedReview.overall_score || 7.0,
        maintainabilityScore: parsedReview.maintainability_score || 7.0,
        securityScore: parsedReview.security_score || 7.0,
        performanceScore: parsedReview.performance_score || 7.0,
        readabilityScore: parsedReview.readability_score || 7.0,
        testingScore: parsedReview.testing_score || 7.0,
        created_at: new Date().toISOString(),
        summary: parsedReview.summary || "AI automated analysis completed.",
        positiveObservations: parsedReview.positive_observations || "",
        criticalIssuesSummary: parsedReview.critical_issues_summary || "",
        recommendedFixes: parsedReview.recommended_fixes || "",
        issues: generatedIssues,
        comments: generatedComments
      };

      db.reviews.push(newReview);
      saveDb(db);
      res.json(newReview);

    } catch (err: any) {
      console.error("Gemini invocation failed:", err);
      res.status(500).json({ error: "Gemini agent invocation error", details: err.message });
    }
  });

  // Handle Mock Webhook simulation pipeline
  app.post("/api/webhook/github", (req, res) => {
    const db = loadDb();
    const { action, pull_request, repository } = req.body;

    if (!pull_request || !repository) {
      res.status(400).json({ error: "Malformed mock webhook data" });
      return;
    }

    // Connect repository if not registered yet
    let dbRepo = db.repositories.find(r => r.fullName === repository.full_name);
    if (!dbRepo) {
      dbRepo = {
        id: "repo-" + Date.now(),
        name: repository.name || "simulated-repo",
        fullName: repository.full_name,
        isActive: true,
        branchesWhitelist: "main, dev",
        customReviewInstructions: "Verify thread safety and resource leak checks.",
        webhookSecret: "whsec_sim_" + Math.random().toString(36).substring(5),
        created_at: new Date().toISOString()
      };
      db.repositories.push(dbRepo);
    }

    // Insert active pull request
    const prNumber = pull_request.number || 101;
    let dbPR = db.pullRequests.find(p => p.repositoryId === dbRepo!.id && p.number === prNumber);
    if (!dbPR) {
      dbPR = {
        id: "pr-sim-" + Date.now(),
        repositoryId: dbRepo.id,
        number: prNumber,
        title: pull_request.title || "Simulated PR trigger",
        state: "open",
        sourceBranch: pull_request.head?.ref || "feat/improve-logs",
        targetBranch: pull_request.base?.ref || "main",
        headSha: pull_request.head?.sha || "9a8b7c6d5e4f3a2b1c",
        baseSha: pull_request.base?.sha || "1a2b3c4d5e6f",
        authorUsername: pull_request.user?.login || "sandbox_coder",
        userAvatarUrl: pull_request.user?.avatar_url || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120",
        description: pull_request.body || "A new simulated code change webhook event.",
        created_at: new Date().toISOString()
      };
      db.pullRequests.push(dbPR);
    } else {
      dbPR.title = pull_request.title || dbPR.title;
      dbPR.headSha = pull_request.head?.sha || dbPR.headSha;
    }

    saveDb(db);
    res.json({
      status: "Accepted",
      message: `Triggered automated webhook capture for PR #${prNumber}`,
      pull_request_id: dbPR.id
    });
  });

  // Vite static SPA setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return { app, PORT };
}

if (process.env.NODE_ENV !== "test") {
  createServerApp().then(({ app, PORT }) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start server", err);
  });
}
