import React, { useState, useEffect } from 'react';
import { AnswerResponse, EvidenceRecord, NavTab, UserProfile, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { DashboardView } from './views/DashboardView';
import { AskView } from './views/AskView';
import { DocumentsView } from './views/DocumentsView';
import { EvidenceView } from './views/EvidenceView';
import { AnalyticsView } from './views/AnalyticsView';
import { ReportsView } from './views/ReportsView';
import { ResearchComparisonView } from './views/ResearchComparisonView';
import { AuditView } from './views/AuditView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [inspectedEvidence, setInspectedEvidence] = useState<EvidenceRecord | null>(null);
  const [activeAnswer, setActiveAnswer] = useState<AnswerResponse | null>(null);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    fetchUser();
  }, []);

  // Handle role switch
  const handleRoleSwitch = async (newRole: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        // If an active answer exists, re-run query with new role credentials
        if (activeAnswer) {
          handleRunQuery(activeAnswer.query);
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  // Execute query pipeline
  const handleRunQuery = async (queryText: string) => {
    setIsLoadingQuery(true);
    setActiveTab('ask');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });
      const data = await res.json();
      setActiveAnswer(data);
    } catch (err) {
      console.error('Error running query:', err);
    } finally {
      setIsLoadingQuery(false);
    }
  };

  // Inspect specific evidence record in Evidence Drawer
  const handleInspectEvidence = (evidence: EvidenceRecord) => {
    setInspectedEvidence(evidence);
  };

  // Render active tab view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRunQuery={handleRunQuery}
          />
        );

      case 'ask':
        return (
          <AskView
            currentUser={currentUser}
            onInspectEvidence={handleInspectEvidence}
            activeAnswer={activeAnswer}
            isLoading={isLoadingQuery}
            onAskQuery={handleRunQuery}
          />
        );

      case 'documents':
        return (
          <DocumentsView
            currentUser={currentUser}
            onInspectEvidence={handleInspectEvidence}
          />
        );

      case 'evidence':
        return (
          <EvidenceView
            currentUser={currentUser}
            onInspectEvidence={handleInspectEvidence}
          />
        );

      case 'analytics':
        return <AnalyticsView currentUser={currentUser} />;

      case 'reports':
        return <ReportsView currentUser={currentUser} />;

      case 'research':
        return <ResearchComparisonView currentUser={currentUser} />;

      case 'audit':
        return <AuditView currentUser={currentUser} />;

      case 'settings':
        return <SettingsView currentUser={currentUser} />;

      default:
        return (
          <DashboardView
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRunQuery={handleRunQuery}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Enterprise Header */}
      <Navbar
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main App Container */}
      <main className="flex-1 pb-16">{renderActiveView()}</main>

      {/* Evidence Drawer ("Where did this number come from?") */}
      <EvidenceDrawer
        evidence={inspectedEvidence}
        onClose={() => setInspectedEvidence(null)}
        onSelectEvidence={async (id) => {
          try {
            const res = await fetch(`/api/evidence/${id}`);
            const data = await res.json();
            if (data.evidence) {
              setInspectedEvidence(data.evidence);
            }
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}
