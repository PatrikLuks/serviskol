import AlertApprovalPanel from '../components/AlertApprovalPanel';
import AdminReportPanel from '../components/AdminReportPanel';
import AIFeedbackAnalyticsPanel from '../components/AIFeedbackAnalyticsPanel';
import AdminRoleBadge from '../components/AdminRoleBadge';
import DecisionTreeChannel from '../components/DecisionTreeChannel';
import ChannelDropRecommendations from '../components/ChannelDropRecommendations';
import SegmentHeatmapAnalytics from '../components/SegmentHeatmapAnalytics';
import AdminRoleManagerSection from '../components/AdminRoleManagerSection';
import AuditLogPanel from '../components/AuditLogPanel';
import SecurityAlertsPanel from '../components/SecurityAlertsPanel';

const CampaignsAdmin = () => {
  // ...existing state and effect hooks...

  // --- Render ---
  return (
    <div>
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <AdminRoleBadge />
      </div>
      <SecurityAlertsPanel />
      <AdminRoleManagerSection />
      <AuditLogPanel />
      {/* Rozložení doporučených kanálů podle DecisionTree */}
      <section>
        <h2 className="text-2xl font-bold mb-4 mt-10">Rozložení doporučených kanálů (DecisionTree)</h2>
        <div className="mb-6 p-4 border rounded bg-blue-50">
          <DecisionTreeChannelPieChart data={dtPieData} />
        </div>
      </section>

      {/* AI doporučení pro novou kampaň */}
      <section>
        <h2 className="text-2xl font-bold mb-4 mt-10">AI doporučení pro novou kampaň</h2>
        <div className="mb-6 p-4 border rounded bg-blue-50">
          {aiRecLoading ? (
            <div>Načítání doporučení...</div>
          ) : aiRecError ? (
            <div className="text-red-500">{aiRecError}</div>
          ) : aiRec ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Doporučený segment: </span>
                {aiRec.recommendedSegment ? Object.entries(aiRec.recommendedSegment).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Není dostatek dat'}
              </div>
              <div>
                <span className="font-semibold">Doporučený obsah: </span>
                {aiRec.recommendedContent ? (
                  <>
                    <span className="italic">{aiRec.recommendedContent.text}</span>
                    {aiRec.recommendedContent.faq && <span> (FAQ: {aiRec.recommendedContent.faq})</span>}
                    <span className="ml-2 text-xs text-gray-500">(CTR: {(aiRec.recommendedContent.ctr*100).toFixed(1)}%)</span>
                  </>
                ) : 'Není dostatek dat'}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Doporučení: uživatelé s nejvyšší predikcí engagementu */}
      <section className="mb-6 p-4 border rounded bg-green-50">
        <div className="font-semibold mb-2 flex items-center gap-4">Doporučení: uživatelé s nejvyšší predikcí engagementu
          {!aiUsersLoading && aiUsers.length > 0 && (
            <>
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                onClick={() => {
      {/* Schvalovací workflow pro alerty */}
      <div>
        <AIFeedbackAnalyticsPanel />
        <AdminReportPanel />
        <AlertApprovalPanel />
      </div>
                  const csv = [
                    ['Jméno','E-mail','Role','Region','Věk','Engagement','Predikce'],
                    ...aiUsers.map(u => [u.name, u.email, u.role, u.region, u.age, u.engagementScore, u.predictedEngagement.toFixed(2)])
                  ].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'doporučení-uživatelé.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >Export CSV</button>
              <button
                className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                onClick={async () => {
                  for (const u of aiUsers) {
                    try {
                      const res = await axios.get(`/api/admin/user/${u._id}/predict-channel`);
                      const bestChannel = res.data.bestChannel;
                      if (bestChannel && bestChannel !== u.preferredChannel) {
                        await axios.patch(`/api/admin/user/${u._id}/preferred-channel`, { preferredChannel: bestChannel });
                        setAiUsers(users => users.map(x => x._id === u._id ? { ...x, preferredChannel: bestChannel } : x));
                      }
                    } catch (e) {
                      // ignore
                    }
                  }
                  alert('Preferované kanály byly aktualizovány podle AI doporučení.');
                }}
              >Přepnout všem na AI kanál</button>
            </>
          )}
        </div>
        {aiUsersLoading ? (
          <div>Načítání uživatelů...</div>
        ) : aiUsersError ? (
          <div className="text-red-500">{aiUsersError}</div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Jméno</th>
                <th className="border p-1">E-mail</th>
                <th className="border p-1">Role</th>
                <th className="border p-1">Region</th>
                <th className="border p-1">Věk</th>
                <th className="border p-1">Engagement</th>
                <th className="border p-1">Predikce</th>
                <th className="border p-1">Preferovaný kanál</th>
                <th className="border p-1">AI doporučený kanál</th>
                <th className="border p-1">DecisionTree kanál</th>
              </tr>
            </thead>
            <tbody>
              {aiUsers.map(u => (
                <tr key={u._id}>
                  <td className="border p-1">{u.name}</td>
                  <td className="border p-1">{u.email}</td>
                  <td className="border p-1">{u.role}</td>
                  <td className="border p-1">{u.region}</td>
                  <td className="border p-1">{u.age}</td>
                  <td className="border p-1">{u.engagementScore}</td>
                  <td className="border p-1">{u.predictedEngagement.toFixed(2)}</td>
                  <td className="border p-1">
                    <select
                      value={u.preferredChannel || ''}
                      onChange={async e => {
                        const newChannel = e.target.value;
                        try {
                          await axios.patch(`/api/admin/user/${u._id}/preferred-channel`, { preferredChannel: newChannel });
                          setAiUsers(users => users.map(x => x._id === u._id ? { ...x, preferredChannel: newChannel } : x));
                        } catch {
                          alert('Chyba při ukládání preferovaného kanálu.');
                        }
                      }}
                      className="border p-1"
                    >
                      <option value="">(výchozí)</option>
                      <option value="in-app">in-app</option>
                      <option value="email">email</option>
                      <option value="push">push</option>
                      <option value="sms">sms</option>
                    </select>
                  </td>
                  <td className="border p-1">
                    {/* AI doporučený kanál */}
                  </td>
                  <td className="border p-1">
                    <DecisionTreeChannel userId={u._id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Spustit/plánovat A/B kampaň */}
      <section>
        <h2 className="text-2xl font-bold mb-4 mt-10">Spustit/plánovat A/B kampaň</h2>
        <form onSubmit={handleAbLaunch} className="mb-8 p-4 border rounded bg-gray-50 flex flex-col gap-2">
          <input required placeholder="Téma" value={abForm.tema} onChange={e => setAbForm(f => ({ ...f, tema: e.target.value }))} className="border p-1" />
          <div className="flex flex-wrap gap-2">
            <select value={abForm.segment.role} onChange={e => setAbForm(f => ({ ...f, segment: { ...f.segment, role: e.target.value } }))} className="border p-1">
              <option value="">Všichni uživatelé</option>
              <option value="client">Klienti</option>
              <option value="mechanic">Mechanici</option>
              <option value="admin">Admini</option>
            </select>
            <input placeholder="Region" value={abForm.segment.region || ''} onChange={e => setAbForm(f => ({ ...f, segment: { ...f.segment, region: e.target.value } }))} className="border p-1" />
            <input type="number" min="0" placeholder="Věk od" value={abForm.segment.ageMin || ''} onChange={e => setAbForm(f => ({ ...f, segment: { ...f.segment, ageMin: e.target.value } }))} className="border p-1 w-24" />
            <input type="number" min="0" placeholder="Věk do" value={abForm.segment.ageMax || ''} onChange={e => setAbForm(f => ({ ...f, segment: { ...f.segment, ageMax: e.target.value } }))} className="border p-1 w-24" />
            <input type="date" placeholder="Poslední přihlášení od" value={abForm.segment.lastLoginSince || ''} onChange={e => setAbForm(f => ({ ...f, segment: { ...f.segment, lastLoginSince: e.target.value } }))} className="border p-1" />
            <input type="number" min="0" placeholder="Min. engagement" value={abForm.segment.engagementMin || ''} onChange={e => setAbForm(f => ({ ...f, segment: { ...f.segment, engagementMin: e.target.value } }))} className="border p-1 w-32" />
          </div>
          <div className="flex gap-4">
            {abForm.variants.map((v, i) => (
              <div key={v.label} className="flex flex-col gap-1 border p-2 rounded bg-white">
                <div className="font-semibold">Varianta {v.label}</div>
                <textarea required placeholder="Text notifikace" value={v.text} onChange={e => setAbForm(f => { const vs = [...f.variants]; vs[i].text = e.target.value; return { ...f, variants: vs }; })} className="border p-1" rows={2} />
                <input placeholder="FAQ odkaz (volitelné)" value={v.faq} onChange={e => setAbForm(f => { const vs = [...f.variants]; vs[i].faq = e.target.value; return { ...f, variants: vs }; })} className="border p-1" />
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={abForm.autoSelectWinner} onChange={e => setAbForm(f => ({ ...f, autoSelectWinner: e.target.checked }))} />
              Automaticky vybrat vítěze po dosažení 1000 odeslání
            </label>
            <label className="flex items-center gap-1">
              <span>Plánované odeslání:</span>
              <input type="datetime-local" value={abForm.scheduledAt} onChange={e => setAbForm(f => ({ ...f, scheduledAt: e.target.value }))} className="border p-1" />
            </label>
          </div>
          <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded" disabled={abLaunching}>Odeslat/naplánovat A/B kampaň</button>
          {abLaunchResult && <div className={abLaunchResult.startsWith('Chyba') ? 'text-red-500' : 'text-green-600'}>{abLaunchResult}</div>}
        </form>
      </section>

      {/* Historie alertů a export */}
      <section>
        <h2 className="text-2xl font-bold mb-4 mt-10">Historie alertů a export</h2>
        <div className="mb-8 p-4 border rounded bg-yellow-100">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (alertLogsFilter?.channel) params.append('channel', alertLogsFilter.channel);
              if (alertLogsFilter?.type) params.append('type', alertLogsFilter.type);
              if (alertLogsFilter?.actionType) params.append('actionType', alertLogsFilter.actionType);
              if (alertLogsFilter?.actionResult) params.append('actionResult', alertLogsFilter.actionResult);
              if (alertLogsFilter?.since) params.append('since', alertLogsFilter.since);
              if (alertLogsFilter?.until) params.append('until', alertLogsFilter.until);
              if (alertLogsFilter?.segmentRole) params.append('segmentRole', alertLogsFilter.segmentRole);
              if (alertLogsFilter?.segmentRegion) params.append('segmentRegion', alertLogsFilter.segmentRegion);
              if (alertLogsFilter?.segmentAgeGroup) params.append('segmentAgeGroup', alertLogsFilter.segmentAgeGroup);
              window.open(`/api/admin/alert-logs/export-csv?${params.toString()}`);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs mb-2"
          >Exportovat alerty (CSV)</button>
          {/* ...stávající export kampaní... */}
          <button onClick={handleExport} className="ml-2 px-2 py-1 bg-gray-500 text-white rounded text-xs mb-2">Exportovat kampaně (CSV)</button>
          {loading ? (
            <div>Načítání kampaní...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1">Téma</th>
                  <th className="border p-1">Text</th>
                  <th className="border p-1">FAQ</th>
                  <th className="border p-1">Role</th>
                  <th className="border p-1">E-mail</th>
                  <th className="border p-1">Datum</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i}>
                    <td className="border p-1">{c.tema}</td>
                    <td className="border p-1">{c.text}</td>
                    <td className="border p-1">{c.faq}</td>
                    <td className="border p-1">{c.userRole}</td>
                    <td className="border p-1">{c.userEmail}</td>
                    <td className="border p-1">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ChannelDropRecommendations a další analytiky */}
      <ChannelDropRecommendations />
      <SegmentHeatmapAnalytics />
      {/* Další analytické/vizualizační komponenty lze přidat zde */}
    </div>
  );
};

export default CampaignsAdmin;
