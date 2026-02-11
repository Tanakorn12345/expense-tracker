import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
  } from "chart.js";
  import { Doughnut } from "react-chartjs-2";
  import { Paper, Typography } from "@mui/material";
  
  ChartJS.register(ArcElement, Tooltip, Legend);
  

  export default function ExpenseChart({ data = [] }) {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <Typography sx={{ mt: 2 }}>
          📭 ยังไม่มีข้อมูลกราฟ
        </Typography>
      );
    }
  
    const chartData = {
      labels: data.map((d) => d.category),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: [
            "#1976d2",
            "#9c27b0",
            "#ff9800",
            "#4caf50",
            "#f44336",
            "#00acc1",
          ],
        },
      ],
    };
  
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📊 ค่าใช้จ่ายแยกตามหมวด
        </Typography>
        <Doughnut data={chartData} />
      </Paper>
    );
  }
  