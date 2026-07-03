import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithAuth } from '../utils/api';
import { PlusCircle, Target, ArrowUpRight, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Savings = () => {
  const { t, language } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.isPro) {
      // Redirect or show not authorized
      window.location.href = '/dashboard';
      return;
    }
    fetchSavingsData();
  }, [user.isPro]);

  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/savings');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals);
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error('Failed to fetch savings data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    const { value: formValues } = await Swal.fire({
      title: language === 'th' ? 'สร้างเป้าหมายการออม' : 'Create Savings Goal',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="${language === 'th' ? 'ชื่อเป้าหมาย' : 'Goal Name'}">` +
        `<input id="swal-input2" class="swal2-input" type="number" placeholder="${language === 'th' ? 'จำนวนเงินเป้าหมาย' : 'Target Amount'}">`,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    });

    if (formValues) {
      const [name, targetAmount] = formValues;
      if (!name || !targetAmount) return;

      try {
        const res = await fetchWithAuth('/api/savings/goals', {
          method: 'POST',
          body: JSON.stringify({ name, targetAmount })
        });
        if (res.ok) {
          fetchSavingsData();
          Swal.fire('Success', language === 'th' ? 'สร้างเป้าหมายสำเร็จ' : 'Goal created successfully', 'success');
        }
      } catch (e) {
        Swal.fire('Error', 'Failed to create goal', 'error');
      }
    }
  };

  const handleAddMoney = async (goalId, goalName) => {
    const { value: amount } = await Swal.fire({
      title: `${language === 'th' ? 'เพิ่มเงินออม:' : 'Add savings to:'} ${goalName}`,
      input: 'number',
      inputPlaceholder: language === 'th' ? 'จำนวนเงิน' : 'Amount',
      showCancelButton: true
    });

    if (amount && parseFloat(amount) > 0) {
      try {
        const res = await fetchWithAuth(`/api/savings/goals/${goalId}/add`, {
          method: 'POST',
          body: JSON.stringify({ amount })
        });
        if (res.ok) {
          fetchSavingsData();
          Swal.fire('Success', language === 'th' ? 'เพิ่มเงินออมสำเร็จ' : 'Added savings successfully', 'success');
        }
      } catch (e) {
        Swal.fire('Error', 'Failed to add money', 'error');
      }
    }
  };

  // Group transactions by month for chart
  const monthlyData = transactions.reduce((acc, curr) => {
    const month = new Date(curr.date).toLocaleString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = { name: month, amount: 0 };
    acc[month].amount += curr.amount;
    return acc;
  }, {});
  
  const chartData = Object.values(monthlyData).reverse();
  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  if (loading) {
    return <Layout><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader2 className="animate-spin" size={48} /></div></Layout>;
  }

  return (
    <Layout>
      <div className="dashboard-header">
        <div className="header-title">
          <h1>{language === 'th' ? 'การออมของคุณ' : 'Your Savings'}</h1>
          <p>{language === 'th' ? 'จัดการและติดตามเป้าหมายการออม' : 'Manage and track your savings goals'}</p>
        </div>
        <div className="top-bar-actions">
          <button className="btn btn-primary" onClick={handleCreateGoal}>
            <PlusCircle size={20} />
            {language === 'th' ? 'สร้างเป้าหมาย' : 'Create Goal'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, var(--primary-main) 0%, var(--primary-light) 100%)', color: 'white' }}>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {language === 'th' ? 'เงินออมทั้งหมด' : 'Total Savings'}
          </div>
          <div className="stat-value" style={{ color: 'white' }}>
            ฿{totalSavings.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} />
            {language === 'th' ? 'เป้าหมายการออม' : 'Savings Goals'}
          </h3>
          
          {goals.length === 0 ? (
            <p className="no-notifs">{language === 'th' ? 'ยังไม่มีเป้าหมายการออม' : 'No savings goals yet.'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {goals.map(goal => {
                const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, wordBreak: 'break-word', flex: '1 1 auto' }}>{goal.name}</h4>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 12px', fontSize: '0.85rem', flexShrink: 0 }}
                        onClick={() => handleAddMoney(goal.id, goal.name)}
                      >
                        <ArrowUpRight size={16} /> {language === 'th' ? 'เพิ่มเงิน' : 'Add'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>฿{goal.currentAmount.toLocaleString()}</span>
                      <span>{language === 'th' ? 'เป้าหมาย:' : 'Target:'} ฿{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: percent >= 100 ? 'var(--success)' : 'var(--accent)', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>{language === 'th' ? 'สถิติการออมแต่ละเดือน' : 'Monthly Savings'}</h3>
          {chartData.length === 0 ? (
             <p className="no-notifs">{language === 'th' ? 'ยังไม่มีข้อมูลการออม' : 'No savings data yet.'}</p>
          ) : (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} name={language === 'th' ? 'ยอดเงินออม' : 'Savings'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Savings;
