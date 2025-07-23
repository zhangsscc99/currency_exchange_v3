CREATE DATABASE IF NOT EXISTS exchange;
use exchange;

-- Create the users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    user_pwd_hash VARCHAR(255) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
);

-- Create the currency table
CREATE TABLE currency (
    currency_id INT PRIMARY KEY AUTO_INCREMENT,
    currency_name VARCHAR(50) NOT NULL UNIQUE,
    currency_symbol VARCHAR(10) NOT NULL UNIQUE
);