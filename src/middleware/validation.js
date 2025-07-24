const { body, param, validationResult } = require('express-validator');
const Currency = require('../models/Currency');

// 通用错误处理函数
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入数据验证失败',
      error_code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// 验证更新货币的数据
const validateUpdateCurrency = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('货币ID必须是大于0的整数'),
    
  body('currency_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('货币名称不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('货币名称长度必须在1-50个字符之间')
    .matches(/^[a-zA-Z\u4e00-\u9fa5\s]+$/)
    .withMessage('货币名称只能包含字母、中文和空格')
    .custom(async (value, { req }) => {
      if (value) {
        const currencyId = parseInt(req.params.id);
        const exists = await Currency.isNameExists(value, currencyId);
        if (exists) {
          throw new Error('货币名称已存在');
        }
      }
      return true;
    }),
    
  body('currency_symbol')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('货币符号不能为空')
    .isLength({ min: 1, max: 10 })
    .withMessage('货币符号长度必须在1-10个字符之间'),
    // 移除货币符号重复性检查 - 允许多个货币使用相同符号
    
  // 确保至少有一个字段需要更新
  body()
    .custom((value, { req }) => {
      const { currency_name, currency_symbol } = req.body;
      if (!currency_name && !currency_symbol) {
        throw new Error('至少需要提供一个要更新的字段（currency_name 或 currency_symbol）');
      }
      return true;
    }),
    
  handleValidationErrors
];

// 验证创建货币的数据
const validateCreateCurrency = [
  body('currency_name')
    .trim()
    .notEmpty()
    .withMessage('货币名称是必填字段')
    .isLength({ min: 1, max: 50 })
    .withMessage('货币名称长度必须在1-50个字符之间')
    .matches(/^[a-zA-Z\u4e00-\u9fa5\s]+$/)
    .withMessage('货币名称只能包含字母、中文和空格')
    .custom(async (value) => {
      const exists = await Currency.isNameExists(value);
      if (exists) {
        throw new Error('货币名称已存在');
      }
      return true;
    }),
    
  body('currency_symbol')
    .trim()
    .notEmpty()
    .withMessage('货币符号是必填字段')
    .isLength({ min: 1, max: 10 })
    .withMessage('货币符号长度必须在1-10个字符之间'),
    // 移除货币符号重复性检查 - 允许多个货币使用相同符号（如￥）
    
  handleValidationErrors
];

module.exports = {
  validateCreateCurrency,
  validateUpdateCurrency,
  handleValidationErrors
}; 