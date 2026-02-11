import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { amount, description, date, categoryName } = req.body;

  // 🔎 หา category จากชื่อ
  let category = await prisma.category.findFirst({
    where: {
      name: categoryName,
    },
  });

  // ➕ ถ้าไม่มี → สร้างใหม่
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categoryName,
      },
    });
  }

  // 💾 สร้าง expense และผูก category
  const expense = await prisma.expense.create({
    data: {
      amount,
      description,
      date: new Date(date),
      categoryId: category.id,
    },
    include: {
      category: true, // ⭐ สำคัญมาก
    },
  });

  res.json(expense);
});


router.get("/", async (req, res) => {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    include: {
      category: true, // ⭐ ต้องมี
    },
  });

  res.json(expenses);
});

export default router;
