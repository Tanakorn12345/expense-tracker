import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Sparkles,
  Lightbulb,
  ShoppingCart,
  Banknote,
  Home,
  ArrowRightLeft,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import TransactionRow from '../components/Dashboard/TransactionRow';
import InsightCard from '../components/Dashboard/InsightCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, getMonthName, translateInsight } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentMonthStr = new Date().getMonth().toString();
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);
  const [filterDate, setFilterDate] = useState('');
  const currentYearStr = new Date().getFullYear().toString();

  const { transactions, stats, forecast, isLoading } = useTransactions(filterMonth, currentYearStr);

  const filteredTransactions = transactions.filter(tItem => {
    // Date filter
    if (filterDate) {
      const tDate = new Date(tItem.date);
      const localDate = new Date(tDate.getTime() - (tDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      if (localDate !== filterDate) return false;
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = tItem.title?.toLowerCase().includes(query);
    const categoryMatch = tItem.category?.name?.toLowerCase().includes(query);
    const subtitleMatch = tItem.subtitle?.toLowerCase().includes(query);
    const amountMatch = tItem.amount?.toString().includes(query);
    return titleMatch || categoryMatch || subtitleMatch || amountMatch;
  });

  const getIcon = (category) => {
    switch (category) {
      case 'Food': 
      case 'อาหาร': return <ShoppingCart size={20} />;
      case 'Income': return <Banknote size={20} />;
      case 'Housing': return <Home size={20} />;
      default: return <ArrowRightLeft size={20} />;
    }
  };

  const chartData = [
    {
      name: t('jan').substring(0, 3), // We can use actual month name if we want, or just "This Month"
      [t('income')]: stats?.monthlyIncome || 0,
      [t('expense')]: stats?.monthlyExpenses || 0,
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--primary-dark)' }}>{getMonthName(parseInt(filterMonth))}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '4px' }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 600 }}>฿{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="dashboard-header">
        <div className="header-title">
          <h1>{t('overviewTitle')}</h1>
          <p>{t('overviewDesc')}</p>
        </div>
        <div className="date-picker flex gap-4">
          <input 
            type="date" 
            className="form-control" 
            style={{ width: 'auto' }}
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              if (e.target.value) {
                const d = new Date(e.target.value);
                setFilterMonth(d.getMonth().toString());
              }
            }}
          />
          <select 
            className="form-control" 
            style={{ width: 'auto' }}
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setFilterDate(''); // Clear specific date when month is changed
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i.toString()}>
                {getMonthName(i)}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/add-transaction')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            {t('addTransaction')}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">{t('totalIncome')}</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>฿{stats?.monthlyIncome?.toLocaleString() || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">{t('totalExpense')}</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>฿{stats?.monthlyExpenses?.toLocaleString() || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">{t('netBalance')}</span>
          <span className="stat-value">฿{stats?.monthlyBalance?.toLocaleString() || 0}</span>
          <span className={`stat-trend ${stats?.monthlyBalance >= 0 ? 'trend-up' : 'trend-down'}`}>
            {stats?.monthlyBalance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
            {stats?.monthlyBalance >= 0 ? ` ${t('trendUp')}` : ` ${t('trendDown')}`}
          </span>
        </div>
      </div>

      <div className="main-grid">
        <div className="card main-dashboard-card" style={{ padding: '2rem' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 style={{ fontSize: '1.25rem' }}>{t('chartTitle')}</h3>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={45}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.9}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey={t('income')} fill="url(#colorIncome)" radius={[8, 8, 0, 0]} />
                <Bar dataKey={t('expense')} fill="url(#colorExpense)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1.1rem' }}>{t('recentTransactions')}</h3>
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/history')}>
                {t('viewAll')}
              </button>
            </div>
            {isLoading ? (
              <p>{t('loading')}</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>{t('noTransactions')}</p>
            ) : (
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                  <tbody>
                    {filteredTransactions.slice(0, 5).map(tItem => (
                      <TransactionRow 
                        key={tItem.id}
                        icon={getIcon(tItem.category?.name || tItem.subtitle)} 
                        title={tItem.title} 
                        subtitle={tItem.subtitle} 
                        category={tItem.category?.name || tItem.subtitle} 
                        badgeClass={tItem.category?.type === 'income' ? 'badge-income' : 'badge-housing'}
                        badgeStyle={tItem.category?.type === 'income' ? { background: 'rgba(0, 51, 102, 0.1)', color: 'var(--primary-main)' } : {}}
                        date={new Date(tItem.date).toLocaleDateString(t('jan') === 'มกราคม' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                        amount={`${tItem.category?.type === 'expense' ? '-' : '+'}฿${tItem.amount.toLocaleString()}`} 
                        isNegative={tItem.category?.type === 'expense'} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card ai-insights">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <h3>{t('aiInsights')}</h3>
          </div>

          <div className="forecast-banner">
            <div className="banner-label">{t('forecastLabel')}</div>
            <div className="forecast-split">
              <div className="forecast-item">
                <div className="estimate-label">{t('expectedIncome')}</div>
                <div className="estimate-value" style={{ color: '#10b981' }}>฿{forecast?.predictedIncome?.toLocaleString() || 0}</div>
              </div>
              <div className="forecast-divider"></div>
              <div className="forecast-item">
                <div className="estimate-label">{t('expectedExpense')}</div>
                <div className="estimate-value" style={{ color: '#ef4444' }}>฿{forecast?.predictedExpenses?.toLocaleString() || 0}</div>
              </div>
            </div>
            
            <div className="net-forecast">
              <div className="estimate-label">{t('expectedSavings')}</div>
              <div className="flex justify-between items-center">
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{forecast?.netSavings >= 0 ? '+' : '-'}฿{Math.abs(forecast?.netSavings || 0).toLocaleString()}</div>
                <span className="savings-badge">{forecast?.efficiency > 0 ? '+' : ''}{forecast?.efficiency || 0}% {t('efficiency')}</span>
              </div>
            </div>
          </div>

          {forecast?.insights?.map(insight => {
            const mappedInsight = translateInsight(insight);
            return (
              <InsightCard 
                key={mappedInsight.id}
                icon={mappedInsight.type === 'saving' ? <Lightbulb size={18} /> : mappedInsight.type === 'investment' ? <TrendingUp size={18} /> : mappedInsight.type === 'warning' ? <AlertTriangle size={18} color="red" /> : <Info size={18} />} 
                title={mappedInsight.title} 
                text={mappedInsight.text} 
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
