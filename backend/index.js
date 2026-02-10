import express from "express";
import cors from "cors";

import categoryRoutes from "./routes/categories.js";
import expenseRoutes from "./routes/expenses.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
