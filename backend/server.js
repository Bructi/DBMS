import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import fundsRoutes from "./routes/funds.js";
import portfolioRoutes from "./routes/portfolio.js";
import dashboardRoutes from "./routes/dashboard.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";
import liveRoutes from "./routes/live.js";
import paymentRoutes from "./routes/payment.js";
import watchlistRoutes from "./routes/watchlist.js";

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("InvestIQ Backend Running");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"]
  }
});

/* ✅ REGISTER ALL ROUTES */
app.use("/api/funds", fundsRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/watchlist", watchlistRoutes);



// Simulate Live Mutual Fund NAV updates
io.on('connection', (socket) => {
  console.log('New client connected for live market data');

  const liveDataInterval = setInterval(() => {
    const marketData = {
      timestamp: new Date().toISOString(),
      funds: [
        { id: 1, symbol: 'NIFTY50', current_nav: (150 + Math.random() * 2 - 1).toFixed(2), change: (Math.random() * 0.5).toFixed(2) },
        { id: 2, symbol: 'SMALLCAP', current_nav: (85 + Math.random() * 3 - 1.5).toFixed(2), change: (Math.random() * 0.8).toFixed(2) },
        { id: 3, symbol: 'TECHFUND', current_nav: (220 + Math.random() * 5 - 2.5).toFixed(2), change: (Math.random() * 1.2).toFixed(2) }
      ]
    };
    socket.emit('market_update', marketData);
  }, 3000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(liveDataInterval);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});