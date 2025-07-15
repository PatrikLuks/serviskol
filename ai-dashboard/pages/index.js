import OnboardingFeedbackForm from '../components/OnboardingFeedbackForm';
        <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow p-4 mb-6">
          <OnboardingFeedbackForm />
        </div>
import OnboardingChecklist from '../components/OnboardingChecklist';
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-4 mb-6">
          <OnboardingChecklist />
        </div>
import ExecutiveSummary from '../components/ExecutiveSummary';
import UnrealizedImpact from '../components/UnrealizedImpact';
import NotionTrendsChart from '../components/NotionTrendsChart';
import NotionTasksReport from '../components/NotionTasksReport';
import NotionSyncButton from '../components/NotionSyncButton';
import ComplianceReport from '../components/ComplianceReport';
import LessonsLearned from '../components/LessonsLearned';
import RecommendationsStatus from '../components/RecommendationsStatus';
import SIEMExport from '../components/SIEMExport';
import LLMAuditSummary from '../components/LLMAuditSummary';
import AnomalyDetection from '../components/AnomalyDetection';
import AuditLogExport from '../components/AuditLogExport';
import WhatIfSimulation from '../components/WhatIfSimulation';
import GovernanceSelfTest from '../components/GovernanceSelfTest';
import LastAutomatedRiskResponse from '../components/LastAutomatedRiskResponse';
import AISecurityAnalysis from '../components/AISecurityAnalysis';
import SecurityAudit from '../components/SecurityAudit';

import { useState, useEffect } from 'react';
import PromptForm from '../components/PromptForm';
import History from '../components/History';
import ReportsList from '../components/ReportsList';
import PendingProposalsList from '../components/PendingProposalsList';
import NewAutomationProposalForm from '../components/NewAutomationProposalForm';
import PromptManager from '../components/PromptManager';
import AuditLogViewer from '../components/AuditLogViewer';
import WorkflowMap from '../components/WorkflowMap';
import UserInfo from '../components/UserInfo';
import AdminUserManagement from '../components/AdminUserManagement';
import SecurityAlerts from '../components/SecurityAlerts';
import GovernanceReport from '../components/GovernanceReport';
import IncidentRiskPrediction from '../components/IncidentRiskPrediction';
import LastEscalationStatus from '../components/LastEscalationStatus';

  const [result, setResult] = useState('');
  const [dark, setDark] = useState(false);

  // Načtení preferencí z localStorage nebo systému
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setDark(saved === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <h1 className="text-2xl font-bold text-center sm:text-left">AI Strategický Dashboard</h1>
          <div className="flex gap-2 items-center">
            <UserInfo />
            <button
              className="px-3 py-1 rounded border text-xs bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition self-center sm:self-auto"
              onClick={() => setDark(d => !d)}
              title="Přepnout světlý/tmavý režim"
            >
              {dark ? '🌙 Tmavý' : '☀️ Světlý'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <PromptForm onResult={setResult} />
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold mb-2">Výstup AI:</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded whitespace-pre-wrap overflow-x-auto text-sm md:text-base">{result}</pre>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <History onSelect={setResult} />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <ReportsList />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <PendingProposalsList />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <NewAutomationProposalForm />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <PromptManager onChange={() => {}} />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <AuditLogViewer />
        </div>


        {/* Admin sekce pro správu uživatelů a rolí */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <AdminUserManagement />
        </div>

        {/* Eskalace incidentů a bezpečnostní alerty */}
        <LastEscalationStatus />
        <div className="bg-red-50 dark:bg-red-900 rounded-lg shadow p-4 mb-6">
          <SecurityAlerts />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <GovernanceReport />
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <LessonsLearned />
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <RecommendationsStatus />
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <NotionSyncButton />
        </div>
        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg shadow p-4 mb-6">
          <IncidentRiskPrediction />
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4">
          <WorkflowMap />
        </div>
      </div>
    </div>
  );
