@echo off
echo 启动货币兑换系统...
echo.

echo 启动后端服务 (端口3000)...
start "后端服务" cmd /k "node src/app.js"

echo 等待2秒...
timeout /t 2 /nobreak >nul

echo 启动前端服务 (端口8080)...
start "前端服务" cmd /k "cd frontend && npm run dev"

echo.
echo 服务启动完成！
echo 后端: http://localhost:3000
echo 前端: http://localhost:8080
echo API文档: http://localhost:3000/api-docs
echo.
pause 