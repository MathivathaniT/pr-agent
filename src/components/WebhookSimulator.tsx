import React, { useState } from 'react';
import { Repository, PullRequest } from '../types';
import { 
  Terminal, 
  PlayCircle, 
  GitPullRequest, 
  Cpu, 
  FileCode, 
  CheckCircle,
  HelpCircle,
  Code
} from 'lucide-react';

interface WebhookSimulatorProps {
  repositories: Repository[];
  pullRequests: PullRequest[];
  onTriggerWebhook: (payload: any) => Promise<void>;
  onTriggerManualReview: (prId: string, customDiffText: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
}

export default function WebhookSimulator({
  repositories,
  pullRequests,
  onTriggerWebhook,
  onTriggerManualReview,
  setActiveTab
}: WebhookSimulatorProps) {
  const [selectedPrId, setSelectedPrId] = useState<string>(pullRequests[0]?.id || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [customDiff, setCustomDiff] = useState<string>(`diff --git a/UserService.py b/UserService.py
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
`);

  const appendLog = (msg: string) => {
    setSimulationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSimulateWebhook = async () => {
    if (!selectedPrId) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    appendLog("Initializing mock GitHub Webhook event dispatch pipeline...");
    
    const pr = pullRequests.find(p => p.id === selectedPrId);
    const repo = pr ? repositories.find(r => r.id === pr.repositoryId) : null;
    
    if (!pr || !repo) {
      appendLog("Error: Selected pull request metadata missing.");
      setIsSimulating(false);
      return;
    }

    // Prepare standard GitHub Webhook schema
    const webhookPayload = {
      action: "synchronize",
      number: pr.number,
      pull_request: {
        number: pr.number,
        title: pr.title,
        state: pr.state,
        head: { ref: pr.sourceBranch, sha: "commit_" + Math.random().toString(36).substring(4) },
        base: { ref: pr.targetBranch, sha: pr.baseSha },
        user: { login: pr.authorUsername, avatar_url: pr.userAvatarUrl },
        body: pr.description
      },
      repository: {
        name: repo.name,
        full_name: repo.fullName
      }
    };

    try {
      appendLog(`POSTing payload to local endpoint: /api/webhook/github`);
      appendLog(`Header: X-GitHub-Event: pull_request`);
      
      await onTriggerWebhook(webhookPayload);
      
      appendLog("Webhook parsed & accepted successfully (202 Accepted).");
      appendLog("Background Celery worker review task scheduled in queue.");
      
      // Let's also run the Gemini review synchronously so the dashboard updates live
      appendLog("Running Gemini review engine synchronously on custom diff...");
      await onTriggerManualReview(pr.id, customDiff);
      
      appendLog("AI Agent finished auditing diff chunks. Review logs persisted.");
      appendLog("GitHub inline commentary mock review posted successfully.");
      
      setTimeout(() => {
        setIsSimulating(false);
        setActiveTab('dashboard');
      }, 1000);

    } catch (e: any) {
      appendLog(`Simulation Error: ${e.message}`);
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="webhook_simulator_view">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900">Webhook Simulator Workbench</h2>
        <p className="text-sm text-slate-500">Trigger simulated GitHub pushes and test Gemini's code audit results in real time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="simulator_grid">
        {/* Settings block */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs" id="simulator_controls_card">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-base text-slate-900">Simulation Setup</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 block font-bold">1. Select Target Pull Request Context</label>
              <select
                value={selectedPrId}
                onChange={e => setSelectedPrId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                id="select_pr_target"
              >
                {pullRequests.map(p => {
                  const repo = repositories.find(r => r.id === p.repositoryId);
                  return (
                    <option key={p.id} value={p.id} className="text-slate-800">
                      {repo ? repo.name : 'Unknown repo'} — #{p.number}: {p.title}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 flex items-center justify-between font-bold">
                <span>2. Code Changes Diff Hunk (Edit this python code to test Gemini!)</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <FileCode className="w-3 h-3" />
                  <span>diff formats</span>
                </span>
              </label>
              <textarea
                value={customDiff}
                onChange={e => setCustomDiff(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 leading-relaxed h-72 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                spellCheck="false"
                id="edit_diff_content"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSimulateWebhook}
              disabled={isSimulating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
              id="simulate_action_btn"
            >
              <PlayCircle className="w-5 h-5" />
              <span>{isSimulating ? 'Simulating Code Audit...' : 'Trigger Simulated Webhook'}</span>
            </button>
          </div>
        </div>

        {/* Terminal logs block */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-full shadow-lg" id="simulator_logs_card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-400" />
                <h3 className="font-display font-bold text-base text-white">Event Log Streams</h3>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="bg-slate-950/80 border border-slate-950 rounded-xl p-4 h-96 overflow-y-auto space-y-2 font-mono text-[10px] text-slate-400 leading-relaxed" id="terminal_logs">
              {simulationLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-600 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto stroke-1 text-slate-600" />
                  <p>Ready to simulate webhook intercepts.</p>
                </div>
              ) : (
                simulationLogs.map((log, idx) => (
                  <p key={idx} className={log.includes("Error") ? 'text-rose-400' : log.includes("Accepted") || log.includes("SUCCESS") ? 'text-emerald-400' : 'text-slate-300'}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 text-xs text-slate-500 font-mono flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Simulates GitHub PR events. Updates metrics in 2 seconds.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
