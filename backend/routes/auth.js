import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

const router = express.Router();
// Create a secret key for JWT (in production, this goes in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || "investiq_super_secret_key";

// 1. REGISTER ROUTE
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (results.length > 0) return res.status(400).json({ message: "Email is already registered" });

            // Hash the password securely
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user into database
            db.query(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ error: "Failed to register user" });
                    res.status(201).json({ message: "User registered successfully!" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 2. LOGIN ROUTE
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        const user = results[0];

        // Compare the typed password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate a JSON Web Token (JWT)
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: "1h", // Token expires in 1 hour
        });

        // Send the token and user data back to the React frontend
        res.json({
            message: "Logged in successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });
});

export default router;