import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  Activity,
  DollarSign,
  Briefcase,
  Trash2,
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveMarket, setLiveMarket] = useState([]);

  const userId = user?.id || 1;
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessedPayment = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isSuccess = params.get("success");

    if (isSuccess && !hasProcessedPayment.current) {
      hasProcessedPayment.current = true;
      const fundId = params.get("fund_id");
      const amount = params.get("amount");
      const type = params.get("type");

      fetch("http://localhost:5000/api/portfolio/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          fund_id: fundId,
          amount,
          type,
        }),
      }).then(() => {
        navigate("/", { replace: true });
        fetchPortfolio();
      });
    } else if (!isSuccess) {
      fetchPortfolio();
    }
  }, [location, navigate, userId]);

  const fetchPortfolio = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/dashboard/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setPortfolio(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (portfolio.length === 0) return;

    const fetchLivePrices = async () => {
      const symbols = [...new Set(portfolio.map((p) => p.ticker_symbol))]
        .filter(Boolean)
        .join(",");
      if (!symbols) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/live/quotes?symbols=${symbols}`,
        );
        if (res.ok) {
          const data = await res.json();
          setLiveMarket(data);
        }
      } catch (err) {
        console.error("Live fetch error", err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 5000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const handleSell = (investmentId, fundName) => {
    if (
      !window.confirm(
        `Are you sure you want to sell your holding in ${fundName}?`,
      )
    )
      return;
    fetch(`http://localhost:5000/api/portfolio/${investmentId}`, {
      method: "DELETE",
    })
      .then(() =>
        setPortfolio((prev) => prev.filter((item) => item.id !== investmentId)),
      )
      .catch((err) => alert("Failed to sell investment"));
  };

  // --- DYNAMIC LIVE CALCULATIONS ---
  const totalInvested = portfolio.reduce(
    (sum, item) => sum + Number(item.investment_amount),
    0,
  );

  const currentPortfolioValue = portfolio.reduce((sum, item) => {
    const liveStock = liveMarket.find((s) => s.symbol === item.ticker_symbol);
    const liveChangePercent = liveStock
      ? parseFloat(liveStock.regularMarketChangePercent)
      : 0;
    const itemCurrentValue =
      Number(item.investment_amount) * (1.125 + liveChangePercent / 100);
    return sum + itemCurrentValue;
  }, 0);

  const totalReturns = currentPortfolioValue - totalInvested;
  const returnPercentage =
    totalInvested > 0
      ? ((totalReturns / totalInvested) * 100).toFixed(2)
      : "0.00";

  const allocationData = portfolio.reduce((acc, item) => {
    const liveStock = liveMarket.find((s) => s.symbol === item.ticker_symbol);
    const liveChangePercent = liveStock
      ? parseFloat(liveStock.regularMarketChangePercent)
      : 0;
    const liveVal =
      Number(item.investment_amount) * (1.125 + liveChangePercent / 100);

    const existing = acc.find((f) => f.name === item.fund_name);
    if (existing) existing.value += liveVal;
    else acc.push({ name: item.fund_name, value: liveVal });
    return acc;
  }, []);

  const performanceData = [
    { month: "January", value: totalInvested * 0.8 },
    { month: "February", value: totalInvested * 0.85 },
    { month: "March", value: totalInvested * 0.9 },
    { month: "April", value: totalInvested * 0.92 },
    { month: "May", value: totalInvested * 1.05 },
    { month: "Live", value: currentPortfolioValue },
  ];

  // --- HIGHLIGHTS WIDGET CALCULATIONS ---
  const portfolioWithLiveStats = portfolio.map((item) => {
    const liveStock = liveMarket.find((s) => s.symbol === item.ticker_symbol);
    const liveChangePercent = liveStock
      ? parseFloat(liveStock.regularMarketChangePercent)
      : 0;
    return { ...item, liveChangePercent };
  });

  const sortedByPerformance = [...portfolioWithLiveStats].sort(
    (a, b) => b.liveChangePercent - a.liveChangePercent,
  );
  const topPerformer =
    sortedByPerformance.length > 0 ? sortedByPerformance[0] : null;
  const worstPerformer =
    sortedByPerformance.length > 0
      ? sortedByPerformance[sortedByPerformance.length - 1]
      : null;

  const todaysPnL = portfolioWithLiveStats.reduce((sum, item) => {
    return (
      sum + Number(item.investment_amount) * (item.liveChangePercent / 100)
    );
  }, 0);

  const PIE_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  if (loading)
    return (
      <div
        className="app-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2563eb" }}
        >
          Loading Dashboard...
        </div>
      </div>
    );

  return (
    <div className="app-container">
      <div className="dash-wrapper">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dash-header"
        >
          <h1 className="dash-title">
            Welcome back, {user?.username || "User"} 👋
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            Here is your real-time portfolio overview.
          </p>
        </motion.div>

        {liveMarket.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="live-banner"
          >
            <span className="live-dot">LIVE ASSETS</span>
            {liveMarket.map((stock, index) => (
              <div key={index} className="live-item">
                <span>{stock.symbol.replace(".NS", "")}</span>
                <span
                  style={{
                    color:
                      stock.regularMarketChangePercent >= 0
                        ? "#10b981"
                        : "#ef4444",
                  }}
                >
                  ₹{stock.regularMarketPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="summary-cards"
        >
          <motion.div variants={itemVariants} className="stat-card">
            <div className="icon-box icon-blue">
              <Wallet size={28} />
            </div>
            <div>
              <p className="stat-label">Total Invested</p>
              <h2 className="stat-val">
                ₹
                {totalInvested.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card">
            <div className="icon-box icon-emerald">
              <Activity size={28} />
            </div>
            <div>
              <p className="stat-label">Current Value</p>
              <h2 className="stat-val" style={{ transition: "color 0.3s" }}>
                ₹
                {currentPortfolioValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card dark">
            <div className="icon-box icon-dark">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="stat-label">Total Returns</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                }}
              >
                <h2
                  className="stat-val"
                  style={{ color: totalReturns >= 0 ? "#34d399" : "#f87171" }}
                >
                  {totalReturns >= 0 ? "+" : ""}₹
                  {totalReturns.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    color: totalReturns >= 0 ? "#34d399" : "#f87171",
                  }}
                >
                  ({returnPercentage}%)
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {portfolio.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="charts-layout"
          >
            {/* 1. PORTFOLIO GROWTH */}
            <motion.div variants={itemVariants} className="chart-box">
              {/* Replace your existing chart header with this: */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Portfolio Growth (Live)
                </h3>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {/* NEW Deep Analysis Button */}
                  <button
                    onClick={() => navigate("/analyzer")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      background: "#3b82f6",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <Activity size={14} /> Deep Analysis
                  </button>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      background: "#ecfdf5",
                      color: "#10b981",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Sync Active
                  </span>
                </div>
              </div>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                      interval={
                        0
                      } /* <--- This forces all month labels to show */
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [
                        `₹${Number(value).toFixed(2)}`,
                        "Value",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* 2. ASSET ALLOCATION */}
            <motion.div
              variants={itemVariants}
              className="chart-box"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Asset Allocation
              </h3>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  minHeight: "250px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => `₹${Number(value).toFixed(2)}`}
                      contentStyle={{ borderRadius: "10px", border: "none" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Assets
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "900",
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {allocationData.length}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. LIVE HIGHLIGHTS (NEW SPACE FILLER) */}
            <motion.div
              variants={itemVariants}
              className="chart-box"
              style={{
                display: "flex",
                flexDirection: "column",
                background:
                  "linear-gradient(to bottom right, #ffffff, #f8fafc)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  margin: "0 0 1.25rem 0",
                }}
              >
                Live Highlights
              </h3>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px dashed #e2e8f0",
                    marginBottom: "0.5rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Today's P&L
                  </p>
                  <h4
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: "900",
                      color: todaysPnL >= 0 ? "#10b981" : "#ef4444",
                      margin: 0,
                    }}
                  >
                    {todaysPnL >= 0 ? "+" : ""}₹
                    {todaysPnL.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h4>
                </div>

                {topPerformer && topPerformer.liveChangePercent > 0 && (
                  <div
                    style={{
                      background: "#ecfdf5",
                      padding: "1rem",
                      borderRadius: "1rem",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        color: "#059669",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      🔥 Top Gainer
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: "900", color: "#0f172a" }}>
                        {topPerformer.ticker_symbol.replace(".NS", "")}
                      </span>
                      <span style={{ fontWeight: "900", color: "#10b981" }}>
                        +{topPerformer.liveChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}

                {worstPerformer && worstPerformer.liveChangePercent < 0 ? (
                  <div
                    style={{
                      background: "#fef2f2",
                      padding: "1rem",
                      borderRadius: "1rem",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        color: "#e11d48",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      🔻 Top Loser
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: "900", color: "#0f172a" }}>
                        {worstPerformer.ticker_symbol.replace(".NS", "")}
                      </span>
                      <span style={{ fontWeight: "900", color: "#ef4444" }}>
                        {worstPerformer.liveChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "1rem",
                      border: "1px solid #e2e8f0",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#475569",
                        fontSize: "0.8rem",
                      }}
                    >
                      All assets are in the green! 🚀
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="table-box"
        >
          <div className="table-header">
            <Briefcase color="#2563eb" size={20} /> Your Holdings
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Ticker</th>
                  <th style={{ textAlign: "right" }}>Invested</th>
                  <th style={{ textAlign: "right" }}>Live Value</th>
                  <th style={{ textAlign: "center" }}>Type</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.length > 0 ? (
                  portfolio.map((item) => {
                    const liveStock = liveMarket.find(
                      (s) => s.symbol === item.ticker_symbol,
                    );
                    const liveChange = liveStock
                      ? parseFloat(liveStock.regularMarketChangePercent)
                      : 0;
                    const currentValue =
                      Number(item.investment_amount) *
                      (1.125 + liveChange / 100);
                    const isUp = currentValue >= Number(item.investment_amount);

                    return (
                      <tr key={item.id}>
                        <td>{item.fund_name}</td>
                        <td>
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.25rem",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {item.ticker_symbol}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ₹
                          {Number(item.investment_amount).toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: "900", color: "#0f172a" }}>
                            ₹
                            {currentValue.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              color: isUp ? "#10b981" : "#ef4444",
                            }}
                          >
                            {isUp ? "+" : ""}₹
                            {(
                              currentValue - Number(item.investment_amount)
                            ).toFixed(2)}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              background:
                                item.investment_type === "SIP"
                                  ? "#f3e8ff"
                                  : "#ffedd5",
                              color:
                                item.investment_type === "SIP"
                                  ? "#7e22ce"
                                  : "#c2410c",
                            }}
                          >
                            {item.investment_type}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => handleSell(item.id, item.fund_name)}
                            style={{
                              padding: "0.5rem",
                              color: "#94a3b8",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              transition: "color 0.2s",
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <DollarSign
                        size={48}
                        color="#cbd5e1"
                        style={{ margin: "0 auto 0.75rem auto" }}
                      />
                      <p
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: "bold",
                          color: "#0f172a",
                          margin: 0,
                        }}
                      >
                        No active investments
                      </p>
                      <button
                        onClick={() => navigate("/funds")}
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          padding: "0.5rem 1.25rem",
                          borderRadius: "0.75rem",
                          fontWeight: "bold",
                          border: "none",
                          cursor: "pointer",
                          marginTop: "1rem",
                        }}
                      >
                        Explore Marketplace
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
