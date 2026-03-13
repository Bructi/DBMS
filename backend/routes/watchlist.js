import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// 1. ADD TO WATCHLIST
router.post("/", (req, res) => {
    const { user_id, symbol, fund_name } = req.body;

    if (!user_id || !symbol) return res.status(400).json({ error: "Missing user_id or symbol" });

    const query = "INSERT INTO watchlist (user_id, ticker_symbol, fund_name) VALUES (?, ?, ?)";
    db.query(query, [user_id, symbol, fund_name], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Asset is already in your watchlist" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Added to watchlist successfully", id: result.insertId });
    });
});

// 2. GET USER WATCHLIST
router.get("/:userId", (req, res) => {
    const query = "SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC";
    db.query(query, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. REMOVE FROM WATCHLIST
router.delete("/:id", (req, res) => {
    const query = "DELETE FROM watchlist WHERE id = ?";
    db.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Removed from watchlist" });
    });
});

export default router;