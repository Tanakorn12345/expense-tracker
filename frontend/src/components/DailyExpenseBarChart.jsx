import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DailyExpenseBarChart({ data, mode }) {
  // กรณีไม่มีข้อมูล แสดงสถานะด้วย tailwind class
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-500 dark:text-gray-400 italic text-base">
          ยังไม่มีข้อมูลค่าใช้จ่าย
        </p>
      </div>
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
      // ใช้สี Tailwind Indigo-600 (0.8 opacity)
      backgroundColor: "rgba(79, 70, 229, 0.8)",
      hoverBackgroundColor: "#4f46e5", // Tailwind indigo-600
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
        backgroundColor: '#1e293b', // Tailwind slate-800
        titleFont: { size: 14, family: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" },
        bodyFont: { size: 14, family: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" },
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
          color: "#6b7280", // Tailwind gray-500
          font: { size: 12, weight: '500' }
        }
      },
      y: {
        beginAtZero: true,
        border: { display: false, dash: [5, 5] },
        grid: {
          color: "rgba(226, 232, 240, 0.5)", // Tailwind slate-200 with opacity
          drawTicks: false
        },
        ticks: {
          color: "#6b7280", // Tailwind gray-500
          font: { size: 12 },
          padding: 10,
          callback: (val) => val >= 1000 ? (val / 1000) + 'k' : val
        }
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}