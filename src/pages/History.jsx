import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingCart, Banknote, Home, ArrowRightLeft, Car, Download, Trash2 } from 'lucide-react';
import TransactionRow from '../components/Dashboard/TransactionRow';
import { fetchWithAuth } from '../utils/api';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const getIcon = (categoryName) => {
  switch (categoryName) {
    case 'Food': return <ShoppingCart size={16} />;
    case 'Income': return <Banknote size={16} />;
    case 'Housing': return <Home size={16} />;
    case 'Transportation': return <Car size={16} />;
    default: return <ArrowRightLeft size={16} />;
  }
};

const History = () => {
  const { transactions, isLoading } = useTransactions();
  const { t, getMonthName } = useLanguage();
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(tItem => {
    // Month filter
    if (filterMonth !== 'all') {
      const tMonth = new Date(tItem.date).getMonth().toString();
      if (tMonth !== filterMonth) return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = tItem.title?.toLowerCase().includes(query);
      const categoryMatch = tItem.category?.name?.toLowerCase().includes(query);
      const subtitleMatch = tItem.subtitle?.toLowerCase().includes(query);
      const amountMatch = tItem.amount?.toString().includes(query);
      
      if (!titleMatch && !categoryMatch && !subtitleMatch && !amountMatch) {
        return false;
      }
    }
    
    return true;
  });

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Cannot export because there is no data.',
        confirmButtonColor: 'var(--primary-main)'
      });
      return;
    }

    const doc = new jsPDF();
    
    // Add Thai Font if possible, but standard jsPDF might not support Thai out of the box without custom font.
    // We will proceed with standard text which might show ? for Thai characters if font is missing,
    // but the user just requested PDF export.
    doc.text("Transaction History", 14, 15);
    
    const tableColumn = ["Title", "Category", "Date", "Amount"];
    const tableRows = [];

    filteredTransactions.forEach(tItem => {
      const transactionData = [
        tItem.title,
        tItem.category?.name || tItem.subtitle,
        new Date(tItem.date).toLocaleDateString('en-US'),
        `${tItem.category?.type === 'expense' ? '-' : '+'}฿${tItem.amount.toLocaleString()}`
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    const engMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthStr = filterMonth !== 'all' ? engMonths[parseInt(filterMonth)].toLowerCase() : 'all-months';
    doc.save(`${monthStr}-transaction.pdf`);
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This deletes all your transactions.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetchWithAuth('/api/transactions/all', {
          method: 'DELETE',
        });
        
        if (response.ok) {
          Swal.fire(
            'Deleted!',
            'Your transactions have been deleted.',
            'success'
          );
          // Refresh page to clear data
          window.location.reload();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete transactions.', 'error');
      }
    }
  };

  return (
    <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="page-header">
        <h1>{t('history')}</h1>
        <p>{t('addTransactionDesc')}</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.25rem' }}>{t('recentTransactions')}</h2>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={handleExportPDF} style={{ padding: '8px 12px' }}>
              <Download size={16} className="mr-2" style={{ marginRight: '8px' }} />
              Export
            </button>
            <button className="btn" onClick={handleDeleteAll} style={{ padding: '8px 12px', background: 'var(--danger)', color: 'white' }}>
              <Trash2 size={16} className="mr-2" style={{ marginRight: '8px' }} />
              Delete All
            </button>
            <select 
              className="form-control" 
              style={{ width: 'auto', display: 'inline-block' }}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="all">{t('allTime')}</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i.toString()}>
                  {getMonthName(i)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('transaction')}</th>
                <th>{t('category')}</th>
                <th>{t('date')}</th>
                <th style={{ textAlign: 'right' }}>{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tItem => (
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
              {!isLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default History;
