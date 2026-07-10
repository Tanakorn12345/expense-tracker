import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';

const AdminUserTransactions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [data, setData] = useState({ user: null, balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email !== 'tanakorn.tip@student.mahidol.edu') {
      navigate('/');
      return;
    }
    loadData();
  }, [id, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/api/admin/users/${id}/transactions`);
      setData(res);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to load user transactions', 'error');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
      </Layout>
    );
  }

  const { user, balance, transactions } = data;

  return (
    <Layout>
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button 
          onClick={() => navigate('/admin')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={18} />
        {language === 'th' ? 'กลับไปหน้า Admin Dashboard' : 'Back to Admin Dashboard'}
      </button>

      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>{user?.name || user?.email}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{user?.email} {user?.isPro && <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>(Pro)</span>}</p>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color={balance >= 0 ? 'var(--income)' : 'var(--expense)'} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'th' ? 'ยอดเงินคงเหลือทั้งหมด' : 'Total Balance'}</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
              ฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="var(--primary-light)" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'th' ? 'จำนวนธุรกรรม' : 'Total Transactions'}</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{transactions.length}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>{language === 'th' ? 'ประวัติธุรกรรม' : 'Transaction History'}</h3>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            {language === 'th' ? 'ไม่มีรายการธุรกรรม' : 'No transactions found'}
          </p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Title</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Category</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px' }}>
                      {new Date(tx.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium' })}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{tx.title}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.85rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tx.category.color || 'var(--primary-main)' }}></span>
                        {tx.category.name}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: tx.category.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                      {tx.category.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default AdminUserTransactions;
