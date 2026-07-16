import React, { useState } from 'react';
import { Review, Repository, PullRequest } from '../types';
import { 
  GitPullRequest, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle, 
  AlertOctagon, 
  AlertTriangle, 
  Code, 
  ChevronRight, 
  FileCode,
  CornerDownRight,
  ThumbsUp,
  XCircle,
  Clock
} from 'lucide-react';

interface ReviewDetailsProps {
  review: Review | null;
  repositories: Repository[];
  pullRequests: PullRequest[];
  onBack: () => void;
}

export default function ReviewDetails({ review, repositories, pullRequests, onBack }: ReviewDetailsProps) {
  const [selectedFile, setSelectedFile] = useState<string>('UserService.py');

  if (!review) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs" id="review_details_empty">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-display font-bold text-lg text-slate-900">No Review Selected</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">Please return to the main dashboard or pull request page and choose a report to view details.</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/10"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const pr = pullRequests.find(p => p.id === review.pullRequestId);
  const repo = pr ? repositories.find(r => r.id === pr.repositoryId) : null;

  // Simple hardcoded files array representation matching our mock commits
  const filesList = Array.from(new Set(review.comments.map(c => c.filePath).concat(['UserService.py', 'auth_helper.js'])));

  // Mock diff renderer helper representation for our mock commits
  const renderCodeLineDiff = (file: string) => {
    if (file === 'UserService.py') {
      return [
        { no: 11, type: 'normal', code: 'class UserService:' },
        { no: 12, type: 'normal', code: '    def __init__(self, db):' },
        { no: 13, type: 'normal', code: '        self.db = db' },
        { no: 14, type: 'normal', code: '' },
        { no: 15, type: 'normal', code: '    def get_user_by_email(self, email):' },
        { no: 16, type: 'normal', code: '        # Rapid user retrieval logic' },
        { no: 17, type: 'delete', code: '-       query = "SELECT * FROM users WHERE email = \'" + email + "\'"' },
        { no: 18, type: 'add', code: '+       query = f"SELECT * FROM users WHERE email = \'{email}\'"' },
        { no: 19, type: 'add', code: '+       results = self.db.execute_raw(query)' },
        { no: 20, type: 'add', code: '+       if not results:' },
        { no: 21, type: 'add', code: '+           return None' },
        { no: 22, type: 'add', code: '+       return results[0]' },
      ];
    } else if (file === 'auth_helper.js') {
      return [
        { no: 20, type: 'normal', code: 'function verifyTokenSignature(token) {' },
        { no: 21, type: 'normal', code: '    const env = process.env.NODE_ENV || "development";' },
        { no: 22, type: 'normal', code: '    ' },
        { no: 23, type: 'delete', code: '-   // Standard verification checks' },
        { no: 24, type: 'add', code: '+   if (env === "staging") return true; // Offline bypass staging' },
        { no: 25, type: 'normal', code: '    return jwt.verify(token, JWT_SECRET);' },
        { no: 26, type: 'normal', code: '}' },
      ];
    }
    
    return [
      { no: 1, type: 'normal', code: '// Static context view' },
      { no: 2, type: 'normal', code: 'console.log("No dynamic edits mapped for this mock file.");' }
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-emerald-700 border-emerald-200 bg-emerald-50';
    if (score >= 5.0) return 'text-amber-700 border-amber-200 bg-amber-50';
    return 'text-rose-700 border-rose-200 bg-rose-50';
  };

  return (
    <div className="space-y-8 animate-fade-in" id="review_report_details">
      {/* Back nav & title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="report_details_header">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all shadow-2xs"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100">
                {repo ? repo.fullName : "enterprise/api"}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight mt-1">
              AI Code Audit Report
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl border ${getScoreColor(review.overallScore)}`}>
            Overall Score: {review.overallScore.toFixed(1)} / 10
          </span>
          <span className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-xl ${
            review.recommendation === 'Approve' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : review.recommendation === 'Comment'
              ? 'bg-slate-100 text-slate-600 border border-slate-200'
              : 'bg-rose-55 text-rose-700 border border-rose-200'
          }`}>
            {review.recommendation}
          </span>
        </div>
      </div>

      {/* Numerical Metrics Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="report_metrics_bar">
        {[
          { label: 'Maintainability', val: review.maintainabilityScore },
          { label: 'Security Quality', val: review.securityScore },
          { label: 'Performance Speed', val: review.performanceScore },
          { label: 'Readability Syntax', val: review.readabilityScore },
          { label: 'Testing Coverage', val: review.testingScore }
        ].map((met, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 text-center shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">{met.label}</span>
            <span className={`text-lg font-bold font-mono ${
              met.val >= 7.5 ? 'text-emerald-600' : met.val >= 5.0 ? 'text-amber-600' : 'text-rose-600'
            }`}>{met.val.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Markdown aggregate summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="report_markdown_grid">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl lg:col-span-2 space-y-4 shadow-xs">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Executive Audit Summary</span>
          </h3>

          <div className="text-sm text-slate-600 space-y-2 leading-relaxed whitespace-pre-wrap">
            {review.summary}
          </div>

          {/* Positives block */}
          {review.positiveObservations && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Positive Structural Aspects</span>
              </h4>
              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                {review.positiveObservations}
              </p>
            </div>
          )}
        </div>

        {/* Action checklist */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Recommended Fixes</span>
          </h3>
          
          <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
            {review.recommendedFixes || "1. No outstanding fixes required."}
          </div>

          {review.criticalIssuesSummary && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Critical Threats Summary</span>
              </span>
              <p className="text-xs text-rose-800 leading-relaxed">
                {review.criticalIssuesSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Code diff annotations browser */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs" id="diff_explorer_card">
        {/* Tab-header files selector */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mr-2 font-bold">Files Changed:</span>
          {filesList.map((file) => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedFile === file 
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                  : 'bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file}</span>
            </button>
          ))}
        </div>

        {/* Code Diff area with nested review annotations */}
        <div className="p-4 bg-slate-50/50 font-mono text-xs overflow-x-auto space-y-0.5 border-b border-slate-100" id="code_block_viewport">
          {renderCodeLineDiff(selectedFile).map((line, idx) => {
            // Check if there is an AI comment linked to this line number
            const commentsOnThisLine = review.comments.filter(
              c => c.filePath === selectedFile && c.lineNumber === line.no
            );

            return (
              <React.Fragment key={idx}>
                <div 
                  className={`flex items-stretch hover:bg-slate-100/50 ${
                    line.type === 'add' 
                      ? 'bg-emerald-50/80 border-l-4 border-emerald-500' 
                      : line.type === 'delete'
                      ? 'bg-rose-50/80 border-l-4 border-rose-400'
                      : ''
                  }`}
                >
                  {/* Line Number bar */}
                  <div className="w-12 text-right select-none pr-4 text-slate-400 border-r border-slate-150">
                    {line.no}
                  </div>
                  {/* Code Line text */}
                  <div className={`pl-4 py-1.5 ${
                    line.type === 'add' 
                      ? 'text-emerald-800 font-medium' 
                      : line.type === 'delete'
                      ? 'text-rose-700 line-through'
                      : 'text-slate-700'
                  }`}>
                    {line.code}
                  </div>
                </div>

                {/* Inline Comment annotations card */}
                {commentsOnThisLine.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="my-4 mx-4 md:mx-12 p-5 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-display font-bold text-slate-900">AI Agent Senior Annotation</span>
                      <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                        {comment.source}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                      {comment.body.replace(/### ⚠️.*?\n\n/g, "")}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
