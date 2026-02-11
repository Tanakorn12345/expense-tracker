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

    res.json({ byDate, byCategory });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ message: "Summary error" });
  }
});


export default router;
