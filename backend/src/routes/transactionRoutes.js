const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all transactions
router.get('/', transactionController.getTransactions);

// Get stats
router.get('/stats', transactionController.getStats);

// Get forecast and insights
router.get('/forecast', transactionController.getForecast);

// Create transaction
router.post('/', transactionController.createTransaction);

// Delete all user transactions
router.delete('/all', transactionController.deleteAllTransactions);

module.exports = router;
