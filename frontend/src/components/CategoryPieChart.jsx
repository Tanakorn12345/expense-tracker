import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
  } from "chart.js";
  import { Doughnut } from "react-chartjs-2";
  import { Box, Typography, useTheme } from "@mui/material";
  
  // ลงทะเบียน ChartJS
  ChartJS.register(ArcElement, Tooltip, Legend);
  
  export default function CategoryPieChart({ data = [] }) {
    const theme = useTheme();
  
    // ตรวจสอบข้อมูล
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            📭 ยังไม่มีข้อมูลหมวดหมู่
          </Typography>
        </Box>
      );
    }
  
    // คำนวณยอดรวมทั้งหมดเพื่อแสดงตรงกลาง Doughnut (Optional)
    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
  
    const chartData = {
      labels: data.map((d) => d.category),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: [
            "#4318FF", // Indigo
            "#6AD2FF", // Light Blue
            "#EFF4FB", // Grayish Blue
            "#FFB547", // Orange
            "#EE5D50", // Red
            "#01B574", // Green
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 15,
        },
      ],
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false, // บังคับให้ขยายเต็ม Container
      cutout: "70%", // ปรับรูตรงกลางให้กว้างขึ้น ดูทันสมัย (Doughnut style)
      plugins: {
        legend: {
          position: "bottom", // ย้ายคำอธิบายมาไว้ด้านล่าง
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: {
              family: theme.typography.fontFamily,
              size: 12,
              weight: "600",
            },
            color: theme.palette.text.primary,
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (context) => {
              const value = context.parsed;
              const percentage = ((value / totalAmount) * 100).toFixed(1);
              return ` ฿${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    };
  
    return (
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <Doughnut data={chartData} options={options} />
        
        {/* ใส่ตัวเลขยอดรวมไว้ตรงกลางกราฟวงกลม (ดู Pro มากขึ้น) */}
        <Box
          sx={{
            position: "absolute",
            top: "43%", // ปรับตามตำแหน่งรูตรงกลาง
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
            Total
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            ฿{totalAmount >= 1000 ? `${(totalAmount / 1000).toFixed(1)}k` : totalAmount}
          </Typography>
        </Box>
      </Box>
    );
  }