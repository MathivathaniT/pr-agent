import React, { useState } from 'react';
import { Repository } from '../types';
import { 
  Database, 
  PlusCircle, 
  ToggleLeft, 
  ToggleRight, 
  HelpCircle, 
  Check, 
  Trash2,
  GitBranch,
  ShieldCheck,
  Code2
} from 'lucide-react';

interface RepositoriesProps {
  repositories: Repository[];
  onAddRepo: (repo: { name: string; fullName: string; branchesWhitelist: string; customReviewInstructions: string }) => void;
  onUpdateRepo: (id: string, updates: Partial<Repository>) => void;
}

export default function Repositories({ repositories, onAddRepo, onUpdateRepo }: RepositoriesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [branches, setBranches] = useState('main, dev');
  const [instructions, setInstructions] = useState('');

  // Submit new repo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fullName) return;
    onAddRepo({
      name,
      fullName,
      branchesWhitelist: branches,
      customReviewInstructions: instructions
    });
    // Reset state
    setName('');
    setFullName('');
    setBranches('main, dev');
    setInstructions('');
    setShowAddForm(false);
  };

  const handleToggleActive = (repo: Repository) => {
    onUpdateRepo(repo.id, { isActive: !repo.isActive });
  };

  return (
    <div className="space-y-8 animate-fade-in" id="repos_view">
      <div className="flex items-center justify-between" id="repos_header_row">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Monitored Repositories</h2>
          <p className="text-sm text-slate-500">Configure connected code repositories and custom LLM evaluation parameters</p>
        </div>
        <button
          id="add_repo_trigger"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Connect Repository</span>
        </button>
      </div>

      {/* Add Repository Modal/Collapse */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-md animate-slide-up" id="add_repo_form">
          <h3 className="font-display font-bold text-base text-slate-900">Connect GitHub Repository</h3>
          <p className="text-xs text-slate-500">Provide repository coordinate keys to register local webhook interceptors.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 font-medium">Repository Name</label>
              <input 
                type="text" 
                placeholder="e.g. user-service-api"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 font-medium">Full Repository Path (owner/name)</label>
              <input 
                type="text" 
                placeholder="e.g. enterprise-labs/user-service-api"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 font-medium">Branch Whitelist (comma-separated)</label>
              <input 
                type="text" 
                placeholder="e.g. main, dev, release/*"
                value={branches}
                onChange={e => setBranches(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-500 font-medium flex items-center gap-1.5">
                <span>Webhook Verification Key</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <input 
                type="text" 
                value="Auto-generated secure HMAC token"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-400 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500 font-medium">Custom Review Instructions (LLM Guidance Prompt)</label>
            <textarea 
              placeholder="e.g. Reject any pull request that exposes passwords. Strict typing is required."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 h-24 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Register Repo
            </button>
          </div>
        </form>
      )}

      {/* Grid of existing repos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="repos_grid">
        {repositories.map((repo) => (
          <div key={repo.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs hover:shadow-sm transition-shadow" id={`repo_card_${repo.id}`}>
            {/* Repo Ident block */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 tracking-tight">{repo.name}</h4>
                  <p className="text-xs font-mono text-slate-400">{repo.fullName}</p>
                </div>
              </div>

              {/* Status Switch */}
              <button 
                onClick={() => handleToggleActive(repo)}
                className="transition-colors"
                id={`toggle_active_${repo.id}`}
              >
                {repo.isActive ? (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-mono text-[10px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span>Monitoring Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200 font-mono text-[10px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                    <span>Deactivated</span>
                  </div>
                )}
              </button>
            </div>

            {/* Whitelist line */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px] font-semibold">Monitored Branches</span>
                <p className="text-slate-700 font-medium flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                  <span>{repo.branchesWhitelist || "All Branches"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px] font-semibold">Local Webhook Hash</span>
                <p className="text-slate-600 font-mono text-[11px] truncate" title={repo.webhookSecret}>
                  {repo.webhookSecret}
                </p>
              </div>
            </div>

            {/* Custom LLM guidelines config */}
            <div className="space-y-2">
              <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px] font-semibold">Custom AI Guidelines context</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-mono text-slate-600 leading-relaxed max-h-24 overflow-y-auto">
                {repo.customReviewInstructions || "No custom guidelines loaded. Running standard senior-grade software audit prompt."}
              </div>
            </div>

            {/* Edit / Quick actions footer */}
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => {
                  const val = prompt("Enter new comma-separated branches (e.g. master, release/*):", repo.branchesWhitelist);
                  if (val !== null) {
                    onUpdateRepo(repo.id, { branchesWhitelist: val });
                  }
                }}
                className="text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
              >
                Configure Branches
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
