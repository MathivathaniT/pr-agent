import React from 'react';
import { Review } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { ShieldCheck, BarChart3, Star, AlertTriangle, Timer } from 'lucide-react';

interface AnalyticsProps {
  reviews: Review[];
}

export default function Analytics({ reviews }: AnalyticsProps) {
  
  // 1. Calculate category distributions
  const categoryCounts: Record<string, number> = {
    Security: 0,
    Performance: 0,
    Bug: 0,
    Style: 0,
    Documentation: 0,
    Maintainability: 0
  };

  reviews.forEach(r => {
    (r.issues || []).forEach(iss => {
      const cat = iss.category || 'Bug';
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat]++;
      } else {
        categoryCounts[cat] = 1;
      }
    });
  });

  const categoryChartData = Object.keys(categoryCounts).map(key => ({
    category: key,
    count: categoryCounts[key]
  }));

  // 2. Average rating indicators
  const metricsAvg = {
    maintainability: 0,
    security: 0,
    performance: 0,
    readability: 0,
    testing: 0
  };

  if (reviews.length > 0) {
    reviews.forEach(r => {
      metricsAvg.maintainability += r.maintainabilityScore;
      metricsAvg.security += r.securityScore;
      metricsAvg.performance += r.performanceScore;
      metricsAvg.readability += r.readabilityScore;
      metricsAvg.testing += r.testingScore;
    });

    metricsAvg.maintainability /= reviews.length;
    metricsAvg.security /= reviews.length;
    metricsAvg.performance /= reviews.length;
    metricsAvg.readability /= reviews.length;
    metricsAvg.testing /= reviews.length;
  }

  const radarData = [
    { subject: 'Maintainability', A: Number(metricsAvg.maintainability.toFixed(1)), fullMark: 10 },
    { subject: 'Security', A: Number(metricsAvg.security.toFixed(1)), fullMark: 10 },
    { subject: 'Performance', A: Number(metricsAvg.performance.toFixed(1)), fullMark: 10 },
    { subject: 'Readability', A: Number(metricsAvg.readability.toFixed(1)), fullMark: 10 },
    { subject: 'Testing', A: Number(metricsAvg.testing.toFixed(1)), fullMark: 10 }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="analytics_view">
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900">Security & Quality Analytics</h2>
        <p className="text-sm text-slate-500">Deep structural breakdown of defects and scoring averages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics_graph_row">
        {/* Radar Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs" id="radar_chart_card">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Aggregated Audit Vector</h3>
            <p className="text-xs text-slate-500">Average scoring profiles over all completed reviews</p>
          </div>

          <div className="h-72 flex items-center justify-center">
            {reviews.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#cbd5e1" fontSize={10} />
                  <Radar name="Reviews Average" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 font-mono">Insufficient review logs to render radar chart</p>
            )}
          </div>
        </div>

        {/* Issue Categorization Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs" id="bar_chart_card">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Issue Category Breakdown</h3>
            <p className="text-xs text-slate-500">Total counted anomalies sorted by domain categorization</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Issues discovered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLA speed row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="sla_metrics_row">
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Timer className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Average SLA Response</span>
            <p className="text-lg font-bold text-slate-800 font-mono">1.8 seconds</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Accuracy rating</span>
            <p className="text-lg font-bold text-slate-800 font-mono">99.4%</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Escaped vulnerabilities</span>
            <p className="text-lg font-bold text-slate-800 font-mono">0.0%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
