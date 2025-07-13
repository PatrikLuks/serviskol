// Utilita pro generování dashboard reportu ve formátu CSV
const { Parser } = require('json2csv');

/**
 * Vygeneruje CSV report z dat dashboardu
 * @param {Object} opts
 * @param {Object} stats - { avgCtr, campaignCount, topSegments }
 * @param {Array} ctrTrendData - [{ date, ctr }]
 * @param {Array} segmentHeatmapData - [{ region, ageGroup, ctr }]
 * @param {string} [summary] - AI sumarizace
 * @returns {string} CSV obsah
 */
function generateDashboardCsv({ stats, ctrTrendData, segmentHeatmapData, summary }) {
  let rows = [];
  // Základní statistiky
  rows.push({ section: 'Statistika', key: 'Průměrné CTR', value: stats.avgCtr });
  rows.push({ section: 'Statistika', key: 'Počet kampaní', value: stats.campaignCount });
  if (summary) {
    rows.push({ section: 'AI sumarizace', key: '', value: summary });
  }
  // Top segmenty
  if (stats.topSegments && stats.topSegments.length) {
    stats.topSegments.forEach((seg, i) => {
      rows.push({ section: 'Top segmenty', key: `${i+1}. ${seg.region}, ${seg.ageGroup} let`, value: seg.ctr });
    });
  }
  // CTR trend
  if (ctrTrendData && ctrTrendData.length) {
    rows.push({ section: 'Trend CTR', key: 'Datum', value: 'CTR' });
    ctrTrendData.forEach(d => {
      rows.push({ section: 'Trend CTR', key: d.date, value: d.ctr });
    });
  }
  // Heatmapa segmentů
  if (segmentHeatmapData && segmentHeatmapData.length) {
    rows.push({ section: 'Heatmapa segmentů', key: 'Region, Věková skupina', value: 'CTR' });
    segmentHeatmapData.forEach(seg => {
      rows.push({ section: 'Heatmapa segmentů', key: `${seg.region}, ${seg.ageGroup}`, value: seg.ctr });
    });
  }
  const parser = new Parser({ fields: ['section', 'key', 'value'] });
  return parser.parse(rows);
}

module.exports = { generateDashboardCsv };
