import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // 1️⃣ Total amount
  const total = await prisma.expense.aggregate({
    _sum: { amount: true },
    where,
  });

  // 2️⃣ Group by category (Pie Chart)
  const byCategory = await prisma.expense.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where,
  });

  const categories = await prisma.category.findMany();

  const categorySummary = byCategory.map((item) => {
    const category = categories.find(
      (c) => c.id === item.categoryId
    );

    return {
      category: category?.name || "Unknown",
      amount: item._sum.amount,
    };
  });

  // 3️⃣ Group by date (Line Chart)
  const byDate = await prisma.expense.groupBy({
    by: ["date"],
    _sum: { amount: true },
    where,
    orderBy: {
      date: "asc",
    },
  });

  res.json({
    totalAmount: total._sum.amount || 0,
    byCategory: categorySummary,
    byDate: byDate.map((d) => ({
      date: d.date,
      amount: d._sum.amount,
    })),
  });
});

export default router;
