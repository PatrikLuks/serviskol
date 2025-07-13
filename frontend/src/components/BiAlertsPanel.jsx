import React, { useEffect, useState } from 'react';
import AiSuggestVariantButton from './AiSuggestVariantButton';
import AiTrendPredictionButton from './AiTrendPredictionButton';
import RetentionTrendChart from './RetentionTrendChart';
import NextBestActionButton from './NextBestActionButton';

export default function BiAlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bi/alerts')
      .then(r => r.json())
      .then(data => {
        setAlerts(data.alerts || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="panel">
      <h2>BI/AI Alert Monitoring</h2>
      {loading ? <div>Načítám alerty…</div> : (
        alerts.length === 0 ? <div>Žádné alerty.</div> :
        <ul>
          {alerts.map(a => {
            // Pokus o extrakci automationId a worst varianty z alertu (uloženo v AuditLogu, ale zde pouze message)
            // Pro demo: hledáme v message pattern "automatizace #ID" a "varianta \"XYZ\""
            const automationIdMatch = a.message.match(/automatizace ([a-f0-9]{24})/i);
            const worstVariantMatch = a.message.match(/varianta \"(.+?)\"/i);
            const automationId = a.automationId || (automationIdMatch ? automationIdMatch[1] : null);
            const worstVariant = a.worstVariant || (worstVariantMatch ? worstVariantMatch[1] : null);
            // Pokud alert obsahuje info o deaktivaci varianty, zobrazíme důvod a možnost predikce trendu
            const deactivated = /byla automaticky deaktivována/i.test(a.message);
            // Pro demo: simulujeme historii varianty (v reálnu by se načítala z backendu)
            const fakeHistory = [
              { date: '2025-06-01', retention: 42 },
              { date: '2025-06-08', retention: 38 },
              { date: '2025-06-15', retention: 35 },
              { date: '2025-06-22', retention: 33 },
              { date: '2025-06-29', retention: 31 }
            ];
            // Pro demo: fake segment a channel
            const fakeSegment = 'riziko_odchodu';
            const fakeChannel = 'in-app';
            return (
              <li key={a._id} style={{marginBottom: 12}}>
                <b>{new Date(a.createdAt).toLocaleString()}</b><br/>
                {a.message}
                {deactivated && (
                  <div style={{color: 'orange', marginTop: 4}}>
                    Varianta byla automaticky vypnuta kvůli nízké retenci.<br/>
                    <RetentionTrendChart data={fakeHistory} />
                    <AiTrendPredictionButton variantHistory={fakeHistory} />
                    <NextBestActionButton variantHistory={fakeHistory} segment={fakeSegment} channel={fakeChannel} />
                  </div>
                )}
                {automationId && worstVariant && !deactivated && (
                  <AiSuggestVariantButton automationId={automationId} worstVariant={worstVariant} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
