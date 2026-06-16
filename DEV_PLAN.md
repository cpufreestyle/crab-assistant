# 🛠️ crab-assistant 开发计划

> 目标：集成 **Obsidian**（知识库）和 **gbrain**（AI 记忆大脑）
> 创建时间：2026-06-16
> 最后更新：2026-06-16 15:10 GMT+8

---

## ✅ 已完成

### gbrain 集成（阶段二）— 2026-06-16 完成
- [x] `gbrain-server.js` — gbrain CLI 桥接服务器（REST API，端口 3101）
- [x] `gbrain.js` — 前端 GbrainClient 模块
- [x] `config.js` — 添加 gbrain 配置
- [x] `skills.js` — 添加 gbrain 技能路由
- [x] `app.js` — 添加 🧠 大脑标签页 + 设置面板
- [x] `index.html` — 添加 gbrain 面板 UI
- [x] `start-gbrain-bridge.bat` — Windows 一键启动脚本

**使用方式：**
1. 启动桥接服务器：`node gbrain-server.js`（或双击 `start-gbrain-bridge.bat`）
2. 螃蟹助手设置面板填写 `http://localhost:3101` 并点「测试」
3. 切换到 🧠 大脑标签页使用

---

## 📋 总体目标

将 Obsidian vault 和 gbrain 记忆系统融入螃蟹助手，实现：
1. **Obsidian 集成** - 读写 Obsidian vault，作为长期知识库
2. **gbrain 集成** - 连接 gbrain AI 记忆引擎，增强记忆能力
3. **统一记忆系统** - 整合 Memory Palace + Obsidian + gbrain

---

## 🔬 技术调研结果

### gbrain 是什么？
**gbrain** = Garry's Brain by [Garry Tan](https://github.com/garrytan)（Y Combinator President & CEO）

> "Search gives you raw pages. GBrain gives you the answer."

**核心特性：**
- 知识图谱 + 综合分析层（不是简单向量检索）
- 自接线知识图谱（自动提取实体关系：`attended`, `works_at`, `invested_in`, `founded`, `advises`）
- Gap Analysis（告诉用户"大脑不知道什么"）
- P@5 49.1%, R@5 97.9%（知识图谱禁用版本 +31.4 分）
- 生产环境：**146,646 页面，24,585 人，5,339 公司，66 个 cron 任务自动运行**

**技术架构：**
- PGLite 数据库（无服务器，2秒启动）
- MCP（Model Context Protocol）服务器
- CLI 工具（TypeScript, src/cli.ts ~105KB）
- 专为 OpenClaw / Hermes Agent 设计

**官方集成方式：**
```bash
# AI Agent 自动安装（推荐）
curl -sSL https://raw.githubusercontent.com/garrytan/gbrain/master/INSTALL_FOR_AGENTS.md | your-agent-execute
```

**项目地址：**
- GitHub: https://github.com/garrytan/gbrain
- 文档：`llms.txt`, `llms-full.txt`, `AGENTS.md`, `CLAUDE.md`

---

### Obsidian 是什么？
**Obsidian** = 本地笔记/知识管理应用（Markdown 格式）

