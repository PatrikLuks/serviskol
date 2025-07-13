import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';

/**
 * @param {Object} props
 * @param {Array} props.data - [{ region, age, ctr }]
 */
export default function SegmentHeatmap({ data }) {
  const chartRef = useRef();
  const regions = Array.from(new Set(data.map(d=>d.region))).sort();
  const ages = Array.from(new Set(data.map(d=>d.ageGroup))).sort((a,b)=>a-b);
  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: '#fff', useCORS: true });
    const link = document.createElement('a');
    link.download = 'segment-heatmap.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: '#fff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [canvas.width, canvas.height+40] });
    pdf.text('Heatmapa CTR podle regionu a věku', 40, 30);
    pdf.addImage(imgData, 'PNG', 20, 40, canvas.width-40, canvas.height-40);
    pdf.save('segment-heatmap.pdf');
  };
  return (
    <div style={{width:'100%',height:320,marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <h4>Heatmapa CTR podle regionu a věku</h4>
        <div>
          <button onClick={handleExportPNG} style={{fontSize:12,padding:'2px 8px',background:'#2563eb',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:8}}>Export PNG</button>
          <button onClick={handleExportPDF} style={{fontSize:12,padding:'2px 8px',background:'#10b981',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Export PDF</button>
        </div>
      </div>
      <div ref={chartRef} style={{width:'100%',height:280,background:'#fff',borderRadius:8}}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="category" dataKey="region" name="Region" categories={regions} />
            <YAxis type="category" dataKey="ageGroup" name="Věková skupina" categories={ages} />
            <ZAxis type="number" dataKey="ctr" range={[0,1]} name="CTR" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={v=>`${(v*100).toFixed(1)}%`} />
            <Scatter data={data} fill="#2563eb" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
