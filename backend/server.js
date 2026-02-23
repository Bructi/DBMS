import express from "express";
import cors from "cors";

import fundsRoutes from "./routes/funds.js";
import portfolioRoutes from "./routes/portfolio.js";
import dashboardRoutes from "./routes/dashboard.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";

const app = express();

/* ✅ GLOBAL CORS — FIXES ALL ROUTES */
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("InvestIQ Backend Running");
});

/* ✅ REGISTER ALL ROUTES */
app.use("/api/funds", fundsRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
