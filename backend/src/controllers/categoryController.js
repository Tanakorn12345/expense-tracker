const prisma = require('../db/prisma');

const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
      
      const formattedCategories = {
        expense: categories.filter(c => c.type === 'expense').map(c => c.name),
        income: categories.filter(c => c.type === 'income').map(c => c.name)
      };

      res.json(formattedCategories);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;
