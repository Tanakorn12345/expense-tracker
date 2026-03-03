import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="mt-4 text-gray-500 dark:text-gray-400 italic">
        📭 ยังไม่มีข้อมูลกราฟ
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: [
          "#3b82f6", // blue-500
          "#a855f7", // purple-500
          "#f97316", // orange-500
          "#22c55e", // green-500
          "#ef4444", // red-500
          "#06b6d4", // cyan-500
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 mt-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        📊 ค่าใช้จ่ายแยกตามหมวด
      </h3>
      <div className="relative h-[300px] w-full flex justify-center">
        <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
