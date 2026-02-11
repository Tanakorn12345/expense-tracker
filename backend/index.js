import express from "express";
import cors from "cors";

import categoryRoutes from "./routes/categories.js";
import expenseRoutes from "./routes/expenses.js";
import summaryRoutes from "./routes/summary.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);

// ✅ ใช้ PORT จาก environment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
