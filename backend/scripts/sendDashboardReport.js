// Cron skript pro generování a rozesílání dashboard PDF reportu adminům
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateDashboardPdf } = require('../utils/pdfReport');
const Campaign = require('../models/Campaign');
const sendEmail = require('../utils/sendEmail');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/serviskol');
  const admins = await User.find({ role: 'admin' });
  const campaigns = await Campaign.find({});
  // Statistika
  const ctrTrendData = [];
  const byDate = {};
  campaigns.forEach(c => {
    if (!c.createdAt || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const date = new Date(c.createdAt).toISOString().slice(0,10);
    if (!byDate[date]) byDate[date] = { clicks: 0, sent: 0 };
    byDate[date].clicks += c.clickCount;
    byDate[date].sent += c.sentCount;
  });
  Object.entries(byDate).forEach(([date, v]) => ctrTrendData.push({ date, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const avgCtr = ctrTrendData.length ? ctrTrendData.reduce((a,b)=>a+b.ctr,0)/ctrTrendData.length : 0;
  const campaignCount = campaigns.length;
  // Segmenty
  const bySeg = {};
  campaigns.forEach(c => {
    if (!c.region || !c.age || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const region = c.region;
    const ageGroup = Math.floor(c.age/10)*10;
    const key = region+'_'+ageGroup;
    if (!bySeg[key]) bySeg[key] = { region, ageGroup, clicks: 0, sent: 0 };
    bySeg[key].clicks += c.clickCount;
    bySeg[key].sent += c.sentCount;
  });
  const segmentHeatmapData = Object.values(bySeg).map(v => ({ region: v.region, ageGroup: v.ageGroup, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const topSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>b.ctr-a.ctr).slice(0,3);
  // PDF
  const pdfBuffer = await generateDashboardPdf({ stats: { avgCtr, campaignCount, topSegments } });
  // Odeslat všem adminům
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: 'ServisKol – Týdenní dashboard report',
      text: 'V příloze najdete aktuální PDF report s klíčovými statistikami a segmenty.',
      attachments: [{ filename: 'dashboard-report.pdf', content: pdfBuffer }]
    });
  }
  await mongoose.disconnect();
  console.log('Report odeslán adminům.');
  process.exit(0);
})();
