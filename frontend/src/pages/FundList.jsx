import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Activity, ShieldCheck, X, Command, Trash2, LineChart as LineChartIcon, CheckCircle2, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function FundList({ user }) {
  const [funds, setFunds] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFund, setSelectedFund] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [investmentType, setInvestmentType] = useState("Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const searchInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  // Simulated Buying Power (Wallet)
  const simulatedWallet = 100000;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } } };

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault(); searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && selectedFund) setSelectedFund(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFund]);

  const fetchFundsData = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/live/quotes?symbols=RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS,ZOMATO.NS`)
      .then(res => res.json()).then(data => setTrendingStocks(data)).catch(() => { });

    fetch("http://localhost:5000/api/funds")
      .then(res => res.json())
      .then(async (dbFunds) => {
        const symbols = dbFunds.map(f => f.ticker_symbol).join(",");
        if (!symbols) { setFunds([]); setLoading(false); return; }
        try {
          const liveRes = await fetch(`http://localhost:5000/api/live/quotes?symbols=${symbols}`);
          const liveData = await liveRes.json();
          setFunds(dbFunds.map(fund => {
            const liveQuote = liveData.find(q => q.symbol === fund.ticker_symbol);
            return { ...fund, current_nav: liveQuote ? liveQuote.regularMarketPrice : fund.current_nav, change: liveQuote ? liveQuote.regularMarketChangePercent : 0 };
          }));
        } catch (err) { setFunds(dbFunds); }
        setLoading(false);
      });
  };

  useEffect(() => { fetchFundsData(); }, []);

  useEffect(() => {
    if (selectedFund) {
      setChartLoading(true);
      fetch(`http://localhost:5000/api/live/history/${selectedFund.ticker_symbol}`)
        .then(res => res.json())
        .then(data => { setHistoricalData(data); setChartLoading(false); })
        .catch(() => setChartLoading(false));
    }
  }, [selectedFund]);

  const handleSearch = async (e) => {
    const query = typeof e === 'string' ? e : e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const res = await fetch(`http://localhost:5000/api/live/search/${query}`);
        setSearchResults(await res.json());
      } catch (err) { }
    } else setSearchResults([]);
  };

  const addToMarketplace = async (stock) => {
    try {
      const res = await fetch("http://localhost:5000/api/funds/add", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fund_name: stock.shortname || stock.symbol, ticker_symbol: stock.symbol }),
      });
      if (res.ok) {
        setSearchQuery(""); setSearchResults([]); fetchFundsData(); showToast(`Added ${stock.symbol}`);
      }
    } catch (err) { showToast("Error adding stock."); }
  };

  const removeFund = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/funds/${id}`, { method: "DELETE" });
      if (res.ok) { setFunds(prev => prev.filter(f => f.id !== id)); showToast(`${name} removed.`); }
      else showToast("Asset is currently held in a portfolio.");
    } catch (err) { showToast("Failed to remove."); }
  };

  const handleCheckout = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, fundId: selectedFund.id, fundName: selectedFund.fund_name, amount: Number(amount), type: investmentType }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { showToast("Payment failed."); setIsSubmitting(false); }
  };

  // Calculate estimated shares dynamically
  const estimatedShares = selectedFund && amount ? (Number(amount) / selectedFund.current_nav).toFixed(4) : "0.0000";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">

      {/* 🟢 TOP ACTION BAR (With Wallet) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" /> Markets
            </h1>

            {/* ✨ NEW WALLET BALANCE ✨ */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buying Power</span>
              <span className="text-sm font-black text-slate-800">₹{simulatedWallet.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              ref={searchInputRef} type="text" placeholder="Search companies (e.g., ITC.NS)..." value={searchQuery} onChange={handleSearch}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            />
            <kbd className="absolute right-3 top-3 hidden md:inline-flex items-center gap-1 font-sans text-[10px] font-bold text-slate-400 border border-slate-300 rounded px-1.5 py-0.5"><Command className="w-3 h-3" /> K</kbd>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {searchResults.map((res, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                      <div className="truncate pr-4"><p className="font-bold text-sm text-slate-800">{res.symbol}</p><p className="text-xs text-slate-500 truncate">{res.shortname}</p></div>
                      <button onClick={() => addToMarketplace(res)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">Add</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">

        {/* 📈 TRENDING STOCKS */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800">Trending Nifty 50</h2>
          </div>

          {trendingStocks.length === 0 ? (
            <div className="flex gap-4 overflow-hidden py-2"><div className="h-24 w-48 bg-slate-200 animate-pulse rounded-2xl"></div><div className="h-24 w-48 bg-slate-200 animate-pulse rounded-2xl"></div></div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {trendingStocks.map((stock) => (
                <motion.div key={stock.symbol} variants={itemVariants} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="font-bold text-slate-800 truncate" title={stock.symbol}>{stock.symbol.replace('.NS', '')}</span>
                  <div className="mt-4 flex flex-col">
                    <span className="text-xl font-extrabold">₹{stock.regularMarketPrice.toFixed(2)}</span>
                    <span className={`text-sm font-semibold flex items-center ${stock.regularMarketChangePercent >= 0 ? "text-teal-500" : "text-rose-500"}`}>
                      {stock.regularMarketChangePercent > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
                      {stock.regularMarketChangePercent > 0 ? "+" : ""}{stock.regularMarketChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* 🛒 MAIN MARKETPLACE */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> Explore Assets</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {funds.map((fund) => (
              <div key={fund.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all relative group cursor-pointer" onClick={() => setSelectedFund(fund)}>
                <button onClick={(e) => { e.stopPropagation(); removeFund(fund.id, fund.fund_name); }} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="mb-4 pr-6">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{fund.fund_name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{fund.ticker_symbol.replace('.NS', '')}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xl font-black text-slate-900 block">₹{Number(fund.current_nav).toFixed(2)}</span>
                    <span className={`text-xs font-bold ${fund.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {fund.change > 0 ? "+" : ""}{fund.change ? fund.change.toFixed(2) : "0.00"}%
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors">
                    <span className="text-xs font-black px-2">BUY</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ⚡ FAST SIDE-DRAWER CHECKOUT */}
        <AnimatePresence>
          {selectedFund && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFund(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />

              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">

                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedFund.ticker_symbol.replace('.NS', '')}</h2>
                    <p className="text-xs text-slate-500 truncate w-64">{selectedFund.fund_name}</p>
                  </div>
                  <button onClick={() => setSelectedFund(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <span className="text-3xl font-black text-slate-900">₹{Number(selectedFund.current_nav).toFixed(2)}</span>
                        <span className={`ml-2 text-sm font-bold ${selectedFund.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{selectedFund.change > 0 ? "+" : ""}{selectedFund.change?.toFixed(2)}%</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">1Y Trajectory</span>
                    </div>

                    <div className="h-48 w-full bg-white rounded-xl border border-slate-200 p-2">
                      {chartLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold animate-pulse text-xs"><LineChartIcon className="w-6 h-6 mb-1 text-blue-500" /> Fetching Data...</div>
                      ) : historicalData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={historicalData}>
                            <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient>
                            </defs>
                            <YAxis domain={['dataMin', 'dataMax']} hide />
                            <RechartsTooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, '']} labelFormatter={() => ""} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-400 text-xs font-bold">Data unavailable</div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleCheckout} className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold text-slate-700">Order Type</label></div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button type="button" onClick={() => setInvestmentType("Delivery")} className={`flex-1 py-2 text-sm font-bold rounded-lg
                             transition-all ${investmentType === 'Delivery' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Delivery</button>
                          <button type="button" onClick={() => setInvestmentType("Intraday")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${investmentType === 'Intraday' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Intraday</button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-slate-700">Amount to Invest</label>
                          {/* ✨ NEW SHARES CALCULATOR ✨ */}
                          {amount > 0 && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Eqv: {estimatedShares} shares</span>}
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input type="number" required min="100" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-8 pr-4 text-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0" />
                        </div>
                      </div>

                      <button type="submit" disabled={isSubmitting || selectedFund.current_nav == 0} className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 flex justify-center items-center gap-2">
                        {isSubmitting ? "Processing..." : `BUY ${selectedFund.ticker_symbol.replace('.NS', '')}`}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-medium text-sm">
              <CheckCircle2 className="text-teal-400 w-5 h-5" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}