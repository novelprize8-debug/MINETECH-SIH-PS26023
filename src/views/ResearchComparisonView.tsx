import React, { useState } from 'react';
import {
  FlaskConical,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { ResearchComparisonItem, UserProfile } from '../types';

interface ResearchComparisonViewProps {
  currentUser: UserProfile | null;
}

export const ResearchComparisonView: React.FC<ResearchComparisonViewProps> = ({ currentUser }) => {
  const [comparisons, setComparisons] = useState<ResearchComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Editable researcher claim inputs
  const [claimEntity, setClaimEntity] = useState('MCL');
  const [claimPeriod, setClaimPeriod] = useState('FY2023-24');
  const [claimMetric, setClaimMetric] = useState('Raw Coal Production');
  const [claimValue, setClaimValue] = useState('208.50');
  const [claimExcerpt, setClaimExcerpt] = useState('Field drone photogrammetry estimated total extraction as 208.50 MT.');

  const sampleResearchSets = [
    {
      label: 'Sample Set A (Over-reporting Conflict)',
      entity: 'MCL',
      period: 'FY2023-24',
      metric: 'Raw Coal Production',
      value: '215.40',
      excerpt: 'Satellite radar assessment indicates 215.40 MT total pithead extraction.'
    },
    {
      label: 'Sample Set B (Consistent with Ground Truth)',
      entity: 'MCL',
      period: 'FY2023-24',
      metric: 'Raw Coal Production',
      value: '206.10',
      excerpt: 'IIT Kharagpur independent audit verifies 206.10 MT statutory output.'
    },
    {
      label: 'Sample Set C (Methodological Mismatch / Opencast Only)',
      entity: 'MCL',
      period: 'FY2023-24',
      metric: 'Opencast Coal Extraction',
      value: '205.85',
      excerpt: 'Pithead conveyor sensors recorded 205.85 MT from opencast faces.'
    }
  ];

  const handleRunComparison = async () => {
    setIsLoading(true);
    setHasRun(true);
    try {
      const payload = {
        claims: [
          {
            entity: claimEntity,
            period: claimPeriod,
            metric: claimMetric,
            value: Number(claimValue),
            unit: 'MT',
            excerpt: claimExcerpt
          }
        ]
      };

      const res = await fetch('/api/research-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.comparisons) {
        setComparisons(data.comparisons);
      }
    } catch (err) {
      console.error('Error running comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusCard = (item: ResearchComparisonItem) => {
    switch (item.status) {
      case 'SUPPORTED':
        return (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                STATUS: SUPPORTED
              </span>
              <span className="text-[10px] font-mono text-emerald-700">Variance &lt; 0.1%</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{item.reason}</p>
          </div>
        );

      case 'CONFLICTING':
        return (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800">
                <XCircle className="w-4 h-4 text-red-600" />
                STATUS: CONFLICTING
              </span>
              <span className="text-[10px] font-mono text-red-700">Audited Figure Differs</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{item.reason}</p>
          </div>
        );

      case 'NOT COMPARABLE':
        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                STATUS: NOT COMPARABLE
              </span>
              <span className="text-[10px] font-mono text-amber-700">Methodology / Scope Divergence</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{item.reason}</p>
          </div>
        );

      case 'NO MATCHING EVIDENCE':
      default:
        return (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                STATUS: NO MATCHING EVIDENCE
              </span>
              <span className="text-[10px] font-mono text-slate-500">Uncovered Domain</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{item.reason}</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Research Comparison & Academic Paper Verification
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-checks independent research findings and survey claims against CIL statutory filings
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          ISOLATED EVALUATION ENGINE
        </span>
      </div>

      {/* Mandatory Non-Overriding Rule Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs border border-slate-800 flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span>RESEARCH DATA IS STRICTLY CLASSIFIED AS PRIVATE / UNVERIFIED</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Independent research documents, field surveys, and academic estimates are tested against the
            CIL statutory corpus for alignment. <strong>They are never permitted to overwrite official government ground truth.</strong>
          </p>
        </div>
      </div>

      {/* Input Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Claim Inputs (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Submit Claim to Test Against Statutory Filings
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Entity</label>
              <select
                value={claimEntity}
                onChange={(e) => setClaimEntity(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="MCL">Mahanadi Coalfields (MCL)</option>
                <option value="SECL">South Eastern Coalfields (SECL)</option>
                <option value="NCL">Northern Coalfields (NCL)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Period</label>
                <select
                  value={claimPeriod}
                  onChange={(e) => setClaimPeriod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                >
                  <option value="FY2023-24">FY2023-24</option>
                  <option value="FY2022-23">FY2022-23</option>
                  <option value="FY2021-22">FY2021-22</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Claimed Value (MT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={claimValue}
                  onChange={(e) => setClaimValue(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Claimed Metric</label>
              <input
                type="text"
                value={claimMetric}
                onChange={(e) => setClaimMetric(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Verbatim Claim Excerpt</label>
              <textarea
                rows={3}
                value={claimExcerpt}
                onChange={(e) => setClaimExcerpt(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={handleRunComparison}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              {isLoading ? 'Verifying against statutory corpus…' : 'Execute Research Verification'}
            </button>
          </div>

          {/* Quick Pre-loads */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Pre-loaded Test Scenarios:
            </span>
            <div className="space-y-1.5">
              {sampleResearchSets.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setClaimEntity(s.entity);
                    setClaimPeriod(s.period);
                    setClaimMetric(s.metric);
                    setClaimValue(s.value);
                    setClaimExcerpt(s.excerpt);
                  }}
                  className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 truncate block transition"
                >
                  {s.label} ({s.value} MT)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Verification Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Statutory Alignment Evaluation Result
            </h3>

            {!hasRun && (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                Click "Execute Research Verification" or choose a scenario to compare research against official statutory evidence.
              </div>
            )}

            {hasRun && comparisons.length === 0 && !isLoading && (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching comparison output returned.
              </div>
            )}

            {comparisons.map((item) => (
              <div key={item.id} className="space-y-4">
                {/* 4-Status Evaluator Card */}
                {getStatusCard(item)}

                {/* Evidence Comparison Breakdown */}
                {item.matchingOfficialEvidence && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px] flex items-center justify-between">
                      <span>Official Ground Truth Citation</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        VERIFIED STATUTORY FILING
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase">Researcher Claimed</span>
                        <div className="font-mono text-base font-bold text-slate-900 mt-0.5">
                          {item.claimValue} {item.claimUnit}
                        </div>
                        <span className="text-[10px] text-amber-700">PRIVATE / UNVERIFIED</span>
                      </div>

                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase">CIL Statutory Audited</span>
                        <div className="font-mono text-base font-bold text-emerald-900 mt-0.5">
                          {item.matchingOfficialEvidence.value} {item.matchingOfficialEvidence.unit}
                        </div>
                        <span className="text-[10px] text-emerald-700">AUDITED STATUTORY FILING</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div>
                        <strong>Document:</strong> {item.matchingOfficialEvidence.docTitle} (Page {item.matchingOfficialEvidence.page})
                      </div>
                      <div>
                        <strong>Issuing Authority:</strong> {item.matchingOfficialEvidence.issuingAuthority}
                      </div>
                      <blockquote className="italic text-slate-500 pt-1 border-t border-slate-100">
                        "{item.matchingOfficialEvidence.excerpt}"
                      </blockquote>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
