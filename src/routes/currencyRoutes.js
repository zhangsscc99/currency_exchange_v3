const express = require('express');
const router = express.Router();

const CurrencyController = require('../controllers/currencyController');
const { validateUpdateCurrency } = require('../middleware/validation');

// 货币路由定义 - GET和PUT功能

// GET /api/v1/currencies - 获取所有货币
router.get('/', CurrencyController.getAllCurrencies);

// GET /api/v1/currencies/:id - 根据ID获取货币
router.get('/:id', CurrencyController.getCurrencyById);

// PUT /api/v1/currencies/:id - 更新货币（主要功能）
router.put('/:id', validateUpdateCurrency, CurrencyController.updateCurrency);

module.exports = router; 