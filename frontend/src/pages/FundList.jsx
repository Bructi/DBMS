import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Activity, ArrowRight, ShieldCheck, X, Command, CheckCircle2 } from "lucide-react";

export default function FundList({ user }) {
  const [funds, setFunds] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFund, setSelectedFund] = useState(null);
  const [amount, setAmount] = useState("");
  
  // NEW: Updated to Groww-style stock options
  const [investmentType, setInvestmentType] = useState("Delivery"); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && selectedFund) {
        setSelectedFund(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFund]);

  const fetchFundsData = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/live/quotes?symbols=RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS,ZOMATO.NS`)
      .then(res => res.json())
      .then(data => setTrendingStocks(data))
      .catch(err => console.error("Trending fetch error:", err));

    fetch("http://localhost:5000/api/funds")
      .then((res) => res.json())
      .then(async (dbFunds) => {
        const symbols = dbFunds.map((f) => f.ticker_symbol).join(",");
        try {
          const liveRes = await fetch(`http://localhost:5000/api/live/quotes?symbols=${symbols}`);
          const liveData = await liveRes.json();

          const updatedFunds = dbFunds.map((fund) => {
            const liveQuote = liveData.find((q) => q.symbol === fund.ticker_symbol);
            return {
              ...fund,
              current_nav: liveQuote ? liveQuote.regularMarketPrice : fund.current_nav,
              change: liveQuote ? liveQuote.regularMarketChangePercent : 0
            };
          });
          setFunds(updatedFunds);
        } catch (err) {
          setFunds(dbFunds);
        }
        setLoading(false);
      });
  };

  useEffect(() => { fetchFundsData(); }, []);

  const handleSearch = async (e) => {
    const query = typeof e === 'string' ? e : e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:5000/api/live/search/${query}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {}
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const addToMarketplace = async (stock) => {
    try {
      const res = await fetch("http://localhost:5000/api/funds/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fund_name: stock.shortname || stock.longname || stock.symbol,
          ticker_symbol: stock.symbol
        }),
      });
      if (res.ok) {
        setSearchQuery("");
        setSearchResults([]);
        fetchFundsData(); 
        showToast(`Successfully added ${stock.symbol} to market!`);
      }
    } catch (err) {
      showToast("Error adding stock. Please try again.");
    }
  };

const handleCheckout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fundId: selectedFund.id,
          fundName: selectedFund.fund_name,
          amount: Number(amount),
          type: investmentType,
        }),
      });
      const data = await res.json();
      
      if (data.url) {
        // Redirecting in the SAME tab prevents double-payment glitches
        window.location.href = data.url;
      }
    } catch (err) {
      showToast("Payment initiation failed. Check your connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-800">
      
      {/* 🟢 HERO SECTION */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-3">
              Invest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Indian Markets</span>
            </h1>
            <p className="text-lg text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-500" /> Secure, real-time NSE/BSE trading.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full md:w-1/3 relative z-40">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                ref={searchInputRef}
                type="text" placeholder="Search NSE/BSE stocks..." value={searchQuery} onChange={handleSearch}
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-inner text-slate-700 font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none hidden md:flex">
                <kbd className="inline-flex items-center gap-1 font-sans px-2 py-1 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <Command className="w-3 h-3"/> K
                </kbd>
              </div>
              {isSearching && <span className="absolute right-4 top-4 text-slate-400 text-sm animate-pulse md:hidden">Scanning...</span>}
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              {['TATA', 'BANK', 'NIFTY', 'IT'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleSearch(tag)}
                  className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-colors whitespace-nowrap shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute w-full mt-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition border-b border-slate-100 last:border-b-0 cursor-pointer">
                      <div>
                        <p className="font-bold text-slate-800">{result.symbol}</p>
                        <p className="text-xs text-slate-500 truncate w-48">{result.shortname}</p>
                      </div>
                      <button onClick={() => addToMarketplace(result)} className="text-sm bg-blue-50 text-blue-600 font-bold px-4 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">Add</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* 📈 TRENDING STOCKS SECTION */}
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
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Explore Assets</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-3xl"></div>)}
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funds.map((fund) => (
              <motion.div key={fund.id} variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800 line-clamp-1" title={fund.fund_name}>{fund.fund_name}</h2>
                    <span className="bg-slate-50 text-slate-500 text-xs px-2 py-1 rounded-md font-mono border border-slate-200">{fund.ticker_symbol.replace('.NS', '')}</span>
                  </div>
                  <div className="mt-8 flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-400 mb-1 font-medium">Current Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-800">₹{Number(fund.current_nav).toFixed(2)}</span>
                        {fund.change !== undefined && (
                          <span className={`text-sm font-bold ${fund.change >= 0 ? "text-teal-500" : "text-rose-500"}`}>
                            {fund.change > 0 ? "+" : ""}{fund.change.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setSelectedFund(fund)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 flex items-center gap-1">
                      Buy <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 💳 STRIPE CHECKOUT MODAL */}
        <AnimatePresence>
          {selectedFund && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-slate-100">
                <button onClick={() => setSelectedFund(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition bg-slate-50 hover:bg-slate-100 rounded-full p-2"><X className="w-5 h-5" /></button>
                <div className="mb-8">
                  <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-bold tracking-wide uppercase border border-blue-100">Setup Order</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 mt-4 mb-1">{selectedFund.ticker_symbol.replace('.NS', '')}</h2>
                  <p className="text-slate-500 font-medium">{selectedFund.fund_name}</p>
                </div>
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Investment Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-slate-400 font-bold">₹</span>
                      <input type="number" required min="100" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-10 pr-4 text-xl font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all" placeholder="1000" />
                    </div>
                  </div>
                  
                  {/* NEW: Groww-style Order Type Buttons */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Order Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        onClick={() => setInvestmentType("Delivery")} 
                        className={`py-3 px-2 rounded-xl transition-all border flex flex-col items-center justify-center gap-1 ${investmentType === 'Delivery' ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="font-bold">Delivery</span>
                        <span className={`text-[10px] ${investmentType === 'Delivery' ? 'text-blue-200' : 'text-slate-400'}`}>Long Term</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setInvestmentType("Intraday")} 
                        className={`py-3 px-2 rounded-xl transition-all border flex flex-col items-center justify-center gap-1 ${investmentType === 'Intraday' ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="font-bold">Intraday</span>
                        <span className={`text-[10px] ${investmentType === 'Intraday' ? 'text-blue-200' : 'text-slate-400'}`}>Same Day</span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-[#635BFF] hover:bg-[#4B45C6] active:scale-[0.98] text-white rounded-xl font-extrabold text-lg transition-all shadow-lg shadow-[#635BFF]/30 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2">
                    {isSubmitting ? "Connecting to Gateway..." : "Proceed to Payment"}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" /> Encrypted by Stripe Checkout <span className="text-slate-300 ml-1">(Esc to cancel)</span>
                  </p>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🍞 SLEEK TOAST NOTIFICATION */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-medium"
            >
              <CheckCircle2 className="text-teal-400 w-5 h-5" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}