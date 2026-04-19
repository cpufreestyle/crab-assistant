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
      // LM Studio 专用
      lmStudioConnected: false,
      lmStudioModels: [],
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

    // 启动时检测 LM Studio 连接状态
    this.checkLMStudio();

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

  // ========== LM Studio 状态（读 localStorage，不发网络请求避免 CORS） ==========
  updateLMStudioIndicator(connected) {
    const indicator = document.getElementById('lmStudioIndicator');
    if (indicator) {
      indicator.textContent = connected ? '🟢 LM Studio 已连接' : '🔴 LM Studio 未运行';
      indicator.style.color = connected ? '#22c55e' : '#ef4444';
    }
  },

  checkLMStudio() {
    // 直接从 localStorage 读取配置中的状态，不发网络请求
    try {
      const cfg = JSON.parse(localStorage.getItem('crab_config') || '{}');
      const connected = cfg.lmStudioConnected === true && cfg.baseUrl?.includes('localhost:1234');
      this.state.config.lmStudioConnected = connected;
      if (cfg.lmStudioModels) this.state.config.lmStudioModels = cfg.lmStudioModels;
      this.updateLMStudioIndicator(connected);
    } catch {
      this.updateLMStudioIndicator(false);
    }
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

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

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

      // 动态生成模型选项 HTML
      const presets = CRAB_CONFIG.api.presets;
      const selectedModel = this.state.config.model || '';
      const selectedBaseUrl = this.state.config.baseUrl || '';

      // 找到当前选中的预设
      const currentPreset = presets.find(p => p.id === selectedModel);

      panel.innerHTML = `
        <h2>⚙️ 设置</h2>

        <!-- LM Studio 状态 -->
        <div id="lmStudioIndicator" style="text-align:center;padding:8px 12px;border-radius:8px;background:#1a1a1a;margin-bottom:12px;font-size:13px;">
          🔄 检测中...
        </div>

        <!-- 快速切换 -->
        <div class="setting-item">
          <label>🤖 模型 / 服务</label>
          <select id="modelSelect" onchange="CrabApp.onModelChange(this.value)">
            <optgroup label="🦎 本地模型">
              ${presets.filter(p => p.provider === 'lm-studio').map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </optgroup>
            <optgroup label="☁️ OpenAI">
              ${presets.filter(p => p.provider === 'openai').map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </optgroup>
            <optgroup label="☁️ Anthropic">
              ${presets.filter(p => p.provider === 'anthropic').map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </optgroup>
            <optgroup label="☁️ 国内模型">
              ${presets.filter(p => ['deepseek','aliyun','zhipu','moonshot'].includes(p.provider)).map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </optgroup>
          </select>
        </div>

        <!-- LM Studio 模型选择（动态显示） -->
        <div id="lmStudioModelSection" class="setting-item" style="display:none;">
          <label>🦎 本地模型选择</label>
          <select id="lmStudioModelSelect">
            <option value="">-- 自动检测 --</option>
            ${this.state.config.lmStudioModels.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
          </select>
          <div style="font-size:11px;color:#888;margin-top:4px;">
            💡 需要先在 LM Studio 加载模型才能看到列表
          </div>
        </div>

        <!-- API 地址 -->
        <div class="setting-item" id="baseUrlSection">
          <label>🔗 API 地址</label>
          <input type="text" id="baseUrlInput" value="${this.escapeHtml(selectedBaseUrl)}" placeholder="https://api.openai.com/v1">
          <div style="font-size:11px;color:#888;margin-top:4px;">
            🦎 LM Studio 默认：<code style="background:#222;padding:2px 6px;border-radius:4px;">http://localhost:1234/v1</code>
          </div>
        </div>

        <!-- API 密钥 -->
        <div class="setting-item" id="apiKeySection">
          <label>🔑 API 密钥</label>
          <input type="password" id="apiKeyInput" value="${this.escapeHtml(this.state.config.apiKey || '')}" placeholder="${this.state.config.model === 'lm-studio' ? '本地模式无需密钥' : 'sk-...'}">
          <div style="font-size:11px;color:#888;margin-top:4px;" id="apiKeyHint">
            🦎 本地 LM Studio 无需密钥；云端 API 需要填写
          </div>
        </div>

        <!-- LM Studio 启动提示 -->
        <div style="background:#1a2a1a;border:1px solid #22c55e33;border-radius:8px;padding:12px;margin:8px 0;font-size:12px;color:#86efac;">
          <strong>🦎 LM Studio 使用指南：</strong><br>
          1. 打开 LM Studio<br>
          2. 左上角搜索下载模型（如 Llama 3.2、Qwen2.5）<br>
          3. 点击 <b>▶ 连接图标 → Developer</b><br>
          4. 确保 Server URL 为 <code>http://localhost:1234</code><br>
          5. 点 "Start Server" 启动本地 API 服务<br>
          6. 返回这里选择「🦎 LM Studio」即可使用
        </div>

        <button class="save-btn" id="saveSettingsBtn">💾 保存配置</button>
        <button class="save-btn" style="background:#252525;margin-top:8px;" onclick="CrabApp.toggleSettings()">关闭</button>
      `;

      // 设置当前选中
      const modelSelect = document.getElementById('modelSelect');
      if (modelSelect) modelSelect.value = selectedModel;

      // 立即更新 LM Studio 指示器
      this.updateLMStudioIndicator(this.state.config.lmStudioConnected);

      // 初始根据当前模型显示/隐藏字段
      this.onModelChange(selectedModel);

      document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveConfig());
    } else {
      panel.classList.remove('open');
    }
  },

  // 切换模型时的联动处理
  onModelChange(modelId) {
    const preset = CRAB_CONFIG.api.presets.find(p => p.id === modelId);
    if (!preset) return;

    const baseUrlInput = document.getElementById('baseUrlInput');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const baseUrlSection = document.getElementById('baseUrlSection');
    const apiKeySection = document.getElementById('apiKeySection');
    const lmModelSection = document.getElementById('lmStudioModelSection');
    const apiKeyHint = document.getElementById('apiKeyHint');

    if (preset.provider === 'lm-studio') {
      // LM Studio 模式
      baseUrlInput.value = preset.baseUrl || 'http://localhost:1234/v1';
      apiKeyInput.value = '';
      apiKeyInput.placeholder = '本地模式无需密钥';
      baseUrlSection.style.display = 'none';
      apiKeySection.style.display = 'none';
      lmModelSection.style.display = 'block';
      // 重新检测 LM Studio
      this.checkLMStudio();
    } else {
      // 云端 API 模式
      baseUrlInput.value = preset.baseUrl || this.state.config.baseUrl || 'https://api.openai.com/v1';
      apiKeyInput.placeholder = 'sk-...';
      baseUrlSection.style.display = 'block';
      apiKeySection.style.display = 'block';
      lmModelSection.style.display = 'none';
      if (apiKeyHint) {
        apiKeyHint.textContent = '☁️ 云端 API 需要填写密钥';
        apiKeyHint.style.color = '#888';
      }
    }
  },

  saveConfig() {
    const apiKey = document.getElementById('apiKeyInput')?.value?.trim();
    const baseUrl = document.getElementById('baseUrlInput')?.value?.trim() || 'https://api.openai.com/v1';
    const model = document.getElementById('modelSelect')?.value || 'gpt-4o-mini';

    this.state.config = {
      ...this.state.config,
      apiKey,
      baseUrl,
      model,
    };

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
