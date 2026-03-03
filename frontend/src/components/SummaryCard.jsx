export default function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className="text-[32px] p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
          {title}
        </span>
        <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
          {value}
        </span>
      </div>
    </div>
  );
}
