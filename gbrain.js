/**
 * 🧠 gbrain 前端模块
 * 
 * 螃蟹助手前端连接 gbrain 桥接服务器的客户端。
 * 需配合 gbrain-server.js 使用。
 */

const GbrainClient = {
  // 默认桥接服务器地址（可从设置面板修改）
  baseUrl: 'http://localhost:3101',

  // 连接状态
  connected: false,
  version: '',
  stats: null,

  // ========== 初始化 ==========
  async init() {
    const saved = localStorage.getItem('crab_gbrain_config');
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        this.baseUrl = cfg.baseUrl || this.baseUrl;
      } catch {}
    }
    return this.checkHealth();
  },

  // ========== 通用请求 ==========
  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        signal: AbortSignal.timeout(15000),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  _get(endpoint) {
    return this._fetch(endpoint);
  },

  _post(endpoint, body) {
    return this._fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // ========== API 方法 ==========

  /** 健康检查 */
  async checkHealth() {
    const result = await this._get('/health');
    this.connected = result.status === 'ok';
    if (this.connected && result.gbrain) {
      this.version = result.gbrain;
    }
    return result;
  },

  /** 综合查询（返回答案，不是页面列表） */
  async query(question, options = {}) {
    const result = await this._post('/query', { question, options });
    if (result.success) return result;
    // 如果有 data 字符串，包装成标准格式
    if (result.data) return { success: true, answer: result.data };
    return result;
  },

  /** 关键词搜索 */
  async search(query) {
    return this._get(`/search?q=${encodeURIComponent(query)}`);
  },

  /** 列出所有页面 */
  async listPages() {
    return this._get('/pages');
  },

  /** 读取页面 */
  async getPage(slug) {
    return this._get(`/page?slug=${encodeURIComponent(slug)}`);
  },

  /** 写入页面 */
  async savePage(slug, content, options = {}) {
    return this._post('/save', { slug, content, ...options });
  },

  /** 大脑统计 */
  async getStats() {
    const result = await this._get('/stats');
    if (result.success) {
      this.stats = result.data;
    }
    return result;
  },

  /** 生成 embedding */
  async embed(slug = null) {
    return this._post('/embed', slug ? { slug } : { stale: true });
  },

  /** 创意发散 */
  async brainstorm(question, options = {}) {
    return this._post('/brainstorm', { question, options });
  },

  /** 知识图谱遍历 */
  async graph(slug, depth = 2) {
    return this._get(`/graph?slug=${encodeURIComponent(slug)}&depth=${depth}`);
  },

  /** 健康检查完整版 */
  async doctor() {
    return this._get('/doctor');
  },

  /** 保存配置 */
  saveConfig(baseUrl) {
    this.baseUrl = baseUrl;
    localStorage.setItem('crab_gbrain_config', JSON.stringify({ baseUrl }));
  },
};
