// 🦀 螃蟹助手 - Skills 插件系统
// 灵感来自 OpenClaw + Hermes Agent 的 Skills 架构

const CrabSkills = {
  // 技能列表（可扩展）
  skills: [
    {
      id: 'chat',
      name: '💬 对话',
      desc: '与AI自由对话',
      icon: '💬',
      color: '#10a37f',
      enabled: true,
    },
    {
      id: 'memory',
      name: '🏛️ 记忆宫殿',
      desc: '存储和检索长期记忆',
      icon: '🏛️',
      color: '#e8853a',
      enabled: true,
    },
    {
      id: 'code',
      name: '🤖 代码助手',
      desc: 'Agentic编程辅助',
      icon: '🤖',
      color: '#4f46e5',
      enabled: true,
    },
    {
      id: 'search',
      name: '🔍 联网搜索',
      desc: '搜索互联网信息',
      icon: '🔍',
      color: '#0891b2',
      enabled: true,
    },
    {
      id: 'todo',
      name: '📋 待办管理',
      desc: '管理任务和提醒',
      icon: '📋',
      color: '#dc2626',
      enabled: true,
    },
  ],

  // 激活的技能
  activeSkill: 'chat',

  // 设置激活技能
  setActive(id) {
    const skill = this.skills.find(s => s.id === id);
    if (skill) {
      this.activeSkill = id;
      return true;
    }
    return false;
  },

  // 获取激活技能
  getActive() {
    return this.skills.find(s => s.id === this.activeSkill) || this.skills[0];
  },

  // 执行技能动作
  async execute(skillId, action, params) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill || !skill.enabled) {
      return { success: false, error: '技能不存在或未启用' };
    }

    // 路由到具体技能处理
    switch (skillId) {
      case 'chat':
        return await this._doChat(params);
      case 'memory':
        return await this._doMemory(action, params);
      case 'code':
        return await this._doCode(params);
      case 'search':
        return await this._doSearch(params);
      case 'todo':
        return await this._doTodo(action, params);
      default:
        return { success: false, error: '未知技能' };
    }
  },

  // ========== 技能实现 ==========

  // 💬 对话 - 调用AI接口
  async _doChat(params) {
    const { message, apiConfig } = params;
    if (!message) return { success: false, error: '消息不能为空' };
    // 本地 LM Studio 不需要密钥；云端 API 需要密钥
    const isLocal = (apiConfig?.baseUrl || '').includes('localhost');
    if (!isLocal && !apiConfig?.apiKey) return { success: false, error: '请先配置API密钥' };

    // 获取相关记忆
    const relevantMemories = CrabMemory.search(message, 3);

    // 构建系统提示词
    const systemPrompt = `你是🦀螃蟹助手，一个全能AI助手。
你的特点：
- 钳住一切，记忆永恒
- 说话简洁有力
- 会主动调用记忆宫殿查询相关信息
- 遇到重要信息会主动保存到记忆宫殿

当前时间：${new Date().toLocaleString('zh-CN')}

相关记忆（如果有）：
${relevantMemories.length > 0 ? relevantMemories.map(m => `[${m.category}] ${m.content}`).join('\n') : '无相关记忆'}`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiConfig.apiKey) headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;

      const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: apiConfig.model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: `API错误: ${response.status} - ${err}` };
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '';

      // 检查是否需要自动保存到记忆
      const autoSaveKeywords = ['重要', '记得', '记住', '提醒', '约定', 'deadline'];
      const shouldSave = autoSaveKeywords.some(kw => reply.includes(kw));

      return {
        success: true,
        reply,
        usage: data.usage,
        relevantMemories: relevantMemories.length,
      };
    } catch (err) {
      return { success: false, error: `请求失败: ${err.message}` };
    }
  },

  // 🏛️ 记忆宫殿
  async _doMemory(action, params) {
    const { query, content, category, tag } = params;

    switch (action) {
      case 'search':
        return { success: true, results: CrabMemory.search(query || '', 5) };
      case 'save':
        return CrabMemory.save(content, { category, tag });
      case 'list':
        return { success: true, memories: CrabMemory.getAll({ category, tag }) };
      case 'stats':
        return { success: true, stats: CrabMemory.stats() };
      case 'delete':
        return { success: CrabMemory.delete(params.id), id: params.id };
      default:
        return { success: false, error: '未知操作' };
    }
  },

  // 🤖 代码助手
  async _doCode(params) {
    const { code, language, task } = params;
    // 简化版：提供代码分析和优化建议
    if (code) {
      return {
        success: true,
        analysis: `检测到 ${language || '未知'} 代码\n行数: ${code.split('\n').length}\n分析中...`,
        suggestions: [
          '代码结构看起来合理',
          '建议添加注释说明',
          '可以考虑提取公共函数'
        ]
      };
    }
    return { success: false, error: '请提供代码内容' };
  },

  // 🔍 联网搜索
  async _doSearch(params) {
    const { query } = params;
    if (!query) return { success: false, error: '搜索关键词不能为空' };

    // 简单搜索（实际项目中可接入搜索API）
    return {
      success: true,
      query,
      results: [
        { title: '搜索结果1', url: '#', snippet: '这是第一个搜索结果...' },
        { title: '搜索结果2', url: '#', snippet: '这是第二个搜索结果...' },
      ],
      note: '联网搜索功能需要接入搜索API'
    };
  },

  // 📋 待办管理
  async _doTodo(action, params) {
    const key = 'crab_todos';

    let todos = JSON.parse(localStorage.getItem(key) || '[]');

    switch (action) {
      case 'add':
        todos.push({
          id: 'todo_' + Date.now(),
          text: params.text,
          done: false,
          created: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(todos));
        return { success: true, todos };

      case 'toggle':
        todos = todos.map(t =>
          t.id === params.id ? { ...t, done: !t.done } : t
        );
        localStorage.setItem(key, JSON.stringify(todos));
        return { success: true, todos };

      case 'delete':
        todos = todos.filter(t => t.id !== params.id);
        localStorage.setItem(key, JSON.stringify(todos));
        return { success: true, todos };

      case 'list':
      default:
        return { success: true, todos };
    }
  },
};
