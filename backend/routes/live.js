import express from "express";
import YahooFinance from "yahoo-finance2"; // <-- Import the class instead of the instance

const router = express.Router();
const yahooFinance = new YahooFinance(); // <-- Initialize it here!

// Fetch multiple live quotes at once
router.get("/quotes", async (req, res) => {
    try {
        const { symbols } = req.query; // e.g., "VFIAX,QQQ,SWPPX"
        if (!symbols) return res.status(400).json({ error: "No symbols provided" });

        // Fetch real-time data for all symbols
        const quotes = await yahooFinance.quote(symbols.split(','));
        res.json(quotes);
    } catch (error) {
        console.error("Yahoo Finance Error:", error);
        res.status(500).json({ error: "Failed to fetch live data" });
    }
});

// Search for ANY stock/fund globally
router.get("/search/:query", async (req, res) => {
    try {
        const { query } = req.params;
        const results = await yahooFinance.search(query);
        
        // Filter out news articles, keep only actual quotes (stocks/funds), and limit to top 5
        const quotes = results.quotes
            .filter(q => q.isYahooFinance)
            .slice(0, 5);
            
        res.json(quotes);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

export default router;