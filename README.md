# 🦀 螃蟹助手 (Crab Assistant)

> 融合 **Hermes Agent (NousResearch)** + **gbrain AI 知识图谱** + **Memory Palace** + **Skills 插件系统** 的全能本地 AI 助手

[![Version](https://img.shields.io/badge/version-v0.3.0-orange)](https://github.com/cpufreestyle/crab-assistant/releases/tag/v0.3.0)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Gitee](https://img.shields.io/badge/mirror-Gitee-blue)](https://gitee.com/cpufreestyle/crab-assistant)

---

## 🏗️ 架构

```
┌──────────────────────────────────────────────────────────────────┐
│                      🦀 螃蟹助手 (PWA)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  💬 对话  │  │ 🏛️ 记忆  │  │ 🧠 大脑  │  │ 🔧 技能  │    │
│  │  (Chat)   │  │(Palace)  │  │(gbrain)  │  │(Skills)  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └───────────────┴───────────────┴───────────────┘          │
│                                 ▼                               │
│                  ┌─────────────────────────────┐                 │
│                  │     ☤ Hermes Agent          │                 │
│                  │  (NousResearch)            │                 │
│                  │  - 真正的 Agent 框架        │                 │
│                  │  - 记忆 + 工具 + Skills     │                 │
│                  └─────────────┬───────────────┘                 │
│                                ▼                                │
│                  ┌─────────────────────────────┐                 │
│                  │  🦎 LM Studio / Ollama     │                 │
│                  │  (本地 LLM，无需联网)        │                 │
│                  └─────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

⚠️ **注意：** 使用真正的 Hermes Agent (NousResearch)，不是 HybridClaw

---

## ✨ 功能特性

### 💬 对话问答
基于 OpenAI 兼容 API，支持本地 LM Studio / Ollama，无需云端

### 🏛️ 记忆宫殿 (Memory Palace)
- **Write Guard** — 防重复、防空、防超长写入保护
- **混合检索** — 关键词 + 字符相似度 + 时间衰减 + 优先级 + 访问频率
- **快照回滚** — 每次写入前自动备份，可一键还原
- **分类标签** — 自由分类 + 系统分类

### 🧠 gbrain AI 知识图谱 (v0.3.0 新增)
- **知识图谱查询** — 支持 `query` / `search` / `brainstorm` / `graph`
- **本地向量引擎** — Ollama `nomic-embed-text` (768维)
- **双轨记忆** — gbrain 知识图谱 + Memory Palace 本地记忆并存
- **67 个 skillpack** — book-club、article-enrichment 等预置模板
- **桥接服务** — `gbrain-server.js` HTTP API (端口 3101)

### 🔧 Skills 插件系统
内置 6 个技能：`chat` / `memory` / `code` / `search` / `todo` / `gbrain`

### 📱 PWA 支持
可安装为独立桌面应用，支持离线使用

---

## 📂 项目结构

```
crab-assistant/
├── index.html          # 主界面 (PWA)
├── app.js              # 主程序逻辑
├── memory.js           # 记忆宫殿引擎
├── skills.js           # Skills 插件系统
├── config.js           # 配置文件
├── gbrain.js           # gbrain 前端客户端
├── gbrain-server.js    # gbrain 桥接服务器
├── manifest.json       # PWA 清单
├── sw.js               # Service Worker
└── start-gbrain-bridge.bat  # gbrain 一键启动脚本
```

---

## 🚀 快速开始

### 方式一：直接打开
1. 双击 `index.html` 在浏览器中打开
2. 点击右上角 ⚙️ 配置模型（默认连接 LM Studio）
3. 开始对话！

### 方式二：配合 gbrain（推荐）
1. 安装 [gbrain](https://github.com/garrytan/gbrain)：`bun install -g github:garrytan/gbrain`
2. 初始化：`gbrain init`（选择 Ollama nomic-embed-text）
3. 双击 `start-gbrain-bridge.bat` 启动桥接服务
4. 打开 `index.html` → 🧠 大脑 标签页

---

## ⚙️ 模型配置

| 模式 | 说明 | 默认地址 |
|------|------|----------|
| **LM Studio** | 本地运行，推荐 | `http://localhost:1234/v1` |
| **Ollama** | 本地运行 | `http://localhost:11434/v1` |
| **OpenAI** | 云端 API | `https://api.openai.com/v1` |
| **国内模型** | 通义/智谱/DeepSeek 等 | 各平台 API 地址 |

在设置面板切换模式，LM Studio 模式自动隐藏 API Key 输入框。

---

## 🧠 gbrain 集成说明

gbrain 是一个本地优先的 AI 记忆系统，基于知识图谱存储和检索信息。

**前置依赖：**
- [Bun](https://bun.sh) — 运行 gbrain CLI
- [Ollama](https://ollama.com) — 运行 `nomic-embed-text` 向量模型
- gbrain CLI — `bun install -g github:garrytan/gbrain`

**启动流程：**
```bash
# 1. 启动 Ollama（如未运行）
ollama serve

# 2. 初始化 gbrain（首次）
gbrain init
# 选择: Ollama → nomic-embed-text

# 3. 启动桥接服务器
start-gbrain-bridge.bat
# 或手动: bun x gbrain serve --http & node gbrain-server.js

# 4. 打开 crab-assistant，进入 🧠 大脑 标签页
```

---

## 🔗 参考项目

| 项目 | 来源 | 说明 |
|------|------|------|
| 🦞 OpenClaw | [GitHub](https://github.com/openclaw/openclaw) | 多渠道 Gateway + Skills 系统 |
| ☤ **Hermes Agent** | **[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)** | **真正的 Hermes Agent — The agent that grows with you** |
| 🧠 **gbrain** | **[garrytan/gbrain](https://github.com/garrytan/gbrain)** | **本地 AI 记忆大脑 (v0.3.0 集成)** |
| 🏛️ Memory Palace | 本地实现 | 持久记忆 + 混合检索 |

---

## 📝 更新日志

### v0.3.0 (2026-06-16) — 🧠 gbrain AI 集成
- ✨ 新增 gbrain 知识图谱记忆引擎
- ✨ 新增 🧠 大脑 标签页（查询/搜索/统计/脑暴/图谱）
- ✨ 新增 `gbrain-server.js` 桥接服务器
- ✨ 新增 67 个 skillpack 模板
- 🔧 更新 DEV_PLAN.md 阶段二完成

### v0.2.2
- 🐛 修正欢迎消息：明确使用 Hermes Agent
- 📋 添加修复记录 FIXES.md

### v0.2.1
- 🎨 深色主题优化（螃蟹橙渐变）
- 📱 PWA 离线支持完善

### v0.2.0
- 🏛️ 记忆宫殿引擎上线
- 🔧 Skills 插件系统

---

## 📄 License

MIT License — 自由使用、修改和分发

---

## 🌟 鸣谢

- [NousResearch](https://github.com/NousResearch) — Hermes Agent 框架
- [garrytan](https://github.com/garrytan) — gbrain AI 记忆系统
- [OpenClaw](https://github.com/openclaw/openclaw) — 灵感来源
