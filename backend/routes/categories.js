import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET all categories
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// CREATE category
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const category = await prisma.category.create({
    data: { name },
  });

  res.json(category);
});

export default router;
