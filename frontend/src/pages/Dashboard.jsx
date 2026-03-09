import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Wallet, TrendingUp, Activity, DollarSign, Briefcase, Trash2 } from "lucide-react";

const Dashboard = ({ user }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userId = user?.id; 
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Stripe Success Return
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isSuccess = params.get("success");
    
    if (isSuccess) {
      const fundId = params.get("fund_id");
      const amount = params.get("amount");
      const type = params.get("type");

      fetch("http://localhost:5000/api/portfolio/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, fund_id: fundId, amount, type }),
      }).then(() => {
        navigate("/", { replace: true });
        fetchPortfolio();
      });
    } else {
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

  const handleSell = (investmentId, fundName) => {
    if (!window.confirm(`Are you sure you want to sell your holding in ${fundName}?`)) return;

    fetch(`http://localhost:5000/api/portfolio/${investmentId}`, { method: "DELETE" })
      .then(() => {
        setPortfolio((prev) => prev.filter((item) => item.id !== investmentId));
      })
      .catch((err) => alert("Failed to sell investment"));
  };

  // --- DATA CALCULATIONS ---
  const totalInvested = portfolio.reduce((sum, item) => sum + Number(item.investment_amount), 0);
  
  // Simulate a 12.5% return to make the dashboard look alive like a real FinTech app!
  const currentPortfolioValue = totalInvested > 0 ? totalInvested * 1.125 : 0; 
  const totalReturns = currentPortfolioValue - totalInvested;

  // Group data for the Pie Chart
  const allocationData = portfolio.reduce((acc, item) => {
    const existing = acc.find(f => f.name === item.fund_name);
    if (existing) {
      existing.value += Number(item.investment_amount);
    } else {
      acc.push({ name: item.fund_name, value: Number(item.investment_amount) });
    }
    return acc;
  }, []);

  // Mock historical data for the Area Chart based on current total
  const performanceData = [
    { month: "Jan", value: totalInvested * 0.8 },
    { month: "Feb", value: totalInvested * 0.85 },
    { month: "Mar", value: totalInvested * 0.9 },
    { month: "Apr", value: totalInvested * 0.92 },
    { month: "May", value: totalInvested * 1.05 },
    { month: "Jun", value: currentPortfolioValue },
  ];

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // Animations
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><div className="animate-pulse text-xl font-bold text-blue-600">Loading Dashboard...</div></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 pt-8 px-6 ">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.username} 👋</h1>
          <p className="text-gray-500 mt-1">Here is your portfolio overview for today.</p>
        </motion.div>

        {/* SUMMARY CARDS ROW */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wallet size={28} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Invested</p>
              <h2 className="text-2xl font-black text-gray-900">${totalInvested.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Activity size={28} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Current Value</p>
              <h2 className="text-2xl font-black text-gray-900">${currentPortfolioValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-lg flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center backdrop-blur-md"><TrendingUp size={28} /></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">Total Returns</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black text-white">+${totalReturns.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                <span className="text-sm font-bold text-emerald-400">(+12.5%)</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* CHARTS SECTION */}
        {portfolio.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Area Chart: Portfolio Growth */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Portfolio Growth (6 Months)</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Donut Chart: Asset Allocation */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Asset Allocation</h3>
              <div className="flex-1 flex justify-center items-center relative min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `$${Number(value).toFixed(2)}`} contentStyle={{ borderRadius: '10px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Inner Text for Donut Chart */}
                <div className="absolute text-center pointer-events-none">
                  <p className="text-gray-400 text-xs font-bold uppercase">Assets</p>
                  <p className="text-2xl font-black text-gray-800">{allocationData.length}</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* ACTIVE HOLDINGS TABLE */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Briefcase className="text-blue-600 w-5 h-5" />
            <h3 className="text-xl font-bold text-gray-900">Your Holdings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Asset Name</th>
                  <th className="p-4 font-bold">Ticker</th>
                  <th className="p-4 font-bold text-right">Invested Amount</th>
                  <th className="p-4 font-bold text-center">Type</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.length > 0 ? (
                  portfolio.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition group">
                      <td className="p-4 font-bold text-gray-900">{item.fund_name}</td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono text-xs font-semibold border border-gray-200">
                          {item.ticker_symbol}
                        </span>
                      </td>
                      <td className="p-4 font-black text-gray-900 text-right">
                        ${Number(item.investment_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.investment_type === 'SIP' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.investment_type}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleSell(item.id, item.fund_name)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Sell Asset"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <DollarSign className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg font-bold text-gray-800">No active investments</p>
                        <p className="text-sm mt-1 mb-4">Head over to the marketplace to start building your wealth.</p>
                        <button onClick={() => navigate('/funds')} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
                          Explore Marketplace
                        </button>
                      </div>
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