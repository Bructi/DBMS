# 📈 InvestIQ - Smart Portfolio & Wealth Management

InvestIQ is a modern, full-stack FinTech application that allows users to simulate investing in the Indian Stock Market (NSE/BSE). It features real-time market data fetching, secure simulated payment processing, beautiful visual analytics, and an automated database audit system.

This project was built as a comprehensive Database Management System (DBMS) mini-project, showcasing complex SQL relationships, automated triggers, and a robust backend architecture.

---

## ✨ Key Features
* **Live Market Data:** Fetches real-time stock prices (Reliance, TCS, HDFC, etc.) directly from Yahoo Finance APIs.
* **Global Search Engine:** Press `/` to instantly search and add any global or Indian stock ticker to your live marketplace.
* **Simulated Transactions:** Securely process "Delivery" and "Intraday" orders using the **Stripe Payment Gateway** (Test Mode).
* **Deep Visual Analytics:** Interactive Donut, Radar, Bar, and Area charts using `recharts`.
* **One-Click PDF Reports:** Generate and download high-resolution portfolio analytics reports.
* **Automated Audit Logs (DBMS Triggers):** MySQL triggers autonomously record every buy/sell action in the background without relying on backend logic.
* **Bank-Grade Security:** User passwords are encrypted using `bcryptjs`, and sessions are secured with JSON Web Tokens (JWT).

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
* **Backend:** Node.js, Express.js.
* **Database:** MySQL (Relational tables, Foreign Keys, Triggers).
* **APIs & Libraries:** `yahoo-finance2`, `stripe`, `html-to-image`, `jspdf`, `recharts`.

---

## ⚙️ Local Installation & Setup

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [XAMPP](https://www.apachefriends.org/) (for MySQL) installed on your machine.

### 2. Clone the Repository
```bash
git clone [https://github.com/yourusername/investiq.git](https://github.com/yourusername/investiq.git)
cd investiq 


