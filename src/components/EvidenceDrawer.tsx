import React from 'react';
import { X, ExternalLink, CheckCircle2, ShieldAlert, FileText, Database, GitBranch, ArrowRight } from 'lucide-react';
import { EvidenceRecord } from '../types';

interface EvidenceDrawerProps {
  evidence: EvidenceRecord | null;
  onClose: () => void;
  onSelectEvidence?: (evidenceId: string) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidence,
  onClose,
  onSelectEvidence
}) => {
  if (!evidence) return null;

  const getStatusBadge = () => {
    switch (evidence.reportedOrDerived) {
      case 'REPORTED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">REPORTED (STATUTORY FILING)</span>;
      case 'DERIVED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">DERIVED (DETERMINISTIC COMPUTATION)</span>;
      case 'USER_PROVIDED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">USER PROVIDED (PRIVATE / UNVERIFIED)</span>;
    }
  };

  const getClassificationBadge = () => {
    switch (evidence.classification) {
      case 'HIGHLY_RESTRICTED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">HIGHLY RESTRICTED</span>;
      case 'CONFIDENTIAL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">CONFIDENTIAL</span>;
      case 'INTERNAL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">INTERNAL CIL USE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">PUBLIC DISCLOSURE</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">
                Evidence Provenance Inspector
              </span>
            </div>
            <h2 className="text-base font-bold mt-0.5 text-slate-100">
              Where did this number come from?
            </h2>
          </div>
          <button
            id="close-evidence-drawer-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {/* Hero Value Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase text-slate-500 font-medium tracking-wide">
                Targeted Metric Claim
              </span>
              <div className="flex items-center gap-1.5">
                {getStatusBadge()}
                {getClassificationBadge()}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {evidence.value}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {evidence.unit}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-slate-200">
              <div>
                <span className="font-semibold text-slate-700">Entity:</span> {evidence.entity}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Reporting Period:</span> {evidence.period}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Mining Scope:</span> {evidence.scope || 'Company Total'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Method:</span> {evidence.miningMethod} (Opencast / Underground)
              </div>
            </div>
          </div>

          {/* Source Document Container */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              Source Document Container
            </h3>
            <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5">
              <div>
                <div className="text-xs text-slate-500">Document Title</div>
                <div className="font-bold text-slate-900 text-sm">{evidence.docTitle}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Document Ref #:</span>{' '}
                  <span className="font-mono font-medium text-slate-800">{evidence.docNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Audited Version:</span>{' '}
                  <span className="font-mono font-medium text-slate-800">{evidence.docVersion}</span>
                </div>
                <div>
                  <span className="text-slate-500">Issuing Authority:</span>{' '}
                  <span className="font-medium text-slate-800">{evidence.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-slate-500">Verified Timestamp:</span>{' '}
                  <span className="font-mono text-slate-800">{new Date(evidence.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location in Source & Verbatim Excerpt */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Location & Verbatim Extraction Excerpt
            </h3>
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-200 text-emerald-900 font-medium">
                <span>Page {evidence.page}</span>
                <span>{evidence.tableOrSection}</span>
              </div>
              <blockquote className="italic text-xs leading-relaxed text-slate-800 bg-white/80 p-3 rounded border border-emerald-100">
                "{evidence.excerpt}"
              </blockquote>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                <span>Extraction Engine: <strong className="font-mono text-slate-800">{evidence.extractionMethod}</strong></span>
                <span className="flex items-center gap-1">
                  Confidence Score:
                  <strong className="text-emerald-700 font-mono">{(evidence.confidence * 100).toFixed(1)}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Traceability & Relationships */}
          {evidence.relationships && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-slate-600" />
                Knowledge Graph Relationships
              </h3>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                {evidence.relationships.derivedFrom && evidence.relationships.derivedFrom.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700">DERIVED_FROM:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evidence.relationships.derivedFrom.map((id) => (
                        <button
                          key={id}
                          onClick={() => onSelectEvidence && onSelectEvidence(id)}
                          className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-mono text-[10px] flex items-center gap-1"
                        >
                          {id} <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {evidence.relationships.contradicts && evidence.relationships.contradicts.length > 0 && (
                  <div>
                    <span className="font-semibold text-red-700">CONTRADICTS / PROVISIONAL VARIANCE:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evidence.relationships.contradicts.map((id) => (
                        <button
                          key={id}
                          onClick={() => onSelectEvidence && onSelectEvidence(id)}
                          className="px-2 py-0.5 rounded bg-red-100 text-red-800 hover:bg-red-200 font-mono text-[10px] flex items-center gap-1"
                        >
                          {id} <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Synthetic Demo Warning */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">DEMO DATA • SYNTHETIC • NON-AUTHORITATIVE</strong>
              This record is a pre-seeded SIH demonstration fixture modeling CMPDI/CIL reporting schemas. It is not an official legal government release.
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-500 text-[11px]">ID: {evidence.id}</span>
          <button
            id="close-drawer-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
