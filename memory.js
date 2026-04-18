// 🦀 螃蟹助手 - 记忆宫殿引擎
// 灵感来自 Memory Palace (AGI-is-going-to-arrive/Memory-Palace)
// 持久记忆 + 混合检索 + 写入守卫

const CrabMemory = {
  DB_KEY: 'crab_memory_store',
  INDEX_KEY: 'crab_memory_index',

  // ========== 初始化 ==========
  init() {
    if (!localStorage.getItem(this.DB_KEY)) {
      localStorage.setItem(this.DB_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.INDEX_KEY)) {
      this._rebuildIndex();
    }
  },

  // ========== 写入守卫 (Write Guard) ==========
  // 参考 Memory Palace 的 Write Guard：写入前预检查
  _writeGuard(entry) {
    if (!entry.content || entry.content.trim().length === 0) {
      return { ok: false, reason: '内容为空' };
    }
    if (entry.content.length > 5000) {
      return { ok: false, reason: '内容过长（上限5000字符）' };
    }
    // 检查重复
    const existing = this._findSimilar(entry.content);
    if (existing && existing.similarity > 0.95) {
      return { ok: false, reason: '与已有记忆重复', duplicate: existing };
    }
    return { ok: true };
  },

  // ========== 存储记忆 ==========
  save(content, options = {}) {
    const entry = {
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      content: content.trim(),
      category: options.category || 'general',
      priority: options.priority || 0,
      tags: options.tags || [],
      created: new Date().toISOString(),
      accessed: new Date().toISOString(),
      accessCount: 0,
    };

    // 写入守卫
    const guard = this._writeGuard(entry);
    if (!guard.ok) {
      return { success: false, reason: guard.reason };
    }

    const memories = this._getAll();
    memories.unshift(entry);

    // 限制最大条数
    if (memories.length > 1000) {
      memories.splice(1000);
    }

    localStorage.setItem(this.DB_KEY, JSON.stringify(memories));
    this._updateIndex(entry);

    return { success: true, id: entry.id };
  },

  // ========== 检索记忆（混合检索） ==========
  // 参考 Memory Palace 的混合检索：关键词 + 语义
  search(query, topK = 5) {
    const memories = this._getAll();
    if (!query || memories.length === 0) return [];

    const queryLower = query.toLowerCase();
    const queryChars = [...new Set(queryLower.split(''))];

    const scored = memories.map(mem => {
      let score = 0;
      const contentLower = mem.content.toLowerCase();

      // 1. 精确匹配加分
      if (contentLower.includes(queryLower)) {
        score += 10;
      }

      // 2. 关键词匹配
      const words = queryLower.split(/\s+/);
      for (const word of words) {
        if (contentLower.includes(word)) {
          score += 3;
        }
      }

      // 3. 字符级相似度（简易语义近似）
      const contentChars = new Set(contentLower.split(''));
      let charOverlap = 0;
      for (const c of queryChars) {
        if (contentChars.has(c)) charOverlap++;
      }
      score += (charOverlap / Math.max(queryChars.length, 1)) * 2;

      // 4. 时间衰减（越近越高分）
      const ageDays = (Date.now() - new Date(mem.created).getTime()) / 86400000;
      score *= Math.max(0.1, 1 - ageDays / 365);

      // 5. 优先级加权
      score *= (1 + mem.priority * 0.2);

      // 6. 访问频率加权
      score *= (1 + mem.accessCount * 0.05);

      return { ...mem, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  },

  // ========== 获取所有记忆 ==========
  getAll(options = {}) {
    let memories = this._getAll();
    if (options.category) {
      memories = memories.filter(m => m.category === options.category);
    }
    if (options.tag) {
      memories = memories.filter(m => m.tags.includes(options.tag));
    }
    return memories;
  },

  // ========== 删除记忆 ==========
  delete(id) {
    let memories = this._getAll();
    memories = memories.filter(m => m.id !== id);
    localStorage.setItem(this.DB_KEY, JSON.stringify(memories));
    this._rebuildIndex();
    return true;
  },

  // ========== 记忆统计 ==========
  stats() {
    const memories = this._getAll();
    const categories = {};
    const now = Date.now();

    memories.forEach(m => {
      categories[m.category] = (categories[m.category] || 0) + 1;
    });

    const recent24h = memories.filter(m =>
      (now - new Date(m.created).getTime()) < 86400000
    ).length;

    return {
      total: memories.length,
      categories,
      recent24h,
      oldest: memories.length > 0 ? memories[memories.length - 1].created : null,
      newest: memories.length > 0 ? memories[0].created : null,
    };
  },

  // ========== 内部方法 ==========
  _getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.DB_KEY) || '[]');
    } catch {
      return [];
    }
  },

  _findSimilar(content) {
    const memories = this._getAll();
    const contentLower = content.toLowerCase();

    for (const mem of memories) {
      const memLower = mem.content.toLowerCase();
      // 简单 Jaccard 相似度
      const setA = new Set(contentLower.split(''));
      const setB = new Set(memLower.split(''));
      const intersection = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...setA, ...setB]).size;
      const similarity = intersection / Math.max(union, 1);

      if (similarity > 0.8) {
        return { ...mem, similarity };
      }
    }
    return null;
  },

  _updateIndex(entry) {
    try {
      const index = JSON.parse(localStorage.getItem(this.INDEX_KEY) || '{}');
      // 按词建索引
      const words = entry.content.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length < 2) continue;
        if (!index[word]) index[word] = [];
        index[word].push(entry.id);
      }
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    } catch {}
  },

  _rebuildIndex() {
    const memories = this._getAll();
    const index = {};
    for (const entry of memories) {
      const words = entry.content.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length < 2) continue;
        if (!index[word]) index[word] = [];
        index[word].push(entry.id);
      }
    }
    localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
  }
};
