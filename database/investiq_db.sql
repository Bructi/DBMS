-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 22, 2026 at 04:53 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `investiq_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`log_id`, `user_id`, `action_type`, `amount`, `transaction_date`) VALUES
(1, 3, 'BUY ORDER', 1200.00, '2026-03-07 12:29:44'),
(3, 3, 'SELL ORDER', 1200.00, '2026-03-07 12:30:10'),
(4, 3, 'BUY ORDER', 1200.00, '2026-03-07 12:30:57'),
(5, 3, 'BUY ORDER', 1200.00, '2026-03-07 12:30:57'),
(6, 3, 'BUY ORDER', 1000.00, '2026-03-07 12:34:52'),
(7, 3, 'BUY ORDER', 1000.00, '2026-03-07 12:34:52'),
(8, 3, 'SELL ORDER', 1000.00, '2026-03-10 17:32:59'),
(9, 3, 'SELL ORDER', 1000.00, '2026-03-10 18:05:40'),
(10, 3, 'BUY ORDER', 1000.00, '2026-03-10 18:07:01'),
(11, 3, 'SELL ORDER', 1000.00, '2026-03-10 18:19:34'),
(12, 3, 'SELL ORDER', 1200.00, '2026-03-10 18:19:37'),
(13, 3, 'SELL ORDER', 5000.00, '2026-03-10 18:19:40'),
(14, 3, 'BUY ORDER', 100.00, '2026-03-22 12:45:20'),
(15, 3, 'SELL ORDER', 5000.00, '2026-03-22 15:44:01'),
(16, 3, 'SELL ORDER', 1200.00, '2026-03-22 15:44:03'),
(17, 3, 'BUY ORDER', 2345.00, '2026-03-22 15:47:05'),
(18, 3, 'BUY ORDER', 2000.00, '2026-03-22 15:50:13'),
(19, 3, 'BUY ORDER', 234.00, '2026-03-22 15:52:19');

-- --------------------------------------------------------

--
-- Table structure for table `mutual_funds`
--

CREATE TABLE `mutual_funds` (
  `id` int(11) NOT NULL,
  `fund_name` varchar(255) NOT NULL,
  `ticker_symbol` varchar(50) NOT NULL,
  `current_nav` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mutual_funds`
--

INSERT INTO `mutual_funds` (`id`, `fund_name`, `ticker_symbol`, `current_nav`) VALUES
(10, 'Reliance Industries Ltd.', 'RELIANCE.NS', 0.00),
(11, 'Tata Consultancy Services', 'TCS.NS', 0.00),
(12, 'HDFC Bank Limited', 'HDFCBANK.NS', 0.00),
(15, 'Nippon India Nifty 50 BeES (ETF)', 'NIFTYBEES.NS', 0.00),
(16, 'CEAT LIMITED', 'CEATLTD.NS', 0.00),
(17, 'E-mini S&P Regional Banks Selec', 'SXB=F', 0.00),
(18, 'TATA CAPITAL LIMITED', 'TATACAP.NS', 0.00),
(20, 'Honda Motor Company, Ltd.', 'HMC', 0.00),
(22, 'OYO CORP', '9755.T', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `portfolio`
--

CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fund_id` int(11) NOT NULL,
  `investment_amount` decimal(15,2) NOT NULL,
  `investment_type` varchar(50) NOT NULL,
  `investment_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `portfolio`
--

INSERT INTO `portfolio` (`id`, `user_id`, `fund_id`, `investment_amount`, `investment_type`, `investment_date`) VALUES
(31, 3, 11, 1200.00, 'Intraday', '2026-03-07'),
(32, 3, 15, 1200.00, 'Delivery', '2026-03-07'),
(35, 3, 11, 1200.00, 'Delivery', '2026-03-07'),
(37, 3, 17, 1000.00, 'Delivery', '2026-03-07'),
(38, 3, 18, 1000.00, 'Delivery', '2026-03-10'),
(39, 3, 18, 100.00, 'Delivery', '2026-03-22'),
(42, 3, 12, 2345.00, 'Delivery', '2026-03-22'),
(44, 3, 15, 2000.00, 'Delivery', '2026-03-22'),
(45, 3, 12, 234.00, 'Delivery', '2026-03-22');

--
-- Triggers `portfolio`
--
DELIMITER $$
CREATE TRIGGER `after_stock_buy` AFTER INSERT ON `portfolio` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, action_type, amount)
    VALUES (NEW.user_id, 'BUY ORDER', NEW.investment_amount);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_stock_sell` AFTER DELETE ON `portfolio` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, action_type, amount)
    VALUES (OLD.user_id, 'SELL ORDER', OLD.investment_amount);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, 'DemoUser', 'demo@investiq.com', '$2a$10$X8/XpQ5V5.5j5.5j5.5j5.5j5.5j5.5j5.5j5.5j5.5j5.5j5.5j5', '2026-02-23 14:54:34'),
(2, 'Aniket', 'aniket@test.com', '$2b$10$70o00sHCgqVIsXjto6rDReYM8iifxqhM7V20Qblu0Bl5Aqq.eQuMK', '2026-02-23 15:04:06'),
(3, 'Ashish Chaurasiya', 'ashish@investiq.com', '$2b$10$1MMDM0j0CgHHe5SCvj.DzOkp/1G.knS2KBo.b6Pw/mn.uNz2PM5Tm', '2026-02-23 15:18:33');

-- --------------------------------------------------------

--
-- Table structure for table `watchlist`
--

CREATE TABLE `watchlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ticker_symbol` varchar(50) NOT NULL,
  `fund_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `watchlist`
--

INSERT INTO `watchlist` (`id`, `user_id`, `ticker_symbol`, `fund_name`, `created_at`) VALUES
(4, 3, 'RELIANCE.NS', 'Reliance Industries Ltd.', '2026-03-22 15:01:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `mutual_funds`
--
ALTER TABLE `mutual_funds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `portfolio`
--
ALTER TABLE `portfolio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fund_id` (`fund_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_asset` (`user_id`,`ticker_symbol`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `mutual_funds`
--
ALTER TABLE `mutual_funds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `portfolio`
--
ALTER TABLE `portfolio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `watchlist`
--
ALTER TABLE `watchlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `portfolio`
--
ALTER TABLE `portfolio`
  ADD CONSTRAINT `portfolio_ibfk_1` FOREIGN KEY (`fund_id`) REFERENCES `mutual_funds` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD CONSTRAINT `watchlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
