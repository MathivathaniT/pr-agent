export interface Repository {
  id: string;
  name: string;
  fullName: string;
  isActive: boolean;
  branchesWhitelist: string;
  customReviewInstructions: string;
  webhookSecret: string;
  created_at: string;
}

export interface PullRequest {
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

export interface ReviewIssue {
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

export interface ReviewComment {
  id: string;
  filePath: string;
  lineNumber?: number;
  body: string;
  source: string;
}

export interface Review {
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
