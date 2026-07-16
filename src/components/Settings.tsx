import React from 'react';
import { Settings as SettingsIcon, Shield, Key, FileText, Cpu, AlertCircle, HelpCircle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 animate-fade-in" id="settings_view">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900">System Settings & Instructions</h2>
        <p className="text-sm text-slate-500">Manage agent keys, prompt limits, and developer credentials safely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings_grid">
        {/* API Key Instructions */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl lg:col-span-2 space-y-6 shadow-xs" id="api_keys_info_card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Gemini API Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Secrets are managed securely via the system environment context</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
              <span>How to configure your API Credentials:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-4">
              To connect the review engine to live AI execution, define your API secret inside the **Settings menu** of the Google AI Studio container (or in your local workspace `.env` file).
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-500">
              # .env.example<br />
              GEMINI_API_KEY=your_google_ai_studio_api_key_here
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Current Secret Status:</span>
            </div>
            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 font-medium">
              Securely Configured Server-Side
            </span>
          </div>
        </div>

        {/* Global Agent presets */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs" id="agent_presets_card">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-base text-slate-900">Global Agent Parameters</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px] font-bold">Target Model Class</span>
              <p className="text-slate-700 font-medium font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                gemini-2.5-flash (Production)
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px] font-bold">Model Temperature</span>
              <p className="text-slate-700 font-medium font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                0.1 (Highly Deterministic)
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-slate-400 block uppercase tracking-wider text-[9px] font-bold">Max output tokens</span>
              <p className="text-slate-700 font-medium font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                8192 tokens per hunk review
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
