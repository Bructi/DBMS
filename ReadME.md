# 📈 InvestIQ - Mutual Fund Portfolio Manager

InvestIQ is a full-stack web application designed to help users track, manage, and analyze their mutual fund investments. Users can create secure accounts, simulate investing in real-world mutual funds, track their total portfolio value, and visualize their asset allocation through interactive charts.

## ✨ Features

- **User Authentication:** Secure user registration and login using encrypted passwords (bcrypt) and JSON Web Tokens (JWT).
- **Interactive Dashboard:** View all active investments, total portfolio value, and sell/delete assets in real-time.
- **Investment Marketplace:** Browse available mutual funds and invest via SIP (Monthly) or Lump Sum (One-time).
- **Visual Analytics:** Dynamic Pie Charts (Asset Allocation) and Bar Charts (Investment Distribution) powered by Recharts.
- **Responsive Design:** Clean, modern, and fully responsive user interface built with React and Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- React Router DOM (Navigation)
- Recharts (Data Visualization)
- Tailwind CSS (Styling)

**Backend:**
- Node.js & Express.js (REST API)
- MySQL (Database via `mysql2` package)
- JWT (Authentication)
- bcryptjs (Password Hashing)

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally on your machine.

### 0. Create a .env file in backend folder 
- Use code node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  
- Make JWT_SECRET variable in .env file and paste the generated 32 letter code.
- If it relinquishes generate a new one and repeat steps

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [XAMPP](https://www.apachefriends.org/) (or any local MySQL server).

### 2. Database Setup (MySQL)
1. Open XAMPP and start both **Apache** and **MySQL**.
2. Click on **Admin** next to MySQL to open phpMyAdmin.
3. Go to the **SQL** tab and run the following commands to create the database and tables:

```sql
CREATE DATABASE IF NOT EXISTS investiq_db;
USE investiq_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mutual_funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fund_name VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(50) NOT NULL,
    current_nav DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fund_id INT NOT NULL,
    investment_amount DECIMAL(15, 2) NOT NULL,
    investment_type VARCHAR(50) NOT NULL,
    investment_date DATE NOT NULL,
    FOREIGN KEY (fund_id) REFERENCES mutual_funds(id) ON DELETE CASCADE
);

-- Insert starting data
INSERT INTO mutual_funds (fund_name, ticker_symbol, current_nav) VALUES 
('Vanguard 500 Index Fund', 'VFIAX', 450.25),
('Fidelity Contrafund', 'FCNTX', 14.50),
('Schwab S&P 500 Index', 'SWPPX', 72.10),
('T. Rowe Price Blue Chip Growth', 'TRBCX', 158.30),
('Invesco QQQ Trust', 'QQQ', 380.45);