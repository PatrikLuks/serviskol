/**
 * Dummy implementace pro měsíční CTR statistiky (pro testy a fallback)
 */
async function getMonthlyCtrStats() {
  return { 'in-app': 0, email: 0, push: 0, sms: 0 };
}
/**
 * @module reportUtils
 * API: generateCSVReport, generatePDFReport, generateXLSXReport, generateChartImage, getWeeklyCtrStats, sendWeeklyReport
 */

const { Parser } = require('json2csv');
const { jsPDF } = require('jspdf');
const ExcelJS = require('exceljs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
let Campaign = require('../models/Campaign');
let sendEmail = require('../utils/sendEmail');
let User = require('../models/User');

// Pro testy umožňujeme přepsat závislosti
Object.defineProperties(module.exports, {
  Campaign: {
    get: () => Campaign,
    set: v => { Campaign = v; }
  },
  User: {
    get: () => User,
    set: v => { User = v; }
  },
  sendEmail: {
    get: () => sendEmail,
    set: v => { sendEmail = v; }
  }
});

/**
 * Vygeneruje CSV report z dashboard dat
 */
function generateCSVReport({ stats, ctrTrendData, segmentHeatmapData, summary }) {
  let rows = [];
  stats = stats || {};
  ctrTrendData = ctrTrendData || [];
  segmentHeatmapData = segmentHeatmapData || [];
  rows.push({ section: 'Statistika', key: 'Průměrné CTR', value: stats.avgCtr ?? '' });
  rows.push({ section: 'Statistika', key: 'Počet kampaní', value: stats.campaignCount ?? '' });
  if (summary) rows.push({ section: 'AI sumarizace', key: '', value: summary });
  if (Array.isArray(stats.topSegments) && stats.topSegments.length) {
    stats.topSegments.forEach((seg, i) => {
      rows.push({ section: 'Top segmenty', key: `${i+1}. ${seg.region ?? ''}, ${seg.ageGroup ?? ''} let`, value: seg.ctr ?? '' });
    });
  }
  if (Array.isArray(ctrTrendData) && ctrTrendData.length) {
    rows.push({ section: 'Trend CTR', key: 'Datum', value: 'CTR' });
    ctrTrendData.forEach(d => {
      rows.push({ section: 'Trend CTR', key: d.date ?? '', value: d.ctr ?? '' });
    });
  }
  if (Array.isArray(segmentHeatmapData) && segmentHeatmapData.length) {
    rows.push({ section: 'Heatmapa segmentů', key: 'Region, Věková skupina', value: 'CTR' });
    segmentHeatmapData.forEach(seg => {
      rows.push({ section: 'Heatmapa segmentů', key: `${seg.region ?? ''}, ${seg.ageGroup ?? ''}`, value: seg.ctr ?? '' });
    });
  }
  const parser = new Parser({ fields: ['section', 'key', 'value'] });
  return parser.parse(rows);
}

/**
 * Vygeneruje PDF report z dashboard dat
 */
async function generatePDFReport({ stats, summary, ctrTrendPng, heatmapPng }) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  let y = 40;
  pdf.setFontSize(22);
  pdf.text('ServisKol – Admin Dashboard Report', 40, y);
  pdf.setFontSize(12);
  y += 24;
  pdf.text(`Datum: ${new Date().toLocaleString('cs-CZ')}`, 40, y);
  y += 20;
  if (summary) {
    pdf.setFontSize(13);
    pdf.setTextColor(34, 197, 94);
    pdf.text('AI sumarizace trendů a doporučení:', 40, y);
    y += 16;
    pdf.setFontSize(12);
    pdf.setTextColor(0,0,0);
    const lines = pdf.splitTextToSize(summary, pdf.internal.pageSize.getWidth()-80);
    pdf.text(lines, 50, y);
    y += lines.length*14 + 8;
  }
  pdf.setFontSize(14);
  pdf.text('Základní statistiky:', 40, y);
  y += 18;
  pdf.setFontSize(12);
  pdf.text(`Průměrné CTR: ${stats?.avgCtr !== undefined ? (stats.avgCtr*100).toFixed(2)+'%' : ''}`, 50, y);
  y += 16;
  pdf.text(`Počet kampaní: ${stats?.campaignCount ?? ''}`, 50, y);
  y += 16;
  if (Array.isArray(stats?.topSegments) && stats.topSegments.length) {
    pdf.text('Top segmenty:', 50, y);
    y += 14;
    stats.topSegments.forEach((seg, i) => {
      pdf.text(`${i+1}. ${seg.region ?? ''}, ${seg.ageGroup ?? ''} let – CTR: ${seg.ctr ?? ''}`, 60, y);
      y += 14;
    });
  }
  // Grafy
  if (ctrTrendPng) {
    pdf.text('Trend CTR:', 40, y);
    y += 16;
    pdf.addImage(ctrTrendPng, 'PNG', 50, y, 400, 120);
    y += 130;
  }
  if (heatmapPng) {
    pdf.text('Heatmapa segmentů:', 40, y);
    y += 16;
    pdf.addImage(heatmapPng, 'PNG', 50, y, 400, 120);
    y += 130;
  }
  return pdf.output('arraybuffer');
}

/**
 * Vygeneruje XLSX report z dashboard dat
 */
