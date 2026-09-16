import React from 'react';
import { GitCompare, CheckCircle2, AlertTriangle, XCircle, Info, FileText } from 'lucide-react';
import { ReconciliationResult, ReconciliationStatus } from '../types';

interface ReconciliationCardProps {
  reconciliation: ReconciliationResult;
  onInspectEvidence?: (evidenceId: string) => void;
}

export const ReconciliationCard: React.FC<ReconciliationCardProps> = ({
  reconciliation,
  onInspectEvidence
}) => {
  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'CONSISTENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            CONSISTENT (IDENTICAL GROUND TRUTH)
          </span>
        );
      case 'EXPLAINABLE DIFFERENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            EXPLAINABLE DIFFERENCE (RECONCILED)
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            UNRESOLVED CONFLICT (CONTRADICTION)
          </span>
        );
      case 'NOT COMPARABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Info className="w-3.5 h-3.5 text-slate-600" />
            NOT COMPARABLE (DIMENSIONAL MISMATCH)
          </span>
        );
    }
  };

  const { itemA, itemB, dimensionCheck } = reconciliation;

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Dimensional Reconciliation Engine</h3>
            <p className="text-xs text-slate-500">Checking 8 strict reporting dimensions before asserting conflict</p>
          </div>
        </div>
        {getStatusBadge(reconciliation.status)}
      </div>

      {/* Side by Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source A */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 uppercase tracking-wide">Source Filing A</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">v{itemA.docVersion}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 line-clamp-1">{itemA.docTitle}</div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">{itemA.value}</span>
            <span className="text-xs font-semibold text-slate-600">{itemA.unit}</span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 grid grid-cols-2 gap-1">
            <div>Scope: {itemA.scope || 'Total'}</div>
            <div>Method: {itemA.miningMethod}</div>
            <div>Type: {itemA.coalType}</div>
            <div>Status: {itemA.reportedOrDerived}</div>
          </div>
          {onInspectEvidence && (
            <button
              onClick={() => onInspectEvidence(itemA.evidenceId)}
              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 pt-1"
            >
              <FileText className="w-3 h-3" /> View Evidence Record
            </button>
          )}
        </div>

        {/* Source B */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 uppercase tracking-wide">Source Filing B</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">v{itemB.docVersion}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 line-clamp-1">{itemB.docTitle}</div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900">{itemB.value}</span>
            <span className="text-xs font-semibold text-slate-600">{itemB.unit}</span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 grid grid-cols-2 gap-1">
            <div>Scope: {itemB.scope || 'Total'}</div>
            <div>Method: {itemB.miningMethod}</div>
            <div>Type: {itemB.coalType}</div>
            <div>Status: {itemB.reportedOrDerived}</div>
          </div>
          {onInspectEvidence && (
            <button
              onClick={() => onInspectEvidence(itemB.evidenceId)}
              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 pt-1"
            >
              <FileText className="w-3 h-3" /> View Evidence Record
            </button>
          )}
        </div>
      </div>

      {/* 8-Point Dimensional Comparability Checklist */}
      <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          8-Point Comparability Dimension Validation
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: 'Entity Check', match: dimensionCheck.entityMatch },
            { label: 'Metric Check', match: dimensionCheck.metricMatch },
            { label: 'Period Window', match: dimensionCheck.periodMatch },
            { label: 'Unit Normalization', match: dimensionCheck.unitMatch },
            { label: 'Scope Boundary', match: dimensionCheck.scopeMatch },
            { label: 'Coal Grade Type', match: dimensionCheck.coalTypeMatch },
            { label: 'OC vs UG Method', match: dimensionCheck.methodMatch },
            { label: 'Document Version', match: dimensionCheck.versionMatch },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded bg-white border border-slate-200 text-[11px]">
              {item.match ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className={item.match ? 'text-slate-800 font-medium' : 'text-amber-800 font-medium'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Explanation */}
      <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 text-xs space-y-1.5">
        <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
          Auditor Diagnostic Verdict
        </div>
        <p className="leading-relaxed">{reconciliation.diagnosticExplanation}</p>
        {reconciliation.documentaryReason && (
          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
            <strong>Documentary Note:</strong> {reconciliation.documentaryReason}
          </p>
        )}
      </div>
    </div>
  );
};
