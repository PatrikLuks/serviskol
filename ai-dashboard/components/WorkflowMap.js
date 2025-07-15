import { useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

const WORKFLOWS = [
  { id: 'incident', label: 'Incident Trend Report', type: 'report' },
  { id: 'voc', label: 'Voice of Customer', type: 'report' },
  { id: 'roadmap', label: 'AI Roadmap Advisor', type: 'ai' },
  { id: 'impact', label: 'AI Impact Report', type: 'ai' },
  { id: 'security', label: 'AI Security Audit', type: 'audit' },
  { id: 'governance', label: 'AI Governance', type: 'audit' },
  { id: 'resilience', label: 'AI Resilience', type: 'ai' },
  { id: 'lessons', label: 'Lessons Learned', type: 'ai' },
  { id: 'hitl', label: 'Human-in-the-Loop', type: 'approval' },
  { id: 'selfimprove', label: 'Self-Improvement', type: 'ai' },
];

const EDGES = [
  ['incident', 'roadmap'],
  ['voc', 'roadmap'],
  ['roadmap', 'impact'],
  ['impact', 'selfimprove'],
  ['impact', 'lessons'],
  ['security', 'governance'],
  ['governance', 'resilience'],
  ['lessons', 'selfimprove'],
  ['hitl', 'impact'],
];

  const permissions = usePermissions();
  const [selected, setSelected] = useState(null);
  const { data: session } = useSession();
  const canEdit = hasPermission(permissions, 'workflow:edit');

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI Workflow Map</h2>
      <div className="relative w-full h-96 bg-white dark:bg-gray-900 border rounded mb-4 overflow-auto">
        <svg width="100%" height="100%" viewBox="0 0 800 350">
          {/* Uzly */}
          {WORKFLOWS.map((w, i) => (
            <g key={w.id} transform={`translate(${100 + (i%5)*140},${60 + Math.floor(i/5)*180})`}>
              <rect
                width="120"
                height="40"
                rx="10"
                fill={selected===w.id?"#2563eb":"#f3f4f6"}
                stroke="#888"
                strokeWidth="2"
                onClick={canEdit ? () => setSelected(w.id) : undefined}
                style={{cursor: canEdit ? 'pointer' : 'not-allowed', opacity: canEdit ? 1 : 0.7}}
              />
              <text x="60" y="25" textAnchor="middle" fontSize="14" fill={selected===w.id?"#fff":"#222"}>{w.label}</text>
            </g>
          ))}
          {/* Hrany */}
          {EDGES.map(([from, to], i) => {
            const fromIdx = WORKFLOWS.findIndex(w => w.id === from);
            const toIdx = WORKFLOWS.findIndex(w => w.id === to);
            if (fromIdx === -1 || toIdx === -1) return null;
            const fx = 100 + (fromIdx%5)*140 + 120;
            const fy = 80 + Math.floor(fromIdx/5)*180;
            const tx = 100 + (toIdx%5)*140;
            const ty = 80 + Math.floor(toIdx/5)*180;
            return <line key={i} x1={fx} y1={fy} x2={tx} y2={ty} stroke="#888" markerEnd="url(#arrow)" />;
          })}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L10,5 L0,10 Z" fill="#888" />
            </marker>
          </defs>
        </svg>
      </div>
      {canEdit && selected && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
          <div className="font-bold mb-1">{WORKFLOWS.find(w=>w.id===selected).label}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">Typ: {WORKFLOWS.find(w=>w.id===selected).type}</div>
          <div className="mt-2 text-xs text-gray-500">(Zde bude detail workflow, poslední běhy, možnost navrhnout změnu...)</div>
        </div>
      )}
      {!canEdit && selected && session?.user && logUnauthorizedAccess({
        user: session.user,
        action: 'edit',
        section: 'workflow-map',
      })}
    </div>
  );
