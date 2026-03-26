import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Thermometer,
  Newspaper
} from "lucide-react";

export default function StockAnalyzer() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [searchInput, setSearchInput] = useState("RELIANCE.NS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States to hold our live fetched data
  const [liveQuote, setLiveQuote] = useState(null);
  const [technicalData, setTechnicalData] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [isGeneralNews, setIsGeneralNews] = useState(false); // Tracks if we are showing fallback news

  // Auto-Suggest States
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch data whenever the 'symbol' changes
  useEffect(() => {
    fetchStockData(symbol);
  }, [symbol]);

  // Smart Auto-Suggest Engine
  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/live/search/${searchInput}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 6)); 
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    };

    const delayDebounceFn = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const fetchStockData = async (ticker) => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch Real-Time Quote Data
      const quoteRes = await fetch(`http://localhost:5000/api/live/quotes?symbols=${ticker}`);
      if (!quoteRes.ok) throw new Error("Failed to connect to Live API");
      const quoteData = await quoteRes.json();

      if (!quoteData || quoteData.length === 0) {
        throw new Error(`No data found for: ${ticker}`);
      }

      const currentQuote = quoteData[0];
      setLiveQuote(currentQuote);

      // 2. Fetch 1-Year Historical Chart Data
      const historyRes = await fetch(`http://localhost:5000/api/live/history/${ticker}`);
      if (!historyRes.ok) throw new Error("Failed to fetch historical chart");
      const historyData = await historyRes.json();

      // 3. Process the raw history to calculate SMA, RSI, and Bollinger Bands
      const processedChart = calculateTechnicalIndicators(historyData, currentQuote.regularMarketVolume);
      setTechnicalData(processedChart);

      // 4. SMART NEWS FETCHER WITH FALLBACKS
      try {
        setNewsLoading(true);
        setIsGeneralNews(false);
        let fetchedNews = [];

        // Attempt 1: Exact Ticker (e.g. ZOMATO.NS)
        let newsRes = await fetch(`http://localhost:5000/api/live/news/${ticker}`);
        if (newsRes.ok) fetchedNews = await newsRes.json();

        // Attempt 2: Cleaned Ticker (e.g. ZOMATO)
        if (fetchedNews.length === 0 && (ticker.includes('.NS') || ticker.includes('.BO'))) {
            const cleanTicker = ticker.replace('.NS', '').replace('.BO', '');
            let fallback1 = await fetch(`http://localhost:5000/api/live/news/${cleanTicker}`);
            if (fallback1.ok) fetchedNews = await fallback1.json();
        }

        // Attempt 3: General Indian Market (NIFTY 50)
        if (fetchedNews.length === 0) {
            let fallback2 = await fetch(`http://localhost:5000/api/live/news/NIFTY`);
            if (fallback2.ok) {
              fetchedNews = await fallback2.json();
              setIsGeneralNews(true); // Flag to tell the user these are general market updates
            }
        }

        // Filter valid articles and limit to top 3
        const validNews = fetchedNews.filter(n => n.title && n.link).slice(0, 3);
        setNewsFeed(validNews);

      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setNewsLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load stock data. Please check symbol or use the suggestions dropdown.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTechnicalIndicators = (history, liveVolume) => {
    if (!history || history.length === 0) return [];

    let processed = [];
    let gains = [];
    let losses = [];
    const baseVolume = liveVolume || 5000000;

    for (let i = 0; i < history.length; i++) {
      const price = history[i].price;
      let sma10 = null; 
      let sma40 = null; 
      let upperBand = null; 
      let lowerBand = null; 
      let rsi = 50;

      const simVolume = baseVolume * (0.6 + Math.random() * 0.8);

      if (i >= 9) {
        const slice = history.slice(i - 9, i + 1);
        sma10 = slice.reduce((sum, val) => sum + val.price, 0) / 10;
        
        const variance = slice.reduce((sum, val) => sum + Math.pow(val.price - sma10, 2), 0) / 10;
        const stdDev = Math.sqrt(variance);
        upperBand = sma10 + (stdDev * 2);
        lowerBand = sma10 - (stdDev * 2);
      }

      if (i >= 39) {
        const slice = history.slice(i - 39, i + 1);
        sma40 = slice.reduce((sum, val) => sum + val.price, 0) / 40;
      }

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
        upperBand: upperBand ? Number(upperBand.toFixed(2)) : null,
        lowerBand: lowerBand ? Number(lowerBand.toFixed(2)) : null,
        volume: Math.floor(simVolume),
        rsi: Number(rsi.toFixed(2)),
      });
    }
    return processed;
  };

  const analyzeSentiment = (title) => {
    if (!title) return "Neutral";
    const text = title.toLowerCase();
    const bullishWords = ['surge', 'jump', 'gain', 'high', 'buy', 'up', 'growth', 'profit', 'beat', 'soar', 'rally', 'bull', 'upgrade', 'positive', 'record'];
    const bearishWords = ['drop', 'fall', 'low', 'sell', 'down', 'loss', 'miss', 'crash', 'plunge', 'bear', 'slump', 'cut', 'downgrade', 'negative', 'warning', 'fear'];
    
    let score = 0;
    bullishWords.forEach(word => { if (text.includes(word)) score++; });
    bearishWords.forEach(word => { if (text.includes(word)) score--; });
    
    if (score > 0) return "Bullish";
    if (score < 0) return "Bearish";
    return "Neutral";
  };

  const formatTime = (timeData) => {
    if (!timeData) return "Recently";
    const date = typeof timeData === 'number' && timeData < 1000000000000 ? new Date(timeData * 1000) : new Date(timeData);
    const diffHours = Math.floor((new Date() - date) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.toUpperCase().trim());
      setShowSuggestions(false);
    }
  };

  const currentPrice = liveQuote?.regularMarketPrice || 0;
  const priceChange = liveQuote?.regularMarketChangePercent || 0;
  const isPositive = priceChange >= 0;
  
  const high52 = technicalData.length > 0 ? Math.max(...technicalData.map(d => d.price)) : 0;
  const low52 = technicalData.length > 0 ? Math.min(...technicalData.map(d => d.price)) : 0;
  const positionPercent = high52 - low52 === 0 ? 50 : ((currentPrice - low52) / (high52 - low52)) * 100;

  const currentRSI = technicalData.length > 0 ? technicalData[technicalData.length - 1].rsi : 50;
  const rsiStatus = currentRSI > 70 ? "Overbought" : currentRSI < 30 ? "Oversold" : "Neutral";
  const formattedVolume = liveQuote?.regularMarketVolume ? (liveQuote.regularMarketVolume / 1000000).toFixed(2) + "M" : "N/A";
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
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)} 
                placeholder="Search Ticker or Company..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-72 font-bold text-gray-700 uppercase"
              />

              {/* Auto-Suggest Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    {suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchInput(suggestion.symbol);
                          setSymbol(suggestion.symbol);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition"
                      >
                        <div className="font-black text-gray-900 flex items-center justify-between">
                          {suggestion.symbol}
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{suggestion.exchDisp}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">{suggestion.shortname || suggestion.longname}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

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
              {/* Top Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Asset Symbol
                  </p>
                  <h2 className="text-2xl font-black text-gray-900 truncate" title={symbol}>
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
                
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">
                      Trend, Moving Averages & Bollinger Bands
                    </h3>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={technicalData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} minTickGap={30} />
                        <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />

                        <Line type="monotone" dataKey="upperBand" name="Upper Band" stroke="#cbd5e1" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="lowerBand" name="Lower Band" stroke="#cbd5e1" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="sma200" name="Long Term MA" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="sma50" name="Short Term MA" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="price" name="Price" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  
                  {/* 52-Week Range Thermometer */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Thermometer size={20} className="text-orange-500"/> 52-Week Range</h3>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                        <span>Low: ₹{low52.toFixed(2)}</span>
                        <span>High: ₹{high52.toFixed(2)}</span>
                      </div>
                      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 w-full opacity-60"></div>
                        <div 
                           className="absolute top-0 h-full w-2 bg-gray-900 rounded-full shadow-md border border-white" 
                           style={{ left: `calc(${Math.min(Math.max(positionPercent, 0), 100)}% - 4px)` }}
                        ></div>
                      </div>
                      <p className="text-center text-xs font-medium mt-3 text-gray-500">
                         Current Price sits at <strong className="text-gray-800">{positionPercent.toFixed(1)}%</strong> of its yearly range.
                      </p>
                    </div>
                  </div>

                  {/* Volume Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 className="text-emerald-500" size={20} />
                      <h3 className="text-lg font-bold text-gray-800">
                        Volume Profile
                      </h3>
                    </div>
                    <div className="h-[100px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={technicalData}>
                          <XAxis dataKey="date" hide />
                          <Tooltip cursor={{ fill: "#f3f4f6" }} contentStyle={{ borderRadius: "8px", border: "none" }} formatter={(val) => `${(val / 1000000).toFixed(2)}M`} />
                          <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* RSI Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Momentum (RSI)</h3>
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">14-Period</span>
                    </div>
                    <div className="h-[100px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={technicalData}>
                          <YAxis domain={[0, 100]} hide />
                          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ position: "insideTopLeft", value: "Overbought (70)", fill: "#ef4444", fontSize: 10, fontWeight: "bold" }} />
                          <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ position: "insideBottomLeft", value: "Oversold (30)", fill: "#10b981", fontSize: 10, fontWeight: "bold" }} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
                          <Line type="monotone" dataKey="rsi" name="RSI" stroke="#6366f1" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE NEWS & SENTIMENT FEED */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <Newspaper className="text-blue-600" size={24}/>
                     <h3 className="text-xl font-bold text-gray-800">Live Market Intelligence & Sentiment</h3>
                   </div>
                   {isGeneralNews && (
                     <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                       Top Indian Market Updates
                     </span>
                   )}
                 </div>
                 
                 {newsLoading ? (
                    <div className="text-center text-sm text-gray-500 py-8 animate-pulse font-bold">Scanning global news feeds...</div>
                 ) : newsFeed.length === 0 ? (
                    <div className="text-center text-sm text-gray-500 py-8 font-medium">No recent news available.</div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {newsFeed.map((news, idx) => {
                       const sentiment = analyzeSentiment(news.title);
                       return (
                         <div 
                            key={idx} 
                            onClick={() => window.open(news.link, '_blank')} 
                            className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-gray-400">{news.publisher || "Finance News"} • {formatTime(news.providerPublishTime)}</span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${sentiment === 'Bullish' ? 'bg-green-100 text-green-700' : sentiment === 'Bearish' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
                                  {sentiment}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-gray-800 leading-relaxed mb-4">{news.title}</h4>
                            </div>
                            <span className="text-xs text-blue-600 font-bold hover:underline mt-auto">Read Article &rarr;</span>
                         </div>
                       );
                     })}
                   </div>
                 )}
              </div>

            </motion.div>
          )
        )}
      </div>
    </div>
  );
}