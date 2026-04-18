// 🦀 螃蟹助手 - 配置文件

const CRAB_CONFIG = {
  // 应用信息
  app: {
    name: '螃蟹助手',
    version: '0.1.0',
    emoji: '🦀',
    tagline: '钳住一切，记忆永恒'
  },

  // API 配置 - 支持 OpenAI 兼容接口（多模型切换）
  api: {
    // 默认使用 OpenAI 兼容接口
    baseUrl: '',       // 用户自行配置，如 https://api.openai.com/v1
    apiKey: '',        // 用户自行配置
    model: '',         // 默认模型
    // 预设模型列表
    presets: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
      { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' },
      { id: 'qwen-plus', name: '通义千问+', provider: 'aliyun' },
      { id: 'glm-4', name: '智谱GLM-4', provider: 'zhipu' },
    ]
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
      { id: 'code', name: '🤖 代码助手', desc: 'Agentic编程辅助' },
      { id: 'search', name: '🔍 联网搜索', desc: '搜索互联网信息' },
      { id: 'todo', name: '📋 待办管理', desc: '管理任务和提醒' },
    ]
  }
};
