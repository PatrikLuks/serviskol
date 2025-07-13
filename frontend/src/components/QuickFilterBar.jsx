import React from 'react';

/**
 * Univerzální filtr bar pro dashboard (text + selecty)
 * @param {Object} props
 * @param {string} props.query
 * @param {function} props.setQuery
 * @param {Array} [props.selects] - [{ label, value, options: [{label,value}], onChange }]
 * @param {function} [props.onSearch]
 */
export default function QuickFilterBar({ query, setQuery, selects = [], onSearch }) {
  return (
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
      <input
        type="text"
        placeholder="Hledat..."
        value={query}
        onChange={e=>setQuery(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&onSearch&&onSearch()}
        style={{padding:4,border:'1px solid #ccc',borderRadius:4,minWidth:180}}
      />
      {selects.map((sel,i)=>(
        <select key={i} value={sel.value} onChange={e=>sel.onChange(e.target.value)} style={{padding:4,border:'1px solid #ccc',borderRadius:4}}>
          <option value="">{sel.label}</option>
          {sel.options.map(opt=>(<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
      ))}
      {onSearch && <button onClick={onSearch} style={{padding:'4px 12px',borderRadius:4,background:'#2563eb',color:'#fff',border:'none'}}>Filtrovat</button>}
    </div>
  );
}
