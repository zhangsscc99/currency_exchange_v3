const winston = require('winston');
const path = require('path');

// 定义日志级别颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

winston.addColors(colors);

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}${
      info.stack ? '\n' + info.stack : ''
    }`;
  })
);

// 控制台格式（带颜色）
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    return `${info.timestamp} [${info.level}]: ${info.message}`;
  })
);

// 创建logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  // 处理未捕获的异常
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log')
    })
  ],
  // 处理Promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log')
    })
  ]
});

// 在生产环境中不记录debug级别
if (process.env.NODE_ENV === 'production') {
  logger.transports.forEach((transport) => {
    if (transport.name === 'console') {
      transport.level = 'info';
    }
  });
}

module.exports = { logger }; 