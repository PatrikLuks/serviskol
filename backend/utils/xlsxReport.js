// Utilita pro generování dashboard reportu ve formátu XLSX
const ExcelJS = require('exceljs');

/**
 * Vygeneruje XLSX report z dat dashboardu
 * @param {Object} opts
 * @param {Object} stats - { avgCtr, campaignCount, topSegments }
 * @param {Array} ctrTrendData - [{ date, ctr }]
 * @param {Array} segmentHeatmapData - [{ region, ageGroup, ctr }]
 * @param {string} [summary] - AI sumarizace
 * @returns {Promise<Buffer>} XLSX soubor jako buffer
 */
async function generateDashboardXlsx({ stats, ctrTrendData, segmentHeatmapData, summary }) {
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
  ws.getCell(`B${row}`).value = stats.avgCtr;
  row++;
  ws.getCell(`A${row}`).value = `Počet kampaní:`;
  ws.getCell(`B${row}`).value = stats.campaignCount;
  row++;
  if (stats.topSegments && stats.topSegments.length) {
    ws.getCell(`A${row}`).value = 'Top segmenty:';
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getRow(row).values = ['#', 'Region', 'Věková skupina', 'CTR'];
    ws.getRow(row).font = { bold: true };
    row++;
    stats.topSegments.forEach((seg, i) => {
      ws.getRow(row).values = [i+1, seg.region, seg.ageGroup, seg.ctr];
      row++;
    });
    row++;
  }
  // CTR trend
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
  // Heatmapa segmentů
  if (segmentHeatmapData && segmentHeatmapData.length) {
    ws.getCell(`A${row}`).value = 'Heatmapa segmentů (region, věk, CTR):';
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getRow(row).values = ['Region', 'Věková skupina', 'CTR'];
    ws.getRow(row).font = { bold: true };
    row++;
    segmentHeatmapData.forEach(seg => {
      ws.getRow(row).values = [seg.region, seg.ageGroup, seg.ctr];
      row++;
    });
  }
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

module.exports = { generateDashboardXlsx };
