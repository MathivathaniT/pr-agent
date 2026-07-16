import React from 'react';
import { 
  GitPullRequest, 
  Database, 
  BarChart3, 
  Settings, 
  Activity, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Agent Center', icon: Activity },
    { id: 'repositories', label: 'Connected Repos', icon: Database },
    { id: 'pull-requests', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'analytics', label: 'Security & Quality', icon: BarChart3 },
    { id: 'webhook-simulator', label: 'Webhook Simulator', icon: Layers },
    { id: 'settings', label: 'Agent Rules', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white" id="main_layout">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between" id="app_header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200/60 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
              GitHub Pull Request Review Agent
            </h1>
            <p className="text-xs text-slate-500 font-mono">Senior AI Architect Platform v1.0.0</p>
          </div>
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Static Linters Online</span>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200/60">
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini 2.5 Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 animate-fade-in" id="workspace_container">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white p-5 flex flex-col justify-between hidden lg:flex shadow-xs" id="app_sidebar">
          <div className="space-y-6">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase px-3">
              Core Modules
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav_btn_${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-mono font-medium text-slate-700">Sandbox Cluster</p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Serving active express middleware proxying Gemini code reviews via sandboxed channels.
            </p>
          </div>
        </aside>

        {/* Content Node Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full" id="main_content_node">
          {/* Mobile Tab bar - only shows on small screens */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-slate-200" id="mobile_navbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {children}
        </main>
      </div>

      {/* Mini Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400 font-mono">
        GitHub Pull Request Review Agent &copy; {new Date().getFullYear()} — Configured with Google GenAI Model Suite.
      </footer>
    </div>
  );
}
