import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET all mutual funds
router.get("/", (req, res) => {
    const query = "SELECT * FROM mutual_funds";
    db.query(query, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

export default router;
