import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
    try {
        const { fundName, amount, fundId, userId, type } = req.body;

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "inr", // <-- Change this to "inr"
                        product_data: { name: `Investment in ${fundName}` },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            // If payment is successful, redirect back to Dashboard and pass the data so we can save it!
            success_url: `http://localhost:5173/?success=true&fund_id=${fundId}&amount=${amount}&type=${type}`,
            cancel_url: `http://localhost:5173/funds`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

export default router;