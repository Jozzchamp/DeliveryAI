import { useState } from "react";
import {
  BrainCircuit,
  MapPin,
  Clock,
  CloudRain,
  Navigation,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Info,
  BarChart3,
} from "lucide-react";

const initialFormData = {
  Delivery_person_Age: 25,
  Delivery_person_Ratings: 4.5,
  Delivery_Distance_km: 8.5,
  Vehicle_condition: 2,
  multiple_deliveries: 1,
  Order_Hour: 13,
  Order_Month: 11,
  Weather_conditions: "Sunny",
  Road_traffic_density: "Low",
  Type_of_order: "Snack",
  Type_of_vehicle: "motorcycle",
  Festival: "No",
  City: "Metropolitian",
  Is_Weekend: false,
};

const numericFields = [
  "Delivery_person_Age",
  "Delivery_person_Ratings",
  "Delivery_Distance_km",
  "Vehicle_condition",
  "multiple_deliveries",
  "Order_Hour",
  "Order_Month",
];

const riskStyles = {
  Low: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    bar: "bg-emerald-400",
  },
  Medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    bar: "bg-amber-400",
  },
  High: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    bar: "bg-red-400",
  },
};

export default function Prediction() {
  const [formData, setFormData] = useState(initialFormData);

  const [etaResult, setEtaResult] = useState(null);
  const [delayResult, setDelayResult] = useState(null);
  const [explanationResult, setExplanationResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleWeekendChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      Is_Weekend: e.target.value === "true",
    }));
  };

  // Generate all three AI results
  const handlePrediction = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    setEtaResult(null);
    setDelayResult(null);
    setExplanationResult(null);

    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };

      const [etaResponse, delayResponse, explanationResponse] =
        await Promise.all([
          fetch("http://127.0.0.1:8000/api/predict", requestOptions),

          fetch("http://127.0.0.1:8000/api/predict-delay", requestOptions),

          fetch("http://127.0.0.1:8000/api/explain", requestOptions),
        ]);

      if (
        !etaResponse.ok ||
        !delayResponse.ok ||
        !explanationResponse.ok
      ) {
        throw new Error(
          "One or more AI services failed. Please check your backend."
        );
      }

      const etaData = await etaResponse.json();
      const delayData = await delayResponse.json();
      const explanationData = await explanationResponse.json();

      setEtaResult(etaData);
      setDelayResult(delayData);
      setExplanationResult(explanationData);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the DeliveryAI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const labelClass = "mb-2 block text-sm font-medium text-slate-300";

  const sectionClass =
    "rounded-2xl border border-slate-800 bg-slate-900/70 p-6";

  const risk = delayResult?.predicted_delay_risk;
  const riskStyle = riskStyles[risk] || riskStyles.Medium;

  const explanations = explanationResult?.explanations || [];

  const maxImpact = Math.max(
    0.001,
    ...explanations.map((item) => Math.abs(item.impact_minutes))
  );

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-400">
            <BrainCircuit size={20} />
            <span className="text-sm font-semibold">
              MACHINE LEARNING ENGINE
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            AI Prediction Studio
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            ETA prediction, delivery-duration risk and explainable AI.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-sm font-medium text-emerald-400">
            Three AI Services Connected
          </span>
        </div>
      </div>

      <form onSubmit={handlePrediction}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* INPUT FORM */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Navigation size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Delivery Information
                </h2>
                <p className="text-xs text-slate-400">
                  Enter order and delivery details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className={labelClass}>Delivery Person Age</label>
                <input
                  className={inputClass}
                  type="number"
                  name="Delivery_person_Age"
                  value={formData.Delivery_person_Age}
                  onChange={handleChange}
                  min="18"
                  max="60"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Delivery Person Rating</label>
                <input
                  className={inputClass}
                  type="number"
                  name="Delivery_person_Ratings"
                  value={formData.Delivery_person_Ratings}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Delivery Distance (KM)</label>
                <input
                  className={inputClass}
                  type="number"
                  name="Delivery_Distance_km"
                  value={formData.Delivery_Distance_km}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Vehicle Condition</label>
                <select
                  className={inputClass}
                  name="Vehicle_condition"
                  value={formData.Vehicle_condition}
                  onChange={handleChange}
                >
                  {[0, 1, 2, 3].map((v) => (
                    <option key={v} value={v}>
                      Condition {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Multiple Deliveries</label>
                <select
                  className={inputClass}
                  name="multiple_deliveries"
                  value={formData.multiple_deliveries}
                  onChange={handleChange}
                >
                  {[0, 1, 2, 3].map((v) => (
                    <option key={v} value={v}>
                      {v} Deliveries
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Order Hour</label>
                <select
                  className={inputClass}
                  name="Order_Hour"
                  value={formData.Order_Hour}
                  onChange={handleChange}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Order Month</label>
                <select
                  className={inputClass}
                  name="Order_Month"
                  value={formData.Order_Month}
                  onChange={handleChange}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString("en", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Weather Conditions</label>
                <select
                  className={inputClass}
                  name="Weather_conditions"
                  value={formData.Weather_conditions}
                  onChange={handleChange}
                >
                  {[
                    "Sunny",
                    "Cloudy",
                    "Fog",
                    "Stormy",
                    "Windy",
                    "Sandstorms",
                  ].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Road Traffic Density</label>
                <select
                  className={inputClass}
                  name="Road_traffic_density"
                  value={formData.Road_traffic_density}
                  onChange={handleChange}
                >
                  {["Low", "Medium", "High", "Jam"].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Type of Order</label>
                <select
                  className={inputClass}
                  name="Type_of_order"
                  value={formData.Type_of_order}
                  onChange={handleChange}
                >
                  {["Snack", "Meal", "Drinks", "Buffet"].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Type of Vehicle</label>
                <select
                  className={inputClass}
                  name="Type_of_vehicle"
                  value={formData.Type_of_vehicle}
                  onChange={handleChange}
                >
                  {[
                    "motorcycle",
                    "scooter",
                    "electric_scooter",
                    "bicycle",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Festival</label>
                <select
                  className={inputClass}
                  name="Festival"
                  value={formData.Festival}
                  onChange={handleChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>City Type</label>
                <select
                  className={inputClass}
                  name="City"
                  value={formData.City}
                  onChange={handleChange}
                >
                  {["Metropolitian", "Urban", "Semi-Urban"].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Weekend Order</label>
                <select
                  className={inputClass}
                  value={String(formData.Is_Weekend)}
                  onChange={handleWeekendChange}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Running Three AI Services...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate AI Predictions
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                <AlertTriangle size={18} className="mb-2" />
                {error}
              </div>
            )}
          </div>

          {/* PREDICTION RESULTS */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                <BrainCircuit size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  AI Prediction Results
                </h2>
                <p className="text-xs text-slate-400">
                  Results from three connected AI services
                </p>
              </div>
            </div>

            {!etaResult && !loading && (
              <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                <BrainCircuit size={48} className="mb-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-300">
                  Waiting for Prediction
                </h3>
                <p className="mt-2 max-w-xs text-sm text-slate-500">
                  Enter delivery details and generate your AI predictions.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[440px] flex-col items-center justify-center">
                <Loader2 size={45} className="animate-spin text-blue-400" />
                <p className="mt-5 font-medium text-slate-300">
                  Processing your delivery...
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  ETA, duration risk and SHAP analysis
                </p>
              </div>
            )}

            {etaResult && delayResult && explanationResult && (
              <div className="space-y-5">

                {/* ETA */}
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Clock size={19} />
                    <span className="text-sm font-medium">
                      Estimated Delivery Time
                    </span>
                  </div>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-bold">
                      {etaResult.predicted_delivery_time_minutes}
                    </span>
                    <span className="mb-1 text-lg text-slate-400">
                      minutes
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    {etaResult.message}
                  </p>
                </div>

                {/* DURATION RISK */}
                <div className={`rounded-2xl border p-5 ${riskStyle.bg} ${riskStyle.border}`}>
                  <div className="flex items-center gap-2 text-slate-300">
                    <AlertTriangle size={19} />
                    <span className="text-sm font-medium">
                      Delivery Duration Risk
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-3xl font-bold ${riskStyle.color}`}>
                      {risk} Risk
                    </span>
                    <span className={`rounded-lg px-3 py-2 text-xs font-semibold ${riskStyle.bg} ${riskStyle.color}`}>
                      AI CLASSIFICATION
                    </span>
                  </div>
                </div>

                {/* RISK PROBABILITIES */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <h3 className="mb-5 flex items-center gap-2 font-semibold">
                    <TrendingUp size={19} className="text-blue-400" />
                    Risk Probability Distribution
                  </h3>

                  <div className="space-y-5">
                    {["Low", "Medium", "High"].map((level) => {
                      const probability =
                        delayResult.risk_probabilities?.[level] ?? 0;

                      const style = riskStyles[level];

                      return (
                        <div key={level}>
                          <div className="mb-2 flex justify-between text-sm">
                            <span className={style.color}>{level} Risk</span>
                            <span className="font-semibold">{probability}%</span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${style.bar}`}
                              style={{ width: `${Math.min(probability, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      All three AI services completed successfully
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      ETA, duration risk and individual SHAP explanation.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </form>

      {/* EXPLAINABLE AI SECTION */}
      {explanationResult && (
        <div className="space-y-6">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-purple-400">
                <Sparkles size={20} />
                <span className="text-sm font-semibold">
                  EXPLAINABLE ARTIFICIAL INTELLIGENCE
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                Why Did AI Make This Prediction?
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                SHAP explains how each input influenced this individual ETA.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-400">
              <BrainCircuit size={18} />
              SHAP Explanation
            </div>
          </div>

          {/* BASELINE VS PREDICTED */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400">
                Baseline Delivery Time
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-300">
                {explanationResult.baseline_delivery_time_minutes} min
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Average model prediction on its background data.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
              <p className="text-sm text-blue-300">
                Individual Predicted ETA
              </p>

              <p className="mt-3 text-3xl font-bold text-blue-400">
                {explanationResult.predicted_delivery_time_minutes} min
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Prediction for the delivery details entered above.
              </p>
            </div>

          </div>

          {/* SHAP FEATURE CONTRIBUTIONS */}
          <div className={sectionClass}>

            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 size={21} className="text-purple-400" />
                  Individual Feature Contributions
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  How much each feature moves the prediction from its baseline.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Decreases ETA
                </span>

                <span className="flex items-center gap-2 text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400"></span>
                  Increases ETA
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {explanations.map((item, index) => {
                const isIncrease = item.impact_minutes > 0;
                const isDecrease = item.impact_minutes < 0;

                const width =
                  (Math.abs(item.impact_minutes) / maxImpact) * 100;

                return (
                  <div key={`${item.feature}-${index}`}>

                    <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs text-slate-400">
                          {index + 1}
                        </span>

                        <span className="text-sm font-medium text-slate-200">
                          {item.feature.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        isIncrease
                          ? "text-red-400"
                          : isDecrease
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}>
                        {isIncrease ? (
                          <TrendingUp size={16} />
                        ) : isDecrease ? (
                          <TrendingDown size={16} />
                        ) : null}

                        {item.impact_minutes > 0 ? "+" : ""}
                        {item.impact_minutes} min
                      </div>
                    </div>

                    <div className="ml-10 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isIncrease
                            ? "bg-red-400"
                            : isDecrease
                            ? "bg-emerald-400"
                            : "bg-slate-500"
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>

                    <p className="ml-10 mt-1 text-xs text-slate-500">
                      {item.direction === "increases"
                        ? "Pushes predicted delivery time higher"
                        : item.direction === "decreases"
                        ? "Pushes predicted delivery time lower"
                        : "No meaningful influence"}
                    </p>

                  </div>
                );
              })}
            </div>

          </div>

          {/* EXPLANATION NOTE */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="mt-0.5 shrink-0 text-purple-400" />

              <div>
                <p className="text-sm font-semibold text-purple-300">
                  Understanding SHAP
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Positive SHAP values increase the predicted ETA relative
                  to the model baseline. Negative values decrease it.
                  Contributions are expressed in minutes. These describe
                  model behaviour, not proven real-world causes.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* INFORMATION CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <Clock className="mb-3 text-blue-400" size={23} />
          <h3 className="font-semibold">ETA Prediction</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Estimates delivery duration using your trained Extra Trees
            regression model.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <AlertTriangle className="mb-3 text-amber-400" size={23} />
          <h3 className="font-semibold">Duration Risk Analysis</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Classifies delivery duration into Low, Medium and High categories.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <CloudRain className="mb-3 text-purple-400" size={23} />
          <h3 className="font-semibold">Explainable AI</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Explains how individual delivery features influence the ETA
            prediction using SHAP.
          </p>
        </div>

      </div>

      {/* IMPORTANT NOTE */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-amber-400">Important:</span>{" "}
          Low, Medium and High represent historical delivery-duration
          categories: 20 minutes or less, 21–30 minutes, and above 30 minutes.
          They do not indicate whether an order is late compared with a
          promised delivery time.
        </p>
      </div>

    </div>
  );
}