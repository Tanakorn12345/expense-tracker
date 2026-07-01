import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingCart, Banknote, Home, ArrowRightLeft, Car, Download, Trash2 } from 'lucide-react';
import TransactionRow from '../components/Dashboard/TransactionRow';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SarabunFont } from '../assets/fonts/Sarabun';
import CategoryIcon from '../components/CategoryIcon';
import { fetchWithAuth } from '../utils/api';



const History = () => {
  const { transactions, isLoading } = useTransactions();
  const { t, getMonthName } = useLanguage();
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(tItem => {
    const tDate = new Date(tItem.date);
    
    // Month filter
    if (filterMonth !== 'all') {
      const tMonth = tDate.getMonth().toString();
      if (tMonth !== filterMonth) return false;
    }

    // Date filter
    if (filterDate) {
      // Compare YYYY-MM-DD
      const localDate = new Date(tDate.getTime() - (tDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      if (localDate !== filterDate) return false;
    }
    
    // Search query filter
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = (
        tItem.title?.toLowerCase().includes(query) ||
        tItem.category?.name?.toLowerCase().includes(query) ||
        tItem.subtitle?.toLowerCase().includes(query) ||
        tItem.amount?.toString().includes(query)
      );
    }

    // Category filter
    let matchesCategory = true;
    if (filterCategory !== 'all') {
      matchesCategory = (tItem.category?.name?.toLowerCase() === filterCategory.toLowerCase() || tItem.category?.type?.toLowerCase() === filterCategory.toLowerCase());
    }

    return matchesSearch && matchesCategory;
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
    
    doc.addFileToVFS("Sarabun-Regular.ttf", SarabunFont);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
    doc.setFont("Sarabun");

    doc.text(t('history') || "ประวัติการทำรายการ", 14, 15);
    
    const tableColumn = [
      t('transaction') || "รายการ", 
      t('category') || "หมวดหมู่", 
      t('date') || "วันที่", 
      t('amount') || "จำนวนเงิน"
    ];
    const tableRows = [];

    filteredTransactions.forEach(tItem => {
      const transactionData = [
        tItem.title,
        tItem.category?.name || tItem.subtitle,
        new Date(tItem.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
        `${tItem.category?.type === 'expense' ? '-' : '+'}฿${tItem.amount.toLocaleString()}`
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        font: "Sarabun",
        fontSize: 12
      },
      headStyles: {
        font: "Sarabun",
        fontStyle: "normal",
        fontSize: 14
      }
    });

    let filename = 'all-months';
    if (filterDate) {
      filename = filterDate;
    } else if (filterMonth !== 'all') {
      const engMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      filename = engMonths[parseInt(filterMonth)].toLowerCase();
    }
    
    doc.save(`${filename}-transaction.pdf`);
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
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>{t('history')}</h1>
        <p>{t('addTransactionDesc')}</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.25rem' }}>{t('recentTransactions')}</h2>
          <div className="flex gap-2">
            <select 
              className="form-control" 
              style={{ width: 'auto', minWidth: '150px' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">{language === 'th' ? 'ทุกหมวดหมู่' : 'All Categories'}</option>
              <option value="income">{language === 'th' ? 'รายรับทั้งหมด' : 'All Income'}</option>
              <option value="expense">{language === 'th' ? 'รายจ่ายทั้งหมด' : 'All Expenses'}</option>
              <option value="food">{language === 'th' ? 'อาหาร' : 'Food'}</option>
              <option value="housing">{language === 'th' ? 'ที่พัก/บ้าน' : 'Housing'}</option>
              <option value="transportation">{language === 'th' ? 'เดินทาง' : 'Transportation'}</option>
            </select>
            <button className="btn btn-outline" onClick={handleExportPDF} style={{ padding: '8px 12px' }}>
              <Download size={16} className="mr-2" style={{ marginRight: '8px' }} />
              Export
            </button>
            <button className="btn" onClick={handleDeleteAll} style={{ padding: '8px 12px', background: 'var(--danger)', color: 'white' }}>
              <Trash2 size={16} className="mr-2" style={{ marginRight: '8px' }} />
              Delete All
            </button>
            <input 
              type="date" 
              className="form-control" 
              style={{ width: 'auto', display: 'inline-block' }}
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
              style={{ width: 'auto', display: 'inline-block' }}
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate(''); // Clear specific date when month is changed
              }}
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
          <table className="data-table" style={{ minWidth: '600px' }}>
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
                  icon={<CategoryIcon categoryName={tItem.category?.name || tItem.subtitle} />} 
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
