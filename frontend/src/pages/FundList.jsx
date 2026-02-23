// import { useEffect, useState } from "react";
// import { getFunds } from "../services/api";

// const FundList = () => {
//   const [funds, setFunds] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch funds from your Express backend
//     fetch("http://localhost:5000/api/funds")
//       .then((res) => res.json())
//       .then((data) => {
//         setFunds(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching funds:", err);
//         setLoading(false);
//       });
//   }, []);



//   const addToPortfolio = async (fundId) => {
//     try {
//       await fetch("http://localhost:5000/api/portfolio/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: 1, // demo user
//           fund_id: fundId,
//           amount: 10000,
//           type: "Lumpsum",
//         }),
//       });

//       alert("Added to portfolio");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add");
//     }
//   };

//   if (loading) {
//     return <p className="p-4 text-gray-600">Loading funds...</p>;
//   }

// //   return (
// //     <div className="p-6">
// //       <h2 className="text-2xl font-semibold mb-6">Available Mutual Funds</h2>

// //       <div className="overflow-x-auto">
// //         <table className="min-w-full border border-gray-200 rounded-lg">
// //           <thead className="bg-gray-100">
// //             <tr>
// //               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
// //                 Fund Name
// //               </th>
// //               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
// //                 Category
// //               </th>
// //               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
// //                 NAV
// //               </th>
// //               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
// //                 Risk
// //               </th>
// //               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
// //                 Action
// //               </th>
// //             </tr>
// //           </thead>

// //           <tbody>
// //             {funds.map((fund) => (
// //               <tr key={fund.fund_id} className="border-t hover:bg-gray-50">
// //                 <td className="px-4 py-3">{fund.fund_name}</td>
// //                 <td className="px-4 py-3">{fund.category}</td>
// //                 <td className="px-4 py-3">₹{fund.nav}</td>
// //                 <td className="px-4 py-3">
// //                   <span
// //                     className={`px-2 py-1 rounded text-xs font-medium
// //                       ${
// //                         fund.risk_level === "High"
// //                           ? "bg-red-100 text-red-700"
// //                           : fund.risk_level === "Medium"
// //                             ? "bg-yellow-100 text-yellow-700"
// //                             : "bg-green-100 text-green-700"
// //                       }`}
// //                   >
// //                     {fund.risk_level}
// //                   </span>
// //                 </td>
// //                 <td className="px-4 py-3">
// //                   <button
// //                     onClick={() => addToPortfolio(fund.fund_id)}
// //                     className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
// //                   >
// //                     Add
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );


// return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Available Mutual Funds</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {funds.map((fund) => (
//           <div key={fund.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <h2 className="text-xl font-semibold">{fund.fund_name}</h2>
//             <p className="text-gray-500 mb-4">{fund.ticker_symbol}</p>
//             <div className="flex justify-between items-center">
//               <span className="text-lg font-bold text-green-600">
//                 NAV: ${fund.current_nav}
//               </span>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
//                 Invest
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
// export default FundList;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FundList({ user }) {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the investment modal
  const [selectedFund, setSelectedFund] = useState(null);
  const [amount, setAmount] = useState("");
  const [investmentType, setInvestmentType] = useState("SIP");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const userId = user.id;

  useEffect(() => {
    fetch("http://localhost:5000/api/funds")
      .then((res) => res.json())
      .then((data) => {
        setFunds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching funds:", err);
        setLoading(false);
      });
  }, []);

  // Handle the form submission
  const handleInvest = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const investmentData = {
      user_id: userId,
      fund_id: selectedFund.id,
      amount: Number(amount),
      type: investmentType,
    };

    fetch("http://localhost:5000/api/portfolio/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(investmentData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add investment");
        return res.json();
      })
      .then(() => {
        alert(`Successfully invested $${amount} in ${selectedFund.fund_name}!`);
        setIsSubmitting(false);
        setSelectedFund(null); // Close the modal
        setAmount(""); // Reset amount
        navigate("/"); // Redirect to dashboard to see the new charts!
      })
      .catch((err) => {
        console.error("Investment error:", err);
        alert("Something went wrong. Please try again.");
        setIsSubmitting(false);
      });
  };

  if (loading) return <div className="p-8 text-center">Loading funds...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <h1 className="text-3xl font-bold mb-6">Available Mutual Funds</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funds.map((fund) => (
          <div key={fund.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold">{fund.fund_name}</h2>
            <p className="text-gray-500 mb-4 font-mono">{fund.ticker_symbol}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-600">
                NAV: ${Number(fund.current_nav).toFixed(2)}
              </span>
              <button 
                onClick={() => setSelectedFund(fund)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Invest
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Modal */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Invest in {selectedFund.ticker_symbol}</h2>
            <p className="text-gray-600 mb-6">{selectedFund.fund_name}</p>

            <form onSubmit={handleInvest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Type
                </label>
                <select
                  value={investmentType}
                  onChange={(e) => setInvestmentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="SIP">SIP (Monthly)</option>
                  <option value="Lump Sum">Lump Sum (One-time)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedFund(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Confirm Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}