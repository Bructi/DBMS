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