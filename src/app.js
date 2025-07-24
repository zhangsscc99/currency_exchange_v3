require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

const { logger } = require('./utils/logger');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 导入路由
const currencyRoutes = require('./routes/currencyRoutes');

// 创建Express应用
const app = express();

// 环境变量
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 创建必要的目录
const createDirectories = () => {
  const directories = ['logs', 'public'];
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`创建目录: ${dir}`);
    }
  });
};

// 安全中间件 - 调整CSP以允许内联样式和脚本
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000"],
    },
  },
}));

// CORS配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200 // 支持旧版浏览器
};
app.use(cors(corsOptions));

// 压缩响应
app.use(compression());

// 静态文件服务 - 提供前端页面
app.use(express.static(path.join(__dirname, '..', 'public')));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API限流
if (process.env.RATE_LIMIT_ENABLED !== 'false') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100次请求
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试',
      error_code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/currencies', limiter);
}

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// API路由 - 简化路径，去掉 /api/v1 前缀
app.use('/currencies', currencyRoutes);

// Swagger文档
if (process.env.SWAGGER_ENABLED !== 'false') {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "货币兑换API文档"
    }));
    logger.info('Swagger文档已启用: /api-docs');
  } catch (error) {
    logger.warn('无法加载Swagger文档:', error.message);
  }
}

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        api: 'running'
      }
    };
    
    res.status(dbStatus ? 200 : 503).json(healthStatus);
  } catch (error) {
    logger.error('健康检查失败:', error.message);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: '服务不可用'
    });
  }
});

// 根路径 - 重定向到Vue.js版本的前端页面
app.get('/', (req, res) => {
  res.redirect('/vue-index.html');
});

// API信息端点
app.get('/api', (req, res) => {
  res.json({
    message: '货币兑换API v3',
    version: '3.0.0',
    documentation: '/api-docs',
    frontend: '/',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 优雅关闭处理
const gracefulShutdown = (signal) => {
  logger.info(`收到 ${signal} 信号，开始优雅关闭...`);
  
  server.close(() => {
    logger.info('HTTP服务器已关闭');
    process.exit(0);
  });
  
  // 强制关闭超时
  setTimeout(() => {
    logger.error('强制关闭应用');
    process.exit(1);
  }, 30000);
};

// 启动服务器
const startServer = async () => {
  try {
    // 创建必要目录
    createDirectories();
    
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('数据库连接失败，服务器启动中止');
      process.exit(1);
    }
    
    // 启动服务器
    const server = app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${NODE_ENV}`);
      logger.info(`前端页面: http://localhost:${PORT}`);
      logger.info(`API文档: http://localhost:${PORT}/api-docs`);
      logger.info(`健康检查: http://localhost:${PORT}/health`);
    });
    
    // 设置全局server变量用于优雅关闭
    global.server = server;
    
    // 注册信号处理
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的Promise拒绝:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('服务器启动失败:', error.message);
    process.exit(1);
  }
};

// 只有在直接运行此文件时才启动服务器
if (require.main === module) {
  startServer();
}

module.exports = app; 