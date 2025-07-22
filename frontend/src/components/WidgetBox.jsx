import React from 'react';

export default function WidgetBox({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
}
