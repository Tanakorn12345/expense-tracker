import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET all expenses
router.get("/", async (req, res) => {
    const {
      categoryId,
      startDate,
      endDate,
      sort = "date",
      order = "desc",
    } = req.query;
  
    const where = {};
  
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
  
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
  
    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: {
        [sort]: order,
      },
    });
  
    res.json(expenses);
  });
  

// CREATE expense
router.post("/", async (req, res) => {
  const { amount, date, categoryId, description } = req.body;

  if (!amount || !date || !categoryId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const expense = await prisma.expense.create({
    data: {
      amount: Number(amount),
      date: new Date(date),
      categoryId: Number(categoryId),
      description,
    },
  });

  res.json(expense);
});

export default router;
