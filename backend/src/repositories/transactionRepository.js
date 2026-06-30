const prisma = require('../db/prisma');

const transactionRepository = {
  async findAll(where = {}) {
    return await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    });
  },

  async findById(id) {
    return await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });
  },

  async create(data) {
    return await prisma.transaction.create({
      data,
      include: { category: true }
    });
  },

  async update(id, data) {
    return await prisma.transaction.update({
      where: { id: parseInt(id) },
      data,
      include: { category: true }
    });
  },

  async delete(id) {
    return await prisma.transaction.delete({
      where: { id: parseInt(id) }
    });
  }
};

module.exports = transactionRepository;
