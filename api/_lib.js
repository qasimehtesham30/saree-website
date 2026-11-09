// Shared helpers for the admin API when the site runs on Vercel.
// Vercel's disk is read-only, so every change is committed straight to the GitHub repo,
// and Vercel redeploys the site from that commit.
// Env vars (Vercel → Project → Settings → Environment Variables):
//   ADMIN_PASSWORD  optional password for /admin.html; leave it out and anyone can use the admin
//   GITHUB_TOKEN    fine-grained token with "Contents: Read and write" on the repo
//   GITHUB_REPO     owner/name, e.g. qasimehtesham30/saree-website
//   GITHUB_BRANCH   optional, defaults to main
const crypto = require('crypto');

const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;
const PASSWORD = process.env.ADMIN_PASSWORD;

const SLOT = /^(hero|film-video|(mood|look|silk|rack|film|reel|bridal)-\d{1,2}(-back)?|piece-\d-\d)$/;
const EXT = {
  'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg', 'image/avif': '.avif', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
};
const MAX_BYTES = 4.4 * 1024 * 1024; // Vercel caps function request bodies at 4.5 MB

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function authorized(req, res) {
  if (!REPO || !TOKEN) {
    send(res, 500, { error: 'Admin is not set up: add GITHUB_TOKEN and GITHUB_REPO in Vercel, then redeploy.' });
    return false;
  }
  // The admin page always sends this header; it forces a CORS preflight, so other websites can't drive the API.
  if (req.headers['x-noolam-admin'] !== '1') {
    send(res, 403, { error: 'Forbidden' });
    return false;
  }
  // Without ADMIN_PASSWORD the admin is open to anyone who finds /admin.html.
  if (!PASSWORD) return true;
  const got = Buffer.from(String(req.headers['x-admin-password'] || ''));
  const want = Buffer.from(PASSWORD);
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) {
    send(res, 401, { error: 'Wrong password' });
    return false;
  }
  return true;
}

async function gh(path, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(j.message ? `GitHub: ${j.message}` : `GitHub error ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return j;
}

async function readManifest(ref = BRANCH) {
  try {
    const f = await gh(`/contents/content/media.json?ref=${encodeURIComponent(ref)}`);
    return JSON.parse(Buffer.from(f.content, 'base64').toString('utf8'));
  } catch (e) {
    if (e.status === 404) return {};
    throw e;
  }
}

const sortKeys = m => Object.fromEntries(Object.keys(m).sort().map(k => [k, m[k]]));

// One commit per change: the new file, the updated manifest, and removal of the file it replaces.
async function commitChange(slot, buf, ext) {
  let blobSha = null, rel = null;
  if (buf) {
    const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: buf.toString('base64'), encoding: 'base64' }) });
    blobSha = blob.sha;
    rel = `media/${slot}-${Date.now().toString(36)}${ext}`;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const head = (await gh(`/git/ref/heads/${BRANCH}`)).object.sha;
    const base = await gh(`/git/commits/${head}`);
    const m = await readManifest(head);
    const old = m[slot];
    if (rel) m[slot] = rel; else delete m[slot];
    const tree = [{ path: 'content/media.json', mode: '100644', type: 'blob', content: JSON.stringify(sortKeys(m), null, 2) + '\n' }];
    if (rel) tree.push({ path: rel, mode: '100644', type: 'blob', sha: blobSha });
    if (old && old.startsWith('media/') && old !== rel) {
      const exists = await gh(`/contents/${old}?ref=${head}`).then(() => true, () => false);
      if (exists) tree.push({ path: old, mode: '100644', type: 'blob', sha: null });
    }
    const t = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
    const c = await gh('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: rel ? `Replace ${slot} from admin` : `Reset ${slot} to drawing from admin`, tree: t.sha, parents: [head] }),
    });
    try {
      await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
      return rel;
    } catch (e) {
      if (e.status !== 422) throw e; // someone else committed first: rebuild on the new head
    }
  }
  throw new Error('GitHub was busy, please try again');
}

module.exports = { REPO, BRANCH, SLOT, EXT, MAX_BYTES, send, authorized, readManifest, commitChange };
