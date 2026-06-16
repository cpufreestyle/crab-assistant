#!/usr/bin/env node
/**
 * 🧠 gbrain 桥接服务器
 * 
 * 包装 gbrain CLI，为螃蟹助手前端提供 REST API。
 * 启动方式：node gbrain-server.js
 * 默认端口：3101
 * 
 * gbrain 文档：https://github.com/garrytan/gbrain
 */

const http = require('http');
const { execSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');

const PORT = parseInt(process.env.GBRAIN_PORT || '3101', 10);
const GBRAIN_CLI = process.env.GBRAIN_CLI || 'gbrain'; // 如果不在 PATH 里可指定完整路径

// ========== 工具函数 ==========

function runGbrain(args, options = {}) {
  const cmd = `${GBRAIN_CLI} ${args}`;
  try {
    const stdout = execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 16 * 1024 * 1024,
      timeout: options.timeout || 30000,
      env: { ...process.env, PATH: process.env.PATH },
      windowsHide: true,
    });
    return { success: true, data: stdout.trim() };
  } catch (err) {
    return { success: false, error: err.stderr?.trim() || err.message };
  }
}

function runGbrainJSON(args, options = {}) {
  const result = runGbrain(args + ' --json', options);
  if (!result.success) return result;
  try {
    return { success: true, data: JSON.parse(result.data) };
  } catch {
    return { success: true, data: result.data };
  }
}

// ========== API 处理 ==========

const routes = {
  // GET /health - 检查 gbrain 是否可用
  '/health': () => {
    const result = runGbrain('version');
    return {
      status: result.success ? 'ok' : 'error',
      gbrain: result.success ? result.data : null,
      error: result.success ? null : result.error,
    };
  },

  // POST /query - 综合查询（类比 ask/query）
  // Body: { question, options?: { noExpand?: boolean } }
  '/query': (body) => {
    if (!body?.question) return { error: 'question 是必填项' };
    const flags = body.options?.noExpand ? '--no-expand' : '';
    const result = runGbrain(`query "${body.question}" ${flags}`);
    return result;
  },

  // GET /search?q=xxx - 关键词搜索
  '/search': (body, url) => {
    const q = new URL(url, 'http://localhost').searchParams.get('q');
    if (!q) return { error: 'q 参数是必填项' };
    const result = runGbrainJSON(`search "${q}"`);
    return result;
  },

  // GET /pages - 列出所有页面
  '/pages': () => {
    const result = runGbrainJSON('list -n 100');
    return result;
  },

  // GET /page/:slug - 读取页面
  '/page': (body, url) => {
    const slug = new URL(url, 'http://localhost').searchParams.get('slug');
    if (!slug) return { error: 'slug 参数是必填项' };
    const result = runGbrain(`get "${slug}"`);
    return result;
  },

  // POST /save - 写入页面
  // Body: { slug, content, type?, tags? }
  '/save': (body) => {
    if (!body?.slug || !body?.content) return { error: 'slug 和 content 是必填项' };
    // 写入临时文件
    const tmpFile = `C:\\Users\\michael\\AppData\\Local\\Temp\\gbrain_write_${Date.now()}.md`;
    try {
      require('fs').writeFileSync(tmpFile, body.content, 'utf-8');
      const cmd = `put "${body.slug}" < "${tmpFile}"`;
      const result = runGbrain(cmd);
      require('fs').unlinkSync(tmpFile);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // GET /stats - 大脑统计
  '/stats': () => {
    const result = runGbrainJSON('stats');
    return result;
  },

  // POST /embed - 生成 embedding
  // Body: { slug? | stale?: boolean }
  '/embed': (body) => {
    const arg = body?.stale ? '--stale' : body?.slug || '--stale';
    const result = runGbrain(`embed ${arg}`, { timeout: 120000 });
    return result;
  },

  // POST /brainstorm - 创意发散
  // Body: { question, options?: { save?, limit? } }
  '/brainstorm': (body) => {
    if (!body?.question) return { error: 'question 是必填项' };
    const flags = [];
    if (body.options?.save) flags.push('--save');
    if (body.options?.limit) flags.push(`--limit ${body.options.limit}`);
    const result = runGbrainJSON(`brainstorm "${body.question}" ${flags.join(' ')}`);
    return result;
  },

  // GET /graph/:slug - 知识图谱遍历
  '/graph': (body, url) => {
    const slug = new URL(url, 'http://localhost').searchParams.get('slug');
    const depth = new URL(url, 'http://localhost').searchParams.get('depth') || '2';
    if (!slug) return { error: 'slug 参数是必填项' };
    const result = runGbrainJSON(`graph "${slug}" --depth ${depth}`);
    return result;
  },

  // GET /doctor - 健康检查
  '/doctor': () => {
    const result = runGbrainJSON('doctor --json --fast', { timeout: 30000 });
    return result;
  },
};

// ========== HTTP 服务器 ==========

const server = http.createServer((req, res) => {
  // CORS 头（允许 PWA 跨域调用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 解析请求体
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;
    const parsedBody = body ? tryParseJSON(body) : {};

    // 路由匹配
    let handler = null;
    let routeKey = null;

    for (const [key, fn] of Object.entries(routes)) {
      if (path === key) {
        handler = fn;
        routeKey = key;
        break;
      }
    }

    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found', available: Object.keys(routes) }));
      return;
    }

    try {
      const result = await handler(parsedBody, req.url);
      res.writeHead(result.error ? 400 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

function tryParseJSON(str) {
  try { return JSON.parse(str); } catch { return {}; }
}

server.listen(PORT, () => {
  console.log(`\n  🧠 gbrain 桥接服务器运行中`);
  console.log(`  📡 http://localhost:${PORT}`);
  console.log(`  ✅ 健康检查: http://localhost:${PORT}/health`);
  console.log(`  💡 螃蟹助手设置中填写 API 地址: http://localhost:${PORT}\n`);
});
