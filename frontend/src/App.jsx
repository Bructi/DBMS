import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FundList from "./pages/FundList";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import StockAnalyzer from "./pages/StockAnalyzer";
import Glossary from './pages/Glossary';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        {/* Only show the App Navbar if the user IS logged in. The Landing Page has its own special public Navbar. */}
        {user && <Navbar user={user} setUser={setUser} />}

        <Routes>
          <Route
            path="/login"
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />

          {/* 2. THE MAGIC FIX: If user exists, show Dashboard. If NOT, show LandingPage! */}
          <Route
            path="/"
            element={user ? <Dashboard user={user} /> : <LandingPage />}
          />

          <Route
            path="/funds"
            element={user ? <FundList user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/analytics"
            element={
              user ? <Analytics user={user} /> : <Navigate to="/login" />
            }
          />

          <Route path="/analyzer" element={<StockAnalyzer />} />

          <Route path="/glossary" element={<Glossary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
