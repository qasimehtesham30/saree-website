#!/usr/bin/env node
// NOOLAM local admin: serves the site, saves uploaded photos/videos into media/,
// records them in content/media.json, and publishes changes to GitHub with git.
// Run:  node admin-server.js   then open http://localhost:5180/admin.html
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5180;
const MANIFEST = path.join(ROOT, 'content', 'media.json');
const MEDIA_DIR = path.join(ROOT, 'media');
const MAX_BYTES = 120 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
};
const EXT = {
  'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/avif': '.avif', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
};
// hero, mood-0, piece-6-2, rack-5-back, film-video ...
const SLOT = /^(hero|film-video|(mood|look|silk|rack|film|reel|bridal)-\d{1,2}(-back)?|piece-\d-\d)$/;

const readManifest = () => { try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch { return {}; } };
const writeManifest = m => {
  const sorted = Object.fromEntries(Object.keys(m).sort().map(k => [k, m[k]]));
  fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
};
const removeFile = rel => {
  if (!rel || !rel.startsWith('media/')) return;
  fs.rm(path.join(ROOT, rel), { force: true }, () => {});
};
const git = (...args) => new Promise(resolve => execFile('git', args, { cwd: ROOT }, (err, stdout, stderr) => resolve({ ok: !err, out: (stdout + stderr).trim() })));

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === '/' ) rel = '/index.html';
  if (rel === '/admin') rel = '/admin.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep) || rel.split('/').some(seg => seg.startsWith('.'))) return send(res, 404, 'Not found', 'text/plain');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not found', 'text/plain');
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) { // videos need range support (Safari)
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}

async function api(req, res, urlPath) {
  // A custom header forces a CORS preflight, so other websites can't drive this admin.
  if (req.headers['x-noolam-admin'] !== '1') return send(res, 403, { error: 'Forbidden' });
  const slot = decodeURIComponent(urlPath.split('/')[3] || '');

  if (req.method === 'GET' && urlPath === '/api/media') return send(res, 200, readManifest());

  if (req.method === 'GET' && urlPath === '/api/status') {
    const st = await git('status', '--porcelain', '--', 'media', 'content');
    const branch = await git('rev-parse', '--abbrev-ref', 'HEAD');
    return send(res, 200, { mode: 'local', changes: st.ok ? st.out.split('\n').filter(Boolean).length : 0, branch: branch.out });
  }

  if (req.method === 'PUT' && urlPath.startsWith('/api/media/')) {
    if (!SLOT.test(slot)) return send(res, 400, { error: 'Unknown slot' });
    const ext = EXT[(req.headers['content-type'] || '').split(';')[0]];
    if (!ext) return send(res, 415, { error: 'Use a JPG, PNG, WebP, AVIF, GIF, MP4, WebM or MOV file' });
    const chunks = []; let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > MAX_BYTES) return send(res, 413, { error: 'File is larger than 120 MB' });
      chunks.push(c);
    }
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
    const rel = `media/${slot}-${Date.now().toString(36)}${ext}`;
    fs.writeFileSync(path.join(ROOT, rel), Buffer.concat(chunks));
    const m = readManifest();
    removeFile(m[slot]);
    m[slot] = rel;
    writeManifest(m);
    return send(res, 200, { slot, url: rel });
  }

  if (req.method === 'DELETE' && urlPath.startsWith('/api/media/')) {
    if (!SLOT.test(slot)) return send(res, 400, { error: 'Unknown slot' });
    const m = readManifest();
    removeFile(m[slot]);
    delete m[slot];
    writeManifest(m);
    return send(res, 200, { slot, url: null });
  }

  if (req.method === 'POST' && urlPath === '/api/publish') {
    const log = [];
    const add = await git('add', '-A', '--', 'media', 'content/media.json'); log.push(add.out);
    const staged = await git('diff', '--cached', '--quiet');
    if (staged.ok) return send(res, 200, { ok: true, message: 'Nothing new to publish.' });
    const commit = await git('commit', '-m', 'Update site images from admin'); log.push(commit.out);
    if (!commit.ok) return send(res, 500, { ok: false, message: 'Commit failed', log });
    const push = await git('push'); log.push(push.out);
    if (!push.ok) return send(res, 500, { ok: false, message: 'Saved locally but the push to GitHub failed', log });
    return send(res, 200, { ok: true, message: 'Published to GitHub.', log });
  }

  send(res, 404, { error: 'Not found' });
}

http.createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://x').pathname;
  if (urlPath.startsWith('/api/')) return api(req, res, urlPath).catch(e => send(res, 500, { error: e.message }));
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
  serveStatic(req, res, urlPath);
}).listen(PORT, '127.0.0.1', () => {
  console.log(`NOOLAM site:  http://localhost:${PORT}/`);
  console.log(`NOOLAM admin: http://localhost:${PORT}/admin.html`);
});
