
# 📈 InvestIQ - Smart Portfolio & Wealth Management

InvestIQ is an advanced, full-stack FinTech application built to simulate real-world investing in the Indian Stock Market (NSE/BSE). Designed as a premium trading terminal, it features real-time market synchronization, secure simulated payment processing, dynamic visual analytics, and an automated background database audit system.

Developed specifically as a comprehensive Database Management System (DBMS) project, InvestIQ showcases complex SQL relationships, automated triggers, and a highly responsive React architecture.

## ✨ Key Features

  - **🔴 Live Market Synchronization:** Fetches and mathematically blends real-time stock prices (Reliance, TCS, HDFC, etc.) via Yahoo Finance APIs to calculate exact live portfolio values and "Today's P\&L" continuously.
  - **🔬 Deep Technical Analyzer:** A dedicated analysis engine that dynamically calculates and charts 50-Period & 200-Period Simple Moving Averages (SMA), 14-Period Relative Strength Index (RSI), P/E Ratios, and Trading Volume profiles on the fly. Includes an AI-driven "Technical Verdict" summary for quick market sentiment reading.
  - **📖 Global Market Dictionary:** A hybrid-architecture educational module. It features a lightning-fast local cache for common terms and integrates the **Wikipedia Search API** to fetch and format live financial definitions from the web in real-time.
  - **⭐ Dynamic Watchlist:** Persistently track your favorite assets before buying. Add and remove global tickers with instant live-price binding.
  - **⚡ Global Search Engine:** Press `⌘ + K` or `/` to instantly search and add any global or Indian stock ticker directly to your live marketplace.
  - **📊 Premium Trading Terminal UI:** A completely custom-built, high-end user interface using Tailwind CSS and Framer Motion for glassmorphism, fluid transitions, and a professional layout resembling tools like Groww or Zerodha.
  - **📈 Deep Visual Analytics:** Interactive and auto-recalculating Donut, Radar, Bar, and Area charts using `recharts`. Features live portfolio benchmarking and 5-year wealth projections.
  - **💳 Simulated Transactions & Native Wallet:** Securely process "Delivery" and "Intraday" orders using the **Stripe Payment Gateway** (Test Mode) or utilize the **Native Paper-Trading Wallet** (starts at ₹1,00,000) that automatically deducts and credits funds instantly upon execution.
  - **🛡️ Automated Audit Logs (DBMS Triggers):** MySQL triggers autonomously record every buy/sell action in the background, maintaining strict financial ledgers without relying on backend logic.
  - **🏆 Global Leaderboard:** A gamified "Top Investors" ranking system that utilizes complex SQL `JOIN` and `SUM` aggregations to dynamically calculate and rank every user's total Net Worth (Wallet + Live Portfolio).
  - **🎛️ God-Mode DBA Control Panel:** A secure, hidden Database Administrator dashboard. It executes global aggregations (`COUNT`, `GROUP BY`) to visualize platform health, market sentiment, demographic breakdowns, and features a "Mass Stimulus" button that executes a global `UPDATE` query to inject funds into all accounts simultaneously.
  - **🖼️ Native Base64 Profiles:** Users can customize their financial goals and upload profile avatars, which are instantly converted into Base64 text strings and stored directly inside the MySQL database.
  - **📄 PDF Statement Generation:** Users can export their autonomous database transaction history into a beautifully formatted, downloadable PDF receipt using `jsPDF`.

-----

## 🛠️ Tech Stack

  - **Frontend:** React.js, Tailwind CSS, Framer Motion (Fluid Animations), Lucide React (Icons).
  - **Backend:** Node.js, Express.js.
  - **Database:** MySQL (Relational tables, Foreign Keys, Unique Constraints, Triggers, Complex Aggregations).
  - **APIs & Libraries:** `yahoo-finance2` (Live Data), Wikipedia API (Web Dictionary), `stripe` (Payments), `recharts` (Data Visualization), `jspdf` & `jspdf-autotable` (PDF Export).

-----

## 🗄️ Database Architecture

As a DBMS-focused project, InvestIQ utilizes a strictly normalized relational database structure:

1.  **`users`**: Secure credential storage with encrypted passwords, Native Wallet balances, demographic goals, and Base64 encoded profile pictures.
2.  **`funds`** / **`marketplace`**: Available assets tied to global ticker symbols.
3.  **`portfolio`**: Active user holdings linking users to funds with tracked investment amounts and order types.
4.  **`watchlist`**: A junction table with `UNIQUE` constraints preventing duplicate asset tracking per user.
5.  **`audit_logs`**: An immutable ledger populated exclusively via SQL `AFTER INSERT` and `AFTER DELETE` triggers on the portfolio table.

-----

## ⚙️ Local Installation & Setup

### 1\. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [XAMPP](https://www.apachefriends.org/) (for MySQL) installed on your machine.

### 2\. Clone the Repository

```bash
git clone https://github.com/Bructi/DBMS.git
cd DBMS
```

### 3\. Database Configuration

1.  Open XAMPP and start the MySQL and Apache modules.

2.  Open your browser and go to http://localhost/phpmyadmin.

3.  Create a new database named investiq\_db.

4.  Click the Import tab and upload the provided SQL dump file located in the database/ folder to instantly generate all tables, constraints, seeded data, and triggers.

### 4\. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and add your credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=investiq_db
JWT_SECRET=your_super_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

Start the backend server:

```bash
node ./server.js
# or use: npm start
```

### 5\. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

**⚠️ Note on Frontend NPM Dependencies:**
If you encounter dependency conflicts or vulnerability warnings during `npm install` (due to older React or Recharts versions), run the following commands to force a clean installation:

```bash
npm audit fix --force
```

If the installation still fails or hangs due to peer dependency conflicts, use the legacy flag:

```bash
npm install --legacy-peer-deps
```

The application will securely launch on `http://localhost:5173`.

### 💳 Testing Payments & Orders

InvestIQ integrates with Stripe in strict Test Mode. When purchasing an asset, you will be redirected to a secure checkout session.

Use standard Stripe test cards (e.g., 4242 4242 4242 4242) to simulate successful investments. Upon success, the database triggers will update your holdings, and the live dashboard will immediately reflect your new assets.

### View Simulated Transactions:

You can monitor the successful test orders directly in the Stripe Dashboard:
🔗 View InvestIQ Stripe Test Payments:
[https://dashboard.stripe.com/acct\_1T8FleF0XdgPr66o/test/payments](https://dashboard.stripe.com/acct_1T8FleF0XdgPr66o/test/payments)

### 🕒 Market Timing
![alt text](stock-timing.png)