async function generateXLSXReport({ stats, ctrTrendData, segmentHeatmapData, summary }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Dashboard Report');
  let row = 1;
  ws.getCell(`A${row}`).value = 'ServisKol – Admin Dashboard Report';
  ws.getCell(`A${row}`).font = { bold: true, size: 16 };
  row += 2;
  ws.getCell(`A${row}`).value = `Datum: ${new Date().toLocaleString('cs-CZ')}`;
  row++;
  if (summary) {
    ws.getCell(`A${row}`).value = 'AI sumarizace trendů a doporučení:';
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getCell(`A${row}`).value = summary;
    row += 2;
  }
  ws.getCell(`A${row}`).value = 'Základní statistiky:';
  ws.getCell(`A${row}`).font = { bold: true };
  row++;
  ws.getCell(`A${row}`).value = `Průměrné CTR:`;
  ws.getCell(`B${row}`).value = stats?.avgCtr ?? '';
  row++;
  ws.getCell(`A${row}`).value = `Počet kampaní:`;
  ws.getCell(`B${row}`).value = stats?.campaignCount ?? '';
  row++;
  if (Array.isArray(stats?.topSegments) && stats.topSegments.length) {
    ws.getCell(`A${row}`).value = 'Top segmenty:';
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getRow(row).values = ['#', 'Region', 'Věková skupina', 'CTR'];
    ws.getRow(row).font = { bold: true };
    row++;
    stats.topSegments.forEach((seg, i) => {
      ws.getRow(row).values = [i+1, seg.region ?? '', seg.ageGroup ?? '', seg.ctr ?? ''];
      row++;
    });
    row++;
  }
  if (ctrTrendData && ctrTrendData.length) {
    ws.getCell(`A${row}`).value = 'Trend CTR v čase:';
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getRow(row).values = ['Datum', 'CTR'];
    ws.getRow(row).font = { bold: true };
    row++;
    ctrTrendData.forEach(d => {
      ws.getRow(row).values = [d.date, d.ctr];
      row++;
    });
    row++;
  }
  if (segmentHeatmapData && segmentHeatmapData.length) {
    ws.getCell(`A${row}`).value = 'Heatmapa segmentů:';
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getRow(row).values = ['Region', 'Věková skupina', 'CTR'];
    ws.getRow(row).font = { bold: true };
    row++;
    segmentHeatmapData.forEach(seg => {
      ws.getRow(row).values = [seg.region, seg.ageGroup, seg.ctr];
      row++;
    });
    row++;
  }
  return wb.xlsx.writeBuffer();
}

/**
 * Vygeneruje PNG obrázek line chartu pro trend CTR
 */
async function generateChartImage(data) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 300, backgroundColour: 'white' });
  const config = {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'CTR',
        data: data.map(d => d.ctr*100),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: 'CTR (%)' } },
        x: { title: { display: true, text: 'Datum' } }
      }
    }
  };
  return chartJSNodeCanvas.renderToBuffer(config);
}

/**
 * Pomocná funkce pro výpočet průměrné CTR za poslední týden
 */
async function getWeeklyCtrStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const campaigns = await module.exports.Campaign.find({ createdAt: { $gte: weekAgo } });
  const stats = { 'in-app': { sent: 0, clicks: 0 }, email: { sent: 0, clicks: 0 }, push: { sent: 0, clicks: 0 }, sms: { sent: 0, clicks: 0 } };
  campaigns.forEach(c => {
    (c.variants || []).forEach(v => {
      const ch = v.channel;
      if (ch && stats[ch]) {
        stats[ch].sent += v.sentCount || 0;
        stats[ch].clicks += v.clickCount || 0;
      }
    });
  });
  const ctrs = {};
  Object.entries(stats).forEach(([ch, s]) => {
    ctrs[ch] = s.sent > 0 ? (s.clicks / s.sent) * 100 : 0;
  });
  return ctrs;
}

/**
 * Spustit jako cron (např. každý týden)
 */
async function sendWeeklyReport() {
  // Najdi adminy
  const admins = await module.exports.User.find({ role: 'admin' });
  // ...původní logika pro personalizované alerty, odeslání reportu...
  const monthlyCtrs = await getMonthlyCtrStats();
  // (původní alerty pro adminy, AlertLog atd. zde, pokud je potřeba)

  // Načti audit logy za posledních 7 dní
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const logs = lines.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean)
    .filter(l => new Date(l.timestamp) >= weekAgo);
  // Statistika
  const actions = {};
  logs.forEach(l => { actions[l.action] = (actions[l.action] || 0) + 1; });
  // CTR statistika
  const ctrs = await module.exports.getWeeklyCtrStats();
  // Sestav report
  let report = `Týdenní report ServisKol\n\nPočet akcí: ${logs.length}\n`;
  report += 'Nejčastější akce:\n';
  Object.entries(actions).forEach(([a, c]) => { report += `- ${a}: ${c}\n`; });
  report += '\nPrůměrné CTR za poslední týden podle kanálu:\n';
  Object.entries(ctrs).forEach(([ch, val]) => { report += `- ${ch}: ${val.toFixed(1)}%\n`; });
  // Alert: více než 5 neúspěšných přihlášení za týden
  const failedLogins = logs.filter(l => l.action === 'Neúspěšné přihlášení').length;
  if (failedLogins > 5) {
    for (const admin of admins) {
      await module.exports.sendEmail({
        to: admin.email,
        subject: 'ALERT: Zvýšený počet neúspěšných přihlášení',
        text: `Za poslední týden bylo zaznamenáno ${failedLogins} neúspěšných pokusů o přihlášení.`
      });
    }
  }
  // Odeslat všem adminům
  for (const admin of admins) {
    await module.exports.sendEmail({
      to: admin.email,
      subject: 'Týdenní report ServisKol',
      text: report
    });
  }
}

module.exports = {
  generateCSVReport,
  generatePDFReport,
  generateXLSXReport,
  generateChartImage,
  getWeeklyCtrStats,
  getMonthlyCtrStats,
  sendWeeklyReport
};
