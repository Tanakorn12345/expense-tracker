import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import categoryRoutes from "./routes/categories.js";
import expenseRoutes from "./routes/expenses.js";
import summaryRoutes from "./routes/summary.js";
import authRoutes from "./routes/auth.js";

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://expense-tracker-indol-phi-53.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/auth", authRoutes);

// ✅ ใช้ PORT จาก environment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
