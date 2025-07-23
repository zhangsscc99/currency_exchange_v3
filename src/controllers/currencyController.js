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
  // 获取所有货币
  static getAllCurrencies = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim()
    };

    const result = await CurrencyService.getAllCurrencies(options);
    
    sendResponse(res, 200, true, {
      currencies: result.data.map(currency => currency.toJSON()),
      pagination: result.pagination
    });
  });

  // 根据ID获取货币
  static getCurrencyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const currency = await CurrencyService.getCurrencyById(id);
    
    if (!currency) {
      return sendResponse(res, 404, false, null, '货币不存在', 'NOT_FOUND');
    }
    
    sendResponse(res, 200, true, currency.toJSON());
  });

  // 创建新货币
  static createCurrency = asyncHandler(async (req, res) => {
    const { currency_name, currency_symbol } = req.body;
    
    const currencyData = {
      currency_name: currency_name.trim(),
      currency_symbol: currency_symbol.trim()
    };

    const newCurrency = await CurrencyService.createCurrency(currencyData);
    
    logger.info(`用户创建了新货币: ${newCurrency.currency_name} (${newCurrency.currency_symbol})`);
    
    sendResponse(res, 201, true, newCurrency.toJSON(), '货币创建成功');
  });

  // 更新货币 - 这是主要的PUT功能
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
      return sendResponse(res, 404, false, null, '货币不存在', 'NOT_FOUND');
    }

    logger.info(`用户更新了货币: ID ${id}, 新数据: ${JSON.stringify(updateData)}`);
    
    sendResponse(res, 200, true, updatedCurrency.toJSON(), '货币更新成功');
  });

  // 删除货币
  static deleteCurrency = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const success = await CurrencyService.deleteCurrency(id);
    
    if (!success) {
      return sendResponse(res, 404, false, null, '货币不存在', 'NOT_FOUND');
    }
    
    logger.info(`用户删除了货币: ID ${id}`);
    
    sendResponse(res, 200, true, null, '货币删除成功');
  });

  // 检查货币名称可用性
  static checkNameAvailability = asyncHandler(async (req, res) => {
    const { name } = req.query;
    const { excludeId } = req.query;
    
    if (!name) {
      return sendResponse(res, 400, false, null, '货币名称不能为空', 'VALIDATION_ERROR');
    }
    
    const isAvailable = await CurrencyService.checkNameAvailability(
      name.trim(), 
      excludeId ? parseInt(excludeId) : null
    );
    
    sendResponse(res, 200, true, { 
      available: isAvailable,
      name: name.trim()
    });
  });

  // 检查货币符号可用性
  static checkSymbolAvailability = asyncHandler(async (req, res) => {
    const { symbol } = req.query;
    const { excludeId } = req.query;
    
    if (!symbol) {
      return sendResponse(res, 400, false, null, '货币符号不能为空', 'VALIDATION_ERROR');
    }
    
    const isAvailable = await CurrencyService.checkSymbolAvailability(
      symbol.trim(), 
      excludeId ? parseInt(excludeId) : null
    );
    
    sendResponse(res, 200, true, { 
      available: isAvailable,
      symbol: symbol.trim()
    });
  });

  // 搜索货币
  static searchCurrencies = asyncHandler(async (req, res) => {
    const { q: searchTerm, page = 1, limit = 10 } = req.query;
    
    if (!searchTerm) {
      return sendResponse(res, 400, false, null, '搜索关键词不能为空', 'VALIDATION_ERROR');
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await CurrencyService.searchCurrencies(searchTerm.trim(), options);
    
    sendResponse(res, 200, true, {
      currencies: result.data.map(currency => currency.toJSON()),
      pagination: result.pagination,
      search_term: searchTerm.trim()
    });
  });
}

module.exports = CurrencyController; 