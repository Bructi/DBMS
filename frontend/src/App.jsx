import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FundList from "./pages/FundList";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  // State to hold our logged-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app loads, check if they are already logged in (via LocalStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-brand-100 selection:text-brand-900">
        
        {/* Only show the Navbar if the user is logged in */}
        {user && <Navbar user={user} setUser={setUser} />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

          {/* Protected Routes (Must be logged in) */}
          <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/funds" element={user ? <FundList user={user} /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/login" />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;