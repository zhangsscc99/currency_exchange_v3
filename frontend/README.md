# Currency Exchange Frontend

这是货币兑换系统的Vue.js前端应用。

## 功能特点

- ✨ 现代化的Vue 3 + Vite开发环境
- 🎨 响应式设计，支持移动端
- 🚀 快速的API调用和实时响应
- 📱 直观的用户界面
- 🔧 完整的货币管理功能

## API功能

### 系统状态
- **健康检查** - 检查后端服务状态和数据库连接
- **API信息** - 查看后端API版本和端点信息

### 货币管理
- **获取所有货币** - 查看系统中的所有货币
- **根据ID查询货币** - 根据货币ID查询特定货币
- **更新货币** - 修改货币名称和符号

## 快速开始

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

前端将在 http://localhost:8080 启动

### 3. 构建生产版本
```bash
npm run build
```

### 4. 预览生产版本
```bash
npm run preview
```

## 开发环境要求

- Node.js 16+
- npm 或 yarn

## 项目结构

```
frontend/
├── index.html          # HTML入口文件
├── package.json        # 项目配置和依赖
├── vite.config.js      # Vite配置
├── src/
│   ├── main.js         # Vue应用入口
│   ├── App.vue         # 主组件
│   └── style.css       # 全局样式
└── README.md           # 项目说明
```

## 技术栈

- **Vue 3** - 响应式前端框架
- **Vite** - 快速构建工具
- **Axios** - HTTP客户端
- **CSS3** - 现代样式和动画
- **Font Awesome** - 图标库

## 使用说明

1. **启动后端服务** - 确保后端服务在端口3000运行
2. **启动前端服务** - 在端口8080启动前端开发服务器
3. **API调用** - 使用界面中的按钮调用各种后端API
4. **货币管理** - 查看、查询和更新货币信息

## 代理配置

前端通过Vite代理将 `/api` 请求转发到后端 `http://localhost:3000`

## 环境配置

- **开发环境**: 使用Vite开发服务器，支持热重载
- **生产环境**: 构建静态文件，可部署到任何静态文件服务器

## 浏览器支持

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+ 