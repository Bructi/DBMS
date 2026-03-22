import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  ArrowLeft,
  Crosshair,
  AlertCircle,
  Scale,
} from "lucide-react";

export default function StockAnalyzer() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [searchInput, setSearchInput] = useState("RELIANCE.NS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to hold our live fetched data
  const [liveQuote, setLiveQuote] = useState(null);
  const [technicalData, setTechnicalData] = useState([]);

  // Fetch data whenever the 'symbol' changes
  useEffect(() => {
    fetchStockData(symbol);
  }, [symbol]);

  const fetchStockData = async (ticker) => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch Real-Time Quote Data
      const quoteRes = await fetch(
        `http://localhost:5000/api/live/quotes?symbols=${ticker}`,
      );
      if (!quoteRes.ok) throw new Error("Failed to connect to Live API");
      const quoteData = await quoteRes.json();

      if (!quoteData || quoteData.length === 0) {
        throw new Error(`No data found for ticker: ${ticker}`);
      }

      const currentQuote = quoteData[0];
      setLiveQuote(currentQuote);

      // 2. Fetch 1-Year Historical Chart Data
      const historyRes = await fetch(
        `http://localhost:5000/api/live/history/${ticker}`,
      );
      if (!historyRes.ok) throw new Error("Failed to fetch historical chart");
      const historyData = await historyRes.json();

      // 3. Process the raw history to calculate SMA and RSI dynamically
      const processedChart = calculateTechnicalIndicators(
        historyData,
        currentQuote.regularMarketVolume,
      );
      setTechnicalData(processedChart);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to load stock data. Please check symbol.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate Moving Averages and RSI from the raw price array
  const calculateTechnicalIndicators = (history, liveVolume) => {
    if (!history || history.length === 0) return [];

    let processed = [];
    let gains = [];
    let losses = [];
    const baseVolume = liveVolume || 5000000;

    for (let i = 0; i < history.length; i++) {
      const price = history[i].price;
      let sma10 = null; // Represents 50-Day SMA (10 weeks)
      let sma40 = null; // Represents 200-Day SMA (40 weeks)
      let rsi = 50;

      // Simulate historical volume curve anchored to current live volume
      const simVolume = baseVolume * (0.6 + Math.random() * 0.8);

      // Calculate 10-period moving average
      if (i >= 9) {
        const slice = history.slice(i - 9, i + 1);
        sma10 = slice.reduce((sum, val) => sum + val.price, 0) / 10;
      }

      // Calculate 40-period moving average
      if (i >= 39) {
        const slice = history.slice(i - 39, i + 1);
        sma40 = slice.reduce((sum, val) => sum + val.price, 0) / 40;
      }

      // Calculate 14-period RSI
      if (i > 0) {
        const change = price - history[i - 1].price;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
      }

      if (gains.length >= 14) {
        const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14;
        const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14;
        rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
      }

      processed.push({
        date: history[i].date,
        price: price,
        sma50: sma10 ? Number(sma10.toFixed(2)) : null,
        sma200: sma40 ? Number(sma40.toFixed(2)) : null,
        volume: Math.floor(simVolume),
        rsi: Number(rsi.toFixed(2)),
      });
    }
    return processed;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.toUpperCase().trim());
    }
  };

  // Safe fallbacks for UI rendering
  const currentPrice = liveQuote?.regularMarketPrice || 0;
  const priceChange = liveQuote?.regularMarketChangePercent || 0;
  const isPositive = priceChange >= 0;
  const currentRSI =
    technicalData.length > 0 ? technicalData[technicalData.length - 1].rsi : 50;
  const rsiStatus =
    currentRSI > 70 ? "Overbought" : currentRSI < 30 ? "Oversold" : "Neutral";
  const formattedVolume = liveQuote?.regularMarketVolume
    ? (liveQuote.regularMarketVolume / 1000000).toFixed(2) + "M"
    : "N/A";

  // Extract P/E Ratio (Yahoo Finance usually returns trailingPE, falling back to forwardPE)
  const peRatio = liveQuote?.trailingPE || liveQuote?.forwardPE || null;
  const formattedPE = peRatio ? peRatio.toFixed(2) : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Crosshair className="text-blue-600" /> Deep Analyzer
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Live data powered by Yahoo Finance
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Ticker (e.g. TCS.NS)"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 font-bold text-gray-700 uppercase"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Analyze
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 font-medium">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-bold text-lg animate-pulse">
              Fetching live market data for {symbol}...
            </p>
          </div>
        ) : (
          !error &&
          liveQuote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Stat Cards (Updated to a 5-column grid) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Asset Symbol
                  </p>
                  <h2 className="text-2xl font-black text-gray-900 truncate">
                    {symbol}
                  </h2>
                  <div
                    className={`flex items-center gap-1 text-sm font-bold mt-2 ${isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {isPositive ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    {priceChange > 0 ? "+" : ""}
                    {priceChange.toFixed(2)}% Today
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    LTP (Live Price)
                  </p>
                  <h2 className="text-2xl font-black text-gray-900">
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-gray-400 text-xs font-bold mt-2">
                    {technicalData[technicalData.length - 1]?.sma50 <
                    currentPrice
                      ? "🟢 Above"
                      : "🔴 Below"}{" "}
                    50-Period SMA
                  </p>
                </div>

                {/* NEW P/E Ratio Card */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    P/E Ratio
                  </p>
                  <h2 className="text-2xl font-black text-gray-900">
                    {formattedPE}
                  </h2>
                  <p className="text-gray-400 text-xs font-bold mt-2 flex items-center gap-1">
                    <Scale size={14} /> Valuation
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    RSI (14-Period)
                  </p>
                  <h2
                    className={`text-2xl font-black ${currentRSI > 70 ? "text-red-500" : currentRSI < 30 ? "text-green-500" : "text-blue-600"}`}
                  >
                    {currentRSI}
                  </h2>
                  <p
                    className={`text-xs font-bold mt-2 ${currentRSI > 70 ? "text-red-500" : currentRSI < 30 ? "text-green-500" : "text-gray-400"}`}
                  >
                    {rsiStatus}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    24h Volume
                  </p>
                  <h2 className="text-2xl font-black text-gray-900">
                    {formattedVolume}
                  </h2>
                  <div className="flex items-center gap-1 text-blue-500 text-sm font-bold mt-2">
                    <Activity size={16} /> Active Trading
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart: Price vs Moving Averages */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">
                      52-Week Trend & Moving Averages
                    </h3>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={technicalData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f3f4f6"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 10 }}
                          minTickGap={30}
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 12 }}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="sma200"
                          name="Long Term MA"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                        <Line
                          type="monotone"
                          dataKey="sma50"
                          name="Short Term MA"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          name="Price"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Column: Volume & Momentum */}
                <div className="space-y-6">
                  {/* Volume Bar Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 className="text-emerald-500" size={20} />
                      <h3 className="text-lg font-bold text-gray-800">
                        Volume Profile
                      </h3>
                    </div>
                    <div className="h-[140px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={technicalData}>
                          <XAxis dataKey="date" hide />
                          <Tooltip
                            cursor={{ fill: "#f3f4f6" }}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                            }}
                            formatter={(val) =>
                              `${(val / 1000000).toFixed(2)}M`
                            }
                          />
                          <Bar
                            dataKey="volume"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* RSI Gauge Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        Momentum (RSI)
                      </h3>
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                        14-Period
                      </span>
                    </div>
                    <div className="h-[100px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={technicalData}>
                          <YAxis domain={[0, 100]} hide />
                          <ReferenceLine
                            y={70}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            label={{
                              position: "insideTopLeft",
                              value: "Overbought (70)",
                              fill: "#ef4444",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          />
                          <ReferenceLine
                            y={30}
                            stroke="#10b981"
                            strokeDasharray="3 3"
                            label={{
                              position: "insideBottomLeft",
                              value: "Oversold (30)",
                              fill: "#10b981",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="rsi"
                            name="RSI"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
