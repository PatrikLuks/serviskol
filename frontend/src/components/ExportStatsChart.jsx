import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ExportStatsChart({ daily }) {
  if (!daily || Object.keys(daily).length === 0) return <div>Žádná data pro graf exportů.</div>;
  const labels = Object.keys(daily);
  const successData = labels.map(d => daily[d].success);
  const failData = labels.map(d => daily[d].fail);
  const data = {
    labels,
    datasets: [
      {
        label: 'Úspěšné exporty',
        data: successData,
        borderColor: 'green',
        backgroundColor: 'rgba(0,200,0,0.1)',
        fill: true
      },
      {
        label: 'Selhání exportu',
        data: failData,
        borderColor: 'red',
        backgroundColor: 'rgba(200,0,0,0.1)',
        fill: true
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Trend exportů podle dní' }
    }
  };
  return <Line data={data} options={options} />;
}
