const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');

// 数据库连接池配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'wyt!!010611ABC',

  database: process.env.DB_NAME || 'exchange',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 不指定数据库的连接配置（用于创建数据库）
const dbConfigWithoutDatabase = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

// 创建连接池
let pool;

// 初始化数据库
const initializeDatabase = async () => {
  let connection;
  try {
    logger.info('开始初始化数据库...');
    
    // 首先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection(dbConfigWithoutDatabase);
    logger.info('MySQL服务器连接成功');

    // 创建数据库
    const databaseName = process.env.DB_NAME || 'exchange';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    logger.info(`数据库 '${databaseName}' 创建成功`);

    // 选择数据库
    await connection.execute(`USE \`${databaseName}\``);
    logger.info(`已切换到数据库 '${databaseName}'`);

    // 创建用户表
    logger.info('开始创建用户表...');
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        user_name VARCHAR(50) NOT NULL UNIQUE,
        user_pwd_hash VARCHAR(255) NOT NULL,
        user_email VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createUsersTable);
    logger.info('✅ 用户表创建成功');

    // 创建货币表
    logger.info('开始创建货币表...');
    const createCurrencyTable = `
      CREATE TABLE IF NOT EXISTS currency (
        currency_id INT PRIMARY KEY AUTO_INCREMENT,
        currency_name VARCHAR(50) NOT NULL UNIQUE,
        currency_symbol VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createCurrencyTable);
    logger.info('✅ 货币表创建成功');

    // 检查货币表是否为空
    logger.info('检查现有货币数据...');
    const [currencyCount] = await connection.execute('SELECT COUNT(*) as count FROM currency');
    logger.info(`货币表中现有 ${currencyCount[0].count} 条记录`);

    // 插入一些初始货币数据（如果表为空）
    if (currencyCount[0].count === 0) {
      logger.info('开始插入初始货币数据...');
      
      // 分别插入每个货币，避免批量插入可能的问题
      const currencies = [
        ['美元', '$'],
        ['欧元', '€'],
        ['英镑', '£'],
        ['日元', '¥'],
        ['人民币', 'CNY']
      ];

      for (const [name, symbol] of currencies) {
        try {
          await connection.execute(
            'INSERT IGNORE INTO currency (currency_name, currency_symbol) VALUES (?, ?)',
            [name, symbol]
          );
          logger.info(`✅ 插入货币: ${name} (${symbol})`);
        } catch (insertError) {
          logger.warn(`插入货币失败 ${name}: ${insertError.message}`);
        }
      }
      
      logger.info('✅ 初始货币数据插入完成');
    } else {
      logger.info('货币表已有数据，跳过初始数据插入');
    }

    await connection.end();
    logger.info('🎉 数据库初始化完成');
    return true;

  } catch (error) {
    logger.error('❌ 数据库初始化失败:');
    logger.error(`错误代码: ${error.code}`);
    logger.error(`错误信息: ${error.message}`);
    logger.error(`SQL状态: ${error.sqlState || 'N/A'}`);
    logger.error(`错误号: ${error.errno || 'N/A'}`);
    
    if (error.sql) {
      logger.error(`失败的SQL: ${error.sql}`);
    }
    
    // 常见错误的解决方案
    switch(error.code) {
      case 'ER_ACCESS_DENIED_ERROR':
        logger.error('💡 解决方案: 检查MySQL用户名和密码是否正确');
        break;
      case 'ER_BAD_DB_ERROR':
        logger.error('💡 解决方案: 数据库不存在，检查权限');
        break;
      case 'ER_DBACCESS_DENIED_ERROR':
        logger.error('💡 解决方案: 用户没有创建数据库的权限');
        break;
      case 'ER_TABLEACCESS_DENIED_ERROR':
        logger.error('💡 解决方案: 用户没有创建表的权限');
        break;
      default:
        logger.error('💡 建议: 检查MySQL服务状态和用户权限');
    }
    
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        logger.error('关闭连接时出错:', closeError.message);
      }
    }
    return false;
  }
};

// 创建连接池
const createConnectionPool = () => {
  pool = mysql.createPool(dbConfig);
  logger.info('数据库连接池创建成功');
};

// 测试数据库连接
const testConnection = async () => {
  try {
    if (!pool) {
      createConnectionPool();
    }
    
    const connection = await pool.getConnection();
    logger.info('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    logger.error('数据库连接失败:', error.message);
    logger.error('错误代码:', error.code);
    
    // 如果连接失败，尝试初始化数据库
    if (error.code === 'ER_BAD_DB_ERROR' || error.code === 'ECONNREFUSED') {
      logger.info('尝试初始化数据库...');
      const initResult = await initializeDatabase();
      
      if (initResult) {
        // 重新创建连接池
        createConnectionPool();
        // 再次测试连接
        try {
          const connection = await pool.getConnection();
          logger.info('数据库连接成功（初始化后）');
          connection.release();
          return true;
        } catch (retryError) {
          logger.error('初始化后仍连接失败:', retryError.message);
          return false;
        }
      }
    }
    
    return false;
  }
};

// 执行查询的辅助函数
const executeQuery = async (query, params = []) => {
  try {
    if (!pool) {
      createConnectionPool();
    }
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    logger.error('数据库查询错误:', error.message);
    throw error;
  }
};

// 事务处理
const executeTransaction = async (queries) => {
  if (!pool) {
    createConnectionPool();
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    logger.error('事务执行失败:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  initializeDatabase
}; 