**集成方案选择：**
- 方案 A：**Local REST API 插件**（推荐）- 实时读写，需安装 [obsidian-local-rest-api](https://github.com/coddingtonbear/obsidian-local-rest-api)
- 方案 B：直接文件系统读写 vault（简单，但不实时）

---

## 🗓️ 开发阶段

### 阶段一：调研与架构设计（预计 1-2 小时）

#### 任务 1.1：确认 gbrain 安装状态
- [ ] 用户是否已安装 gbrain？
- [ ] 如果未安装，需要先安装（~30分钟）

#### 任务 1.2：确认 Obsidian 配置
- [ ] 用户是否使用 Obsidian？
- [ ] 是否已安装 Local REST API 插件？
- [ ] vault 路径？

#### 任务 1.3：设计架构
- [x] `ARCHITECTURE.md`（新建）- 架构设计
- [ ] 设计配置结构（`config.js` 扩展）
- [ ] 设计技能接口（`skills.js` 扩展）

---

### 阶段二：gbrain 集成（预计 2-3 小时）

#### 任务 2.1：gbrain 连接配置
- [x] 在 `config.js` 添加 gbrain 配置
- [x] 创建 `gbrain.js` 模块（GbrainClient）
- [x] 创建 `gbrain-server.js` 桥接服务器（REST API）

#### 任务 2.2：集成到螃蟹助手
- [x] 在 `skills.js` 添加 `gbrain` 技能
- [x] 在 UI 添加 gbrain 标签页（🧠 大脑）
- [x] 实现设置面板 gbrain 配置区

#### 任务 2.3：测试
- [x] 桥接服务器启动测试
- [ ] 浏览器端连接测试（待用户验证）
- [ ] 查询功能测试
- [ ] 知识图谱查询测试

---

### 阶段三：Obsidian 集成（预计 2-3 小时）

#### 任务 3.1：实现 Obsidian 连接
- [ ] 在 `config.js` 添加 Obsidian 配置
  ```javascript
  obsidian: {
    enabled: false,
    // Local REST API 方式
    apiUrl: 'http://localhost:27123',
    apiKey: '',  // 可选，插件可设置密钥
    // 或文件系统方式
    vaultPath: 'C:\\Users\\xxx\\Obsidian\\MyVault',
  }
  ```

- [ ] 创建 `obsidian.js` 模块
  - `obsidian.connect()` - 测试连接
  - `obsidian.listNotes()` - 列出笔记
  - `obsidian.getNote(path)` - 读取笔记
  - `obsidian.createNote(path, content)` - 创建笔记
  - `obsidian.updateNote(path, content)` - 更新笔记
  - `obsidian.searchNotes(query)` - 搜索笔记

#### 任务 3.2：集成到螃蟹助手
- [ ] 在 `skills.js` 添加 `obsidian` 技能
- [ ] 在 UI 添加 Obsidian 标签页
- [ ] 实现 Obsidian → Memory Palace 双向同步

#### 任务 3.3：测试
- [ ] 测试连接（需要用户本地运行 Obsidian + Local REST API）
- [ ] 测试读写操作
- [ ] 测试搜索功能

---

### 阶段四：统一记忆系统（预计 1-2 小时）

#### 任务 4.1：设计统一记忆接口
- [ ] 创建 `unified-memory.js`
  - `unifiedMemory.search(query)` - 从所有源搜索
    - Memory Palace → 快速关键词检索
    - gbrain → 综合分析答案
    - Obsidian → 笔记内容
  - `unifiedMemory.save(content, options)` - 保存到所有启用的源

#### 任务 4.2：更新现有功能
- [ ] 更新 `memory.js` 支持多后端
- [ ] 更新 `app.js` 中的记忆搜索逻辑
- [ ] 更新设置面板，支持配置多个记忆源

#### 任务 4.3：测试
- [ ] 测试跨源搜索
- [ ] 测试记忆同步
- [ ] 测试降级逻辑（某个源不可用时的处理）

---

## 📊 gbrain vs Memory Palace 功能对比

| 功能 | Memory Palace | gbrain |
|------|--------------|--------|
| 数据存储 | localStorage | PGLite（文件数据库） |
| 搜索方式 | 关键词 + 相似度 + 时间衰减 | 知识图谱 + 综合分析 |
| 输出格式 | 原始记忆列表 | **综合答案 + 引用来源** |
| Gap Analysis | ❌ | ✅ 告诉你"不知道什么" |
| 实体关系 | ❌ | ✅ 自动提取关系边 |
| 公司脑/多用户 | ❌ | ✅ 按用户隔离 |
| MCP 协议 | ❌ | ✅ |
| 安装复杂度 | 零（纯前端） | ~30分钟 |

**结论：gbrain 是 Memory Palace 的"超级升级版"，但需要额外安装。**

---

## 📝 配置文件变更

### `config.js` 新增配置
```javascript
// gbrain 配置（AI 记忆大脑）
gbrain: {
  enabled: false,
  mcpUrl: 'http://localhost:3100',  // MCP 服务器
  apiKey: '',
},

// Obsidian 配置
obsidian: {
  enabled: false,
  apiUrl: 'http://localhost:27123',  // Local REST API
  apiKey: '',
  vaultPath: '',  // 或文件系统路径
},

// 统一记忆配置
unifiedMemory: {
  enabledSources: ['memory-palace', 'obsidian', 'gbrain'],
  primarySource: 'memory-palace',  // 默认使用 Memory Palace
  gbrainAsSynthesis: true,  // gbrain 用于综合分析，不是简单搜索
}
```

### `skills.js` 调整
- 保留 `memory` 技能，但增加 gbrain/Obsidian 作为后端
- 新增 `obsidian` 技能（可选）
- 新增 `gbrain` 技能（可选）

### 新增文件
- `gbrain.js` - gbrain MCP 客户端封装
- `obsidian.js` - Obsidian API 封装
- `unified-memory.js` - 统一记忆接口
- `ARCHITECTURE.md` - 架构文档

---

## 🚀 实施顺序

1. **✅ 确认需求**（完成）
2. **阶段一：架构设计**（进行中）
3. **阶段二：gbrain 集成**（需要 gbrain 先安装）
4. **阶段三：Obsidian 集成**
5. **阶段四：统一记忆系统**
6. 测试与文档更新

---

## ❓ 待确认问题

1. **gbrain 安装状态**
   - [ ] 是否已安装 gbrain？
   - [ ] 如果未安装，需要先执行安装流程（~30分钟）
   - [ ] gbrain MCP 服务器运行在哪个端口？（默认 3100）

2. **Obsidian 配置**
   - [ ] 是否使用 Obsidian？
   - [ ] vault 路径？
   - [ ] 是否已安装 Local REST API 插件？

3. **优先级**
   - [ ] 先做 gbrain 还是先做 Obsidian？
   - [ ] 还是并行开发？

---

## 📊 预计时间

| 阶段 | 预计时间 | 依赖 |
|------|----------|------|
| 阶段一：调研与架构 | 1-2 小时 | 需要确认安装状态 |
| 阶段二：gbrain 集成 | 2-3 小时 | 阶段一完成，需要 gbrain 已安装 |
| 阶段三：Obsidian 集成 | 2-3 小时 | 阶段一完成 |
| 阶段四：统一记忆 | 1-2 小时 | 阶段二、三完成 |
| **总计** | **6-10 小时** | |

---

## ✅ 完成标准

- [ ] 可以连接 gbrain 并查询（返回综合答案，不是页面列表）
- [ ] 可以从螃蟹助手读写 Obsidian vault
- [ ] 统一记忆系统可以跨源搜索
- [ ] 配置面板可以配置所有新功能
- [ ] 文档更新完成（`README.md`、`ARCHITECTURE.md`）

---

## 🔗 参考资源

- **gbrain GitHub**: https://github.com/garrytan/gbrain
- **gbrain 安装指南**: `INSTALL_FOR_AGENTS.md`
- **gbrain 文档**: `llms.txt`, `AGENTS.md`
- **Obsidian Local REST API**: https://github.com/coddingtonbear/obsidian-local-rest-api

---

*最后更新：2026-06-16 12:50 GMT+8*