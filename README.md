# 🦀 螃蟹助手

> 融合 OpenClaw + **Hermes Agent (NousResearch)** + Memory Palace + Claude Code 的全能AI助手

## 🏗️ 架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                     🦀 螃蟹助手                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web UI     │  │  记忆宫殿     │  │  Skills 插件 │      │
│  │  (PWA)       │  │  (本地存储)   │  │  (模块化)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           ▼                                 │
│              ┌─────────────────────────┐                    │
│              │  ☤ Hermes Agent         │                    │
│              │  (NousResearch)         │                    │
│              │  - 真正的 Hermes Agent  │                    │
│              │  - 记忆 + 工具 + Skills │                    │
│              └───────────┬─────────────┘                    │
│                          ▼                                  │
│              ┌─────────────────────────┐                    │
│              │  🦎 LM Studio / Ollama  │                    │
│              │  (本地 LLM 模型)         │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘

⚠️ 注意：使用真正的 Hermes Agent (NousResearch)，不是 HybridClaw
```

## ✨ 特性

- 💬 **对话问答** - 基于 OpenAI 兼容 API 的智能对话
- 🏛️ **记忆宫殿** - 持久记忆，自动学习，混合检索（关键词+相似度+时间衰减）
- 🤖 **代码助手** - Agentic 编程辅助
- 🔍 **联网搜索** - 获取实时信息
- 📋 **待办管理** - 任务追踪
- 📱 **PWA 支持** - 可安装为独立应用，离线可用
- 🎨 **深色主题** - 螃蟹橙渐变风格

## 🗂️ 项目结构

```
crab-assistant/
├── index.html     # 主界面
├── app.js         # 主程序
├── memory.js      # 记忆宫殿引擎
├── skills.js      # Skills 插件系统
├── config.js      # 配置文件
├── manifest.json  # PWA 清单
└── sw.js          # Service Worker
```

## 🚀 快速开始

1. **直接在浏览器打开** `index.html`
2. 点击右上角 ⚙️ 配置 API 密钥
3. 开始对话！

## ⚙️ API 配置

支持 OpenAI 兼容接口，可配置：
- API 地址（默认 `https://api.openai.com/v1`）
- 模型选择（GPT-4o / Claude / DeepSeek / 通义 / 智谱 等）

## 🏛️ 记忆宫殿

- **Write Guard** - 防重复、防空、防超长写入保护
- **混合检索** - 关键词 + 字符相似度 + 时间衰减 + 优先级 + 访问频率
- **快照回滚** - 每次写入前自动备份，可一键还原
- **分类标签** - 自由分类 + 系统分类

## 📖 参考项目

| 项目 | 来源 | 说明 |
|------|------|------|
| 🦞 OpenClaw | [GitHub](https://github.com/openclaw/openclaw) | 多渠道 Gateway + Skills 系统 |
| ☤ **Hermes Agent** | **[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)** | **真正的 Hermes Agent - The agent that grows with you** |
| 🏛️ Memory Palace | 本地实现 | 持久记忆 + 混合检索 |
| 🤖 Claude Code | Anthropic | Agentic 编程范式 |
| 🏛️ Memory Palace | 持久记忆 OS | 混合检索 + 快照机制 |
| 🤖 Claude Code | Anthropic | Agentic 编程模式 |

## 📄 License

MIT
