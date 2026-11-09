import { useState, useEffect, useCallback } from 'react'

import {
  Search,
  RefreshCw,
  Package,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api/predictions'

function Orders() {

  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch saved prediction records
  const fetchOrders = useCallback(async () => {

    try {

      setLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to fetch order records.')
      }

      const data = await response.json()

      setOrders(data.predictions || [])

    } catch (err) {

      console.error(err)

      setError(
        'Unable to connect to the backend. Please check your server.'
      )

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Format date
  const formatDate = (dateValue) => {

    if (!dateValue) return 'N/A'

    const date = new Date(dateValue)

    if (isNaN(date.getTime())) return 'N/A'

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  }

  // Risk badge styling
  const getRiskStyle = (risk) => {

    switch (risk) {

      case 'Low':
        return 'bg-green-500/10 text-green-400 border-green-500/20'

      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'

      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/20'

      default:
        return 'bg-slate-700 text-slate-300 border-slate-600'

    }

  }

  // Search and filter
  const filteredOrders = orders.filter((order) => {

    const features = order.input_features || {}

    const orderId = String(order.id || '')

    const foodType = String(
      features.Type_of_order || ''
    )

    const city = String(
      features.City || ''
    )

    const search = searchTerm.toLowerCase()

    const matchesSearch =
      orderId.toLowerCase().includes(search) ||
      foodType.toLowerCase().includes(search) ||
      city.toLowerCase().includes(search)

    const matchesRisk =
      filterRisk === 'All' ||
      order.predicted_delay_risk === filterRisk

    return matchesSearch && matchesRisk

  })

  // Statistics
  const totalOrders = orders.length

  const averageETA = totalOrders > 0
    ? (
        orders.reduce(
          (sum, order) => sum + Number(order.predicted_eta || 0),
          0
        ) / totalOrders
      ).toFixed(1)
    : '0.0'

  const highRiskOrders = orders.filter(
    order => order.predicted_delay_risk === 'High'
  ).length

  const mediumRiskOrders = orders.filter(
    order => order.predicted_delay_risk === 'Medium'
  ).length

  return (

    <div className="p-6 space-y-6">

      {/* Page Heading */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-white">
            Orders Management
          </h1>

          <p className="text-slate-400 mt-1">
            View saved AI delivery predictions and monitor delivery duration.
          </p>

        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50"
        >

          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh Orders

        </button>

      </div>


      {/* Error Message */}

      {error && (

        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4">
          {error}
        </div>

      )}


      {/* Summary Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex justify-between items-center">

            <p className="text-slate-400 text-sm">
              Total Predictions
            </p>

            <Package className="text-cyan-400" />

          </div>

          <h2 className="text-3xl font-bold text-white mt-4">
            {loading ? '...' : totalOrders}
          </h2>

        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex justify-between items-center">

            <p className="text-slate-400 text-sm">
              Average Predicted ETA
            </p>

            <Clock className="text-green-400" />

          </div>

          <h2 className="text-3xl font-bold text-white mt-4">
            {loading ? '...' : `${averageETA} min`}
          </h2>

        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex justify-between items-center">

            <p className="text-slate-400 text-sm">
              Medium Duration Risk
            </p>

            <AlertTriangle className="text-yellow-400" />

          </div>

          <h2 className="text-3xl font-bold text-white mt-4">
            {loading ? '...' : mediumRiskOrders}
          </h2>

        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

          <div className="flex justify-between items-center">

            <p className="text-slate-400 text-sm">
              High Duration Risk
            </p>

            <AlertTriangle className="text-red-400" />

          </div>

          <h2 className="text-3xl font-bold text-white mt-4">
            {loading ? '...' : highRiskOrders}
          </h2>

        </div>

      </div>


      {/* Search and Filter */}

      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">

          <Search
            size={19}
            className="absolute left-3 top-3.5 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search by prediction ID, food category or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-cyan-500"
          />

        </div>


        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white outline-none"
        >

          <option value="All">All Risk Categories</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>

        </select>

      </div>


      {/* Orders Table */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">

          <h2 className="text-lg font-semibold text-white">
            Saved Prediction Records
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Showing {filteredOrders.length} of {totalOrders} records
          </p>

        </div>


        {loading ? (

          <div className="p-10 text-center text-slate-400">
            Loading prediction records...
          </div>

        ) : filteredOrders.length === 0 ? (

          <div className="p-10 text-center">

            <Package
              size={40}
              className="mx-auto text-slate-600 mb-3"
            />

            <p className="text-slate-300 font-medium">
              No prediction records found.
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Generate an AI prediction or change your search filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-800/70">

                <tr className="text-slate-400 text-sm">

                  <th className="px-5 py-4">Prediction ID</th>

                  <th className="px-5 py-4">Food Category</th>

                  <th className="px-5 py-4">Distance</th>

                  <th className="px-5 py-4">Weather</th>

                  <th className="px-5 py-4">Traffic</th>

                  <th className="px-5 py-4">Predicted ETA</th>

                  <th className="px-5 py-4">Duration Risk</th>

                  <th className="px-5 py-4">Date</th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-800">

                {filteredOrders.map((order) => {

                  const features = order.input_features || {}

                  return (

                    <tr
                      key={order.id}
                      className="text-slate-300 hover:bg-slate-800/40 transition"
                    >

                      <td className="px-5 py-4 font-semibold text-cyan-400">
                        #{order.id}
                      </td>


                      <td className="px-5 py-4">

                        <div className="font-medium text-white">
                          {features.Type_of_order || 'N/A'}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {features.City || 'City unavailable'}
                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <MapPin size={15} className="text-cyan-400" />

                          {order.delivery_distance != null
                            ? `${Number(order.delivery_distance).toFixed(1)} km`
                            : 'N/A'}

                        </div>

                      </td>


                      <td className="px-5 py-4">
                        {order.weather_conditions || 'N/A'}
                      </td>


                      <td className="px-5 py-4">
                        {order.traffic_conditions || 'N/A'}
                      </td>


                      <td className="px-5 py-4 font-semibold text-white">

                        {Number(order.predicted_eta).toFixed(1)} min

                      </td>


                      <td className="px-5 py-4">

                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getRiskStyle(order.predicted_delay_risk)}`}>

                          {order.predicted_delay_risk || 'N/A'}

                        </span>

                      </td>


                      <td className="px-5 py-4 text-sm whitespace-nowrap">

                        <div className="flex items-center gap-2">

                          <Calendar
                            size={15}
                            className="text-slate-500"
                          />

                          {formatDate(order.created_at)}

                        </div>

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* Information */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

        <h3 className="text-white font-semibold">
          Order Intelligence
        </h3>

        <p className="text-sm text-slate-400 mt-2">

          These records represent AI delivery predictions saved in
          PostgreSQL. ETA indicates estimated delivery duration,
          while duration risk represents the model's predicted
          delivery-duration category.

        </p>

      </div>

    </div>

  )

}

export default Orders