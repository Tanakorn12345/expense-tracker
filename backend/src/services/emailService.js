const nodemailer = require('nodemailer');

const createTransporter = () => {
  // If SMTP is not configured, nodemailer can optionally use ethereal.email or just mock
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'mock_user@example.com',
      pass: process.env.SMTP_PASS || 'mock_pass',
    },
  });
};

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();
    
    // In dev mode or without real credentials, just log it out instead of crashing
    if (!process.env.SMTP_USER) {
      console.log('--- EMAIL MOCK ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      console.log('--- END EMAIL ---');
      return { success: true, mock: true };
    }

    const info = await transporter.sendMail({
      from: `"FinTrack" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

const sendTransactionNotification = async (userEmail, transaction) => {
  const isExpense = transaction.category.type === 'expense';
  const typeText = isExpense ? 'รายจ่าย' : 'รายรับ';
  const subject = `[FinTrack] แจ้งเตือนการเพิ่ม${typeText}ใหม่`;
  const text = `
สวัสดีครับคุณ ${userEmail},

มีการเพิ่มรายการ${typeText}ใหม่ในบัญชีของคุณ:
- ชื่อรายการ: ${transaction.title}
- หมวดหมู่: ${transaction.category.name}
- จำนวนเงิน: ฿${transaction.amount.toLocaleString()}
- วันที่: ${new Date(transaction.date).toLocaleDateString('th-TH')}

ขอขอบคุณที่ใช้บริการ FinTrack
  `;

  return sendEmail(userEmail, subject, text);
};

module.exports = {
  sendEmail,
  sendTransactionNotification
};
