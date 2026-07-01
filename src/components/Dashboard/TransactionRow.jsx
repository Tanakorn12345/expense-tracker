import React from 'react';

const TransactionRow = ({ icon, title, subtitle, category, badgeClass, badgeStyle, date, amount, isNegative }) => (
  <tr>
    <td>
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>
        </div>
      </div>
    </td>
    <td><span className={`transaction-badge ${badgeClass}`} style={badgeStyle}>{category}</span></td>
    <td>{date}</td>
    <td style={{ textAlign: 'right', fontWeight: 600, color: isNegative ? 'var(--danger)' : 'var(--success)' }}>{amount}</td>
  </tr>
);

export default TransactionRow;
