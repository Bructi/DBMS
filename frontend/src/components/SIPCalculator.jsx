import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, PieChart as PieIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend // <-- Imported Legend
} from "recharts";
import "./SIPCalculator.css";

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  // --- CALCULATIONS ---
  const { totalInvested, estimatedReturns, maturityValue, chartData } = useMemo(() => {
    const i = expectedReturn / 12 / 100; // monthly rate
    const n = timePeriod * 12; // total months
    const invested = monthlyInvestment * n;
    
    let maturity = 0;
    if (i === 0) {
      maturity = invested;
    } else {
      maturity = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const returns = maturity - invested;

    // Generate data for the Area Chart
    const data = [];
    for (let year = 1; year <= timePeriod; year++) {
      const months = year * 12;
      const yearlyInvested = monthlyInvestment * months;
      const yearlyMaturity =
        i === 0
          ? yearlyInvested
          : monthlyInvestment * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);

      data.push({
        year: year, // <-- Changed this to just a number for a cleaner X-axis
        Invested: Math.round(yearlyInvested),
        Value: Math.round(yearlyMaturity),
      });
    }

    return {
      totalInvested: invested,
      estimatedReturns: returns,
      maturityValue: maturity,
      chartData: data,
    };
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  const pieData = [
    { name: "Invested", value: totalInvested }, // Shortened name for the legend
    { name: "Est. Returns", value: estimatedReturns > 0 ? estimatedReturns : 0 },
  ];
  const PIE_COLORS = ["#94a3b8", "#3b82f6"]; // Made the invested color a bit darker so the legend text is readable

  // --- FORMATTERS ---
  const formatCurrency = (val) =>
    `₹${Math.round(val).toLocaleString("en-IN")}`;
    
  // Shortens large numbers for the Y-axis (e.g., 100000 -> 1L)
  const formatYAxis = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val}`;
  };

  return (
    <div className="sip-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sip-header"
      >
        <div className="sip-title-box">
          <Calculator size={28} color="#2563eb" />
          <h1>SIP & Compound Interest Calculator</h1>
        </div>
        <p>Estimate your future wealth by visualizing the power of compounding.</p>
      </motion.div>

      <div className="sip-grid">
        {/* --- CONTROLS SECTION --- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sip-card controls-card"
        >
          {/* ... (Controls code remains exactly the same) ... */}
          <div className="input-group">
            <div className="input-header">
              <label>Monthly Investment</label>
              <span className="value-badge">{formatCurrency(monthlyInvestment)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="custom-slider"
            />
            <div className="slider-labels">
              <span>₹500</span>
              <span>₹1L</span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <label>Expected Return Rate (p.a)</label>
              <span className="value-badge">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="custom-slider"
            />
            <div className="slider-labels">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-header">
              <label>Time Period (Years)</label>
              <span className="value-badge">{timePeriod} Yr</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="custom-slider"
            />
            <div className="slider-labels">
              <span>1 Yr</span>
              <span>40 Yrs</span>
            </div>
          </div>
        </motion.div>

        {/* --- RESULTS SECTION --- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sip-card results-card"
        >
          <div className="results-summary">
            <div className="result-item">
              <p>Invested Amount</p>
              <h3>{formatCurrency(totalInvested)}</h3>
            </div>
            <div className="result-item">
              <p>Est. Returns</p>
              <h3 style={{ color: "#10b981" }}>+{formatCurrency(estimatedReturns)}</h3>
            </div>
            <div className="result-item total-value">
              <p>Total Value</p>
              <h2>{formatCurrency(maturityValue)}</h2>
            </div>
          </div>

          <div className="charts-container">
            {/* Pie Chart */}
            <div className="chart-wrapper pie-wrapper">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PieIcon size={16} /> Wealth Composition
              </h4>
              <ResponsiveContainer width="100%" height={250}> {/* Increased height slightly to fit legend */}
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  {/* Added Legend */}
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="chart-wrapper area-wrapper">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} /> Growth Over Time
              </h4>
              <ResponsiveContainer width="100%" height={250}> {/* Increased height slightly */}
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  
                  {/* Un-hid XAxis and formatted it */}
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                    label={{ value: 'Years', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
                  />
                  
                  {/* Added YAxis and formatted values */}
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    tickFormatter={formatYAxis}
                    width={50}
                  />

                  <Tooltip
                    labelFormatter={(label) => `Year ${label}`}
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  
                  {/* Added Legend */}
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: '#64748b', fontWeight: '500', paddingBottom: '10px' }}
                  />

                  <Area
                    name="Total Value"
                    type="monotone"
                    dataKey="Value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                  <Area
                    name="Invested Amount"
                    type="monotone"
                    dataKey="Invested"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="#cbd5e1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SIPCalculator;