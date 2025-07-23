const express = require('express');
const router = express.Router();

const CurrencyController = require('../controllers/currencyController');
const {
  validateCurrencyId,
  validateCreateCurrency,
  validateUpdateCurrency,
  validateGetCurrencies
} = require('../middleware/validation');

// 货币路由定义

// GET /api/v1/currencies - 获取所有货币（支持分页和搜索）
router.get('/', CurrencyController.getAllCurrencies);

// GET /api/v1/currencies/search - 搜索货币
router.get('/search', CurrencyController.searchCurrencies);

// GET /api/v1/currencies/check-name - 检查货币名称可用性
router.get('/check-name', CurrencyController.checkNameAvailability);

// GET /api/v1/currencies/check-symbol - 检查货币符号可用性
router.get('/check-symbol', CurrencyController.checkSymbolAvailability);

// POST /api/v1/currencies - 创建新货币
router.post('/', validateCreateCurrency, CurrencyController.createCurrency);

// GET /api/v1/currencies/:id - 根据ID获取货币
router.get('/:id', validateCurrencyId, CurrencyController.getCurrencyById);

// PUT /api/v1/currencies/:id - 更新货币（这是主要的功能）
router.put('/:id', validateUpdateCurrency, CurrencyController.updateCurrency);

// DELETE /api/v1/currencies/:id - 删除货币
router.delete('/:id', validateCurrencyId, CurrencyController.deleteCurrency);

module.exports = router; 