import { Link, useNavigate } from "react-router-dom";
import { LogOut, TrendingUp, User, Server } from "lucide-react";

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

  // Determine what name to show next to the avatar
  const displayName = user?.full_name || user?.username || "Guest";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link
        to="/"
        className="flex items-center gap-2 text-2xl font-extrabold text-blue-600 tracking-tight"
      >
        <TrendingUp className="w-8 h-8" /> InvestIQ
      </Link>

      <div className="flex space-x-6 items-center">
        <Link
          to="/"
          className="text-gray-600 hover:text-blue-600 font-bold transition"
        >
          Dashboard
        </Link>
        <Link
          to="/funds"
          className="text-gray-600 hover:text-blue-600 font-bold transition"
        >
          Marketplace
        </Link>
        <Link
          to="/analytics"
          className="text-gray-600 hover:text-blue-600 font-bold transition"
        >
          Analytics
        </Link>
        <Link
          to="/leaderboard"
          className="text-gray-600 hover:text-blue-600 font-bold transition"
        >
          Leaderboard
        </Link>
        <Link
          to="/glossary"
          className="text-gray-600 hover:text-blue-600 font-bold transition"
        >
          Glossary
        </Link>

        <Link to="/history" className="hover:text-blue-200 transition font-medium">History</Link>

        <div className="flex items-center space-x-4 ml-4 pl-6 border-l border-gray-300">
          {/* ✨ DYNAMIC PROFILE BADGE (Clickable) */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 group cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-100 pr-4 pl-1 py-1 rounded-full transition-all"
            title="Go to Profile Settings"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <span className="text-sm font-bold text-blue-900 group-hover:text-blue-700 block">
              {displayName}
            </span>
          </Link>
          <Link
            to="/admin"
            className="flex items-center text-gray-400 hover:text-blue-600 transition mr-2"
            title="DBA Access"
          >
            <Server className="w-5 h-5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-red-500 transition font-bold"
          >
            <LogOut className="w-5 h-5 mr-1" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
