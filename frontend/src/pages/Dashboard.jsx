import { useState, useEffect, useCallback } from 'react'

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Star,
  Bike,
  TrendingUp
} from 'lucide-react'

import Charts from '../components/Charts'

const API_BASE = 'http://127.0.0.1:8000/api'

function Dashboard() {

  const [predictions, setPredictions] = useState([])
  const [partners, setPartners] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // FETCH DASHBOARD DATA
  const fetchDashboardData = useCallback(async () => {

    try {

      setLoading(true)
      setError('')

      const [predictionResponse, partnerResponse] = await Promise.all([
        fetch(`${API_BASE}/predictions`),
        fetch(`${API_BASE}/delivery-partners`)
      ])

      if (!predictionResponse.ok || !partnerResponse.ok) {
        throw new Error('Failed to fetch dashboard data.')
      }

      const predictionData = await predictionResponse.json()
      const partnerData = await partnerResponse.json()

      setPredictions(predictionData.predictions || [])
      setPartners(partnerData.partners || [])

    } catch (err) {

      console.error(err)

      setError(
        'Unable to connect to the database. Please check your backend.'
      )

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])


  // PREDICTION STATISTICS

  const totalPredictions = predictions.length

  const averageETA = totalPredictions > 0
    ? (
        predictions.reduce(
          (total, item) => total + Number(item.predicted_eta || 0),
          0
        ) / totalPredictions
      ).toFixed(2)
    : '0.00'

  const lowRisk = predictions.filter(
    item => item.predicted_delay_risk === 'Low'
  ).length

  const mediumRisk = predictions.filter(
    item => item.predicted_delay_risk === 'Medium'
  ).length

  const highRisk = predictions.filter(
    item => item.predicted_delay_risk === 'High'
  ).length


  // DELIVERY PARTNER STATISTICS

  const totalPartners = partners.length

  const activePartners = partners.filter(
    partner => partner.status === 'Active'
  ).length

  const averageRating = totalPartners > 0
    ? (
        partners.reduce(
          (total, partner) => total + Number(partner.rating || 0),
          0
        ) / totalPartners
      ).toFixed(1)
    : '0.0'


  // KPI CARDS

  const stats = [

    {
      title: 'Total Predictions',
      value: totalPredictions,
      icon: ShoppingBag,
      color: 'text-cyan-400',
      description: 'Saved AI predictions'
    },

    {
      title: 'Average Predicted ETA',
      value: `${averageETA} min`,
      icon: Clock,
      color: 'text-green-400',
      description: 'Average estimated duration'
    },

    {
      title: 'Low Duration Risk',
      value: lowRisk,
      icon: CheckCircle,
      color: 'text-green-400',
      description: 'Low predicted duration category'
    },

    {
      title: 'Medium Duration Risk',
      value: mediumRisk,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      description: 'Medium predicted duration category'
    },

    {
      title: 'High Duration Risk',
      value: highRisk,
      icon: AlertTriangle,
      color: 'text-red-400',
      description: 'High predicted duration category'
    },

    {
      title: 'Delivery Partners',
      value: totalPartners,
      icon: Users,
      color: 'text-purple-400',
      description: `${activePartners} currently active`
    }

  ]


  return (

    <div className="p-6 space-y-8">

      {/* DASHBOARD HEADING */}

      <div className="flex flex-col md:flex-row justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-white">
            Dashboard Overview
          </h1>

          <p className="text-slate-400 mt-2">
            Monitor AI predictions, delivery performance and business insights.
          </p>

        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-semibold px-5 py-3 rounded-lg transition"
        >

          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />

          Refresh Dashboard

        </button>

      </div>


      {/* ERROR MESSAGE */}

      {error && (

        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">

          {error}

        </div>

      )}


      {/* AI PREDICTION KPI CARDS */}

      <div>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-white">
            AI Prediction Overview
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Delivery ETA and predicted duration categories.
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {stats.map((stat) => {

            const Icon = stat.icon

            return (

              <div
                key={stat.title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition"
              >

                <div className="flex justify-between items-center">

                  <p className="text-slate-400 text-sm">
                    {stat.title}
                  </p>

                  <Icon
                    size={24}
                    className={stat.color}
                  />

                </div>

                <h2 className="text-3xl font-bold text-white mt-5">

                  {loading ? '...' : stat.value}

                </h2>

                <p className="text-xs text-slate-500 mt-3">
                  {stat.description}
                </p>

              </div>

            )

          })}

        </div>

      </div>


      {/* PARTNER OVERVIEW */}

      <div>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-white">
            Delivery Partner Overview
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Monitor partner availability and performance.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <div className="flex justify-between items-center">

              <p className="text-slate-400 text-sm">
                Total Partners
              </p>

              <Bike className="text-cyan-400" />

            </div>

            <h2 className="text-3xl font-bold text-white mt-4">
              {loading ? '...' : totalPartners}
            </h2>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <div className="flex justify-between items-center">

              <p className="text-slate-400 text-sm">
                Active Partners
              </p>

              <Users className="text-green-400" />

            </div>

            <h2 className="text-3xl font-bold text-white mt-4">
              {loading ? '...' : activePartners}
            </h2>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <div className="flex justify-between items-center">

              <p className="text-slate-400 text-sm">
                Average Partner Rating
              </p>

              <Star className="text-yellow-400" />

            </div>

            <h2 className="text-3xl font-bold text-white mt-4">
              {loading ? '...' : averageRating}
            </h2>

          </div>

        </div>

      </div>


      {/* DYNAMIC CHARTS */}

      <div>

        <h2 className="text-lg font-semibold text-white mb-4">
          Delivery Analytics
        </h2>

        <Charts predictions={predictions} />

      </div>


      {/* PARTNER PERFORMANCE TABLE */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">

          <h2 className="text-lg font-semibold text-white">
            Delivery Partner Performance
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Partner ratings and delivery statistics.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-800/50 text-slate-400 text-sm">

              <tr>
                <th className="p-4">Partner</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Deliveries</th>
                <th className="p-4">Average Time</th>
                <th className="p-4">Status</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {loading ? (

                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Loading partner information...
                  </td>
                </tr>

              ) : partners.length > 0 ? (

                partners.map(partner => (

                  <tr
                    key={partner.id}
                    className="hover:bg-slate-800/30"
                  >

                    <td className="p-4">

                      <p className="text-white font-medium">
                        {partner.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {partner.partner_code}
                      </p>

                    </td>

                    <td className="p-4 text-slate-300">
                      {partner.vehicle_type}
                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-1 text-yellow-400">

                        <Star size={15} />

                        {Number(partner.rating || 0).toFixed(1)}

                      </div>

                    </td>

                    <td className="p-4 text-slate-300">
                      {partner.total_deliveries}
                    </td>

                    <td className="p-4 text-slate-300">
                      {partner.average_delivery_time != null
                        ? `${partner.average_delivery_time} min`
                        : 'N/A'}
                    </td>

                    <td className="p-4">

                      <span className={`px-3 py-1 rounded-full text-xs ${
                        partner.status === 'Active'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>

                        {partner.status}

                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No delivery partners available.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* AI INFORMATION */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="flex items-center gap-3">

          <TrendingUp className="text-cyan-400" size={25} />

          <h2 className="text-lg font-semibold text-white">
            AI Delivery Intelligence
          </h2>

        </div>

        <p className="text-sm text-slate-400 mt-3">

          DeliveryAI uses machine learning models to estimate delivery
          times, classify delivery-duration categories and explain
          individual predictions using SHAP.

        </p>

        <div className="mt-5 flex flex-wrap gap-3">

          <span className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm">

            <span className="w-2 h-2 bg-green-400 rounded-full"></span>

            Database Integration Active

          </span>

          <span className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-lg text-sm">

            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>

            AI Models Integrated

          </span>

        </div>

      </div>

    </div>

  )

}

export default Dashboard