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

const Analytics = ({ user }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userId = user?.id || 1;
  const reportRef = useRef();

  useEffect(() => {
    fetch(`http://localhost:5000/api/analytics/distribution/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics data");
        return res.json();
      })
      .then((data) => {
        const formattedData = data.map((item) => ({
          name: item.fund_name,
          value: Number(item.total_invested),
        }));
        setChartData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  const ASSET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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
    } catch (err) {
      alert("Failed to generate PDF.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-xl font-bold text-blue-600">Analyzing Portfolio...</div></div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold bg-red-50 rounded-xl m-10 border border-red-200"><AlertCircle className="mx-auto mb-2 w-10 h-10"/> Error: {error}</div>;

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const topAsset = chartData.length > 0 ? chartData.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null;
  const diversificationScore = chartData.length > 0 ? Math.min(Math.round((chartData.length / 5) * 100), 100) : 0;

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
    <div className="min-h-screen bg-gray-50 pb-20 pt-8 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Deep Analytics</h1>
            <p className="text-gray-500 mt-1 font-medium">Understand your wealth distribution & risk factors.</p>
          </motion.div>
          
          {chartData.length > 0 && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={downloadPDF}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2"
            >
              <DownloadCloud className="w-5 h-5" /> Export Report
            </motion.button>
          )}
        </div>

        {chartData.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-500">Your portfolio is currently empty. Make some investments!</p>
          </div>
        ) : (
          <div ref={reportRef} className="bg-gray-50 pb-4">
            
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Target size={28} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Diversification</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-gray-900">{diversificationScore}%</h2>
                    <span className="text-sm font-semibold text-emerald-500">Optimal</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><ShieldAlert size={28} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Risk Profile</p>
                  <h2 className="text-2xl font-black text-gray-900">Moderate</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">Balanced exposure</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Award size={28} /></div>
                <div className="w-full overflow-hidden">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Top Asset</p>
                  <h2 className="text-xl font-black text-gray-900 truncate">{topAsset?.name}</h2>
                  <p className="text-sm font-bold text-blue-600 mt-1">₹{topAsset?.value.toLocaleString()}</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">5-Year Wealth Projection</h3>
                <div className="h-80 w-full">
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

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Sector Exposure</h3>
                <div className="h-80 w-full">
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

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Asset Allocation</h3>
                <div className="h-80 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={6} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Invested']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-gray-400 font-bold text-xs uppercase">Total Assets</span>
                    <span className="text-3xl font-black text-gray-900">{chartData.length}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Capital Distribution</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} interval={0} angle={-25} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `₹${val}`} tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} width={80} />
                      <RechartsTooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={45} />
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