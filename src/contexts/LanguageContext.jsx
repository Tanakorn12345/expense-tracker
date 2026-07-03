import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  th: {
    // Layout & Sidebar
    dashboard: "ภาพรวม",
    transactions: "เพิ่มรายการ",
    history: "ประวัติรายการ",
    logout: "ออกจากระบบ",
    upgradePro: "อัปเกรดเป็นโปร",
    upgradeDesc: "เข้าถึงการวิเคราะห์เชิงลึกและรายงานภาษี",
    search: "ค้นหารายการ...",
    premiumMember: "สมาชิกระดับพรีเมียม",
    normalMember: "สมาชิกระดับปกติ",
    transaction: "รายการ",
    allTime: "ทุกช่วงเวลา",
    
    // Dashboard
    overviewTitle: "ภาพรวมการเงิน (Financial Overview)",
    overviewDesc: "ยินดีต้อนรับ นี่คือสรุปภาพรวมการใช้จ่ายและการเงินของคุณในเดือนนี้",
    addTransaction: "เพิ่มรายการ",
    totalIncome: "ยอดรับรวม (Income)",
    totalExpense: "ยอดจ่ายรวม (Expense)",
    netBalance: "ยอดคงเหลือสุทธิ (Net Balance)",
    trendUp: "ทิศทางเป็นบวก",
    trendDown: "ทิศทางติดลบ",
    chartTitle: "เปรียบเทียบรายรับและรายจ่าย",
    recentTransactions: "รายการทำธุรกรรมล่าสุด (Recent Transactions)",
    viewAll: "ดูทั้งหมด",
    noTransactions: "ไม่มีรายการสำหรับเดือนที่เลือก",
    loading: "กำลังโหลดข้อมูล...",
    aiInsights: "AI สรุปและวิเคราะห์ข้อมูล",
    forecastLabel: "การคาดการณ์ (Forecast)",
    expectedIncome: "รายรับที่คาดหวัง",
    expectedExpense: "รายจ่ายที่คาดหวัง",
    expectedSavings: "เงินออมที่คาดหวังสุทธิ",
    efficiency: "ประสิทธิภาพ",
    
    // Month Names
    jan: "มกราคม", feb: "กุมภาพันธ์", mar: "มีนาคม", apr: "เมษายน",
    may: "พฤษภาคม", jun: "มิถุนายน", jul: "กรกฎาคม", aug: "สิงหาคม",
    sep: "กันยายน", oct: "ตุลาคม", nov: "พฤศจิกายน", dec: "ธันวาคม",

    // Add Transaction
    addTransactionTitle: "เพิ่มรายการ",
    addTransactionDesc: "บันทึกรายรับและรายจ่ายของคุณให้เป็นระเบียบ",
    expense: "รายจ่าย",
    income: "รายรับ",
    amount: "จำนวนเงิน",
    date: "วันที่",
    category: "หมวดหมู่ (Category)",
    source: "แหล่งที่มา (Source)",
    selectCategory: "เลือกหมวดหมู่",
    selectSource: "เลือกแหล่งที่มา",
    description: "คำอธิบาย",
    descriptionPlaceholderExpense: "ค่าใช้จ่ายนี้คือค่าอะไร?",
    descriptionPlaceholderIncome: "แหล่งรายรับมาจากไหน?",
    cancel: "ยกเลิก",
    save: "บันทึก",
    saving: "บันทึก...",
    dailyBudget: "ค่าใช้จ่ายเฉลี่ยต่อวัน (AI)",
    forecastFromHistory: "คาดการณ์จากประวัติ",
    aiAnalysisNote: "*วิเคราะห์โดย AI จากประวัติการใช้จ่ายทั้งหมดของคุณ",
    recentCategories: "หมวดหมู่ล่าสุด",

    // AI Insight overrides (Backend returns Thai, we map it for English below)
    ai_noData_title: "ยังไม่มีข้อมูล",
    ai_noData_text: "เริ่มบันทึกรายรับและรายจ่ายเพื่อรับการวิเคราะห์จาก AI!",
    ai_highSpending_title: "ค่าใช้จ่ายสูง",
    ai_highSpending_text: "คุณมีรายจ่ายมากกว่ารายรับในเดือนนี้ ควรพิจารณาลดค่าใช้จ่ายที่ไม่จำเป็น",
    ai_savings_title: "เงินออมคงเหลือ",
    ai_savings_text: "คุณมีเงินเหลือประมาณ {amount} บาท ในเดือนนี้ แนะนำให้นำไปลงทุนหรือออมเพิ่มเติม",
    ai_balanced_title: "การเงินสมดุล",
    ai_balanced_text: "การใช้จ่ายของคุณอยู่ในเกณฑ์ดีเยี่ยม ขอให้รักษาวินัยการเงินแบบนี้ต่อไป!",
  },
  en: {
    // Layout & Sidebar
    dashboard: "Dashboard",
    transactions: "Add Record",
    history: "History",
    logout: "Logout",
    upgradePro: "Upgrade Pro",
    upgradeDesc: "Access advanced portfolio analytics and tax reporting.",
    search: "Search transactions...",
    premiumMember: "Premium Member",
    normalMember: "Standard Member",
    transaction: "Transaction",
    allTime: "All Time",
    
    // Dashboard
    overviewTitle: "Financial Overview",
    overviewDesc: "Welcome back! Here's your financial summary for this month.",
    addTransaction: "Add New",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    netBalance: "Net Balance",
    trendUp: "Positive Trend",
    trendDown: "Negative Trend",
    chartTitle: "Income vs Expense",
    recentTransactions: "Recent Transactions",
    viewAll: "View All",
    noTransactions: "No transactions found for this month.",
    loading: "Loading data...",
    aiInsights: "AI Insights & Summary",
    forecastLabel: "Forecast",
    expectedIncome: "Expected Income",
    expectedExpense: "Expected Expense",
    expectedSavings: "Net Expected Savings",
    efficiency: "Efficiency",
    
    // Month Names
    jan: "January", feb: "February", mar: "March", apr: "April",
    may: "May", jun: "June", jul: "July", aug: "August",
    sep: "September", oct: "October", nov: "November", dec: "December",

    // Add Transaction
    addTransactionTitle: "Add Transaction",
    addTransactionDesc: "Keep your financial records precise.",
    expense: "Expense",
    income: "Income",
    amount: "Amount",
    date: "Date",
    category: "Category",
    source: "Source",
    selectCategory: "Select Category",
    selectSource: "Select Source",
    description: "Description",
    descriptionPlaceholderExpense: "What was this expense for?",
    descriptionPlaceholderIncome: "Where did this income come from?",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    dailyBudget: "Avg Daily Expense (AI)",
    forecastFromHistory: "Historical Forecast",
    aiAnalysisNote: "*Analyzed by AI based on your entire spending history",
    recentCategories: "Recent Categories",

    // AI Insight overrides
    ai_noData_title: "No Data",
    ai_noData_text: "Start adding transactions to get AI insights!",
    ai_highSpending_title: "High Spending",
    ai_highSpending_text: "You are spending more than you earn. Try to cut back on expenses.",
    ai_savings_title: "Surplus Savings",
    ai_savings_text: "You have a surplus of {amount} THB this month. Consider investing.",
    ai_balanced_title: "Balanced Finances",
    ai_balanced_text: "Your finances are balanced. Keep tracking your expenses!",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'th';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'th' ? 'en' : 'th');
  };

  const t = (key, params = {}) => {
    let str = translations[language][key] || key;
    Object.keys(params).forEach(paramKey => {
      str = str.replace(`{${paramKey}}`, params[paramKey]);
    });
    return str;
  };

  const translateInsight = (insight) => {
    if (language === 'th') return insight; 

    let titleKey, textKey;
    switch(insight.id) {
      case 1:
        if (insight.type === 'info') { titleKey = 'ai_noData_title'; textKey = 'ai_noData_text'; }
        else { titleKey = 'ai_highSpending_title'; textKey = 'ai_highSpending_text'; }
        break;
      case 2:
        titleKey = 'ai_savings_title'; 
        textKey = 'ai_savings_text';
        break;
      case 3:
        titleKey = 'ai_balanced_title';
        textKey = 'ai_balanced_text';
        break;
      default:
        return insight;
    }

    let params = {};
    if (insight.id === 2) {
      const match = insight.text.match(/ประมาณ ([\d,]+) บาท/);
      if (match) {
        params.amount = match[1];
      }
    }

    return {
      ...insight,
      title: t(titleKey),
      text: t(textKey, params)
    };
  };

  const getMonthName = (monthIndex) => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return t(months[monthIndex]);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getMonthName, translateInsight }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
