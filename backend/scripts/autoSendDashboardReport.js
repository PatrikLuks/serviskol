// Cron skript pro automatické rozesílání dashboard reportů dle nastavení v ReportSetting
const mongoose = require('mongoose');
const ReportSetting = require('../models/ReportSetting');
const { generateDashboardPdf } = require('../utils/pdfReport');
const sendEmail = require('../utils/sendEmail');
const Campaign = require('../models/Campaign');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/serviskol');
  const now = new Date();
  // Najít aktivní naplánovaná rozesílání
  const settings = await ReportSetting.find({ enabled: true, scheduledSend: true });
  for (const setting of settings) {
    // Kontrola, zda je čas poslat (weekly/monthly, podle lastSentAt)
    let shouldSend = false;
    if (!setting.lastSentAt) {
      shouldSend = true;
    } else if (setting.frequency === 'weekly') {
      const diff = (now - setting.lastSentAt) / (1000*60*60*24);
      if (diff >= 7) shouldSend = true;
    } else if (setting.frequency === 'monthly') {
      const diff = (now - setting.lastSentAt) / (1000*60*60*24);
      if (diff >= 28) shouldSend = true;
    }
    if (!shouldSend) continue;
    // Sestavit časový rozsah
    let dateFrom = setting.dateFrom;
    let dateTo = setting.dateTo;
    if (!dateFrom && setting.frequency === 'weekly') {
      dateFrom = new Date(now.getTime() - 7*24*60*60*1000);
    }
    if (!dateFrom && setting.frequency === 'monthly') {
      dateFrom = new Date(now.getTime() - 28*24*60*60*1000);
    }
    if (!dateTo) dateTo = now;
    // Načíst kampaně v rozsahu
    let campaignQuery = {};
    if (dateFrom || dateTo) {
      campaignQuery.createdAt = {};
      if (dateFrom) campaignQuery.createdAt.$gte = dateFrom;
      if (dateTo) campaignQuery.createdAt.$lte = dateTo;
    }
    const campaigns = await Campaign.find(campaignQuery);
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
    // PDF (respektovat enabledSections)
    const enabledSections = setting.enabledSections || ['aiSummary','ctrTrend','heatmap'];
    let summary = '';
    let ctrTrendPng = null;
    let heatmapPng = null;
    try {
      if (enabledSections.includes('aiSummary')) {
        // AI sumarizace pomocí OpenAI API (pokud je k dispozici)
        const bottomSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>a.ctr-b.ctr).slice(0,1);
        const prompt = `Jsi marketingový analytik. Na základě těchto statistik:\n- Průměrné CTR: ${(avgCtr*100).toFixed(2)}%\n- Počet kampaní: ${campaignCount}\n- Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let (CTR ${(topSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\n- Nejslabší segment: ${bottomSegments.length ? `${bottomSegments[0].region}, ${bottomSegments[0].ageGroup} let (CTR ${(bottomSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\nStručně shrň hlavní trendy a doporučení pro růst v nejslabším segmentu. Odpověz česky, max. 3 věty.`;
        let aiSummary = '';
        try {
          const { default: axios } = require('axios');
          const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
          if (OPENAI_API_KEY) {
            const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: 'Jsi marketingový analytik.' },
                { role: 'user', content: prompt }
              ],
              max_tokens: 120,
              temperature: 0.6
            }, {
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            aiSummary = openaiRes.data.choices[0].message.content.trim();
          }
        } catch (e) {
          aiSummary = '';
        }
        summary = aiSummary || `Průměrné CTR: ${(avgCtr*100).toFixed(2)}%. Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let` : 'N/A'}.`;
      }
      if (enabledSections.includes('ctrTrend')) {
        // ...generování grafu...
      }
      if (enabledSections.includes('heatmap')) {
        // ...generování heatmapy...
      }
    } catch {}
    const pdfBuffer = await generateDashboardPdf({
      stats: { avgCtr, campaignCount, topSegments },
      summary: enabledSections.includes('aiSummary') ? summary : undefined,
      ctrTrendPng: enabledSections.includes('ctrTrend') ? ctrTrendPng : undefined,
      heatmapPng: enabledSections.includes('heatmap') ? heatmapPng : undefined
    });
    // Odeslat na zadané e-maily
    for (const email of (setting.emails || [])) {
      await sendEmail({
        to: email,
        subject: 'ServisKol – Automatický dashboard report',
        text: 'V příloze najdete PDF report za zvolené období.',
        attachments: [{ filename: 'dashboard-report.pdf', content: pdfBuffer }]
      });
    }
    // Aktualizovat lastSentAt
    setting.lastSentAt = now;
    await setting.save();
  }
  await mongoose.disconnect();
  console.log('Automatické reporty rozeslány.');
  process.exit(0);
})();
