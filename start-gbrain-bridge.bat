@echo off
REM 🧠 启动 gbrain 桥接服务器
REM 让螃蟹助手前端能调用 gbrain CLI

echo ================================
echo   🦀 螃蟹助手 - gbrain 桥接
echo ================================
echo.

REM 检查 node
where node >nul 2>&1
if errorlevel 1 (
  echo ❌ 未找到 node，请先安装 Node.js
  pause
  exit /b 1
)

REM 检查 gbrain
gbrain version >nul 2>&1
if errorlevel 1 (
  echo ❌ 未找到 gbrain CLI，请先运行: bun install -g github:garrytan/gbrain
  pause
  exit /b 1
)

echo ✅ node 已找到
gbrain version
echo.

echo 🚀 启动桥接服务器 http://localhost:3101
echo 💡 螃蟹助手设置中填写: http://localhost:3101
echo 🛑 按 Ctrl+C 停止
echo.

node "%~dp0gbrain-server.js"
