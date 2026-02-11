import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Box, Typography, alpha, useTheme } from "@mui/material";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DailyExpenseBarChart({ data, mode }) {
  const theme = useTheme();

  // กรณีไม่มีข้อมูล แสดงสถานะด้วย MUI Typography
  if (!data || data.length === 0) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        height="100%"
      >
        <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          ยังไม่มีข้อมูลค่าใช้จ่าย
        </Typography>
      </Box>
    );
  }

  const chartData = {
    labels: data.map(d => mode === 'day' 
      ? new Date(d.label).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
      : new Date(d.label).toLocaleDateString('th-TH', { month: 'long' })
    ),
    datasets: [{
      label: 'ยอดใช้จ่าย',
      data: data.map(d => d.total),
      // ใช้สี Primary จาก MUI Theme เพื่อความกลมกลืน
      backgroundColor: alpha(theme.palette.primary.main, 0.8),
      hoverBackgroundColor: theme.palette.primary.main,
      borderRadius: 8,
      barThickness: mode === 'day' ? 20 : 40,
      maxBarThickness: 50,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleFont: { size: 14, family: theme.typography.fontFamily },
        bodyFont: { size: 14, family: theme.typography.fontFamily },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) => ` ยอดรวม: ฿${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: theme.palette.text.secondary,
          font: { size: 12, weight: '500' }
        }
      },
      y: {
        beginAtZero: true,
        border: { display: false, dash: [5, 5] },
        grid: { 
          color: alpha(theme.palette.divider, 0.5),
          drawTicks: false 
        },
        ticks: { 
          color: theme.palette.text.secondary,
          font: { size: 12 },
          padding: 10,
          callback: (val) => val >= 1000 ? (val/1000) + 'k' : val
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
}