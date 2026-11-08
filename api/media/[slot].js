const { SLOT, EXT, MAX_BYTES, send, authorized, commitChange } = require('../_lib');

module.exports = async (req, res) => {
  if (!authorized(req, res)) return;
  const slot = String(req.query.slot || '');
  if (!SLOT.test(slot)) return send(res, 400, { error: 'Unknown slot' });
  try {
    if (req.method === 'DELETE') return send(res, 200, { slot, url: await commitChange(slot, null) });
    if (req.method !== 'PUT') return send(res, 405, { error: 'Method not allowed' });
    const ext = EXT[(req.headers['content-type'] || '').split(';')[0]];
    if (!ext) return send(res, 415, { error: 'Use a JPG, PNG, WebP, AVIF, GIF, MP4, WebM or MOV file' });
    const chunks = []; let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > MAX_BYTES) return send(res, 413, { error: 'Files over 4 MB can’t go through Vercel. Compress it, or use the local admin.' });
      chunks.push(c);
    }
    send(res, 200, { slot, url: await commitChange(slot, Buffer.concat(chunks), ext) });
  } catch (e) {
    send(res, e.status === 401 || e.status === 403 ? 502 : 500, { error: e.message });
  }
};
