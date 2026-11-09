import { useEffect, useMemo, useState } from 'react'

import {
  Utensils,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

function Restaurant() {
  const [predictions, setPredictions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://127.0.0.1:8000/api/predictions')

      if (!response.ok) {
        throw new Error('Unable to fetch prediction history.')
      }

      const data = await response.json()

      setPredictions(data.predictions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  // Group saved predictions by food category
  const categoryData = useMemo(() => {
    const grouped = {}

    predictions.forEach((prediction) => {
      const category =
        prediction.input_features?.Type_of_order || 'Unknown'

      if (!grouped[category]) {
        grouped[category] = {
          name: category,
          orders: 0,
          totalETA: 0,
          low: 0,
          medium: 0,
          high: 0
        }
      }

      grouped[category].orders += 1
      grouped[category].totalETA += Number(prediction.predicted_eta)

      const risk = prediction.predicted_delay_risk?.toLowerCase()

      if (risk === 'low') grouped[category].low += 1
      if (risk === 'medium') grouped[category].medium += 1
      if (risk === 'high') grouped[category].high += 1
    })

    return Object.values(grouped).map((category) => ({
      ...category,
      avgETA: category.totalETA / category.orders
    }))
  }, [predictions])

  // Overall statistics
  const totalPredictions = predictions.length

  const averageETA =
    totalPredictions > 0
      ? predictions.reduce(
          (sum, item) => sum + Number(item.predicted_eta),
          0
        ) / totalPredictions
      : 0

  const highRisk = predictions.filter(
    (item) => item.predicted_delay_risk === 'High'
  ).length

  const filteredCategories = categoryData.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterCategory === 'All' || category.name === filterCategory

    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8 space-y-8">

      {/* Heading */}
      <div className="flex flex-col md:flex-row justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Food Category Intelligence
          </h1>

          <p className="text-slate-400 mt-2">
            Analyse food categories using saved AI delivery predictions.
          </p>
        </div>

        <button
          onClick={fetchPredictions}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white px-5 py-3 rounded-lg transition"
        >
          <RefreshCw size={18} />
          Refresh Data
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <ShoppingBag className="text-cyan-400 mb-4" size={25} />

          <p className="text-sm text-slate-400">
            Total Predictions
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {loading ? '...' : totalPredictions.toLocaleString()}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <Utensils className="text-purple-400 mb-4" size={25} />

          <p className="text-sm text-slate-400">
            Food Categories
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {loading ? '...' : categoryData.length}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <Clock className="text-green-400 mb-4" size={25} />

          <p className="text-sm text-slate-400">
            Average Predicted ETA
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {loading ? '...' : `${averageETA.toFixed(2)} min`}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <AlertTriangle className="text-red-400 mb-4" size={25} />

          <p className="text-sm text-slate-400">
            High Duration Risk
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {loading ? '...' : highRisk}
          </h2>
        </div>

      </div>

      {/* Category Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Food Category Performance
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Delivery prediction statistics for each food category.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <div className="flex items-center gap-2 bg-slate-800 px-3 rounded-lg">
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-white text-sm py-3 w-full"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            >
              <option value="All">All Categories</option>

              {categoryData.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-sm">

                <th className="py-4 px-3">Food Category</th>
                <th className="py-4 px-3">Predictions</th>
                <th className="py-4 px-3">Average ETA</th>
                <th className="py-4 px-3">Low Risk</th>
                <th className="py-4 px-3">Medium Risk</th>
                <th className="py-4 px-3">High Risk</th>

              </tr>
            </thead>

            <tbody>

              {filteredCategories.map((category) => (

                <tr
                  key={category.name}
                  className="border-b border-slate-800/70 hover:bg-slate-800/40 transition"
                >

                  <td className="py-4 px-3 text-white font-medium">
                    <span className="flex items-center gap-2">
                      <Utensils size={17} className="text-cyan-400" />
                      {category.name}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-slate-300">
                    {category.orders}
                  </td>

                  <td className="py-4 px-3 text-white font-semibold">
                    {category.avgETA.toFixed(2)} min
                  </td>

                  <td className="py-4 px-3 text-green-400">
                    {category.low}
                  </td>

                  <td className="py-4 px-3 text-yellow-400">
                    {category.medium}
                  </td>

                  <td className="py-4 px-3 text-red-400">
                    {category.high}
                  </td>

                </tr>

              ))}

              {!loading && filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    {predictions.length === 0
                      ? 'No saved predictions available.'
                      : 'No matching food categories found.'}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <p className="text-sm text-slate-500 mt-5">
          Showing {filteredCategories.length} of {categoryData.length} food categories.
        </p>

      </div>

      {/* Information */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">

        <div className="flex items-center gap-2 text-cyan-400">
          <TrendingUp size={20} />
          <h3 className="font-semibold">
            AI Category Insights
          </h3>
        </div>

        <p className="text-sm text-slate-400 mt-2">
          Category statistics are calculated from saved AI predictions.
          They represent predicted delivery-duration categories, not
          confirmed restaurant performance or actual late deliveries.
        </p>

      </div>

    </div>
  )
}

export default Restaurant