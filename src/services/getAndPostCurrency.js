// index.js
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(cors());  // 允许所有跨域请求
// 使用中间件解析 JSON 请求体
app.use(express.json());

// 创建 MySQL 连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          // 修改为你的数据库用户名
  password: 'wyt!!010611ABC',          // 修改为你的数据库密码
  database: 'exchange'   // 数据库名
});

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('成功连接到 MySQL 数据库');
  }
});

// GET /currency - 获取所有货币数据
app.get('/currency', (req, res) => {
  const query = 'SELECT * FROM currency';
  db.query(query, (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      return res.status(500).json({ error: '数据库查询失败' });
    }
    res.json(results);
  });
});

// POST 接口：新增 currency
app.post('/currency', (req, res) => {
    const { currency_name, currency_symbol } = req.body;
  
    if (!currency_name || !currency_symbol) {
      return res.status(400).json({ error: '缺少参数 currency_name 或 currency_symbol' });
    }
  
    const query = 'INSERT INTO currency (currency_name, currency_symbol) VALUES (?, ?)';
    db.query(query, [currency_name, currency_symbol], (err, result) => {
      if (err) {
        console.error('插入失败:', err);
        return res.status(500).json({ error: '插入数据库失败', details: err.code });
      }
      res.status(201).json({ message: '货币添加成功', currency_id: result.insertId });
    });
  });



// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
