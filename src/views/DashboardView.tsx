import React from 'react';
import {
  TrendingUp,
  FileCheck2,
  GitCompare,
  Calculator,
  ShieldCheck,
  Search,
  ArrowRight,
  Database,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';
import { NavTab, UserProfile } from '../types';

interface DashboardViewProps {
  currentUser: UserProfile | null;
  onNavigateTab: (tab: NavTab) => void;
  onRunQuery: (query: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigateTab,
  onRunQuery
}) => {
  const sihWorkflows = [
    {
      id: 'fact',
      title: '1. Fact Verification',
      query: 'What was MCL’s raw coal production in FY2023–24?',
      badge: 'GROUND TRUTH',
      desc: 'Retrieve verified statutory production figures with page-level provenance and OC/UG composition.',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
    },
    {
      id: 'trend',
      title: '2. Trend Analysis',
      query: 'Show MCL’s production trend from FY2020–21 to FY2024–25.',
      badge: 'LONGITUDINAL',
      desc: 'Multi-year production progression with deterministic CAGR computation across 5 fiscal years.',
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
    },
    {
      id: 'target',
      title: '3. Target vs Actual',
      query: 'Compare MCL’s target and actual production.',
      badge: 'RECONCILED MATH',
      desc: 'Evaluates MoU target against audited realization with deterministic deviation & achievement percentage.',
      color: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
    },
    {
      id: 'reconciliation',
      title: '4. Evidence Reconciliation',
      query: 'Why are these two production figures different?',
      badge: 'PROVISIONAL VS AUDITED',
      desc: '8-dimension comparison resolving why flash report (204.50 MT) differs from statutory audited filing (206.10 MT).',
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
    },
    {
      id: 'report',
      title: '5. Performance Report',
      query: 'Prepare a production-performance report for MCL.',
      badge: 'EXECUTIVE BRIEF',
      desc: 'Assembles full executive brief synthesizing production, offtake, overburden, target achievement, and audit citations.',
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Positioning Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SIH 2026 • PROBLEM STATEMENT 26023 (CMPDI / CIL)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Evidence-Governed Mining Reporting Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            “We don’t replace CIL’s existing reporting systems—we create an{' '}
            <strong className="text-emerald-400 font-semibold">evidence intelligence layer</strong> that
            connects reported numbers, deterministic calculations, operational context and source documents
            into one auditable answer.”
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="dash-hero-ask-btn"
              onClick={() => onNavigateTab('ask')}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Ask Evidence Question
            </button>
            <button
              id="dash-hero-reports-btn"
              onClick={() => onNavigateTab('reports')}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Compile Statutory Report
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              FIND → VERIFY → RECONCILE → CALCULATE → EXPLAIN → REPORT
            </span>
          </div>
        </div>
      </div>

      {/* Primary Operating Benchmarks (FY2023-24 Ground Truth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">CIL Total Production</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">773.60</span>
            <span className="text-xs font-semibold text-slate-600">MT</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            +10.0% YoY statutory growth
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">Source: CIL Statutory Filing (Doc #CIL-AR-2023-24)</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">MCL Record Output</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">206.10</span>
            <span className="text-xs font-semibold text-slate-600">MT</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <FileCheck2 className="w-3 h-3 text-emerald-600" />
            101.03% Target Achieved (+2.10 MT)
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">Highest producing CIL subsidiary</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deterministic Engine</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-700">100%</span>
            <span className="text-xs font-semibold text-slate-600">Verified Math</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1">
            <Calculator className="w-3 h-3 text-slate-500" />
            No arithmetic performed by Gemini
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">TypeScript Deterministic Virtual Machine</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Evidence Corpus</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">15+</span>
            <span className="text-xs font-semibold text-slate-600">Statutory Documents</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 flex items-center gap-1 font-medium">
            <Database className="w-3 h-3 text-blue-600" />
            Active Role Clearance: {currentUser?.clearanceLevel}
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">Full RBAC pre-filter active</div>
        </div>
      </div>

      {/* The Five Primary SIH Demo Workflows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Five Primary SIH Demonstration Workflows</h3>
            <p className="text-xs text-slate-500">
              Click any verified workflow to execute through the full 7-layer evidence intelligence pipeline
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            PS 26023 MANDATED SCENARIOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sihWorkflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => onRunQuery(wf.query)}
              className={`p-4 rounded-xl border ${wf.color} transition cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{wf.title}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {wf.badge}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-900 italic mb-2">
                  "{wf.query}"
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {wf.desc}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Execute Grounded Query</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture & Governance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Pipeline */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Seven-Layer System Architecture</h4>
              <p className="text-xs text-slate-500">Strict pipeline guarantees auditable and unhallucinated answers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-emerald-700 font-bold">1. Security & RBAC</span>
              <p className="text-slate-600 text-[11px]">
                Pre-retrieval clearance check. Restricted records are pruned before LLM context exposure.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-emerald-700 font-bold">2. Query Intelligence</span>
              <p className="text-slate-600 text-[11px]">
                Infers intent, entity, metric, period, and mining scope without manual user tagging.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-emerald-700 font-bold">3. Reconciliation Engine</span>
              <p className="text-slate-600 text-[11px]">
                8-point dimensional comparability checklist before asserting conflict or difference.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-emerald-700 font-bold">4. Deterministic Math</span>
              <p className="text-slate-600 text-[11px]">
                Strict TypeScript arithmetic execution for totals, deviations, percentages, and CAGR.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-emerald-700 font-bold">5. Grounded AI Explainer</span>
              <p className="text-slate-600 text-[11px]">
                Gemini explains already-calculated evidence with strict factual adherence and attribution labels.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-emerald-700 font-bold">6. Tamper-Evident Audit</span>
              <p className="text-slate-600 text-[11px]">
                Logs every query, document view, authorization outcome, and derived report.
              </p>
            </div>
          </div>
        </div>

        {/* Security Persona Status */}
        <div className="p-5 rounded-xl bg-slate-900 text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
              <ShieldCheck className="w-4 h-4" /> ACTIVE GOVERNANCE PROFILE
            </div>
            <div className="mt-2 text-lg font-bold">{currentUser?.name}</div>
            <div className="text-xs text-slate-300">{currentUser?.department}</div>
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Role:</span>
                <span className="font-mono font-bold text-emerald-300">{currentUser?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Clearance Level:</span>
                <span className="font-mono text-amber-300">{currentUser?.clearanceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">LLM Math Isolation:</span>
                <span className="font-mono text-emerald-400">ENFORCED (0% LLM Calc)</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            Tip: Use the top-right persona selector to switch between Authority, Employee, Auditor, and Researcher to test role-gated access.
          </div>
        </div>
      </div>
    </div>
  );
};
