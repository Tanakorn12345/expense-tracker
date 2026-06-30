import React from 'react';

const InsightCard = ({ icon, title, text }) => (
  <div className="insight-card-item">
    <div className="insight-icon">{icon}</div>
    <div>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.4 }}>{text}</div>
    </div>
  </div>
);

export default InsightCard;
