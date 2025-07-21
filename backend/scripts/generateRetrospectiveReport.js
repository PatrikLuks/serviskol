// Automatizované generování retrospektivního reportu
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

async function generateRetrospectiveReport(logs) {
  let report = 'Retrospektivní report\n';
  report += `Počet událostí: ${logs.length}\n`;
  if (logs.length === 0) {
    report += 'Žádné události.\n';
    return report;
  }
  // Statistika typů incidentů (simulace)
  const typeStats = logs.reduce((acc, log) => {
    const type = log.includes('incident') ? 'incident' : 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  report += 'Statistika typů událostí:\n';
  Object.entries(typeStats).forEach(([type, count]) => {
    report += `- ${type}: ${count}\n`;
  });
  // Generování grafu typů událostí
  const width = 400;
  const height = 300;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const chartConfig = {
    type: 'bar',
    data: {
      labels: Object.keys(typeStats),
      datasets: [{
        label: 'Počet událostí',
        data: Object.values(typeStats),
        backgroundColor: ['#36a2eb', '#ff6384'],
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  };
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
  const reportsDir = path.join(__dirname, '../reports');
  const chartPath = path.join(reportsDir, `retrospektiva-chart-${new Date().toISOString().slice(0,10)}.png`);
  fs.writeFileSync(chartPath, imageBuffer);
  report += `\nGraf typů událostí uložen jako: ${chartPath}\n`;
  // AI shrnutí trendů (simulace)
  report += '\nAI shrnutí trendů:\n';
  if (typeStats.incident && typeStats.incident > 2) {
    report += 'Pozorujeme zvýšený počet incidentů, doporučujeme detailní analýzu.\n';
  } else {
    report += 'Počet incidentů je v normě.\n';
  }
  return report;
}

// Simulace načtení logů
const logs = ['incident1', 'incident2', 'incident3', 'other1'];
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
generateRetrospectiveReport(logs).then(report => {
  const outPath = path.join(reportsDir, `retrospektiva-${new Date().toISOString().slice(0,10)}.txt`);
  fs.writeFileSync(outPath, report);
  console.log(`Report uložen do ${outPath}`);
});
