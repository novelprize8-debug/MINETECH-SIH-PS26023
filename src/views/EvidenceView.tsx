import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  GitCompare,
  CheckCircle,
  FileCheck,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { EvidenceRecord, ReconciliationResult, UserProfile } from '../types';
import { ReconciliationCard } from '../components/ReconciliationCard';

interface EvidenceViewProps {
  currentUser: UserProfile | null;
  onInspectEvidence: (evidence: EvidenceRecord) => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ currentUser, onInspectEvidence }) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Pair-wise Reconciliation Selector State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/evidence');
      const data = await res.json();
      if (data.evidence) {
        setEvidenceList(data.evidence);
      }
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [currentUser?.role]);

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
      setReconciliationResult(null);
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
      setReconciliationResult(null);
    }
  };

  const handleRunPairReconciliation = async () => {
    if (selectedForCompare.length !== 2) return;
    setIsReconciling(true);
    try {
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceIdA: selectedForCompare[0],
          evidenceIdB: selectedForCompare[1]
        })
      });
      const data = await res.json();
      setReconciliationResult(data);
    } catch (err) {
      console.error('Reconciliation error:', err);
    } finally {
      setIsReconciling(false);
    }
  };

  const filteredList = evidenceList.filter((e) => {
    const matchesSearch =
      e.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'ALL' || e.entity === entityFilter;
    const matchesPeriod = periodFilter === 'ALL' || e.period === periodFilter;
    const matchesMethod = methodFilter === 'ALL' || e.miningMethod === methodFilter;

    return matchesSearch && matchesEntity && matchesPeriod && matchesMethod;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verified Evidence Inventory</h2>
          <p className="text-xs text-slate-500">
            Granular atomic assertions extracted from authorized statutory filings with source citations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedForCompare.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-mono">
                {selectedForCompare.length}/2 selected for compare
              </span>
              <button
                onClick={handleRunPairReconciliation}
                disabled={selectedForCompare.length !== 2 || isReconciling}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <GitCompare className="w-4 h-4" />
                {isReconciling ? 'Reconciling 8-Dimensions…' : 'Run 8-Point Reconciliation'}
              </button>
              <button
                onClick={() => {
                  setSelectedForCompare([]);
                  setReconciliationResult(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Direct Reconciliation Viewer when user triggers pair compare */}
      {reconciliationResult && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-amber-600" />
            Active Pair Reconciliation Result
          </div>
          <ReconciliationCard
            reconciliation={reconciliationResult}
            onInspectEvidence={(id) => {
              const found = evidenceList.find((e) => e.id === id);
              if (found) onInspectEvidence(found);
            }}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search metric, document, or excerpt…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-800"
          >
            <option value="ALL">All Entities</option>
            <option value="MCL">MCL</option>
            <option value="SECL">SECL</option>
            <option value="NCL">NCL</option>
            <option value="ECL">ECL</option>
            <option value="BCCL">BCCL</option>
            <option value="CIL">CIL Total</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Period:</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-800"
          >
            <option value="ALL">All Periods</option>
            <option value="FY2024-25">FY2024-25</option>
            <option value="FY2023-24">FY2023-24</option>
            <option value="FY2022-23">FY2022-23</option>
            <option value="FY2021-22">FY2021-22</option>
            <option value="FY2020-21">FY2020-21</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-800"
          >
            <option value="ALL">All Methods</option>
            <option value="TOTAL">TOTAL</option>
            <option value="OC">Opencast (OC)</option>
            <option value="UG">Underground (UG)</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            Authorized Evidence Records ({filteredList.length} matching)
          </span>
          <span className="text-[11px] text-slate-500">
            Select checkboxes to compare any 2 records in the Reconciliation Engine
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-8 text-center">Compare</th>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Scope / Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Source Document</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((ev) => {
                const isSelected = selectedForCompare.includes(ev.id);
                return (
                  <tr
                    key={ev.id}
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isSelected ? 'bg-amber-50/50' : ''
                    }`}
                    onClick={() => onInspectEvidence(ev)}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectForCompare(ev.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{ev.metric}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{ev.entity}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-extrabold text-slate-900">{ev.value}</span>{' '}
                      <span className="text-[10px] text-slate-500">{ev.unit}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{ev.period}</td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                        {ev.miningMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {ev.reportedOrDerived === 'REPORTED' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          REPORTED
                        </span>
                      )}
                      {ev.reportedOrDerived === 'DERIVED' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          DERIVED
                        </span>
                      )}
                      {ev.reportedOrDerived === 'USER_PROVIDED' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          USER_PROVIDED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate text-slate-600">
                      {ev.docTitle} (p.{ev.page})
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectEvidence(ev);
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs flex items-center justify-end gap-1 ml-auto"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
