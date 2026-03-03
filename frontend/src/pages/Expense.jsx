import { useEffect, useState } from "react";
import api from "../api";
import {
  Wallet, Save, PlusCircle,
  FileText, Calendar, Tag
} from "lucide-react";
import ExpenseList from "../components/ExpenseList";

console.log("API URL:", import.meta.env.VITE_API_URL);

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/api/expenses");
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/expenses", {
        amount: Number(amount),
        description,
        date,
        categoryName
      });
      setAmount("");
      setDescription("");
      setDate("");
      setCategoryName("");
      await fetchExpenses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50/50 dark:bg-zinc-950 min-h-[calc(100vh-80px)] flex flex-col rounded-3xl overflow-hidden mt-4 shadow-sm border border-gray-100 dark:border-zinc-800">

      {/* 1. Header (Top) */}
      <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Expense Management
          </h1>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 gap-6 overflow-hidden">

        {/* --- Left Side: Entry Form --- */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 lg:w-[400px] shrink-0 flex flex-col h-max lg:h-full lg:overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-zinc-800/50 pb-4">
            <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Add New Transaction
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">$</span>
                </div>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you buy?"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Category Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tag className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Food, Travel, etc."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {loading ? "Saving..." : "Save Transaction"}
            </button>
          </form>
        </div>

        {/* --- Right Side: Expense History --- */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex-1 flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10 shrink-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Transaction History
            </h2>
          </div>

          {/* Scrollable List Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <ExpenseList expenses={expenses} />
          </div>
        </div>

      </div>
    </div>
  );
}