import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// ลงทะเบียน ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ data = [] }) {
  // ตรวจสอบข้อมูล
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          📭 ยังไม่มีข้อมูลหมวดหมู่
        </p>
      </div>
    );
  }

  // คำนวณยอดรวมทั้งหมดเพื่อแสดงตรงกลาง Doughnut
  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: [
          "#4f46e5", // Indigo (Tailwind indigo-600)
          "#0ea5e9", // Light Blue (Tailwind sky-500)
          "#64748b", // Slate (Tailwind slate-500)
          "#f59e0b", // Amber (Tailwind amber-500)
          "#ef4444", // Red (Tailwind red-500)
          "#10b981", // Green (Tailwind emerald-500)
          "#d946ef", // Fuchsia (Tailwind fuchsia-500)
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
            family: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
            size: 12,
            weight: "600",
          },
          color: "#6b7280", // Tailwind gray-500
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)", // Tailwind gray-900 with opacity
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
    <div className="w-full h-full relative">
      <Doughnut data={chartData} options={options} />

      {/* ใส่ตัวเลขยอดรวมไว้ตรงกลางกราฟวงกลม (ดู Pro มากขึ้น) */}
      <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Total
        </span>
        <span className="text-lg font-black text-gray-900 dark:text-white">
          ฿{totalAmount >= 1000 ? `${(totalAmount / 1000).toFixed(1)}k` : totalAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}