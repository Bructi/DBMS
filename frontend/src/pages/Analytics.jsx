import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from "recharts";

const Analytics = ({user}) => {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const userId = user.id;

  useEffect(() => {
    fetch(`http://localhost:5000/api/analytics/distribution/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics data");
        return res.json();
      })
      .then((data) => {
        // Recharts expects numbers, so we convert the SQL SUM string back to a Number
        const formattedData = data.map((item) => ({
          name: item.fund_name,
          value: Number(item.total_invested),
        }));
        setChartData(formattedData);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  // Custom colors for the pie chart slices
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Portfolio Analytics</h2>

      {chartData.length === 0 ? (
        <p className="text-gray-500">No analytics data available. Head to the dashboard to add investments!</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pie Chart Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-center">Asset Allocation</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-center">Investment by Fund</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} cursor={{fill: 'transparent'}}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;