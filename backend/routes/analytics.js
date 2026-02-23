import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET portfolio distribution for a user
router.get("/distribution/:userId", (req, res) => {
    const { userId } = req.params;

    // We use SUM() to combine all investments in the same fund, grouped by fund_name
    const query = `
    SELECT 
      mf.fund_name,
      SUM(p.investment_amount) as total_invested
    FROM portfolio p
    JOIN mutual_funds mf ON p.fund_id = mf.id
    WHERE p.user_id = ?
    GROUP BY mf.fund_name
  `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json(result);
    });
});

export default router;