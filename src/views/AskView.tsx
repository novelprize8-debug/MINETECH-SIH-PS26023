import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Database,
  ExternalLink,
  RotateCcw,
  BookOpen,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AnswerResponse, EvidenceRecord, UserProfile } from '../types';
import { FormulaCard } from '../components/FormulaCard';
import { ReconciliationCard } from '../components/ReconciliationCard';
import { VisualizationViewer } from '../components/VisualizationViewer';

interface AskViewProps {
  currentUser: UserProfile | null;
  onInspectEvidence: (evidence: EvidenceRecord) => void;
  activeAnswer: AnswerResponse | null;
  isLoading: boolean;
  onAskQuery: (query: string) => void;
}

export const AskView: React.FC<AskViewProps> = ({
  currentUser,
  onInspectEvidence,
  activeAnswer,
  isLoading,
  onAskQuery
}) => {
  const [inputQuery, setInputQuery] = useState('');

  const sampleQueries = [
    'What was MCL’s raw coal production in FY2023–24?',
    'Show MCL’s production trend from FY2020–21 to FY2024–25.',
    'Compare MCL’s target and actual production.',
    'Why are these two production figures different?',
    'Prepare a production-performance report for MCL.'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onAskQuery(inputQuery.trim());
    }
  };

  const getExplanationBadge = (label?: string) => {
    switch (label) {
      case 'REPORTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">REPORTED (OFFICIAL STATUTORY)</span>;
      case 'DERIVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">DERIVED (DETERMINISTIC ENGINE)</span>;
      case 'DOCUMENTED ASSOCIATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">DOCUMENTED ASSOCIATION</span>;
      case 'INSUFFICIENT EVIDENCE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">INSUFFICIENT EVIDENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">SUPPORTED EXPLANATION</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Central Question Input Box */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="mining-query-input" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Ask a question about mining data, reports or evidence…
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              Role: <strong className="text-slate-800">{currentUser?.role}</strong> (Clearance: {currentUser?.clearanceLevel})
            </span>
          </div>

          <div className="relative">
            <input
              id="mining-query-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g., What was MCL's raw coal production in FY2023–24? or Why are these two figures different?"
              className="w-full pl-4 pr-32 py-3.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner outline-hidden transition"
            />
            <button
              id="submit-query-btn"
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Verifying…
                </span>
              ) : (
                <>
                  <span>Audit & Answer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick-Prompt Chips */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Primary Demonstration Inquiries (1-Click Querying):
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputQuery(sq);
                    onAskQuery(sq);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition text-left flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{sq}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Answer Container */}
      {isLoading && (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="font-semibold text-slate-900 text-sm">Executing Seven-Layer Verification Pipeline…</div>
          <div className="text-xs text-slate-500 max-w-md mx-auto">
            Checking role clearance → Inferring query intent → Retrieving authorized evidence → Performing deterministic math → Verifying provenance
          </div>
        </div>
      )}

      {!isLoading && activeAnswer && (
        <div className="space-y-6">
          {/* Main Answer Header Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeAnswer.statusBadge.text}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  INTENT: <strong className="text-slate-800">{activeAnswer.intent}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                AUDIT REF: {activeAnswer.auditRecordId}
              </span>
            </div>

            {/* Answer Headline & Primary Metric */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeAnswer.answerHeadline}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeAnswer.answerSummary}
                </p>
              </div>

              {activeAnswer.primaryMetric && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 min-w-[200px] text-right shadow-2xs">
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                    {activeAnswer.primaryMetric.label}
                  </div>
                  <div className="flex items-baseline justify-end gap-1.5 mt-1">
                    <span className="text-3xl font-black font-mono text-emerald-950">
                      {activeAnswer.primaryMetric.value}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {activeAnswer.primaryMetric.unit}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1">
                    Confidence: {(activeAnswer.primaryMetric.confidence * 100).toFixed(0)}% • Ground Truth
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deterministic Calculations Section */}
          {activeAnswer.calculations && activeAnswer.calculations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Deterministic Engine Calculations (Code Executed, 0% LLM Arithmetic)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAnswer.calculations.map((c) => (
                  <FormulaCard
                    key={c.id}
                    calculation={c}
                    onInspectEvidence={(id) => {
                      const found = activeAnswer.retrievedEvidence.find((e) => e.id === id);
                      if (found) onInspectEvidence(found);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reconciliation Card Section */}
          {activeAnswer.reconciliation && (
            <ReconciliationCard
              reconciliation={activeAnswer.reconciliation}
              onInspectEvidence={(id) => {
                const found = activeAnswer.retrievedEvidence.find((e) => e.id === id);
                if (found) onInspectEvidence(found);
              }}
            />
          )}

          {/* Visualizations Section */}
          {activeAnswer.visualization && (
            <VisualizationViewer visualization={activeAnswer.visualization} />
          )}

          {/* Grounded AI Explanation Section */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Grounded Evidence Explanation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getExplanationBadge(activeAnswer.explanation.label)}
                {activeAnswer.explanation.geminiGrounded && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Gemini 3.8 Grounded
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
              {activeAnswer.explanation.text}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
              <span>Synthesized from {activeAnswer.explanation.evidenceCount} verified statutory records.</span>
              <span className="italic text-slate-400">Strictly adheres to documentary evidence boundaries.</span>
            </div>
          </div>

          {/* Evidence Inventory Table */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Retrieved Evidence Inventory ({activeAnswer.retrievedEvidence.length} Records)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any row to open the <strong>Evidence Drawer</strong> ("Where did this number come from?")
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Metric Claim</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Source Document</th>
                    <th className="py-2.5 px-3">Page / Table</th>
                    <th className="py-2.5 px-3 text-right">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeAnswer.retrievedEvidence.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => onInspectEvidence(ev)}
                      className="hover:bg-slate-50/80 cursor-pointer transition text-slate-800"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900">{ev.metric}</td>
                      <td className="py-3 px-3 font-mono">{ev.entity}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900">{ev.value}</span>{' '}
                        <span className="text-[10px] text-slate-500">{ev.unit}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{ev.period}</td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                          {ev.miningMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-slate-600" title={ev.docTitle}>
                        {ev.docTitle}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        p.{ev.page} ({ev.tableOrSection})
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectEvidence(ev);
                          }}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold text-xs"
                        >
                          Inspect <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sources and Citations Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-600" />
              Statutory Documentary Citations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeAnswer.sources.map((src, idx) => (
                <div key={idx} className="p-2 rounded bg-white border border-slate-200 text-[11px] space-y-0.5">
                  <div className="font-semibold text-slate-900">{src.title}</div>
                  <div className="text-slate-500">
                    Doc Ref: <span className="font-mono text-slate-700">{src.docNumber}</span> (v{src.version}) • {src.issuingAuthority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
