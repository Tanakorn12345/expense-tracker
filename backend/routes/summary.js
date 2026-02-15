import express from "express";
import prisma from "../prisma/client.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mode = req.query.mode || "day";
    const { startDate, endDate } = req.query;

    const where = {};

    // ✅ filter ช่วงวันที่
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    /* -------------------- */
    /* 1. Group by date */
    /* -------------------- */
    let byDate;

    if (mode === "day") {
      const raw = await prisma.expense.findMany({
        where,
        select: { date: true, amount: true }
      });

      const map = {};
      raw.forEach(e => {
        const key = e.date.toISOString().slice(0, 10);
        map[key] = (map[key] || 0) + e.amount;
      });

      byDate = Object.entries(map).map(([label, total]) => ({
        label,
        total
      }));
    }

    if (mode === "month") {
      // (ส่วน logic ของ month คงเดิม)
      const raw = await prisma.expense.findMany({
        where,
        select: { date: true, amount: true }
      });

      const map = {};
      raw.forEach(e => {
        const key = e.date.toISOString().slice(0, 7);
        map[key] = (map[key] || 0) + e.amount;
      });

      byDate = Object.entries(map).map(([label, total]) => ({
        label,
        total
      }));
    }

    /* -------------------- */
    /* 2. Group by category */
    /* -------------------- */
    // (ส่วน logic ของ category คงเดิม)
    const byCategoryRaw = await prisma.expense.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true }
    });

    const categories = await prisma.category.findMany();

    const byCategory = byCategoryRaw.map(c => {
      const cat = categories.find(cat => cat.id === c.categoryId);
      return {
        category: cat ? cat.name : "ไม่ระบุ",
        total: c._sum.amount
      };
    });

    /* -------------------- */
    /* 3. (เพิ่มใหม่) Get Expense List */
    /* -------------------- */
    // ดึงรายการทั้งหมดที่ตรงกับ filter เพื่อส่งกลับไปแสดงผล
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        category: true,
      },
    });

    // ส่ง expenses กลับไปพร้อมกับ summary
    res.json({ byDate, byCategory, expenses });
    
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ message: "Summary error" });
  }
});

export default router;