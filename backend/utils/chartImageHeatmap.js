const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800;
const height = 320;
const backgroundColour = 'white';

/**
 * Vygeneruje PNG obrázek heatmapy segmentů (CTR podle regionu a věku)
 * @param {Array} data - [{ region, ageGroup, ctr }]
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generateSegmentHeatmap(data) {
  // Unikátní regiony a věkové skupiny
  const regions = Array.from(new Set(data.map(d => d.region))).sort();
  const ages = Array.from(new Set(data.map(d => d.ageGroup))).sort((a,b)=>a-b);
  // 2D pole hodnot
  const matrix = ages.map(age => regions.map(region => {
    const found = data.find(d => d.region === region && d.ageGroup === age);
    return found ? found.ctr*100 : 0;
  }));
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
  const config = {
    type: 'matrix',
    data: {
      datasets: [{
        label: 'CTR (%)',
        data: data.map(d => ({ x: d.region, y: d.ageGroup, v: d.ctr*100 })),
        backgroundColor: ctx => {
          const v = ctx.raw.v;
          return v > 0 ? `rgba(37,99,235,${0.2+0.8*v/100})` : '#eee';
        },
        width: ({chart}) => (chart.chartArea || {}).width / regions.length - 2,
        height: ({chart}) => (chart.chartArea || {}).height / ages.length - 2,
        borderWidth: 1,
        borderColor: '#2563eb',
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => `Region: ${ctx[0].raw.x}, Věk: ${ctx[0].raw.y}`,
            label: ctx => `CTR: ${ctx.raw.v.toFixed(1)}%`
          }
        }
      },
      scales: {
        x: { type: 'category', labels: regions, title: { display: true, text: 'Region' } },
        y: { type: 'category', labels: ages, title: { display: true, text: 'Věková skupina' } }
      }
    }
  };
  // Matrix controller plugin (chartjs-chart-matrix)
  ChartJSNodeCanvas.registerFont && ChartJSNodeCanvas.registerFont('Arial', { family: 'Arial' });
  // Poznámka: vyžaduje chartjs-chart-matrix
  return chartJSNodeCanvas.renderToBuffer(config, 'image/png');
}

module.exports = { generateSegmentHeatmap };
