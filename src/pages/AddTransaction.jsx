import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  ArrowUp, 
  ArrowDown, 
  Info, 
  MapPin, 
  UploadCloud,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { useTransactions } from '../hooks/useTransactions';
import { useLanguage } from '../contexts/LanguageContext';
import Swal from 'sweetalert2';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { forecast } = useTransactions();
  const { t } = useLanguage();
  const [isExpense, setIsExpense] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState({ expense: [], income: [] });

  useEffect(() => {
    fetchWithAuth('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const expenseCategories = categories.expense;
  const incomeCategories = categories.income;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const amountInput = document.querySelector('.amount-input').value;
    const dateInput = document.querySelector('input[type="date"]').value;
    const categoryInput = document.querySelector('select').value;
    const descriptionInput = document.querySelector('textarea').value;

    const payload = {
      title: descriptionInput || (isExpense ? t('expense') : t('income')),
      subtitle: isExpense ? categoryInput : document.querySelector('select').value,
      categoryName: isExpense ? categoryInput : 'Income',
      type: isExpense ? 'expense' : 'income',
      amount: parseFloat(amountInput) || 0,
      date: dateInput
    };

    try {
      const response = await fetchWithAuth('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Add to local notifications
        try {
          const storedNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
          const newNotif = {
            id: Date.now(),
            type: 'transaction',
            text: `เพิ่มรายการ${isExpense ? 'รายจ่าย' : 'รายรับ'}ใหม่: ${payload.title} (฿${payload.amount.toLocaleString()})`,
            time: new Date().toISOString(),
            read: false
          };
          localStorage.setItem('notifications', JSON.stringify([newNotif, ...storedNotifs]));
        } catch(e) {
          console.error(e);
        }

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${isExpense ? 'Expense' : 'Income'} saved successfully!`,
          confirmButtonColor: 'var(--primary-main)'
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to save transaction',
        confirmButtonColor: 'var(--primary-main)'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>{t('addTransactionTitle')}</h1>
        <p>{t('addTransactionDesc')}</p>
      </div>

      <div className="main-grid">
        <div className="card form-card">
          <div className="tab-group">
            <button 
              className={`tab-btn ${isExpense ? 'active' : ''}`}
              onClick={() => setIsExpense(true)}
              style={isExpense ? { color: 'var(--danger)', borderBottom: '2px solid var(--danger)', borderRadius: '8px 8px 0 0' } : {}}
            >
              <ArrowUp size={18} /> {t('expense')}
            </button>
            <button 
              className={`tab-btn ${!isExpense ? 'active' : ''}`}
              onClick={() => setIsExpense(false)}
              style={!isExpense ? { color: 'var(--success)', borderBottom: '2px solid var(--success)', borderRadius: '8px 8px 0 0' } : {}}
            >
              <ArrowDown size={18} /> {t('income')}
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="amount-input-container">
              <span className="amount-label">{t('amount')}</span>
              <div className="amount-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="text" 
                  className="amount-input" 
                  placeholder="0.00" 
                  autoFocus 
                  style={{ color: isExpense ? 'var(--danger)' : 'var(--success)' }}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t('date')}</label>
                <input type="date" className="form-control" required />
              </div>
              <div className="form-group">
                <label className="form-label">{isExpense ? t('category') : t('source')}</label>
                <select className="form-control" required>
                  <option value="">{isExpense ? t('selectCategory') : t('selectSource')}</option>
                  {isExpense ? expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  )) : (
                    <>
                      <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย (KBank)</option>
                      <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย (KTB)</option>
                      <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</option>
                      <option value="เงินสด">เงินสด (Cash)</option>
                      <option value="อื่นๆ">อื่นๆ (Other)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('description')}</label>
              <textarea className="form-control" rows="3" placeholder={isExpense ? t('descriptionPlaceholderExpense') : t('descriptionPlaceholderIncome')}></textarea>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>{t('cancel')}</button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  padding: '12px 32px',
                  background: isExpense ? 'var(--primary-dark)' : 'var(--success)'
                }} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                    {t('saving')}
                  </>
                ) : t('save')}
              </button>
            </div>
          </form>
        </div>

        <div className="sidebar-aside">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1rem' }}>{t('dailyBudget')}</h3>
              <Info size={16} className="text-muted" />
            </div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('forecastFromHistory')}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                  ฿{forecast?.predictedDailyExpense?.toLocaleString() || 0}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              {t('aiAnalysisNote')}
            </p>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              <MapPin size={16} style={{ color: 'var(--accent)', marginRight: '8px', verticalAlign: 'middle' }} />
              {t('recentCategories')}
            </h3>
            <div className="category-chips">
              <span className="category-chip">อาหาร</span>
              <span className="category-chip">บันเทิง</span>
              <span className="category-chip">การศึกษา</span>
              <span className="category-chip">เสื้อผ้า</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .page-header { margin-bottom: 2.5rem; }
        .form-card { max-width: 800px; margin: 0 auto; }
        .tab-group {
          display: flex;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          margin-bottom: 2.5rem;
        }
        .tab-btn {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-muted);
          font-family: inherit;
        }
        .tab-btn.active {
          background: white;
          color: var(--primary-dark);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .amount-input-container { text-align: center; margin-bottom: 3rem; }
        .amount-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 1rem;
          display: block;
        }
        .amount-wrapper { display: inline-flex; align-items: center; gap: 12px; max-width: 100%; }
        .currency-symbol { font-size: 2.5rem; font-family: 'Outfit'; color: var(--text-muted); }
        .amount-input {
          border: none;
          background: transparent;
          font-size: 4rem;
          font-family: 'Outfit';
          font-weight: 700;
          width: 100%;
          max-width: 250px;
          text-align: left;
          color: var(--primary-dark);
          border-bottom: 2px solid transparent;
          transition: border-color 0.2s ease;
        }
        .amount-input:focus { outline: none; border-bottom-color: var(--accent); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .receipt-upload {
          border: 2px dashed var(--border);
          border-radius: 16px;
          padding: 2.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafafa;
        }
        .receipt-upload:hover { border-color: var(--accent); background: rgba(0, 168, 232, 0.02); }
        .upload-icon {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: var(--shadow-sm);
          color: var(--text-muted);
        }
        .category-chip {
          display: inline-flex;
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.85rem;
          margin-right: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .category-chip:hover { border-color: var(--accent); color: var(--accent); }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </Layout>
  );
};

export default AddTransaction;
