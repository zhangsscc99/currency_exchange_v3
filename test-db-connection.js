require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || 'n3u3da!',
    database: process.env.DB_NAME || 'exchange',
    port: process.env.DB_PORT || 3306
  };

  console.log('尝试连接数据库...');
  console.log('配置:', {
    host: config.host,
    user: config.user,
    database: config.database,
    port: config.port,
    password: config.password ? '***' : '(空)'
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功！');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 查询测试成功:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error('错误代码:', error.code);
    console.error('错误信息:', error.message);
    
    // 常见错误解释
    switch(error.code) {
      case 'ECONNREFUSED':
        console.log('💡 解决方案: MySQL服务未启动，请启动MySQL服务');
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        console.log('💡 解决方案: 用户名或密码错误，请检查.env文件');
        break;
      case 'ER_BAD_DB_ERROR':
        console.log('💡 解决方案: 数据库不存在，请创建exchange数据库');
        break;
      default:
        console.log('💡 请检查数据库配置和网络连接');
    }
  }
}

testConnection(); 