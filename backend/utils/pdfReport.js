const { jsPDF } = require('jspdf');
const { createCanvas } = require('canvas');


/**
 * Vytvoří PDF report s textem, statistikami a AI sumarizací.
 * @param {Object} opts
 * @param {Object} stats - { avgCtr, campaignCount, topSegments }
 * @param {string} [summary] - AI sumarizace trendů
 * @returns {Buffer} PDF soubor jako buffer
 */
/**
 * Vytvoří PDF report s textem, statistikami, AI sumarizací a grafem trendu CTR.
 * @param {Object} opts
 * @param {Object} stats - { avgCtr, campaignCount, topSegments }
 * @param {string} [summary] - AI sumarizace trendů
 * @param {Buffer} [ctrTrendPng] - PNG obrázek grafu trendu CTR
 * @returns {Buffer} PDF soubor jako buffer
 */
/**
 * Vytvoří PDF report s textem, statistikami, AI sumarizací a grafy.
 * @param {Object} opts
 * @param {Object} stats - { avgCtr, campaignCount, topSegments }
 * @param {string} [summary] - AI sumarizace trendů
 * @param {Buffer} [ctrTrendPng] - PNG obrázek grafu trendu CTR
 * @param {Buffer} [heatmapPng] - PNG obrázek heatmapy segmentů
 * @returns {Buffer} PDF soubor jako buffer
 */
async function generateDashboardPdf({ stats, summary, ctrTrendPng, heatmapPng }) {
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
  pdf.text(`Průměrné CTR: ${(stats.avgCtr*100).toFixed(2)}%`, 50, y);
  y += 16;
  pdf.text(`Počet kampaní: ${stats.campaignCount}`, 50, y);
  y += 16;
  if (stats.topSegments && stats.topSegments.length) {
    pdf.text('Top segmenty:', 50, y);
    y += 14;
    stats.topSegments.forEach((seg, i) => {
      pdf.text(`${i+1}. ${seg.region}, ${seg.ageGroup} let – CTR: ${(seg.ctr*100).toFixed(1)}%`, 60, y);
      y += 14;
    });
  }
  y += 10;
  // --- CTR trend graf ---
  if (ctrTrendPng) {
    try {
      const img = typeof ctrTrendPng === 'string' ? ctrTrendPng : 'data:image/png;base64,'+ctrTrendPng.toString('base64');
      pdf.setFontSize(13);
      pdf.text('Trend CTR kampaní v čase', 40, y);
      y += 10;
      pdf.addImage(img, 'PNG', 40, y, pdf.internal.pageSize.getWidth()-80, 120);
      y += 130;
    } catch {}
  }
  // --- Heatmapa segmentů ---
  if (heatmapPng) {
    try {
      const img = typeof heatmapPng === 'string' ? heatmapPng : 'data:image/png;base64,'+heatmapPng.toString('base64');
      pdf.setFontSize(13);
      pdf.text('Heatmapa CTR podle regionu a věku', 40, y);
      y += 10;
      pdf.addImage(img, 'PNG', 40, y, pdf.internal.pageSize.getWidth()-80, 140);
      y += 150;
    } catch {}
  }
  return Buffer.from(pdf.output('arraybuffer'));
}

module.exports = { generateDashboardPdf };
