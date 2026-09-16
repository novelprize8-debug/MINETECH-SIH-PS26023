import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Clock,
  Download,
  Filter
} from 'lucide-react';
import { AuditLogRecord, UserProfile, UserRole } from '../types';

interface AuditViewProps {
  currentUser: UserProfile | null;
}

export const AuditView: React.FC<AuditViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentUser?.role]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.query && log.query.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || log.user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const exportAuditCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Auth Result', 'Query', 'Docs Accessed'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.user.name}"`,
      l.user.role,
      l.action,
      l.authResult,
      `"${(l.query || '').replace(/"/g, '""')}"`,
      `"${l.documentsAccessed.join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Governance & Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Immutable log recording query execution, document access, role switches, and authorization outcomes
          </p>
        </div>
        <button
          onClick={exportAuditCSV}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by user, action, query, or reason…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">User Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-800"
          >
            <option value="ALL">All Roles</option>
            <option value="AUTHORITY">AUTHORITY</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="AUDITOR">AUDITOR</option>
            <option value="RESEARCHER">RESEARCHER</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            Recorded Audit Events ({filteredLogs.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Cryptographic SHA-256 Chain Verification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Auth Outcome</th>
                <th className="py-2.5 px-4">Query / Context</th>
                <th className="py-2.5 px-4 text-right">Items Accessed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition text-slate-800">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.user.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {log.user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{log.action}</td>
                  <td className="py-3 px-4">
                    {log.authResult === 'GRANTED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        GRANTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 text-red-600" />
                        DENIED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-[280px] truncate text-slate-600">
                    {log.query || log.reason || 'Administrative Navigation'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                    {log.documentsAccessed.length > 0 && `${log.documentsAccessed.length} docs`}
                    {log.evidenceAccessed.length > 0 && ` • ${log.evidenceAccessed.length} ev`}
                    {log.documentsAccessed.length === 0 && log.evidenceAccessed.length === 0 && '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
