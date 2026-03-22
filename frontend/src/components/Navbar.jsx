import { Link, useNavigate } from "react-router-dom";
import { LogOut, TrendingUp } from "lucide-react";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  // Make sure we remove any dark mode leftovers from the HTML tag if they clicked it
  document.documentElement.classList.remove("dark");
  localStorage.removeItem("theme");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-600 tracking-tight">
        <TrendingUp className="w-8 h-8" /> InvestIQ
      </Link>
      
      <div className="flex space-x-6 items-center">
        <Link to="/" className="text-gray-600 hover:text-blue-600 font-bold transition">Dashboard</Link>
        <Link to="/funds" className="text-gray-600 hover:text-blue-600 font-bold transition">Marketplace</Link>
        <Link to="/analytics" className="text-gray-600 hover:text-blue-600 font-bold transition">Analytics</Link>
        <Link to="/glossary" className="text-gray-600 hover:text-blue-600 font-bold transition">Glossary</Link>
        
        <div className="flex items-center space-x-4 ml-4 pl-6 border-l border-gray-300">
          <span className="text-sm font-bold text-gray-800 bg-blue-50 px-3 py-1.5 rounded-lg">
            {user?.username}
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}