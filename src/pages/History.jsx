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
  const { t, getMonthName, language } = useLanguage();
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

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Helper to draw Fintrack Logo
    const drawFintrackLogo = (x, y, size) => {
      doc.setFillColor(0, 51, 102);
      doc.roundedRect(x, y, size, size, size * 0.2, size * 0.2, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.rect(x + size * 0.3, y + size * 0.25, size * 0.12, size * 0.5, 'F'); // stem
      doc.rect(x + size * 0.4, y + size * 0.25, size * 0.3, size * 0.12, 'F'); // top bar
      doc.rect(x + size * 0.4, y + size * 0.45, size * 0.2, size * 0.12, 'F'); // mid bar

      doc.setDrawColor(16, 185, 129); // #10b981 green
      doc.setLineWidth(size * 0.08);
      doc.line(x + size * 0.5, y + size * 0.7, x + size * 0.8, y + size * 0.4); // diagonal
      doc.line(x + size * 0.8, y + size * 0.4, x + size * 0.6, y + size * 0.4); // arrow top
      doc.line(x + size * 0.8, y + size * 0.4, x + size * 0.8, y + size * 0.6); // arrow right
    };

    // Header Logo
    drawFintrackLogo(14, 12, 10);
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(16);
    doc.text("FinTrack", 27, 19);

    // Title
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);

    let periodText = 'ทั้งหมด';
    if (filterDate) {
      periodText = `วันที่ ${filterDate}`;
    } else if (filterMonth !== 'all') {
      const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
      periodText = thMonths[parseInt(filterMonth)];
    }
    
    const now = new Date();
    const exportTime = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + now.toLocaleTimeString('th-TH');

    const titleStr = `รายการแจ้งธุรกรรมที่ดำเนินการในเดือน: ${periodText}`;
    const timeStr = `เวลาที่ส่งออก: ${exportTime}`;
    doc.text(titleStr, 14, 30);
    doc.text(timeStr, 14, 37);
    
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

    let reportIncome = 0;
    let reportExpense = 0;
    filteredTransactions.forEach(t => {
      if (t.category?.type === 'income') reportIncome += t.amount;
      if (t.category?.type === 'expense') reportExpense += t.amount;
    });

    let systemIncome = 0;
    let systemExpense = 0;
    transactions.forEach(t => {
      if (t.category?.type === 'income') systemIncome += t.amount;
      if (t.category?.type === 'expense') systemExpense += t.amount;
    });
    const systemBalance = systemIncome - systemExpense;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 43,
      styles: {
        font: "Sarabun",
        fontSize: 10
      },
      headStyles: {
        font: "Sarabun",
        fontStyle: "normal",
        fontSize: 12,
        fillColor: [0, 51, 102]
      },
      margin: { bottom: 30 },
      didDrawPage: function(data) {
        doc.setFont("Sarabun");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        
        const footerText = "ขอบคุณที่ใช้บริการของเรา หากมีข้อสงสัยสามารถติดต่อได้ที่ hoing11111@gmail.com";
        const textWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 15);
        
        const footerLogoSize = 6;
        const footerLogoX = (pageWidth - footerLogoSize - 18) / 2;
        drawFintrackLogo(footerLogoX, pageHeight - 10, footerLogoSize);
        
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(10);
        doc.text("FinTrack", footerLogoX + footerLogoSize + 3, pageHeight - 5);
      }
    });

    let finalY = doc.lastAutoTable.finalY || 43;

    if (finalY > pageHeight - 60) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFillColor(243, 246, 249);
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(14, finalY + 10, pageWidth - 28, 45, 2, 2, 'FD');
    
    doc.setFont("Sarabun");
    doc.setFontSize(12);
    
    doc.setTextColor(50, 50, 50);
    doc.text(`สรุปตามช่วงเวลาที่เลือก (ในรายงานนี้):`, 20, finalY + 22);
    
    doc.setTextColor(39, 174, 96); // Green
    doc.text(`รายรับรวม: +฿${reportIncome.toLocaleString()}`, 20, finalY + 32);
    
    doc.setTextColor(231, 76, 60); // Red
    doc.text(`รายจ่ายรวม: -฿${reportExpense.toLocaleString()}`, 90, finalY + 32);
    
    // System Balance
    doc.setTextColor(0, 51, 102); // Primary Blue
    doc.setFontSize(14);
    doc.text(`เงินคงเหลือที่มีอยู่ในระบบทั้งหมด: ฿${systemBalance.toLocaleString()}`, 20, finalY + 45);

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

      <div className="card history-card">
        <div className="history-header">
          <h2 style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', margin: 0 }}>{t('recentTransactions')}</h2>
          <div className="history-filters-row">
            <div className="history-filters-group">
              <select 
                className="form-control" 
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
              <input 
                type="date" 
                className="form-control" 
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
            
            <div className="history-actions-group">
              <button className="btn btn-outline" onClick={handleExportPDF} style={{ padding: '8px 12px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Download size={16} className="mr-2" style={{ marginRight: '8px' }} />
                Export
              </button>
              <button className="btn" onClick={handleDeleteAll} style={{ padding: '8px 12px', background: 'var(--danger)', color: 'white', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={16} className="mr-2" style={{ marginRight: '8px' }} />
                Delete All
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
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
