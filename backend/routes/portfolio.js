import express from "express";
import { db } from "../config/db.js";
const router = express.Router();

// BUY STOCK: Deduct from Wallet, Add to Portfolio
router.post("/buy", (req, res) => {
  const { user_id, fund_id, amount, type } = req.body;

  // 1. Check Wallet Balance
  db.query(
    "SELECT wallet_balance FROM users WHERE id = ?",
    [user_id],
    (err, users) => {
      if (err || users.length === 0)
        return res.status(500).json({ error: "User not found" });
      const currentBalance = Number(users[0].wallet_balance);

      if (currentBalance < Number(amount)) {
        return res.status(400).json({ error: "Insufficient funds in wallet." });
      }

      // 2. Deduct from wallet
      const newBalance = currentBalance - Number(amount);
      db.query(
        "UPDATE users SET wallet_balance = ? WHERE id = ?",
        [newBalance, user_id],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          // 3. Add to active Portfolio
          db.query(
            "INSERT INTO portfolio (user_id, fund_id, investment_amount, investment_type, investment_date) VALUES (?, ?, ?, ?, CURRENT_DATE)",
            [user_id, fund_id, amount, type],
            (err3) => {
              if (err3) return res.status(500).json(err3);
              res.json({ message: "Purchase successful!", newBalance });
            },
          );
        },
      );
    },
  );
});

// SELL STOCK: Add to Wallet, Remove from Portfolio
router.post("/sell", (req, res) => {
  // 1. Bring back 'amount' to receive the LIVE value (Original + Profit) from the frontend
  const { user_id, portfolio_id, amount } = req.body; 

  if (!amount) {
    return res.status(400).json({ error: "Sale amount is required!" });
  }

  // 2. Verify the user actually owns this portfolio item before selling
  db.query(
    "SELECT id FROM portfolio WHERE id = ? AND user_id = ?",
    [portfolio_id, user_id],
    (err, portfolioItems) => {
      if (err || portfolioItems.length === 0) {
        return res.status(404).json({ error: "Portfolio item not found or unauthorized" });
      }

      // 3. Get Current Wallet Balance
      db.query(
        "SELECT wallet_balance FROM users WHERE id = ?",
        [user_id],
        (err, users) => {
          if (err || users.length === 0) return res.status(500).json({ error: "User not found" });

          const currentBalance = Number(users[0].wallet_balance);

          // 4. Add the LIVE amount back to the wallet (This locks in the profit!)
          const newBalance = currentBalance + Number(amount);
          
          db.query(
            "UPDATE users SET wallet_balance = ? WHERE id = ?",
            [newBalance, user_id],
            (err2) => {
              if (err2) return res.status(500).json(err2);

              // 5. Remove the asset from the portfolio
              db.query(
                "DELETE FROM portfolio WHERE id = ? AND user_id = ?",
                [portfolio_id, user_id],
                (err3) => {
                  if (err3) return res.status(500).json(err3);
                  res.json({ message: "Asset sold successfully!", newBalance });
                },
              );
            },
          );
        },
      );
    },
  );
});

// Get Active Portfolio Data
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = `
        SELECT p.id, p.investment_amount, p.investment_type, p.created_at, 
               m.fund_name, m.ticker_symbol, m.current_nav
        FROM portfolio p
        JOIN mutual_funds m ON p.fund_id = m.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

export default router;
