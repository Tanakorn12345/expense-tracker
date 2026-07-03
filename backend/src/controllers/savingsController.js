const prisma = require('../db/prisma');

const savingsController = {
  // Get all savings goals and transactions for the user
  async getSavings(req, res, next) {
    try {
      const goals = await prisma.savingsGoal.findMany({
        where: { userId: req.user.id },
        include: {
          transactions: {
            orderBy: { date: 'desc' }
          }
        }
      });
      
      const transactions = await prisma.savingsTransaction.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' }
      });
      
      res.json({ goals, transactions });
    } catch (error) {
      next(error);
    }
  },

  // Create a new savings goal
  async createGoal(req, res, next) {
    try {
      const { name, targetAmount } = req.body;
      const goal = await prisma.savingsGoal.create({
        data: {
          name,
          targetAmount: parseFloat(targetAmount),
          userId: req.user.id
        }
      });
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  },

  // Add money to a goal
  async addMoney(req, res, next) {
    try {
      const { id } = req.params;
      const { amount, date } = req.body;
      const amountFloat = parseFloat(amount);
      
      // Verify goal belongs to user
      const goal = await prisma.savingsGoal.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!goal || goal.userId !== req.user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      // Create transaction
      const transaction = await prisma.savingsTransaction.create({
        data: {
          amount: amountFloat,
          date: date ? new Date(date) : new Date(),
          goalId: parseInt(id),
          userId: req.user.id
        }
      });

      // Update goal currentAmount
      const updatedGoal = await prisma.savingsGoal.update({
        where: { id: parseInt(id) },
        data: {
          currentAmount: goal.currentAmount + amountFloat
        }
      });

      res.status(201).json({ transaction, updatedGoal });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = savingsController;
