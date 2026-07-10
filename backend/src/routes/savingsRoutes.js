const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', savingsController.getSavings);
router.post('/goals', savingsController.createGoal);
router.post('/goals/:id/add', savingsController.addMoney);
router.put('/goals/:id', savingsController.updateGoal);
router.delete('/goals/:id', savingsController.deleteGoal);

module.exports = router;
