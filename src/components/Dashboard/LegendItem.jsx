import React from 'react';

const LegendItem = ({ color, label, amount }) => (
  <div className="legend-item">
    <div className="flex items-center">
      <div className="dot" style={{ background: color }}></div>
      <span>{label}</span>
    </div>
    <span style={{ fontWeight: 600 }}>{amount}</span>
  </div>
);

export default LegendItem;
