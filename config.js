// 🦀 螃蟹助手 - 配置文件
// 架构：前端 Web UI + Hermes Agent (NousResearch) 后端 + LM Studio 本地模型

const CRAB_CONFIG = {
  // 应用信息
  app: {
    name: '螃蟹助手',
    version: '0.2.1',
    emoji: '🦀',
    tagline: '钳住一切，记忆永恒',
    // 核心架构
    architecture: {
      frontend: '螃蟹助手 Web UI (PWA)',
      agent: 'Hermes Agent (NousResearch) ☤',
      llm: 'LM Studio / Ollama 本地模型',
      note: 'NOT HybridClaw - 使用真正的 Hermes Agent'
    }
  },

  // API 配置 - 支持 OpenAI 兼容接口（多模型切换）
  api: {
    // 默认使用 OpenAI 兼容接口
    baseUrl: '',       // 用户自行配置
    apiKey: '',        // 用户自行配置
    model: '',         // 默认模型
    // 预设模型列表
    presets: [
      // ===== 本地模型 (推荐) =====
      { id: 'lm-studio', name: '🦎 LM Studio (本地)', provider: 'lm-studio', baseUrl: 'http://localhost:1234/v1', model: '', icon: '🦎' },
      { id: 'ollama', name: '🦙 Ollama (本地)', provider: 'ollama', baseUrl: 'http://localhost:11434/v1', model: '', icon: '🦙' },
      // ===== OpenAI =====
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
      { id: 'o3', name: 'GPT-o3', provider: 'openai' },
      // ===== Anthropic =====
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      // ===== 国内 =====
      { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' },
      { id: 'qwen-plus', name: '通义千问+', provider: 'aliyun' },
      { id: 'glm-4', name: '智谱GLM-4', provider: 'zhipu' },
      { id: 'moonshot-v1-8k', name: 'Moonshot (Kimi)', provider: 'moonshot' },
    ]
  },

  // Hermes Agent 配置
  hermes: {
    enabled: true,
    source: 'NousResearch/hermes-agent',
    description: 'The agent that grows with you - 真正的 Hermes Agent',
    installPath: '~/hermes-agent',  // 或 C:\Users\<user>\hermes-agent
    cli: 'hermes',
    features: ['memory', 'skills', 'tools', 'compression'],
  },

  // 记忆系统配置
  memory: {
    maxEntries: 1000,        // 最大记忆条数
    autoSaveKeywords: [      // 触发自动记忆的关键词
      '记住', '记得', '别忘了', '重要', '提醒我',
      'remember', 'note', 'important', 'don\'t forget'
    ],
    searchTopK: 5,           // 语义搜索返回前K条
  },

  // Skills 插件配置
  skills: {
    builtin: [
      { id: 'chat', name: '💬 对话', desc: '与AI自由对话' },
      { id: 'memory', name: '🏛️ 记忆宫殿', desc: '存储和检索长期记忆' },
      { id: 'gbrain', name: '🧠 大脑', desc: 'gbrain AI 知识图谱查询' },
      { id: 'code', name: '🤖 代码助手', desc: 'Agentic编程辅助' },
      { id: 'search', name: '🔍 联网搜索', desc: '搜索互联网信息' },
      { id: 'todo', name: '📋 待办管理', desc: '管理任务和提醒' },
    ]
  },

  // gbrain 配置（AI 记忆大脑）
  gbrain: {
    enabled: false,
    bridgeUrl: 'http://localhost:3101',
    description: 'gbrain AI 知识图谱记忆引擎',
  },

  // LM Studio 配置提示
  lmStudio: {
    defaultUrl: 'http://localhost:1234/v1',
    defaultModel: '本地模型',
    // LM Studio 连接状态（运行时检测）
    status: 'unknown', // 'connected' | 'disconnected' | 'unknown'
  }
};
