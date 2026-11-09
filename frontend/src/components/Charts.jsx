import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

function Charts({ predictions = [] }) {

  // 1. GROUP PREDICTIONS BY DATE

  const groupedData = {}

  predictions.forEach((item) => {

    const date = new Date(item.created_at)

    if (isNaN(date.getTime())) return

    const dateKey = date.toLocaleDateString('en-CA')

    const day = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    })

    if (!groupedData[dateKey]) {

      groupedData[dateKey] = {
        date: dateKey,
        day,
        totalETA: 0,
        count: 0
      }

    }

    groupedData[dateKey].totalETA += Number(item.predicted_eta || 0)

    groupedData[dateKey].count += 1

  })


  // PREPARE DATE CHART DATA

  const chartData = Object.values(groupedData)

    .sort((a, b) => a.date.localeCompare(b.date))

    .map(item => ({

      day: item.day,

      averageETA: Number(
        (item.totalETA / item.count).toFixed(2)
      ),

      predictions: item.count

    }))


  // 2. DURATION RISK DISTRIBUTION

  const riskColors = {
    Low: '#22c55e',
    Medium: '#eab308',
    High: '#ef4444'
  }

  const riskCounts = {
    Low: 0,
    Medium: 0,
    High: 0
  }

  predictions.forEach((item) => {

    const risk = item.predicted_delay_risk

    if (Object.prototype.hasOwnProperty.call(riskCounts, risk)) {
      riskCounts[risk] += 1
    }

  })

  const riskData = Object.entries(riskCounts).map(([name, value]) => ({
    name,
    value
  }))


  // 3. FOOD CATEGORY ANALYSIS

  const categoryGroups = {}

  predictions.forEach((item) => {

    const features = item.input_features || {}

    const category =
      features.Type_of_order ||
      features.type_of_order ||
      'Unknown'

    if (!categoryGroups[category]) {

      categoryGroups[category] = {
        category,
        totalETA: 0,
        count: 0
      }

    }

    categoryGroups[category].totalETA += Number(item.predicted_eta || 0)

    categoryGroups[category].count += 1

  })


  const categoryData = Object.values(categoryGroups)

    .map(item => ({

      category: item.category,

      averageETA: Number(
        (item.totalETA / item.count).toFixed(2)
      ),

      predictions: item.count

    }))

    .sort((a, b) => b.averageETA - a.averageETA)


  // CHART STYLES

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#fff'
  }

  const axisStyle = {
    fill: '#94a3b8',
    fontSize: 12
  }

  const noData = (
    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
      No prediction data available yet.
    </div>
  )


  return (

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* 1. DELIVERY ETA TREND */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Delivery ETA Trend
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Average predicted delivery duration over time
        </p>

        <div className="h-72 mt-6">

          {chartData.length > 0 ? (

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={chartData}>

                <defs>
                  <linearGradient
                    id="etaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#06b6d4"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#06b6d4"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="day"
                  tick={axisStyle}
                />

                <YAxis
                  tick={axisStyle}
                  unit=" min"
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value} min`, 'Average ETA']}
                />

                <Area
                  type="monotone"
                  dataKey="averageETA"
                  name="Average ETA"
                  stroke="#06b6d4"
                  fill="url(#etaGradient)"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />

              </AreaChart>

            </ResponsiveContainer>

          ) : noData}

        </div>

      </div>


      {/* 2. PREDICTION VOLUME */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Prediction Volume Analysis
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Number of AI predictions saved each day
        </p>

        <div className="h-72 mt-6">

          {chartData.length > 0 ? (

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="day"
                  tick={axisStyle}
                />

                <YAxis
                  tick={axisStyle}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                />

                <Bar
                  dataKey="predictions"
                  name="Predictions"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : noData}

        </div>

      </div>


      {/* 3. DURATION RISK DISTRIBUTION */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Duration Risk Distribution
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Distribution of predicted delivery-duration categories
        </p>

        <div className="h-72 mt-6">

          {predictions.length > 0 ? (

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >

                  {riskData.map((entry) => (

                    <Cell
                      key={entry.name}
                      fill={riskColors[entry.name]}
                    />

                  ))}

                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                />

                <Legend
                  formatter={(value) => (
                    <span className="text-slate-300">
                      {value}
                    </span>
                  )}
                />

              </PieChart>

            </ResponsiveContainer>

          ) : noData}

        </div>

      </div>


      {/* 4. FOOD CATEGORY ANALYSIS */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Food Category Analysis
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          Average predicted ETA across food categories
        </p>

        <div className="h-72 mt-6">

          {categoryData.length > 0 ? (

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: 15, right: 20 }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  type="number"
                  tick={axisStyle}
                  unit=" min"
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  tick={axisStyle}
                  width={75}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value} min`, 'Average ETA']}
                />

                <Bar
                  dataKey="averageETA"
                  name="Average ETA"
                  fill="#a78bfa"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : noData}

        </div>

      </div>

    </div>

  )

}

export default Charts