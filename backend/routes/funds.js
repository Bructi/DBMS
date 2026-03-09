import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET all available funds
router.get("/", (req, res) => {
    db.query("SELECT * FROM mutual_funds", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// POST add a new fund from global search to the marketplace
router.post("/add", (req, res) => {
    const { fund_name, ticker_symbol } = req.body;

    // Check if it already exists first
    db.query("SELECT * FROM mutual_funds WHERE ticker_symbol = ?", [ticker_symbol], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) return res.status(400).json({ message: "Fund already exists in marketplace" });

        // Insert new fund (setting current_nav to 0, since live.js fetches the real price anyway!)
        const query = "INSERT INTO mutual_funds (fund_name, ticker_symbol, current_nav) VALUES (?, ?, 0)";
        db.query(query, [fund_name, ticker_symbol], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Added to marketplace successfully" });
        });
    });
});

export default router;