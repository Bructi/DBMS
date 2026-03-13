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

-- 4. Create Audit Logs Table for Triggers
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insert Default Nifty 50 Stocks
INSERT INTO mutual_funds (fund_name, ticker_symbol, current_nav) VALUES 
('Reliance Industries Ltd.', 'RELIANCE.NS', 0),
('Tata Consultancy Services', 'TCS.NS', 0),
('HDFC Bank Limited', 'HDFCBANK.NS', 0),
('Zomato Limited', 'ZOMATO.NS', 0),
('Tata Motors Limited', 'TATAMOTORS.NS', 0),
('Nippon India Nifty 50 BeES (ETF)', 'NIFTYBEES.NS', 0);

-- 6. Create Trigger: Log when a stock is BOUGHT
DELIMITER $$
CREATE TRIGGER after_stock_buy
AFTER INSERT ON portfolio
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, amount)
    VALUES (NEW.user_id, 'BUY ORDER', NEW.investment_amount);
END$$
DELIMITER ;

-- 7. Create Trigger: Log when a stock is SOLD
DELIMITER $$
CREATE TRIGGER after_stock_sell
AFTER DELETE ON portfolio
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, amount)
    VALUES (OLD.user_id, 'SELL ORDER', OLD.investment_amount);
END$$
DELIMITER ;