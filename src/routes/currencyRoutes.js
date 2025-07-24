const express = require('express');
const router = express.Router();

const CurrencyController = require('../controllers/currencyController');
const { validateCreateCurrency, validateUpdateCurrency } = require('../middleware/validation');

// 货币路由定义 - GET、POST和PUT功能

// GET /currencies - 获取所有货币
router.get('/', CurrencyController.getAllCurrencies);

// GET /currencies/:id - 根据ID获取货币
router.get('/:id', CurrencyController.getCurrencyById);

// POST /currencies - 创建新货币
router.post('/', validateCreateCurrency, CurrencyController.createCurrency);

// PUT /currencies/:id - 更新货币
router.put('/:id', validateUpdateCurrency, CurrencyController.updateCurrency);

module.exports = router; 