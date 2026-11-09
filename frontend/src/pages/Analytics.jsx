import { useEffect, useState } from 'react'

import {
ResponsiveContainer,
AreaChart,
Area,
BarChart,
Bar,
PieChart,
Pie,
Cell,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
Legend
} from 'recharts'

import {
TrendingUp,
Clock,
AlertTriangle,
Activity,
RefreshCw,
CheckCircle,
Package,
Cloud,
Car,
Utensils
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444']

function Analytics() {

const [predictions, setPredictions] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

// Fetch saved predictions from PostgreSQL
const fetchAnalytics = async () => {


try {

  setLoading(true)
  setError('')

  const response = await fetch(`${API_URL}/api/predictions`)

  if (!response.ok) {
    throw new Error('Unable to load analytics data.')
  }

  const data = await response.json()

  setPredictions(data.predictions || [])

} catch (err) {

  setError(err.message || 'Backend connection failed.')

} finally {

  setLoading(false)

}


}

useEffect(() => {
fetchAnalytics()
}, [])

// Calculate KPI statistics
const totalPredictions = predictions.length

const averageETA = totalPredictions > 0
? predictions.reduce(
(sum, item) => sum + Number(item.predicted_eta || 0),
0
) / totalPredictions
: 0

const lowRisk = predictions.filter(
item => item.predicted_delay_risk === 'Low'
).length

const mediumRisk = predictions.filter(
item => item.predicted_delay_risk === 'Medium'
).length

const highRisk = predictions.filter(
item => item.predicted_delay_risk === 'High'
).length

const highRiskPercentage = totalPredictions > 0
? (highRisk / totalPredictions) * 100
: 0

const lowRiskPercentage = totalPredictions > 0
? (lowRisk / totalPredictions) * 100
: 0

const mediumRiskPercentage = totalPredictions > 0
? (mediumRisk / totalPredictions) * 100
: 0

// Duration risk distribution
const riskData = [
{ name: 'Low', value: lowRisk },
{ name: 'Medium', value: mediumRisk },
{ name: 'High', value: highRisk }
]

// ETA performance chart
const etaData = [...predictions]
.reverse()
.map(item => ({
prediction: `#${item.id}`,
eta: Number(item.predicted_eta || 0)
}))

// Generic grouping function
const createGroupedData = (field, label) => {


const grouped = {}

predictions.forEach(item => {

  const features = item.input_features || {}
  const category = features[field] || 'Unknown'
  const eta = Number(item.predicted_eta || 0)

  if (!grouped[category]) {
    grouped[category] = {
      [label]: category,
      totalETA: 0,
      count: 0
    }
  }

  grouped[category].totalETA += eta
  grouped[category].count += 1

})

return Object.values(grouped).map(item => ({
  [label]: item[label],
  averageETA: Number(
    (item.totalETA / item.count).toFixed(2)
  ),
  predictions: item.count
}))


}

// Weather analysis
const weatherData = createGroupedData(
'Weather_conditions',
'weather'
)

// Traffic analysis
const trafficData = createGroupedData(
'Road_traffic_density',
'traffic'
)

// Food category analysis
const foodData = createGroupedData(
'Type_of_order',
'category'
)

// Chart tooltip styling
const tooltipStyle = {
backgroundColor: '#0f172a',
border: '1px solid #334155',
borderRadius: '8px',
color: '#fff'
}

// KPI cards
const stats = [


{
  title: 'Total Predictions',
  value: totalPredictions,
  description: 'Saved in PostgreSQL',
  icon: Activity,
  color: 'text-cyan-400'
},

{
  title: 'Average Predicted ETA',
  value: `${averageETA.toFixed(2)} min`,
  description: 'Across all saved predictions',
  icon: Clock,
  color: 'text-green-400'
},

{
  title: 'Low Duration Risk',
  value: `${lowRiskPercentage.toFixed(1)}%`,
  description: `${lowRisk} low-risk predictions`,
  icon: CheckCircle,
  color: 'text-green-400'
},

{
  title: 'Medium Duration Risk',
  value: `${mediumRiskPercentage.toFixed(1)}%`,
  description: `${mediumRisk} medium-risk predictions`,
  icon: TrendingUp,
  color: 'text-yellow-400'
},

{
  title: 'High Duration Risk',
  value: `${highRiskPercentage.toFixed(1)}%`,
  description: `${highRisk} high-risk predictions`,
  icon: AlertTriangle,
  color: 'text-red-400'
}


]

return (


<div className="p-6 md:p-8 space-y-8">

  {/* Page Heading */}

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div>

      <h1 className="text-2xl font-bold text-white">
        Advanced Analytics
      </h1>

      <p className="text-slate-400 mt-2">
        Explore AI delivery predictions, duration risks and business insights.
      </p>

    </div>

    <button
      onClick={fetchAnalytics}
      disabled={loading}
      className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 font-semibold px-5 py-3 rounded-lg transition"
    >

      <RefreshCw
        size={18}
        className={loading ? 'animate-spin' : ''}
      />

      Refresh Analytics

    </button>

  </div>

  {/* Loading */}

  {loading && (

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">

      <RefreshCw
        className="animate-spin text-cyan-400 mx-auto mb-3"
        size={30}
      />

      <p className="text-slate-400">
        Loading analytics from PostgreSQL...
      </p>

    </div>

  )}

  {/* Error */}

  {!loading && error && (

    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">

      <p className="text-red-400">
        {error}
      </p>

      <button
        onClick={fetchAnalytics}
        className="mt-3 bg-cyan-500 px-4 py-2 rounded-lg text-slate-950 font-semibold"
      >
        Try Again
      </button>

    </div>

  )}

  {/* Main Analytics */}

  {!loading && !error && (

    <>

      {/* KPI Cards */}

      <section>

        <h2 className="text-lg font-semibold text-white mb-4">
          Prediction Performance Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">

          {stats.map(stat => {

            const Icon = stat.icon

            return (

              <div
                key={stat.title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >

                <div className="flex items-center justify-between">

                  <p className="text-sm text-slate-400">
                    {stat.title}
                  </p>

                  <Icon
                    size={24}
                    className={stat.color}
                  />

                </div>

                <h3 className="text-3xl font-bold text-white mt-5">
                  {stat.value}
                </h3>

                <p className="text-xs text-slate-500 mt-3">
                  {stat.description}
                </p>

              </div>

            )

          })}

        </div>

      </section>

      {/* ETA Performance */}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h2 className="text-lg font-semibold text-white">
          Delivery ETA Performance
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Predicted delivery duration for each saved prediction.
        </p>

        <div className="h-80 mt-6">

          {etaData.length > 0 ? (

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={etaData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="prediction"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={value => `${value} min`}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={value => [`${value} min`, 'Predicted ETA']}
                />

                <Area
                  type="monotone"
                  dataKey="eta"
                  name="Predicted ETA"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />

              </AreaChart>

            </ResponsiveContainer>

          ) : (

            <div className="h-full flex items-center justify-center text-slate-500">
              No prediction data available.
            </div>

          )}

        </div>

      </section>

      {/* Risk and Weather */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Risk Distribution */}

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

          <h2 className="text-lg font-semibold text-white">
            Duration Risk Distribution
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Distribution of predicted delivery-duration categories.
          </p>

          <div className="h-72 mt-6">

            {totalPredictions > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >

                    {riskData.map((entry, index) => (

                      <Cell
                        key={entry.name}
                        fill={COLORS[index]}
                      />

                    ))}

                  </Pie>

                  <Tooltip contentStyle={tooltipStyle} />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-500">
                No risk data available.
              </div>

            )}

          </div>

        </section>

        {/* Weather Analysis */}

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

          <div className="flex items-center gap-2">

            <Cloud className="text-cyan-400" size={21} />

            <h2 className="text-lg font-semibold text-white">
              Weather Impact Analysis
            </h2>

          </div>

          <p className="text-sm text-slate-400 mt-1">
            Average predicted ETA grouped by weather condition.
          </p>

          <div className="h-72 mt-6">

            {weatherData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={weatherData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="weather"
                    stroke="#94a3b8"
                  />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Bar
                    dataKey="averageETA"
                    name="Average ETA (min)"
                    fill="#06b6d4"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-500">
                No weather data available.
              </div>

            )}

          </div>

        </section>

      </div>

      {/* Traffic and Food Analysis */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Traffic Analysis */}

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

          <div className="flex items-center gap-2">

            <Car className="text-yellow-400" size={21} />

            <h2 className="text-lg font-semibold text-white">
              Traffic Condition Analysis
            </h2>

          </div>

          <p className="text-sm text-slate-400 mt-1">
            Average predicted ETA across traffic conditions.
          </p>

          <div className="h-72 mt-6">

            {trafficData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={trafficData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="traffic"
                    stroke="#94a3b8"
                  />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Bar
                    dataKey="averageETA"
                    name="Average ETA (min)"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-500">
                No traffic data available.
              </div>

            )}

          </div>

        </section>

        {/* Food Category Analysis */}

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

          <div className="flex items-center gap-2">

            <Utensils className="text-purple-400" size={21} />

            <h2 className="text-lg font-semibold text-white">
              Food Category Analysis
            </h2>

          </div>

          <p className="text-sm text-slate-400 mt-1">
            Average predicted ETA across food categories.
          </p>

          <div className="h-72 mt-6">

            {foodData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={foodData}
                  layout="vertical"
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#94a3b8"
                    width={80}
                  />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Bar
                    dataKey="averageETA"
                    name="Average ETA (min)"
                    fill="#a78bfa"
                    radius={[0, 6, 6, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-500">
                No food category data available.
              </div>

            )}

          </div>

        </section>

      </div>

      {/* Risk Summary */}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h2 className="text-lg font-semibold text-white mb-5">
          Duration Risk Summary
        </h2>

        <div className="space-y-5">

          {[
            {
              name: 'Low Duration Risk',
              count: lowRisk,
              percentage: lowRiskPercentage,
              color: 'bg-green-500'
            },
            {
              name: 'Medium Duration Risk',
              count: mediumRisk,
              percentage: mediumRiskPercentage,
              color: 'bg-yellow-500'
            },
            {
              name: 'High Duration Risk',
              count: highRisk,
              percentage: highRiskPercentage,
              color: 'bg-red-500'
            }
          ].map(item => (

            <div key={item.name}>

              <div className="flex justify-between text-sm mb-2">

                <span className="text-slate-300">
                  {item.name}
                </span>

                <span className="text-white font-semibold">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>

              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">

                <div
                  className={`${item.color} h-full rounded-full transition-all`}
                  style={{ width: `${item.percentage}%` }}
                />

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Information */}

      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">

        <div className="flex items-center gap-2 mb-2">

          <Package className="text-cyan-400" size={20} />

          <h3 className="text-white font-semibold">
            Analytics Information
          </h3>

        </div>

        <p className="text-sm text-slate-400 leading-6">

          These analytics are calculated from saved AI predictions
          stored in PostgreSQL. Low, Medium and High represent
          predicted delivery-duration categories, not confirmed
          late or on-time delivery outcomes. Weather and traffic
          comparisons are descriptive and do not establish causation.

        </p>

      </div>

    </>

  )}

</div>


)

}

export default Analytics
