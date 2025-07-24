const CurrencyService = require('../services/currencyService');
const { logger } = require('../utils/logger');

// 统一的响应格式
const sendResponse = (res, statusCode, success, data = null, message = null, errorCode = null) => {
  const response = {
    success,
    ...(message && { message }),
    ...(errorCode && { error_code: errorCode }),
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

// 错误处理装饰器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

class CurrencyController {
  // 获取所有货币 - 简化返回格式
  static getAllCurrencies = asyncHandler(async (req, res) => {
    const currencies = await CurrencyService.getAllCurrencies();
    
    // 直接返回原始格式的货币数组，类似 getAndPostCurrency.js 风格
    const result = currencies.map(currency => ({
      currency_id: currency.currency_id,
      currency_name: currency.currency_name,
      currency_symbol: currency.currency_symbol
    }));
    
    res.json(result);
  });

  // 根据ID获取货币 - 简化返回格式
  static getCurrencyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const currency = await CurrencyService.getCurrencyById(id);
    
    if (!currency) {
      return res.status(404).json({ error: '货币不存在' });
    }
    
    res.json({
      currency_id: currency.currency_id,
      currency_name: currency.currency_name,
      currency_symbol: currency.currency_symbol
    });
  });

  // 创建新货币 - POST方法
  static createCurrency = asyncHandler(async (req, res) => {
    const { currency_name, currency_symbol } = req.body;

    // 验证必填字段
    if (!currency_name || !currency_symbol) {
      return res.status(400).json({ 
        error: '缺少必填字段：currency_name 和 currency_symbol 都是必需的' 
      });
    }

    // 调用服务层创建货币
    const newCurrency = await CurrencyService.createCurrency({
      currency_name: currency_name.trim(),
      currency_symbol: currency_symbol.trim()
    });

    logger.info(`用户创建了新货币: ${JSON.stringify(newCurrency)}`);
    
    res.status(201).json({
      currency_id: newCurrency.currency_id,
      currency_name: newCurrency.currency_name,
      currency_symbol: newCurrency.currency_symbol,
      message: '货币创建成功'
    });
  });

  // 更新货币 - 简化返回格式
  static updateCurrency = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = {};

    // 只包含提供的字段
    if (req.body.currency_name !== undefined) {
      updateData.currency_name = req.body.currency_name.trim();
    }
    
    if (req.body.currency_symbol !== undefined) {
      updateData.currency_symbol = req.body.currency_symbol.trim();
    }

    // 调用服务层更新货币
    const updatedCurrency = await CurrencyService.updateCurrency(id, updateData);
    
    if (!updatedCurrency) {
      return res.status(404).json({ error: '货币不存在' });
    }

    logger.info(`用户更新了货币: ID ${id}, 新数据: ${JSON.stringify(updateData)}`);
    
    res.json({
      currency_id: updatedCurrency.currency_id,
      currency_name: updatedCurrency.currency_name,
      currency_symbol: updatedCurrency.currency_symbol,
      message: '货币更新成功'
    });
  });
}

module.exports = CurrencyController; 