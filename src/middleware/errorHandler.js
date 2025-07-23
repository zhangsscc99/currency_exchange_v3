const { logger } = require('../utils/logger');

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(`错误: ${error.message}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // 默认错误响应
  let response = {
    success: false,
    message: '服务器内部错误',
    error_code: 'INTERNAL_ERROR'
  };

  // MySQL错误处理
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        response.message = '数据已存在，不能重复创建';
        response.error_code = 'DUPLICATE_ENTRY';
        return res.status(409).json(response);
      
      case 'ER_NO_REFERENCED_ROW_2':
        response.message = '引用的数据不存在';
        response.error_code = 'FOREIGN_KEY_CONSTRAINT';
        return res.status(400).json(response);
      
      case 'ER_ROW_IS_REFERENCED_2':
        response.message = '数据正在被使用，无法删除';
        response.error_code = 'REFERENCED_DATA';
        return res.status(400).json(response);
      
      case 'ER_DATA_TOO_LONG':
        response.message = '数据长度超出限制';
        response.error_code = 'DATA_TOO_LONG';
        return res.status(400).json(response);
      
      case 'ER_BAD_NULL_ERROR':
        response.message = '必填字段不能为空';
        response.error_code = 'NULL_VALUE_ERROR';
        return res.status(400).json(response);
      
      case 'ECONNREFUSED':
        response.message = '数据库连接失败';
        response.error_code = 'DATABASE_CONNECTION_ERROR';
        return res.status(503).json(response);
    }
  }

  // 业务逻辑错误
  if (err.message.includes('已存在')) {
    response.message = err.message;
    response.error_code = 'CONFLICT';
    return res.status(409).json(response);
  }

  if (err.message.includes('不存在') || err.message.includes('未找到')) {
    response.message = err.message;
    response.error_code = 'NOT_FOUND';
    return res.status(404).json(response);
  }

  if (err.message.includes('验证失败') || err.message.includes('无效')) {
    response.message = err.message;
    response.error_code = 'VALIDATION_ERROR';
    return res.status(400).json(response);
  }

  if (err.message.includes('权限') || err.message.includes('未授权')) {
    response.message = err.message;
    response.error_code = 'UNAUTHORIZED';
    return res.status(401).json(response);
  }

  // 开发环境显示详细错误信息
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      message: err.message,
      stack: err.stack
    };
  }

  res.status(500).json(response);
};

// 404处理中间件
const notFoundHandler = (req, res, next) => {
  const response = {
    success: false,
    message: `未找到路由: ${req.method} ${req.originalUrl}`,
    error_code: 'ROUTE_NOT_FOUND'
  };
  
  logger.warn(`404错误: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json(response);
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 