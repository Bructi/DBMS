import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET a user's portfolio
router.get("/:user_id", (req, res) => {
    const { user_id } = req.params;
    
    const query = `
        SELECT p.id, p.investment_amount, p.investment_type, p.investment_date, 
               f.fund_name, f.ticker_symbol
        FROM portfolio p
        JOIN mutual_funds f ON p.fund_id = f.id
        WHERE p.user_id = ?
        ORDER BY p.investment_date DESC
    `;

    db.query(query, [user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// ADD to portfolio
router.post("/add", (req, res) => {
    const { user_id, fund_id, amount, type } = req.body;

    const query = `
    INSERT INTO portfolio (user_id, fund_id, investment_amount, investment_type, investment_date)
    VALUES (?, ?, ?, ?, CURDATE())
  `;

    db.query(query, [user_id, fund_id, amount, type], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Added to portfolio successfully" });
    });
});

// DELETE an investment (SELL)
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM portfolio WHERE id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to delete investment" });
        }
        res.json({ message: "Investment sold/deleted successfully" });
    });
});

export default router;
