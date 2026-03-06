import { useEffect, useState } from "react";
import DailyExpenseBarChart from "../components/DailyExpenseBarChart";
import CategoryPieChart from "../components/CategoryPieChart";
import ExpenseList from "../components/ExpenseList";
import api from "../api";
import {
  BarChart2,
  RotateCcw,
  PieChart,
  Wallet,
  ListOrdered
} from "lucide-react";

export default function Dashboard() {
  const [mode, setMode] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  // ลบ const fetchSummary แบบเดิมทิ้งไป แล้วเอามาเขียนรวมในนี้แทน
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/api/summary`, {
          params: { mode, startDate, endDate }
        });

        setChartData(res.data.byDate || []);
        setCategoryData(res.data.byCategory || []);
        setRecentExpenses(res.data.expenses || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchSummary();
  }, [mode, startDate, endDate]);

  const totalAmount = categoryData.reduce((acc, curr) => {
    return acc + (Number(curr.total) || Number(curr.value) || 0);
  }, 0);

  return (
    <div className="min-h-full space-y-6">

      {/* Header & Total (Top Row) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-1">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 drop-shadow-sm flex items-center gap-2">
          📊 Expense Overview
        </h1>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Total Expenses</p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
              ฿{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* --- ส่วนที่ 1: Filters --- */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest shrink-0">FILTERS</h2>

            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setMode("day")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${mode === "day"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                DAY
              </button>
              <button
                onClick={() => setMode("month")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${mode === "month"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                MONTH
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1">
              <div className="flex-1 w-full relative">
                <label className="absolute -top-2 left-3 bg-white dark:bg-zinc-900 px-1 text-xs font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white sm:text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all focus:bg-white dark:focus:bg-zinc-800"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full relative">
                <label className="absolute -top-2 left-3 bg-white dark:bg-zinc-900 px-1 text-xs font-medium text-gray-500 dark:text-gray-400">End Date</label>
                <input
                  type="date"
                  className="w-full bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white sm:text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all focus:bg-white dark:focus:bg-zinc-800"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors shrink-0 flex items-center justify-center group"
              title="Reset Filters"
            >
              <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* --- ส่วนที่ 2: Expense Trend --- */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-zinc-800/50 pb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Expense Trend</h3>
          </div>
          <div className="h-[400px] w-full">
            <DailyExpenseBarChart data={chartData} mode={mode} />
          </div>
        </div>

        {/* --- ส่วนที่ 3: Category --- */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-zinc-800/50 pb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Categories</h3>
          </div>
          <div className="h-[450px] flex justify-center items-center">
            <CategoryPieChart data={categoryData} />
          </div>
        </div>

        {/* --- ส่วนที่ 4: Detailed List --- */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-zinc-800/50 pb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ListOrdered className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              Transaction Details
            </h3>
          </div>
          {/* ส่งข้อมูล recentExpenses ไปแสดงผล */}
          <ExpenseList expenses={recentExpenses} />
        </div>

      </div>
    </div>
  );
}