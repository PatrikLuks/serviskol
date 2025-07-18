const Notification = require('../models/Notification');

// Vrací statistiky efektivity follow-upů podle varianty
async function getVariantStats(segment, userIds) {
  if (!userIds || userIds.length === 0) {
    return {};
  }
  // Najdi všechny notifikace typu followup pro dané uživatele
  const notifs = await Notification.find({ user: { $in: userIds }, type: 'followup' }).lean();
  // Mapování: { variant: { total, stillIn, left } }
  const stats = {};
  for (const n of notifs) {
    const v = n.variant || 'default';
    if (!stats[v]) stats[v] = { total: 0, userIds: [] };
    stats[v].total++;
    stats[v].userIds.push(n.user.toString());
  }
  // Pro každou variantu zjisti, kolik uživatelů je stále v segmentu
  for (const v in stats) {
    const users = await require('../models/User').find({ _id: { $in: stats[v].userIds } }).lean();
    stats[v].stillIn = users.filter(u => u.aiSegment === segment).length;
    stats[v].left = users.length - stats[v].stillIn;
    stats[v].percentRetained = users.length ? Math.round((stats[v].stillIn / users.length) * 100) : 0;
    stats[v].percentLeft = users.length ? Math.round((stats[v].left / users.length) * 100) : 0;
  }
  return stats;
}

module.exports = getVariantStats;
