import React, { useState } from 'react';
import { Shield, ShieldAlert, User, ChevronDown, Check, FileCheck, Layers } from 'lucide-react';
import { Classification, NavTab, UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onRoleSwitch: (role: UserRole) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  activeTab,
  onTabChange,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: Array<{ role: UserRole; label: string; clearance: Classification; desc: string }> = [
    { role: 'AUTHORITY', label: 'Dr. A. K. Singh (Director Technical)', clearance: 'HIGHLY_RESTRICTED', desc: 'Apex Board clearance, unrestricted access' },
    { role: 'EMPLOYEE', label: 'Rajesh Sharma (MCL Operations)', clearance: 'INTERNAL', desc: 'Mine planning & internal operational access' },
    { role: 'AUDITOR', label: 'Priya Narayanan (Statutory CAG)', clearance: 'CONFIDENTIAL', desc: 'Audit inspection & compliance verification' },
    { role: 'RESEARCHER', label: 'Dr. Vivek Sengupta (CMPDI Research)', clearance: 'PUBLIC', desc: 'Public records & private research comparison' },
  ];

  const getClearanceBadge = (clearance?: Classification) => {
    switch (clearance) {
      case 'HIGHLY_RESTRICTED':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-red-900/80 text-red-200 border border-red-700">CLEARANCE: HIGHLY RESTRICTED</span>;
      case 'CONFIDENTIAL':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/80 text-amber-200 border border-amber-700">CLEARANCE: CONFIDENTIAL</span>;
      case 'INTERNAL':
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/80 text-blue-200 border border-blue-700">CLEARANCE: INTERNAL</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700">CLEARANCE: PUBLIC</span>;
    }
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner: Synthetic Demo Disclaimer */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold tracking-wider text-[10px]">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            DEMO DATA • SYNTHETIC • NON-AUTHORITATIVE
          </span>
          <span className="hidden sm:inline text-slate-400">
            SIH 2026 Solution for PS 26023 (CMPDI / Coal India Limited) • Verifiable Evidence Layer
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span className="hidden md:inline">FIND → VERIFY → RECONCILE → CALCULATE → EXPLAIN → REPORT</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ENGINE READY
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-lg bg-emerald-800 border border-emerald-600 flex items-center justify-center text-emerald-200 shadow-md">
            <FileCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                EVIDENCE-GOVERNED MINING INTELLIGENCE
              </h1>
              <span className="hidden lg:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                V2 Production Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Auditable reporting & calculation layer for Coal India Limited & CMPDI
            </p>
          </div>
        </div>

        {/* User Role Switcher & Clearance Badge */}
        <div className="relative">
          <button
            id="role-selector-btn"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-semibold">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="font-medium text-slate-200 flex items-center gap-1.5">
                <span>{currentUser?.name || 'Authorized User'}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-slate-700 text-slate-300">
                  {currentUser?.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                {currentUser?.department || 'Coal Mining Directorate'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Role Dropdown */}
          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-slate-850 border border-slate-700 shadow-2xl z-50 p-2 text-xs bg-slate-900">
              <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Security Persona (RBAC Simulation)
              </div>
              <div className="py-1 space-y-1">
                {roles.map((r) => {
                  const isActive = currentUser?.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleSwitch(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded flex items-start gap-2.5 transition ${
                        isActive
                          ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-200'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isActive ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-100 flex items-center justify-between">
                          <span>{r.role}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{r.clearance}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">{r.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-2 border-t border-slate-800 text-[10px] text-slate-400">
                Notice: Unauthorized documents and evidence are pruned at retrieval level prior to Gemini model exposure.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-slate-800 bg-slate-950/80 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-2 text-xs font-medium">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'ask', label: 'Ask Intelligence' },
            { id: 'documents', label: 'Documents' },
            { id: 'evidence', label: 'Evidence Inventory' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'reports', label: 'Reports' },
            { id: 'research', label: 'Research Comparison' },
            { id: 'audit', label: 'Audit Trail' },
            { id: 'settings', label: 'Governance & Security' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id as NavTab)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                {tab.id === 'ask' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
