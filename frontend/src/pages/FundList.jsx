import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Activity, X, Trash2, LineChart as LineChartIcon, CheckCircle2, Wallet, Star } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import "./FundList.css";

export default function FundList({ user }) {
  const [funds, setFunds] = useState([]);
  const [watchlist, setWatchlist] = useState([]); 
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

  const simulatedWallet = 100000;
  const currentUserId = user?.id || 1; 

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

  const fetchFundsData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);

    try {
      fetch(`http://localhost:5000/api/live/quotes?symbols=RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS,ZOMATO.NS`)
        .then(res => res.json())
        .then(data => setTrendingStocks(data))
        .catch(() => { });

      const dbRes = await fetch("http://localhost:5000/api/funds");
      const dbFunds = await dbRes.json();

      let wlData = [];
      try {
         const wlRes = await fetch(`http://localhost:5000/api/watchlist/${currentUserId}`);
         if (wlRes.ok) wlData = await wlRes.json();
      } catch (err) {
         console.error("Watchlist fetch failed", err);
      }

      const allSymbols = new Set([
        ...dbFunds.map(f => f.ticker_symbol),
        ...wlData.map(w => w.ticker_symbol)
      ]);
      const symbolString = Array.from(allSymbols).filter(Boolean).join(",");

      let liveData = [];
      if (symbolString) {
        const liveRes = await fetch(`http://localhost:5000/api/live/quotes?symbols=${symbolString}`);
        liveData = await liveRes.json();
      }

      setFunds(dbFunds.map(fund => {
        const liveQuote = liveData.find(q => q.symbol === fund.ticker_symbol);
        return { 
          ...fund, 
          current_nav: liveQuote ? liveQuote.regularMarketPrice : fund.current_nav, 
          change: liveQuote ? liveQuote.regularMarketChangePercent : 0 
        };
      }));

      setWatchlist(wlData.map(item => {
        const liveQuote = liveData.find(q => q.symbol === item.ticker_symbol);
        return { 
          ...item, 
          current_nav: liveQuote ? liveQuote.regularMarketPrice : 0, 
          change: liveQuote ? liveQuote.regularMarketChangePercent : 0 
        };
      }));

    } catch (err) {
      console.error("Failed fetching market data", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFundsData(false);
    const interval = setInterval(() => fetchFundsData(true), 5000); 
    return () => clearInterval(interval);
  }, [currentUserId]);

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
        setSearchQuery(""); setSearchResults([]); fetchFundsData(true); showToast(`Added ${stock.symbol}`);
      }
    } catch (err) { showToast("Error adding stock."); }
  };

  const removeFund = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Remove ${name} from Marketplace?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/funds/${id}`, { method: "DELETE" });
      if (res.ok) { setFunds(prev => prev.filter(f => f.id !== id)); showToast(`${name} removed.`); }
      else showToast("Asset is currently held in a portfolio.");
    } catch (err) { showToast("Failed to remove."); }
  };

  const addToWatchlist = async (fund, e) => {
    e.stopPropagation();
    const symbolToUse = fund.ticker_symbol || fund.symbol;
    const nameToUse = fund.fund_name || fund.shortname || symbolToUse;

    try {
        const res = await fetch("http://localhost:5000/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: currentUserId, symbol: symbolToUse, fund_name: nameToUse }) 
        });
        const data = await res.json();

        if (res.ok) {
            showToast(`★ ${symbolToUse} added to Watchlist`);
            fetchFundsData(true);
        } else {
            showToast(data.error || "Failed to add to watchlist");
        }
    } catch (err) {
        showToast("Error adding to watchlist");
    }
  };

  const removeFromWatchlist = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Remove ${name} from Watchlist?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/watchlist/${id}`, { method: "DELETE" });
      if (res.ok) {
         setWatchlist(prev => prev.filter(w => w.id !== id));
         showToast(`${name} removed from Watchlist`);
      }
    } catch (err) { showToast("Failed to remove."); }
  };

  const handleCheckout = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, fundId: selectedFund.id || 999, fundName: selectedFund.fund_name, amount: Number(amount), type: investmentType }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { showToast("Payment failed."); setIsSubmitting(false); }
  };

  const estimatedShares = selectedFund && amount && selectedFund.current_nav > 0 
    ? (Number(amount) / selectedFund.current_nav).toFixed(4) 
    : "0.0000";

  return (
    <div className="app-container">

      <div className="top-nav">
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h1 className="nav-brand"><TrendingUp color="#2563eb" /> Markets</h1>
            <div className="wallet-badge">
              <Wallet color="#10b981" size={16} />
              <span className="wallet-label">Buying Power</span>
              <span className="wallet-value">₹{simulatedWallet.toLocaleString()}</span>
            </div>
          </div>

          <div className="search-box">
            <Search style={{ position: 'absolute', left: '0.75rem', top: '0.625rem', color: '#94a3b8', width: '1.25rem' }} />
            <input
              ref={searchInputRef} type="text" placeholder="Search companies (e.g., ITC.NS)..." value={searchQuery} onChange={handleSearch}
              className="search-input"
            />
            <kbd style={{ position: 'absolute', right: '0.75rem', top: '0.625rem', fontSize: '0.7rem', color: '#94a3b8', border: '1px solid #cbd5e1', padding: '0.1rem 0.3rem', borderRadius: '0.25rem', background: '#fff' }}>⌘ K</kbd>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ position: 'absolute', width: '100%', marginTop: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 50 }}>
                  {searchResults.map((res, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ overflow: 'hidden', paddingRight: '1rem' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.875rem' }}>{res.symbol}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{res.shortname}</p>
                      </div>
                      <button onClick={() => addToMarketplace(res)} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Add</button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="content-wrapper">

        {/* TRENDING SECTION */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="section-title"><Activity color="#2563eb" /> Trending Nifty 50</h2>

          {trendingStocks.length === 0 ? (
            <div className="trending-grid">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton"></div>)}
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="trending-grid">
              {trendingStocks.map((stock) => (
                <motion.div key={stock.symbol} variants={itemVariants} className="card">
                  <span style={{ fontWeight: 'bold', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={stock.symbol}>{stock.symbol.replace('.NS', '')}</span>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <span className="card-price">₹{stock.regularMarketPrice.toFixed(2)}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }} className={stock.regularMarketChangePercent >= 0 ? "text-green" : "text-red"}>
                      {stock.regularMarketChangePercent > 0 ? <TrendingUp size={14} style={{marginRight: '4px'}} /> : null}
                      {stock.regularMarketChangePercent > 0 ? "+" : ""}{stock.regularMarketChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* WATCHLIST SECTION */}
        {watchlist.length > 0 && (
           <div style={{ marginBottom: '3rem' }}>
              <h2 className="section-title"><Star color="#f59e0b" fill="#f59e0b" /> Your Watchlist</h2>
              <div className="fund-grid">
                 {watchlist.map((fund) => (
                   <div key={fund.id} className="card" style={{ position: 'relative' }} onClick={() => setSelectedFund(fund)}>
                     <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <button onClick={(e) => removeFromWatchlist(fund.id, fund.fund_name, e)} 
                          style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                          <Trash2 size={12} /> Remove
                        </button>
                     </div>
                     <div style={{ marginBottom: '1rem', paddingRight: '5rem' }}>
                       <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fund.fund_name}</h3>
                       <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{fund.ticker_symbol.replace('.NS', '')}</p>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                       <div>
                         <span className="card-price" style={{ display: 'block' }}>₹{Number(fund.current_nav).toFixed(2)}</span>
                         <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }} className={fund.change >= 0 ? "text-green" : "text-red"}>
                           {fund.change > 0 ? "+" : ""}{fund.change ? fund.change.toFixed(2) : "0.00"}%
                         </span>
                       </div>
                       <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}>
                         BUY
                       </button>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* EXPLORE ASSETS (MARKETPLACE) */}
        <h2 className="section-title"><Activity color="#2563eb" /> Explore Assets</h2>

        {loading ? (
          <div className="fund-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '8.5rem' }}></div>)}
          </div>
        ) : (
          <div className="fund-grid">
            {funds.map((fund) => (
              <div key={fund.id} className="card" style={{ position: 'relative' }} onClick={() => setSelectedFund(fund)}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    <button onClick={(e) => addToWatchlist(fund, e)} 
                      style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="currentColor" /> Watch
                    </button>
                    <button onClick={(e) => removeFund(fund.id, fund.fund_name, e)} 
                      style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                </div>
                <div style={{ marginBottom: '1rem', paddingRight: '5.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fund.fund_name}</h3>
                  <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{fund.ticker_symbol.replace('.NS', '')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <span className="card-price" style={{ display: 'block' }}>₹{Number(fund.current_nav).toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }} className={fund.change >= 0 ? "text-green" : "text-red"}>
                      {fund.change > 0 ? "+" : ""}{fund.change ? fund.change.toFixed(2) : "0.00"}%
                    </span>
                  </div>
                  <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>
                    BUY
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUY / CHART DRAWER */}
        <AnimatePresence>
          {selectedFund && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFund(null)} className="drawer-overlay" />

              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="drawer-panel">
                <div className="drawer-header">
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>{selectedFund.ticker_symbol.replace('.NS', '')}</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', maxWidth: '16rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFund.fund_name}</p>
                  </div>
                  {/* Fixed X button visibility */}
                  <button onClick={() => setSelectedFund(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#18191b', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#ffffff' }}>
                    <X size={30} />
                  </button>
                </div>

                <div className="drawer-body">
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '2.25rem', fontWeight: '900' }}>₹{Number(selectedFund.current_nav).toFixed(2)}</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }} className={selectedFund.change >= 0 ? "text-green" : "text-red"}>{selectedFund.change > 0 ? "+" : ""}{selectedFund.change?.toFixed(2)}%</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', background: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}>1Y Trajectory</span>
                    </div>

                    <div style={{ height: '12rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '0.5rem' }}>
                      {chartLoading ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: '0.75rem' }}>
                          <LineChartIcon size={24} color="#2563eb" style={{ marginBottom: '0.25rem' }} /> Fetching Data...
                        </div>
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
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 'bold' }}>Data unavailable</div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleCheckout}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Order Type</label>
                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.75rem' }}>
                        <button type="button" onClick={() => setInvestmentType("Delivery")} style={{ flex: 1, padding: '0.5rem', border: 'none', background: investmentType === 'Delivery' ? '#fff' : 'transparent', color: investmentType === 'Delivery' ? '#2563eb' : '#64748b', fontWeight: 'bold', borderRadius: '0.5rem', cursor: 'pointer', boxShadow: investmentType === 'Delivery' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>Delivery</button>
                        <button type="button" onClick={() => setInvestmentType("Intraday")} style={{ flex: 1, padding: '0.5rem', border: 'none', background: investmentType === 'Intraday' ? '#fff' : 'transparent', color: investmentType === 'Intraday' ? '#2563eb' : '#64748b', fontWeight: 'bold', borderRadius: '0.5rem', cursor: 'pointer', boxShadow: investmentType === 'Intraday' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>Intraday</button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Amount to Invest</label>
                        {amount > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>Eqv: {estimatedShares} shares</span>}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold' }}>₹</span>
                        <input type="number" required min="100" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="checkout-input" placeholder="0" />
                      </div>
                    </div>

                    {/* NEW: Side-by-side Cancel and Buy Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button" 
                        onClick={() => setSelectedFund(null)}
                        style={{ padding: '0.875rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer', flex: 1, transition: 'background 0.2s' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting || selectedFund.current_nav == 0} 
                        className="submit-btn"
                        style={{ flex: 2 }}
                      >
                        {isSubmitting ? "Processing..." : `BUY ${selectedFund.ticker_symbol.replace('.NS', '')}`}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#1e293b', color: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 60, fontSize: '0.875rem', fontWeight: '500', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <CheckCircle2 color="#34d399" size={20} /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}