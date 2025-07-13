import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

/**
 * @param {Object} props
 * @param {Array} props.data - [{ date, ctr }]
 */
export default function CTRTrendChart({ data }) {
  const chartRef = useRef();
  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: '#fff', useCORS: true });
    const link = document.createElement('a');
    link.download = 'ctr-trend.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: '#fff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [canvas.width, canvas.height+40] });
    pdf.text('Trend CTR kampaní v čase', 40, 30);
    pdf.addImage(imgData, 'PNG', 20, 40, canvas.width-40, canvas.height-40);
    pdf.save('ctr-trend.pdf');
  };
  return (
    <div style={{width:'100%',height:260,marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <h4>Trend CTR kampaní v čase</h4>
        <div>
          <button onClick={handleExportPNG} style={{fontSize:12,padding:'2px 8px',background:'#2563eb',color:'#fff',border:'none',borderRadius:4,cursor:'pointer',marginRight:8}}>Export PNG</button>
          <button onClick={handleExportPDF} style={{fontSize:12,padding:'2px 8px',background:'#10b981',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Export PDF</button>
        </div>
      </div>
      <div ref={chartRef} style={{width:'100%',height:220,background:'#fff',borderRadius:8}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0,1]} tickFormatter={v=>`${(v*100).toFixed(0)}%`} />
            <Tooltip formatter={v=>`${(v*100).toFixed(1)}%`} />
            <Line type="monotone" dataKey="ctr" stroke="#2563eb" strokeWidth={2} dot={{r:3}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
