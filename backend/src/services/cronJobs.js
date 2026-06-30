const cron = require('node-cron');
const prisma = require('../db/prisma');
const emailService = require('./emailService');

const initCronJobs = () => {
  // Run on the last day of every month at 23:59 (11:59 PM)
  // '59 23 28-31 * *' will run at 23:59 on days 28 to 31, but we need to check if it's the last day.
  // Actually, '59 23 * * *' running daily and checking if tomorrow is a new month is more precise, 
  // but let's use a standard cron expression that is simpler or just '59 23 28-31 * *' with a JS check.
  
  // A cleaner approach: Run every day at 23:59 and check if it's the last day of the month
  cron.schedule('59 23 * * *', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // If tomorrow's month is different from today's month, today is the last day of the month
    if (today.getMonth() !== tomorrow.getMonth()) {
      console.log('Running monthly email summary cron job...');
      try {
        const users = await prisma.user.findMany();
        
        for (const user of users) {
          const targetMonth = today.getMonth();
          const targetYear = today.getFullYear();
          
          const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            include: { category: true }
          });

          const thisMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
          });

          const totalIncome = thisMonthTransactions.filter(t => t.category.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const totalExpense = thisMonthTransactions.filter(t => t.category.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
          const balance = totalIncome - totalExpense;

          const subject = `[FinTrack] สรุปยอดค่าใช้จ่ายประจำเดือน ${today.toLocaleString('th-TH', { month: 'long' })}`;
          const text = `
เรียนคุณ ${user.email},

นี่คือสรุปยอดค่าใช้จ่ายของคุณประจำเดือนนี้:
- รายรับทั้งหมด: ฿${totalIncome.toLocaleString()}
- รายจ่ายทั้งหมด: ฿${totalExpense.toLocaleString()}
- ยอดเงินคงเหลือ: ฿${balance.toLocaleString()}

${balance > 0 ? 'ยอดเยี่ยม! คุณมีเงินเหลือเก็บในเดือนนี้' : 'ระวัง! คุณใช้จ่ายเกินกว่ารายรับในเดือนนี้'}

ขอบคุณที่ใช้บริการ FinTrack
          `;

          await emailService.sendEmail(user.email, subject, text);
        }
        console.log('Monthly email summaries sent successfully.');
      } catch (error) {
        console.error('Error running monthly email cron job:', error);
      }
    }
  });

  console.log('Cron jobs initialized.');
};

module.exports = { initCronJobs };
