// import { useEffect, useState } from "react";

// const Dashboard = () => {
//   const [portfolio, setPortfolio] = useState([]);
//   const [error, setError] = useState(null);
//   const userId = 1; // demo user

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/dashboard/${userId}`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch dashboard data");
//         return res.json();
//       })
//       .then((data) => {
//         // Ensure data is an array before setting it
//         if (Array.isArray(data)) {
//           setPortfolio(data);
//         } else {
//           setPortfolio([]);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         setError(err.message);
//       });
//   }, []);

//   // Safety check before reducing
//   const totalInvestment = Array.isArray(portfolio) 
//     ? portfolio.reduce((sum, item) => sum + Number(item.investment_amount), 0)
//     : 0;

//   if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">My Portfolio</h2>

//       <div className="mb-4 text-lg font-medium">
//         Total Invested:{" "}
//         <span className="text-blue-600">${totalInvestment.toFixed(2)}</span>
//       </div>

//       <table className="min-w-full border border-gray-200 rounded-lg">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="px-4 py-3 text-left">Fund Name</th>
//             <th className="px-4 py-3 text-left">Ticker</th>
//             <th className="px-4 py-3 text-left">Amount</th>
//             <th className="px-4 py-3 text-left">Type</th>
//           </tr>
//         </thead>
//         <tbody>
//           {portfolio.length > 0 ? (
//             portfolio.map((item, index) => (
//               <tr key={index} className="border-t">
//                 <td className="px-4 py-3">{item.fund_name}</td>
//                 <td className="px-4 py-3 font-mono text-sm text-gray-500">{item.ticker_symbol}</td>
//                 <td className="px-4 py-3">${Number(item.investment_amount).toFixed(2)}</td>
//                 <td className="px-4 py-3">{item.investment_type}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
//                 No investments found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Dashboard;

import { useEffect, useState } from "react";

const Dashboard = ({ user }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [error, setError] = useState(null);
  const userId = user.id;

  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPortfolio(data);
        } else {
          setPortfolio([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  // Handle Selling an Investment
  const handleSell = (investmentId, fundName) => {
    // Add a quick confirmation dialog
    if (!window.confirm(`Are you sure you want to sell your investment in ${fundName}?`)) return;

    fetch(`http://localhost:5000/api/portfolio/${investmentId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to sell investment");
        return res.json();
      })
      .then(() => {
        // Filter out the deleted item from the state to update the UI instantly
        setPortfolio((prevPortfolio) =>
          prevPortfolio.filter((item) => item.id !== investmentId)
        );
        alert(`Successfully sold investment in ${fundName}!`);
      })
      .catch((err) => {
        console.error("Error selling:", err);
        alert("Something went wrong while trying to sell.");
      });
  };

  const totalInvestment = Array.isArray(portfolio)
    ? portfolio.reduce((sum, item) => sum + Number(item.investment_amount), 0)
    : 0;

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">My Portfolio</h2>

      <div className="mb-4 text-lg font-medium">
        Total Invested:{" "}
        <span className="text-blue-600">${totalInvestment.toFixed(2)}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Fund Name</th>
              <th className="px-4 py-3 text-left">Ticker</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.length > 0 ? (
              portfolio.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{item.fund_name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-500">{item.ticker_symbol}</td>
                  <td className="px-4 py-3 font-medium">${Number(item.investment_amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {item.investment_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSell(item.id, item.fund_name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No investments found. Head to the Funds tab to invest!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;