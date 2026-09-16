import React from 'react';
import {
  Shield,
  Key,
  Lock,
  Server,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Governance & Security Matrix</h2>
        <p className="text-xs text-slate-500">
          Cryptographic provenance, role clearance matrices, and deterministic arithmetic enforcement parameters
        </p>
      </div>

      {/* Mandatory Demo Disclosure */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Mandatory SIH Demonstration Disclosure
        </div>
        <p className="text-xs leading-relaxed text-amber-900/90 font-mono">
          DEMO DATA • SYNTHETIC • NON-AUTHORITATIVE
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          All document schemas, values, and evidence records displayed in this application represent synthetic
          demonstration fixtures engineered to fulfill SIH 2026 Problem Statement 26023 (CMPDI / Coal India Limited).
          This system is not an official legal publication of the Ministry of Coal.
        </p>
      </div>

      {/* Role-Based Access Control (RBAC) Clearance Matrix */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            RBAC Clearance & Information Classification Matrix
          </h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Max Clearance</th>
                <th className="py-2.5 px-3">Allowed Classifications</th>
                <th className="py-2.5 px-3">Document Upload Type</th>
                <th className="py-2.5 px-3">Audit Log Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900">AUTHORITY</td>
                <td className="py-3 px-3 font-mono text-red-700 font-semibold">HIGHLY_RESTRICTED</td>
                <td className="py-3 px-3 text-slate-600">All (Public, Internal, Confidential, Highly Restricted)</td>
                <td className="py-3 px-3 font-mono text-emerald-700">Official Statutory</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">Full Organization</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900">AUDITOR</td>
                <td className="py-3 px-3 font-mono text-amber-700 font-semibold">CONFIDENTIAL</td>
                <td className="py-3 px-3 text-slate-600">Public, Internal, Confidential</td>
                <td className="py-3 px-3 font-mono text-slate-600">Auditor Notes</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold">Full Organization</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900">EMPLOYEE</td>
                <td className="py-3 px-3 font-mono text-blue-700 font-semibold">INTERNAL</td>
                <td className="py-3 px-3 text-slate-600">Public, Internal</td>
                <td className="py-3 px-3 font-mono text-blue-700">Operational Internal</td>
                <td className="py-3 px-3 text-slate-500">Self Only</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900">RESEARCHER</td>
                <td className="py-3 px-3 font-mono text-slate-700 font-semibold">PUBLIC</td>
                <td className="py-3 px-3 text-slate-600">Public Only</td>
                <td className="py-3 px-3 font-mono text-amber-700 font-semibold">Private / Unverified Only</td>
                <td className="py-3 px-3 text-slate-500">Self Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deterministic Architecture Invariants */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Architecture Invariants & Non-Negotiable Constraints
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">1. LLM Arithmetic Prohibition (Zero Arithmetic by AI)</strong>
              All additions, subtractions, percentage deviations, and compound growth rates (CAGR) are computed exclusively by TypeScript deterministic application code. Gemini is strictly prohibited from doing arithmetic.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">2. Pre-Retrieval Authorization Filtering</strong>
              Role authorization occurs before evidence enters the context window. If a user lacks clearance, restricted records are filtered out at the data layer, guaranteeing zero unauthorized data leakage to the AI model.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">3. Research Document Isolation</strong>
              User and researcher uploads are categorized as <code>PRIVATE / UNVERIFIED</code>. They are tested against official filings via the Research Comparison Engine but are strictly barred from overwriting official statutory filings.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">4. Multi-Dimensional Reconciliation Before Conflict</strong>
              The system never declares two differing numbers contradictory without verifying entity, metric, period, unit, scope, coal grade, mining method, and filing version.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
