import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Vygeneruje PDF report dashboardu s grafy a statistikami.
 * @param {Object} opts
 * @param {HTMLElement} ctrChartEl - DOM element s CTR trend grafem
 * @param {HTMLElement} heatmapEl - DOM element s heatmapou
 * @param {Object} stats - { avgCtr, campaignCount, topSegments }
 */
export async function exportDashboardReport({ ctrChartEl, heatmapEl, stats }) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 40;

  // Titulek a meta
  pdf.setFontSize(22);
  pdf.text('ServisKol – Admin Dashboard Report', 40, y);
  pdf.setFontSize(12);
  y += 24;
  pdf.text(`Datum: ${new Date().toLocaleString('cs-CZ')}`, 40, y);
  y += 20;

  // Statistika
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

  // CTR trend graf
  if (ctrChartEl) {
    const canvas = await html2canvas(ctrChartEl, { backgroundColor: '#fff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    pdf.text('Trend CTR kampaní v čase', 40, y);
    y += 10;
    pdf.addImage(imgData, 'PNG', 40, y, pageWidth-80, 180);
    y += 190;
  }

  // Heatmapa
  if (heatmapEl) {
    const canvas = await html2canvas(heatmapEl, { backgroundColor: '#fff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    pdf.text('Heatmapa CTR podle regionu a věku', 40, y);
    y += 10;
    pdf.addImage(imgData, 'PNG', 40, y, pageWidth-80, 180);
    y += 190;
  }

  pdf.save('serviskol-dashboard-report.pdf');
}
