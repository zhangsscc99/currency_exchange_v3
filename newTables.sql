CREATE DATABASE IF NOT EXISTS exchange;
use exchange;

-- Create the users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    user_pwd_hash VARCHAR(255) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE
);

-- Create the currency table
CREATE TABLE currency (
    currency_id INT PRIMARY KEY AUTO_INCREMENT,
    currency_name VARCHAR(50) NOT NULL UNIQUE,
    currency_symbol VARCHAR(10) NOT NULL UNIQUE
);

Insert into currency (currency_id, currency_name, currency_symbol) values   
(1, 'US Dollar', '$'),
(2, 'Euro', '€'),
(3, 'British Pound', '£'),
(4, 'Japanese Yen', '¥'),
(5, 'Swiss Franc', 'CHF');

Insert into users (user_id, user_name, user_pwd_hash, user_email) values
(1, 'john_doe', 'hashed_password_123', 'john.doe@example.com'),
(2, 'jane_smith', 'hashed_password_456', 'jane.smith@example.com');