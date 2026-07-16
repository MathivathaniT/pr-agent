import React, { useState } from 'react';
import { Repository, PullRequest, Review } from '../types';
import { 
  GitPullRequest, 
  RefreshCw, 
  CheckCircle, 
  User, 
  Clock, 
  ExternalLink,
  Zap,
  Sparkles
} from 'lucide-react';

interface PullRequestsProps {
  repositories: Repository[];
  pullRequests: PullRequest[];
  reviews: Review[];
  onTriggerManualReview: (prId: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setSelectedReviewId: (id: string) => void;
}

export default function PullRequests({
  repositories,
  pullRequests,
  reviews,
  onTriggerManualReview,
  setActiveTab,
  setSelectedReviewId
}: PullRequestsProps) {
  const [runningAudits, setRunningAudits] = useState<Record<string, boolean>>({});

  const handleRunAudit = async (prId: string) => {
    setRunningAudits(prev => ({ ...prev, [prId]: true }));
    try {
      await onTriggerManualReview(prId);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningAudits(prev => ({ ...prev, [prId]: false }));
    }
  };

  const handleViewReport = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setActiveTab('review-details');
  };

  return (
    <div className="space-y-8 animate-fade-in" id="prs_list_view">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900">Active Pull Requests</h2>
        <p className="text-sm text-slate-500">View monitored pull request branches and trigger manual senior-grade audits on code changes</p>
      </div>

      <div className="space-y-4" id="prs_grid_layout">
        {pullRequests.map((pr) => {
          const repo = repositories.find(r => r.id === pr.repositoryId);
          const review = reviews.find(r => r.pullRequestId === pr.id);
          const isAuditing = !!runningAudits[pr.id];

          return (
            <div 
              key={pr.id} 
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs hover:shadow-sm transition-shadow"
              id={`pr_card_item_${pr.id}`}
            >
              {/* Context Block */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {repo ? repo.fullName : "enterprise/api"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    PR #{pr.number}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 tracking-tight leading-snug">
                  {pr.title}
                </h3>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <GitPullRequest className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{pr.sourceBranch}</span>
                    <span className="text-slate-300">&rarr;</span>
                    <span>{pr.targetBranch}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <img 
                      src={pr.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60"} 
                      alt="avatar" 
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full ring-1 ring-slate-100"
                    />
                    <span>{pr.authorUsername}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(pr.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {pr.description && (
                  <p className="text-xs text-slate-600 max-w-2xl bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-mono mt-2 truncate">
                    {pr.description}
                  </p>
                )}
              </div>

              {/* Score / Status Section */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {review ? (
                  <div className="text-left lg:text-right space-y-1">
                    <div className="flex items-center gap-2 justify-start lg:justify-end">
                      <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                        review.overallScore >= 7.5 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : review.overallScore >= 5.0 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        Score: {review.overallScore.toFixed(1)} / 10
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Rec: <span className={`font-semibold uppercase ${
                        review.recommendation === 'Approve' ? 'text-emerald-600' : review.recommendation === 'Comment' ? 'text-slate-500' : 'text-rose-600'
                      }`}>{review.recommendation}</span>
                    </p>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-400">Pending initial audit</span>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunAudit(pr.id)}
                    disabled={isAuditing}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-medium transition-all flex items-center justify-center border border-slate-200"
                    title="Audit Pull Request"
                    id={`trigger_audit_btn_${pr.id}`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>

                  {review ? (
                    <button
                      onClick={() => handleViewReport(review.id)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-indigo-650/10 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRunAudit(pr.id)}
                      disabled={isAuditing}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-50 border border-slate-200 rounded-xl text-xs font-medium transition-all"
                    >
                      {isAuditing ? 'Auditing...' : 'Queue Agent Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
