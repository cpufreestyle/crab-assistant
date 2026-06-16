# gbrain 集成到 crab-assistant — 任务产物

**时间：** 2026-06-16 15:10 GMT+8  
**目标：** 将 gbrain AI 知识图谱记忆引擎集成到螃蟹助手前端 PWA

---

## ✅ 完成内容

### 新增文件

| 文件 | 说明 |
|------|------|
| `gbrain-server.js` | gbrain CLI 桥接服务器，包装为 REST API（端口 3101） |
| `gbrain.js` | 前端 GbrainClient 模块，封装所有 API 调用 |
| `start-gbrain-bridge.bat` | Windows 一键启动桥接服务器 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `config.js` | 添加 `gbrain` 配置节（bridgeUrl 等） |
| `skills.js` | 添加 `gbrain` 技能（icon 🧠，color #8b5cf6），添加 `_doGbrain()` 路由 |
| `app.js` | 添加 `loadGbrainPage()` / `doCrabQuery()` / `doGbrainSearch()` / `testGbrain()` / `refreshGbrainStats()` / `showGbrainResult()` 方法；`switchTab()` 增加 `gbrain` 分支；设置面板增加 gbrain 配置区 |
| `index.html` | 添加 `🧠 大脑` 面板 HTML；加载 `gbrain.js`；设置面板增加桥接服务器配置区 |

---

## 🔌 架构说明

```
螃蟹助手前端 (PWA)
       │
       │ fetch()  REST API
       ▼
gbrain-server.js (Node.js, 端口 3101)
       │
       │ execSync()  调用 gbrain CLI
       ▼
gbrain (Bun/Node CLI)
       │
       │ PGLite 本地数据库
       ▼
C:\Users\michael\gbrain\
```

**为什么需要桥接服务器？**  
螃蟹助手是纯前端 PWA，浏览器无法调用本地 CLI。`gbrain-server.js` 在本地跑一个轻量 Node.js HTTP 服务，把 gbrain CLI 命令包装成 REST API，前端通过 `fetch()` 调用。

---

## 🚀 使用步骤

### 1. 启动桥接服务器
```bash
# 方式一：命令行
node gbrain-server.js

# 方式二：双击
start-gbrain-bridge.bat
```

### 2. 配置螃蟹助手
1. 打开螃蟹助手
2. 点右上角 ⚙️ 设置
3. 找到「🧠 gbrain 桥接服务器」 section
4. 确认地址为 `http://localhost:3101`
5. 点「测试」— 应显示「✅ 已连接」

### 3. 使用
1. 切换到侧边栏「🧠 大脑」标签
2. 在「综合查询」输入问题（gbrain 会返回综合答案）
3. 或用「关键词搜索」搜索大脑中的页面

---

## 📡 API 端点（gbrain-server.js）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/query` | POST | 综合查询（返回答案） |
| `/search?q=xxx` | GET | 关键词搜索 |
| `/pages` | GET | 列出所有页面 |
| `/page?slug=xxx` | GET | 读取页面 |
| `/save` | POST | 写入页面 |
| `/stats` | GET | 大脑统计 |
| `/embed` | POST | 生成 embedding |
| `/brainstorm` | POST | 创意发散 |
| `/graph?slug=xxx` | GET | 知识图谱遍历 |
| `/doctor` | GET | 完整健康检查 |

---

## ⚠️ 已知限制

1. **gbrain CLI 必须已安装** — `bun install -g github:garrytan/gbrain`
2. **gbrain 必须已 init** — `gbrain init`（已完成，PGLite + nomic-embed-text）
3. **桥接服务器必须常驻运行** — 可以注册为 Windows 服务或开机启动
4. **CORS 已放行** — 桥接服务器允许所有来源（本地开发用）
5. **Ollama 必须运行** — gbrain 依赖 Ollama 做 embedding（`ollama serve`）

---

## 📋 待完成（阶段二剩余）

- [ ] 浏览器端实际连接测试
- [ ] 查询功能端到端测试
- [ ] 知识图谱可视化（前端渲染 force-directed graph）
- [ ] gbrain 结果融入对话（AI 调用 gbrain 前自动查询）

---

## 📝 相关文档

- `DEV_PLAN.md` — 已更新，标记阶段二大部分完成
- `gbrain-server.js` — 桥接服务器源码（含完整 API 文档注释）
- `gbrain.js` — 前端客户端模块
