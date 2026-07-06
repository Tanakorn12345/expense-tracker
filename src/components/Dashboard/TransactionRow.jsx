import React from 'react';

const TransactionRow = ({ icon, title, subtitle, category, badgeClass, badgeStyle, date, amount, isNegative }) => (
  <div style={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '16px 12px', 
    borderBottom: '1px solid var(--border)', 
    gap: '1rem' 
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 200px' }}>
      {icon}
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>
    </div>
    <div style={{ flex: '1 1 100px' }}>
      <span className={`transaction-badge ${badgeClass}`} style={badgeStyle}>{category}</span>
    </div>
    <div style={{ flex: '1 1 100px', color: 'var(--text-muted)' }}>{date}</div>
    <div style={{ flex: '1 1 100px', textAlign: 'right', fontWeight: 600, color: isNegative ? 'var(--danger)' : 'var(--success)' }}>
      {amount}
    </div>
  </div>
);

export default TransactionRow;
