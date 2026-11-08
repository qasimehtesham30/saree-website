const { send, authorized } = require('./_lib');

module.exports = (req, res) => {
  if (!authorized(req, res)) return;
  send(res, 200, { ok: true, message: 'On Vercel every change is already saved to GitHub.' });
};
