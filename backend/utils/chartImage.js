const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800; // px
const height = 300; // px
const backgroundColour = 'white';

/**
 * Vygeneruje PNG obrázek line chartu pro trend CTR
 * @param {Array} data - [{ date, ctr }]
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generateCtrTrendChart(data) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
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

module.exports = { generateCtrTrendChart };
