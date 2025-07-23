# Currency Exchange API v3 💱

一个功能完整的货币兑换系统API，支持实时汇率查询、货币转换、历史数据等功能。

## 🚀 技术栈

### 后端 (Node.js)
- **Express.js** - Web框架
- **MongoDB** - 数据库 (使用Mongoose)
- **JWT** - 身份验证
- **Swagger/OpenAPI 3.0** - API文档
- **Axios** - HTTP客户端
- **Node-cron** - 定时任务

### 前端 (Vue.js)
- **Vue 3** - 前端框架
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - API请求
- **Element Plus** - UI组件库

## 📋 功能特性

- ✅ 货币管理 (CRUD操作)
- ✅ 实时汇率查询
- ✅ 货币转换计算
- ✅ 历史汇率数据
- ✅ 用户认证与授权
- ✅ 转换历史记录
- ✅ API限流保护
- ✅ 完整的API文档
- ✅ 分页支持
- ✅ 搜索过滤功能

## 🛠️ 安装与运行

### 后端设置

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd currency_exchange_v3
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   创建 `.env` 文件：
   ```env
   # 服务器配置
   PORT=3000
   NODE_ENV=development
   
   # 数据库配置
   MONGODB_URI=mongodb://localhost:27017/currency_exchange
   
   # JWT配置
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRE=7d
   
   # 汇率API配置
   EXCHANGE_API_KEY=your-exchange-api-key
   EXCHANGE_API_URL=https://api.exchangerate-api.com/v4/latest
   
   # 日志配置
   LOG_LEVEL=info
   ```

4. **启动服务器**
   ```bash
   # 开发模式
   npm run dev
   
   # 生产模式
   npm start
   ```

### 前端设置

1. **进入前端目录**
   ```bash
   cd frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 📚 API文档

### Swagger UI
API启动后，访问：
- 开发环境: http://localhost:3000/api-docs
- Swagger独立服务: http://localhost:3001 (运行 `npm run swagger`)

### 主要端点

#### 货币管理
```http
GET    /api/v1/currencies           # 获取所有货币
POST   /api/v1/currencies           # 创建新货币
GET    /api/v1/currencies/{id}      # 获取特定货币
PUT    /api/v1/currencies/{id}      # 更新货币
DELETE /api/v1/currencies/{id}      # 删除货币
```

#### 汇率查询
```http
GET    /api/v1/exchange-rates       # 获取汇率
POST   /api/v1/exchange-rates       # 更新汇率
```

#### 货币转换
```http
POST   /api/v1/convert              # 货币转换
GET    /api/v1/convert/history      # 转换历史
```

#### 用户认证
```http
POST   /api/v1/auth/register        # 用户注册
POST   /api/v1/auth/login           # 用户登录
```

### 请求示例

#### 货币转换
```bash
curl -X POST http://localhost:3000/api/v1/convert \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "amount": 100
  }'
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "EUR",
    "amount": 100.00,
    "converted_amount": 85.50,
    "exchange_rate": 0.855,
    "date": "2024-01-15",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🗂️ 项目结构

```
currency_exchange_v3/
├── src/
│   ├── controllers/         # 控制器层
│   ├── models/             # 数据模型
│   ├── routes/             # 路由定义
│   ├── middleware/         # 中间件
│   ├── services/           # 业务逻辑
│   ├── utils/              # 工具函数
│   ├── config/             # 配置文件
│   └── app.js              # 应用入口
├── frontend/               # Vue.js前端
│   ├── src/
│   │   ├── components/     # Vue组件
│   │   ├── views/          # 页面视图
│   │   ├── store/          # Pinia状态管理
│   │   ├── router/         # 路由配置
│   │   └── utils/          # 工具函数
│   ├── public/
│   └── package.json
├── tests/                  # 测试文件
├── docs/                   # 文档
├── swagger.yaml            # API文档
├── package.json
├── .env.example
└── README.md
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 运行代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix
```

## 🌐 支持的货币

系统支持主要的国际货币，包括但不限于：
- USD (美元)
- EUR (欧元)
- GBP (英镑)
- JPY (日元)
- CNY (人民币)
- CAD (加拿大元)
- AUD (澳大利亚元)
- CHF (瑞士法郎)

## 🔒 安全特性

- JWT token认证
- 密码加密存储
- API限流保护
- CORS配置
- Helmet安全头
- 输入验证和清理

## 📈 性能优化

- 响应压缩
- 数据库索引
- 缓存机制
- 分页查询
- 连接池管理

## 🚀 部署

### Docker部署
```bash
# 构建镜像
docker build -t currency-exchange-api .

# 运行容器
docker run -p 3000:3000 --env-file .env currency-exchange-api
```

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目链接: [GitHub Repository](https://github.com/yourusername/currency-exchange-api)
- 问题反馈: [Issues](https://github.com/yourusername/currency-exchange-api/issues)

## 🙏 致谢

- [ExchangeRate-API](https://exchangerate-api.com/) - 汇率数据提供
- [Swagger](https://swagger.io/) - API文档工具
- [Element Plus](https://element-plus.org/) - Vue.js UI组件库
