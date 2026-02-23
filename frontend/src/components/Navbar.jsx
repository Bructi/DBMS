// import { Link, useLocation } from "react-router-dom";
// import { LayoutDashboard, Compass, LineChart, Wallet } from "lucide-react";

// const Navbar = () => {
//   const location = useLocation();

//   const isActive = (path) =>
//     location.pathname === path
//       ? "text-brand-600 bg-brand-50"
//       : "text-gray-500 hover:text-gray-900 hover:bg-gray-100";

//   return (
//     <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center gap-2">
//             <div className="bg-brand-600 p-2 rounded-lg">
//               <Wallet className="h-6 w-6 text-white" />
//             </div>
//             <span className="text-xl font-bold text-gray-900 tracking-tight">
//               FundFolio
//             </span>
//           </div>

//           <div className="flex items-center space-x-4">
//             <Link
//               to="/"
//               className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive("/")}`}
//             >
//               <LayoutDashboard size={18} /> Dashboard
//             </Link>
//             <Link
//               to="/funds"
//               className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive("/funds")}`}
//             >
//               <Compass size={18} /> Explore Funds
//             </Link>
//             <Link
//               to="/analytics"
//               className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive("/analytics")}`}
//             >
//               <LineChart size={18} /> Analytics
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session from browser storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear React state
    setUser(null);
    // Send back to login page
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
        InvestIQ
      </Link>
      
      <div className="flex space-x-6 items-center">
        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</Link>
        <Link to="/funds" className="text-gray-600 hover:text-blue-600 font-medium transition">Funds</Link>
        <Link to="/analytics" className="text-gray-600 hover:text-blue-600 font-medium transition">Analytics</Link>
        
        {/* User Profile & Logout section */}
        <div className="flex items-center space-x-4 ml-4 pl-6 border-l border-gray-300">
          <span className="text-sm font-semibold text-gray-700">
            Hi, {user?.username}
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-200 hover:text-gray-900 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}