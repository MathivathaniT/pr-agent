import React from 'react';
import { Repository, PullRequest, Review } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  GitPullRequest, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  PlusCircle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Code
} from 'lucide-react';

interface DashboardProps {
  repositories: Repository[];
  pullRequests: PullRequest[];
  reviews: Review[];
  setActiveTab: (tab: string) => void;
  setSelectedReviewId: (id: string) => void;
}

export default function Dashboard({ 
  repositories, 
  pullRequests, 
  reviews, 
  setActiveTab,
  setSelectedReviewId 
}: DashboardProps) {
  
  // Calculate analytics metric sums
  const activeReposCount = repositories.filter(r => r.isActive).length;
  const analyzedPrsCount = reviews.length;
  
  const avgScore = analyzedPrsCount > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.overallScore, 0) / analyzedPrsCount).toFixed(1)
    : "0.0";

  // Calculate issue severity sums
  let criticalCount = 0;
  let highCount = 0;
  reviews.forEach(r => {
    (r.issues || []).forEach(iss => {
      if (iss.severity === 'Critical') criticalCount++;
      if (iss.severity === 'High') highCount++;
    });
  });

  // Prepare simple trend data for Recharts Area chart
  const trendData = reviews
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((rev, index) => {
      const pr = pullRequests.find(p => p.id === rev.pullRequestId);
      return {
        name: pr ? `PR #${pr.number}` : `Rev #${index + 1}`,
        score: Number(rev.overallScore.toFixed(1)),
        security: Number(rev.securityScore.toFixed(1)),
        performance: Number(rev.performanceScore.toFixed(1))
      };
    });

  // Default trend data if empty
  const chartData = trendData.length > 0 ? trendData : [
    { name: 'Start', score: 0, security: 0, performance: 0 }
  ];

  const handlePrClick = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setActiveTab('review-details');
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard_view">
      {/* Top Banner greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 p-6 rounded-3xl shadow-md text-white" id="greeting_banner">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-center gap-2">
            Welcome, Sandbox Engineer <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            AI PR Review Agent is currently active. Monitoring connected branches for automated commits.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button 
            id="sim_btn_quick"
            onClick={() => setActiveTab('webhook-simulator')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-650/10 flex items-center gap-2"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Simulate Webhook</span>
          </button>
        </div>
      </div>

      {/* Numerical Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="stats_grid">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow" id="stat_repos">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Active Repos</span>
            <span className="text-3xl font-display font-bold text-slate-900">{activeReposCount}</span>
            <span className="text-xs text-slate-500 block">of {repositories.length} total repositories</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow" id="stat_score">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Average Score</span>
            <span className="text-3xl font-display font-bold text-emerald-600">{avgScore} <span className="text-sm text-slate-400">/ 10</span></span>
            <span className="text-xs text-emerald-600 font-medium block">Senior Quality rating</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow" id="stat_security">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Critical Exploits</span>
            <span className="text-3xl font-display font-bold text-rose-600">{criticalCount}</span>
            <span className="text-xs text-rose-500 font-medium block">Require immediate fix</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow" id="stat_audits">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Audits Completed</span>
            <span className="text-3xl font-display font-bold text-violet-600">{analyzedPrsCount}</span>
            <span className="text-xs text-slate-500 block">PR reviews posted</span>
          </div>
          <div className="p-3 bg-violet-50 border border-violet-100 text-violet-600 rounded-xl">
            <Code className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart and Active Diffs row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_visual_row">
        {/* Quality Trend Graph */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs" id="trend_chart_card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Quality Evolution</h3>
              <p className="text-xs text-slate-500">Rolling rating matrix over chronological PR commits</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-200">
              Live Core
            </span>
          </div>
          
          <div className="h-64" id="quality_chart_wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="secColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" name="Overall Quality" />
                <Area type="monotone" dataKey="security" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#secColor)" name="Security rating" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity balance */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs" id="issue_health_card">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Security Vulnerabilities</h3>
            <p className="text-xs text-slate-500 mb-6">Unresolved issues discovered inside analyzed branches</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-medium text-slate-700">Critical Threats</p>
                    <p className="text-[10px] text-slate-500">Immediate SQLi, Remote Execution risks</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-rose-700">{criticalCount}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-medium text-slate-700">High Severity</p>
                    <p className="text-[10px] text-slate-500">Resource leak, unchecked auth bounds</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-amber-700">{highCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto"
            >
              <span>View full security metric analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent PR Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="recent_prs_section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Recent Pull Request Audits</h3>
            <p className="text-xs text-slate-500">Chronological analysis of incoming code submissions</p>
          </div>
          <button 
            onClick={() => setActiveTab('pull-requests')}
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            See all Pull Requests
          </button>
        </div>

        <div className="overflow-x-auto" id="prs_table_wrapper">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4">Pull Request</th>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4 text-center">Quality Score</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pullRequests.map((pr) => {
                const repo = repositories.find(r => r.id === pr.repositoryId);
                const review = reviews.find(r => r.pullRequestId === pr.id);
                
                return (
                  <tr key={pr.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          #{pr.number} — {pr.title}
                        </p>
                        <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                          <span>{pr.sourceBranch}</span>
                          <span>&rarr;</span>
                          <span>{pr.targetBranch}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-slate-500">
                      {repo ? repo.fullName : "enterprise/api"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={pr.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60"} 
                          alt="avatar" 
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full ring-1 ring-slate-100"
                        />
                        <span className="text-xs text-slate-600 font-medium">{pr.authorUsername}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {review ? (
                        <div className="inline-block">
                          <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                            review.overallScore >= 7.5 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : review.overallScore >= 5.0 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {review.overallScore.toFixed(1)} / 10
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">No review</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {review ? (
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                          review.recommendation === 'Approve' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : review.recommendation === 'Comment'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-50 text-rose-750'
                        }`}>
                          {review.recommendation}
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">Unreviewed</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {review ? (
                        <button 
                          onClick={() => handlePrClick(review.id)}
                          className="text-xs font-medium bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-indigo-700 hover:text-indigo-800 px-3 py-1.5 rounded-lg transition-all shadow-2xs"
                        >
                          View Report
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Simulating</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
