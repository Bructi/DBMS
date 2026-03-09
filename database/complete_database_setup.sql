-- 1. Create Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Mutual Funds / Stocks Table
CREATE TABLE mutual_funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fund_name VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(50) UNIQUE NOT NULL,
    current_nav DECIMAL(10,2) DEFAULT 0
);

-- 3. Create Portfolio (Active Holdings) Table
CREATE TABLE portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fund_id INT NOT NULL,
    investment_amount DECIMAL(15,2) NOT NULL,
    investment_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
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