import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { DownloadCloud, Target, ShieldAlert, Award, AlertCircle } from "lucide-react";
import "./Analytics.css";

const Analytics = ({ user }) => {
  const [portfolioData, setPortfolioData] = useState([]); // Raw Portfolio data
  const [liveQuotes, setLiveQuotes] = useState([]);       // Exact live prices
  const [liveHistoryLine, setLiveHistoryLine] = useState([]); // Array for the scrolling chart
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userId = user?.id || 1;
  const reportRef = useRef();

  const ASSET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // 1. Fetch exact user portfolio to get Tickers
  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics data");
        return res.json();
      })
      .then((data) => {
        setPortfolioData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  // 2. Poll background data to construct live, recalculating graphs
  useEffect(() => {
    if (portfolioData.length === 0) return;

    const fetchLive = async () => {
      const symbols = [...new Set(portfolioData.map(p => p.ticker_symbol))].filter(Boolean).join(",");
      if (!symbols) return;

      try {
        const res = await fetch(`http://localhost:5000/api/live/quotes?symbols=${symbols}`);
        if(res.ok) {
           const data = await res.json();
           setLiveQuotes(data);

           // Feed the live Line Chart!
           const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
           const newDataPoint = { time: timeString };
           data.forEach(quote => {
              newDataPoint[quote.symbol] = quote.regularMarketPrice;
           });
           
           setLiveHistoryLine(prev => {
             const updated = [...prev, newDataPoint];
             return updated.length > 20 ? updated.slice(1) : updated;
           });
        }
      } catch (err) {}
    };

    fetchLive(); // First run
    const interval = setInterval(fetchLive, 5000); 
    return () => clearInterval(interval);
  }, [portfolioData]);

  // 3. Dynamically map LIVE Data for Pie and Bar charts!
  const liveChartData = portfolioData.reduce((acc, item) => {
    const quote = liveQuotes.find(q => q.symbol === item.ticker_symbol);
    const liveChange = quote ? parseFloat(quote.regularMarketChangePercent) : 0;
    const liveVal = Number(item.investment_amount) * (1.125 + (liveChange / 100));

    const existing = acc.find(f => f.name === item.fund_name);
    if (existing) existing.value += liveVal;
    else acc.push({ name: item.fund_name, value: liveVal });
    return acc;
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 20 } } };

  const downloadPDF = async () => {
    const input = reportRef.current;
    if (!input) return;
    try {
      const dataUrl = await toPng(input, { cacheBust: true, backgroundColor: '#f8f9fa', pixelRatio: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(22);
      pdf.text(`InvestIQ Analytics: ${user?.username || 'User'}`, 15, 20);
      pdf.addImage(dataUrl, "PNG", 0, 35, pdfWidth, imgHeight);
      pdf.save(`InvestIQ_Report_${new Date().getTime()}.pdf`);
    } catch (err) { alert("Failed to generate PDF."); }
  };

  if (loading) return <div className="loading-screen">Analyzing Portfolio...</div>;
  if (error) return <div style={{ padding: '2.5rem', textAlign: 'center', color: '#ef4444' }}><AlertCircle size={40} style={{ margin: '0 auto 10px auto' }}/> Error: {error}</div>;

  const totalValue = liveChartData.reduce((sum, item) => sum + item.value, 0);
  const topAsset = liveChartData.length > 0 ? liveChartData.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null;
  const diversificationScore = liveChartData.length > 0 ? Math.min(Math.round((liveChartData.length / 5) * 100), 100) : 0;
  
  // Array of uniquely owned symbols for the Line Chart
  const uniqueSymbols = [...new Set(portfolioData.map(p => p.ticker_symbol))];

  const projectedGrowthData = [
    { year: '2024 (Now)', value: totalValue },
    { year: '2025', value: totalValue * 1.12 },
    { year: '2026', value: totalValue * Math.pow(1.12, 2) },
    { year: '2027', value: totalValue * Math.pow(1.12, 3) },
    { year: '2028', value: totalValue * Math.pow(1.12, 4) },
    { year: '2029', value: totalValue * Math.pow(1.12, 5) },
  ];

  const sectorData = [
    { subject: 'Technology', A: totalValue * 0.4, fullMark: totalValue },
    { subject: 'Finance', A: totalValue * 0.25, fullMark: totalValue },
    { subject: 'Energy', A: totalValue * 0.15, fullMark: totalValue },
    { subject: 'Retail', A: totalValue * 0.1, fullMark: totalValue },
    { subject: 'Healthcare', A: totalValue * 0.1, fullMark: totalValue },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-wrapper">
        
        <div className="analytics-header">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="analytics-title">Deep Analytics</h1>
            <p className="analytics-subtitle">Understand your wealth distribution & live risk factors.</p>
          </motion.div>
          
          {liveChartData.length > 0 && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={downloadPDF} className="export-btn"
            >
              <DownloadCloud size={20} /> Export Report
            </motion.button>
          )}
        </div>

        {liveChartData.length === 0 ? (
          <div className="empty-state">
            <Target size={64} color="#d1d5db" style={{ margin: '0 auto 16px auto' }} />
            <h3 className="empty-title">No Data Available</h3>
            <p className="empty-desc">Your portfolio is currently empty. Make some investments!</p>
          </div>
        ) : (
          <div ref={reportRef} style={{ paddingBottom: '1rem' }}>
            
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="summary-grid">
              <motion.div variants={itemVariants} className="summary-card">
                <div className="icon-box icon-blue"><Target size={28} /></div>
                <div>
                  <p className="card-label">Diversification</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h2 className="card-value">{diversificationScore}%</h2>
                    <span className="card-status" style={{color: '#10b981', fontWeight: 'bold', fontSize: '0.875rem'}}>Optimal</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="summary-card">
                <div className="icon-box icon-orange"><ShieldAlert size={28} /></div>
                <div>
                  <p className="card-label">Risk Profile</p>
                  <h2 className="card-value" style={{ fontSize: '1.5rem' }}>Moderate</h2>
                  <p className="card-subtext" style={{color: '#64748b', fontSize: '0.875rem', fontWeight: '500'}}>Balanced exposure</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="summary-card">
                <div className="icon-box icon-emerald"><Award size={28} /></div>
                <div style={{ overflow: 'hidden', width: '100%' }}>
                  <p className="card-label">Top Asset</p>
                  <h2 className="card-value-sm">{topAsset?.name}</h2>
                  <p className="card-subtext-blue" style={{color: '#2563eb', fontWeight: 'bold', marginTop: '4px'}}>₹{topAsset?.value.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="charts-grid">
              
              {/* REAL-TIME PORTFOLIO BENCHMARK CHART */}
              <motion.div variants={itemVariants} className="chart-card chart-card-full">
                <h3 className="chart-title chart-title-light"><span className="live-indicator"></span> Your Live Portfolio Benchmark</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={liveHistoryLine} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} itemStyle={{ fontWeight: 'bold' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      
                      {uniqueSymbols.map((symbol, index) => (
                        <Line key={symbol} type="monotone" dataKey={symbol} name={symbol.replace('.NS','')} stroke={ASSET_COLORS[index % ASSET_COLORS.length]} strokeWidth={3} dot={false} isAnimationActive={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="chart-card">
                <h3 className="chart-title">5-Year Wealth Projection</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectedGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="year" tick={{fontSize: 12, fill: '#8b5cf6', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `₹${(val/1000).toFixed(1)}k`} tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                      <RechartsTooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Projected Value']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="chart-card">
                <h3 className="chart-title">Sector Exposure</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sectorData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b82f6', fontSize: 13, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name="Exposure" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                      <RechartsTooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Exposure']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="chart-card">
                <h3 className="chart-title">Asset Allocation</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {/* isAnimationActive set to true so slices morph in real time */}
                      <Pie data={liveChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={6} dataKey="value" stroke="none" isAnimationActive={true}>
                        {liveChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'Live Value']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-center-text">
                    <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase'}}>Total Assets</span>
                    <span style={{fontSize: '1.5rem', fontWeight: '900', color: '#0f172a'}}>{liveChartData.length}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="chart-card">
                <h3 className="chart-title">Capital Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liveChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} interval={0} angle={-25} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `₹${val}`} tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} width={80} />
                      <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, 'Live Amount']} cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={45} isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;