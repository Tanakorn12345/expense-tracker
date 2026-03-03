import {
  ShoppingBag,
  Utensils,
  Car,
  Ticket,
  MoreHorizontal
} from "lucide-react";

// Helper to get icon based on category name
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("food") || name.includes("อาหาร")) return <Utensils className="w-5 h-5" />;
  if (name.includes("travel") || name.includes("เดินทาง")) return <Car className="w-5 h-5" />;
  if (name.includes("shop") || name.includes("ช้อปปิ้ง")) return <ShoppingBag className="w-5 h-5" />;
  if (name.includes("bill")) return <Ticket className="w-5 h-5" />;
  return <MoreHorizontal className="w-5 h-5" />;
};

// Helper to get color based on category name
const getCategoryColor = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("food") || name.includes("อาหาร")) return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
  if (name.includes("travel") || name.includes("เดินทาง")) return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  if (name.includes("shop") || name.includes("ช้อปปิ้ง")) return "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400";
  if (name.includes("bill")) return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
};

export default function ExpenseList({ expenses = [] }) {
  if (expenses.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="font-medium text-gray-500 dark:text-gray-400">
          No transactions found.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Your recent activities will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {expenses.map((e, index) => (
        <div key={e.id || index} className="group relative">
          <div className="flex justify-between items-center py-4 px-4 sm:px-6 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-2xl cursor-pointer">
            <div className="flex items-center gap-4">
              {/* 1. Category Icon Avatar */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${getCategoryColor(e.category?.name)} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {getCategoryIcon(e.category?.name)}
              </div>

              {/* 2. Main Info (Category & Date) */}
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white text-[0.95rem]">
                  {e.category?.name || "Uncategorized"}
                </span>
                <span className="text-[0.8rem] text-gray-500 dark:text-gray-400 mt-0.5 max-w-[150px] sm:max-w-xs truncate">
                  {new Date(e.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {e.description && ` • ${e.description}`}
                </span>
              </div>
            </div>

            {/* 3. Amount & Status Chip */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-extrabold text-gray-900 dark:text-white text-base">
                ฿{e.amount.toLocaleString()}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-wider">
                Completed
              </span>
            </div>
          </div>

          {/* Divider */}
          {index < expenses.length - 1 && (
            <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-6" />
          )}
        </div>
      ))}
    </div>
  );
}