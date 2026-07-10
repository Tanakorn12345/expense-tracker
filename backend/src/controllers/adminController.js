const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Get all users with their balance (sum of income - expense transactions)
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isPro: true,
        createdAt: true,
        transactions: {
          select: {
            amount: true,
            category: { select: { type: true } }
          }
        }
      }
    });

    const usersWithBalance = users.map(user => {
      let balance = 0;
      user.transactions.forEach(tx => {
        if (tx.category.type === 'income') {
          balance += tx.amount;
        } else {
          balance -= tx.amount;
        }
      });
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isPro: user.isPro,
        createdAt: user.createdAt,
        balance
      };
    });

    res.json(usersWithBalance);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, isPro } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isPro: isPro || false
      }
    });

    res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, isPro } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (isPro !== undefined) updateData.isPro = isPro;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });

    res.json({ message: 'User updated successfully', user: { id: updatedUser.id, email: updatedUser.email } });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user with Cascade
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    // Using transaction for cascade delete
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.savingsTransaction.deleteMany({ where: { userId } }),
      prisma.savingsGoal.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, isPro: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    });

    let balance = 0;
    transactions.forEach(tx => {
      if (tx.category.type === 'income') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
    });

    res.json({ user, balance, transactions });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
