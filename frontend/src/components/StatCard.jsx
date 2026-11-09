import {
  TrendingUp,
  TrendingDown
} from 'lucide-react'

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition">

      {/* Card Header */}
      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="bg-cyan-500/10 p-3 rounded-lg">
          <Icon size={21} className="text-cyan-400" />
        </div>

      </div>

      {/* Main Value */}
      <h2 className="text-3xl font-bold text-white mt-4">
        {value}
      </h2>

      {/* Percentage Change */}
      <div className="flex items-center gap-2 mt-3">

        {positive ? (
          <TrendingUp size={16} className="text-green-400" />
        ) : (
          <TrendingDown size={16} className="text-red-400" />
        )}

        <span
          className={`text-sm font-medium ${
            positive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {change}
        </span>

        <span className="text-xs text-slate-500">
          vs last month
        </span>

      </div>

    </div>
  )
}

export default StatCard