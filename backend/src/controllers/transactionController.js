const transactionService = require('../services/transactionService');
const prisma = require('../db/prisma');
const emailService = require('../services/emailService');

const transactionController = {
  getTransactions: async (req, res, next) => {
    try {
      const filters = { ...req.query, userId: req.user.id };
      const transactions = await transactionService.getTransactions(filters);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await transactionService.getStats(req.user.id, req.query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  createTransaction: async (req, res, next) => {
    try {
      const transaction = await transactionService.createTransaction(req.body, req.user.id);
      
      // Send email notification (async, don't wait for it to finish)
      if (req.user && req.user.id) {
        prisma.user.findUnique({ where: { id: req.user.id } }).then(u => {
          if (u && u.email) {
            emailService.sendTransactionNotification(u.email, transaction).catch(err => {
              console.error('Failed to send email notification:', err);
            });
          }
        }).catch(err => console.error('Failed to fetch user for email:', err));
      }

      res.status(201).json(transaction);
    } catch (error) {
      res.status(400); // Bad Request
      next(error);
    }
  },

  getForecast: async (req, res, next) => {
    try {
      const transactions = await transactionService.getTransactions({ userId: req.user.id });
      
      const targetMonth = req.query.month !== undefined ? parseInt(req.query.month) : new Date().getMonth();
      const targetYear = req.query.year !== undefined ? parseInt(req.query.year) : new Date().getFullYear();

      const thisMonthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      });

      const totalIncome = thisMonthTransactions.filter(t => t.category.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = thisMonthTransactions.filter(t => t.category.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      const insights = [];
      if (thisMonthTransactions.length === 0) {
        insights.push({ id: 1, type: 'info', title: "ยังไม่มีข้อมูล", text: "เริ่มบันทึกรายรับและรายจ่ายเพื่อรับการวิเคราะห์จาก AI!" });
      } else {
        if (totalExpenses > totalIncome) {
          insights.push({ id: 1, type: 'warning', title: "ค่าใช้จ่ายสูง", text: "คุณมีรายจ่ายมากกว่ารายรับในเดือนนี้ ควรพิจารณาลดค่าใช้จ่ายที่ไม่จำเป็น" });
        } else if (totalIncome - totalExpenses > 1000) {
          insights.push({ id: 2, type: 'investment', title: "เงินออมคงเหลือ", text: `คุณมีเงินเหลือประมาณ ${(totalIncome - totalExpenses).toLocaleString()} บาท ในเดือนนี้ แนะนำให้นำไปลงทุนหรือออมเพิ่มเติม` });
        } else {
          insights.push({ id: 3, type: 'saving', title: "การเงินสมดุล", text: "การใช้จ่ายของคุณอยู่ในเกณฑ์ดีเยี่ยม ขอให้รักษาวินัยการเงินแบบนี้ต่อไป!" });
        }
      }

      // Calculate predicted daily expense based on ALL history
      const allExpenses = transactions.filter(t => t.category.type === 'expense');
      let predictedDailyExpense = 0;
      if (allExpenses.length > 0) {
        const totalHistoricalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
        
        // Find the range of days from first transaction to last
        const dates = allExpenses.map(t => new Date(t.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const diffTime = Math.abs(maxDate - minDate);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) diffDays = 1; // At least 1 day
        predictedDailyExpense = Math.round(totalHistoricalExpenses / diffDays);
      }

      res.json({
        predictedIncome: totalIncome > 0 ? Math.round(totalIncome / 2) : 0, // Simplified prediction
        predictedExpenses: totalExpenses > 0 ? Math.round(totalExpenses / 2) : 0,
        predictedDailyExpense, // AI predicted daily
        netSavings: Math.round((totalIncome - totalExpenses) / 2),
        efficiency: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
        insights
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = transactionController;
