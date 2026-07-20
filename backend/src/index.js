const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Fail-safe environment variable checks
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}
if (!process.env.ADMIN_EMAIL) {
  console.error("FATAL ERROR: ADMIN_EMAIL is not defined in .env file.");
  process.exit(1);
}
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adRoutes = require('./routes/adRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authenticate = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const { initCronJobs } = require('./services/cronJobs');

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy (e.g. Nginx, Cloudflare) for rate limiting and real IP
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'] : '*',
  credentials: true
};
app.use(cors(corsOptions));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api', globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/savings', authenticate, savingsRoutes);
app.use('/api/admin', authenticate, adminMiddleware, adminRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/notifications', notificationRoutes);
// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initCronJobs();
});
