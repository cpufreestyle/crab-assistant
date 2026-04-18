// 🦀 螃蟹助手 - 主程序
// 融合 OpenClaw + Hermes + Memory Palace + Claude Code

const CrabApp = {
  // ========== 状态 ==========
  state: {
    activeTab: 'chat',
    isLoading: false,
    chatHistory: [],
    config: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    },
    sidebarOpen: true,
    settingsOpen: false,
  },

  // ========== 初始化 ==========
  init() {
    CrabMemory.init();
    this.loadConfig();
    this.loadHistory();
    this.bindEvents();
    this.render();

    if (this.state.chatHistory.length === 0) {
      this.addMessage('assistant', `🦀 欢迎使用螃蟹助手！

我是你的全能AI助手，融合了四大开源项目的精华：
• 🦞 OpenClaw - 多渠道Gateway
• ☤ Hermes - 自学习智能体
• 🏛️ Memory Palace - 持久记忆
• 🤖 Claude Code - Agentic编程

💬 对话问答 · 🏛️ 记忆宫殿 · 🤖 代码助手 · 🔍 联网搜索 · 📋 待办管理

请先在右上角 ⚙️ 设置中配置你的API密钥！`);
    }
  },

  // ========== 事件绑定 ==========
  bindEvents() {
    document.getElementById('sendBtn')?.addEventListener('click', () => this.handleSend());

    const input = document.getElementById('msgInput');
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    document.getElementById('settingsBtn')?.addEventListener('click', () => this.toggleSettings());
    document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('clearChatBtn')?.addEventListener('click', () => {
      if (confirm('确定清空聊天记录？')) {
        this.state.chatHistory = [];
        localStorage.removeItem('crab_chat_history');
        this.renderMessages();
      }
    });

    // 记忆搜索
    const memInput = document.getElementById('memorySearchInput');
    memInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.doMemorySearch();
    });
  },

  // ========== 核心功能 ==========
  async handleSend() {
    const input = document.getElementById('msgInput');
    const message = input?.value.trim();
    if (!message || this.state.isLoading) return;

    input.value = '';
    input.style.height = 'auto';
    this.addMessage('user', message);
    this.setLoading(true);

    try {
      const result = await CrabSkills.execute('chat', null, {
        message,
        apiConfig: this.state.config,
      });

      if (result.success) {
        this.addMessage('assistant', result.reply);

        // 自动记忆检测
        const autoSaveKeywords = ['重要', '记得', '记住', '提醒', '约定', 'deadline'];
        if (autoSaveKeywords.some(kw => message.includes(kw))) {
          CrabMemory.save(message, { category: 'auto', priority: 1 });
        }
      } else {
        this.addMessage('assistant', `❌ ${result.error}`);
      }
    } catch (err) {
      this.addMessage('assistant', `❌ 发生错误: ${err.message}`);
    }

    this.setLoading(false);
  },

  addMessage(role, content) {
    this.state.chatHistory.push({
      id: Date.now(),
      role,
      content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    });
    this.renderMessages();
    this.saveHistory();

    setTimeout(() => {
      const container = document.getElementById('chatContainer');
      if (container) container.parentElement.scrollTop = container.parentElement.scrollHeight;
    }, 50);
  },

  // ========== 标签页切换 ==========
  switchTab(tab) {
    this.state.activeTab = tab;

    // 更新导航
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // 切换视图
    const chatArea = document.getElementById('chatArea');
    const memoryPanel = document.getElementById('memoryPanel');
    const inputArea = document.getElementById('inputArea');
    const headerTitle = document.getElementById('headerTitle');

    const tabNames = { chat: '💬 对话', memory: '🏛️ 记忆宫殿', code: '🤖 代码助手', search: '🔍 搜索', todo: '📋 待办' };

    if (tab === 'memory') {
      chatArea.style.display = 'none';
      memoryPanel.style.display = 'block';
      inputArea.style.display = 'none';
      headerTitle.textContent = tabNames[tab] || '🦀 螃蟹助手';
      this.loadMemoryList();
    } else {
      chatArea.style.display = 'block';
      memoryPanel.style.display = 'none';
      inputArea.style.display = 'block';
      headerTitle.textContent = tabNames[tab] || '💬 对话';
    }
  },

  // ========== 记忆宫殿 ==========
  doMemorySearch() {
    const query = document.getElementById('memorySearchInput')?.value.trim() || '';
    const results = CrabMemory.search(query, 10);
    this.renderMemoryResults(results);
  },

  loadMemoryList() {
    const memories = CrabMemory.getAll();
    this.renderMemoryResults(memories);
  },

  renderMemoryResults(results) {
    const container = document.getElementById('memoryResults');
    if (!container) return;

    if (!results || results.length === 0) {
      container.innerHTML = '<div class="empty-state">没有找到相关记忆<br><br><button onclick="CrabApp.showSaveMemoryInput()" class="save-btn" style="width:auto;padding:10px 24px;">➕ 添加记忆</button></div>';
      return;
    }

    container.innerHTML = results.map(mem => `
      <div class="memory-item">
        <div class="memory-content">${this.escapeHtml(mem.content)}</div>
        <div class="memory-meta">
          <span class="memory-category">${this.escapeHtml(mem.category)}</span>
          <span>${new Date(mem.created).toLocaleDateString('zh-CN')}</span>
          <button class="memory-use" onclick="CrabApp.useMemory('${mem.id}')">💬 使用</button>
          <button class="memory-use" onclick="CrabApp.deleteMemory('${mem.id}')" style="background:#ef4444;margin-left:4px;">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  showSaveMemoryInput() {
    const content = prompt('输入要保存的记忆内容：');
    if (content?.trim()) {
      const result = CrabMemory.save(content.trim(), { category: 'manual' });
      if (result.success) {
        this.showToast('✅ 已保存到记忆宫殿');
        this.loadMemoryList();
      } else {
        this.showToast(`❌ 保存失败: ${result.reason}`);
      }
    }
  },

  useMemory(id) {
    const memories = CrabMemory.getAll();
    const mem = memories.find(m => m.id === id);
    if (mem) {
      this.switchTab('chat');
      document.getElementById('msgInput').value = mem.content;
    }
  },

  deleteMemory(id) {
    if (confirm('确定删除这条记忆？')) {
      CrabMemory.delete(id);
      this.showToast('🗑️ 已删除');
      this.loadMemoryList();
    }
  },

  // ========== 设置面板 ==========
  toggleSettings() {
    this.state.settingsOpen = !this.state.settingsOpen;
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    if (this.state.settingsOpen) {
      panel.classList.add('open');
      panel.innerHTML = `
        <h2>⚙️ 设置</h2>
        <div class="setting-item">
          <label>API 密钥</label>
          <input type="password" id="apiKeyInput" value="${this.escapeHtml(this.state.config.apiKey || '')}" placeholder="sk-...">
        </div>
        <div class="setting-item">
          <label>API 地址</label>
          <input type="text" id="baseUrlInput" value="${this.escapeHtml(this.state.config.baseUrl || 'https://api.openai.com/v1')}" placeholder="https://api.openai.com/v1">
        </div>
        <div class="setting-item">
          <label>模型</label>
          <select id="modelSelect">
            ${CRAB_CONFIG.api.presets.map(p =>
              `<option value="${p.id}" ${this.state.config.model === p.id ? 'selected' : ''}>${p.name} (${p.provider})</option>`
            ).join('')}
          </select>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#6b6b6b;">
          💡 支持 OpenAI 兼容接口：OpenAI / DeepSeek / 阿里云 / 智谱 等
        </div>
        <button class="save-btn" id="saveSettingsBtn">💾 保存配置</button>
        <button class="save-btn" style="background:#252525;margin-top:8px;" onclick="CrabApp.toggleSettings()">关闭</button>
      `;
      document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveConfig());
    } else {
      panel.classList.remove('open');
    }
  },

  saveConfig() {
    const apiKey = document.getElementById('apiKeyInput')?.value?.trim();
    const baseUrl = document.getElementById('baseUrlInput')?.value?.trim() || 'https://api.openai.com/v1';
    const model = document.getElementById('modelSelect')?.value || 'gpt-4o-mini';
    this.state.config = { apiKey, baseUrl, model };
    localStorage.setItem('crab_config', JSON.stringify(this.state.config));
    this.showToast('✅ 配置已保存');
    this.toggleSettings();
  },

  loadConfig() {
    try {
      const saved = localStorage.getItem('crab_config');
      if (saved) this.state.config = { ...this.state.config, ...JSON.parse(saved) };
    } catch {}
  },

  // ========== 历史 ==========
  loadHistory() {
    try {
      const saved = localStorage.getItem('crab_chat_history');
      if (saved) this.state.chatHistory = JSON.parse(saved);
    } catch {}
  },

  saveHistory() {
    const history = this.state.chatHistory.slice(-50);
    localStorage.setItem('crab_chat_history', JSON.stringify(history));
  },

  // ========== 渲染 ==========
  render() {
    this.renderNav();
    this.renderMessages();
  },

  renderNav() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = CrabSkills.skills.map(s => `
      <button class="nav-item tab-btn ${this.state.activeTab === s.id ? 'active' : ''}" data-tab="${s.id}">
        <span class="nav-icon">${s.icon}</span>
        <span class="nav-name">${s.name}</span>
      </button>
    `).join('');

    // 重新绑定事件
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  },

  renderMessages() {
    const container = document.getElementById('chatContainer');
    if (!container) return;

    if (this.state.chatHistory.length === 0) {
      container.innerHTML = '<div class="empty-state">🦀 你好！有什么可以帮助你的？<br>切换到 🏛️ 记忆宫殿查看已保存的内容</div>';
      return;
    }

    container.innerHTML = this.state.chatHistory.map(msg => `
      <div class="message ${msg.role}">
        <div class="message-avatar">${msg.role === 'user' ? '👤' : '🦀'}</div>
        <div class="message-content">
          <div class="message-text">${this.formatContent(msg.content)}</div>
          <div class="message-time">${msg.time}</div>
        </div>
      </div>
    `).join('');
  },

  // ========== 工具 ==========
  setLoading(loading) {
    this.state.isLoading = loading;
    const btn = document.getElementById('sendBtn');
    if (btn) {
      btn.disabled = loading;
      btn.innerHTML = loading ? '⏳' : '➤';
    }
  },

  toggleSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    document.getElementById('sidebar')?.classList.toggle('collapsed', !this.state.sidebarOpen);
  },

  formatContent(content) {
    return this.escapeHtml(content)
      .replace(/\n\n/g, '<br><br>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },
};

document.addEventListener('DOMContentLoaded', () => CrabApp.init());
