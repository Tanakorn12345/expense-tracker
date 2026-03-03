export default function DashboardFilter({ mode, onChange }) {
  const handleChange = (value) => {
    if (value && value !== mode) onChange(value);
  };

  return (
    <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-fit mb-6">
      <button
        onClick={() => handleChange("day")}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex-1 text-center ${mode === "day"
            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
      >
        รายวัน
      </button>
      <button
        onClick={() => handleChange("month")}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex-1 text-center ${mode === "month"
            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
      >
        รายเดือน
      </button>
    </div>
  );
}
