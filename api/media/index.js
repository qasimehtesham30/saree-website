const { send, authorized, readManifest } = require('../_lib');

module.exports = async (req, res) => {
  if (!authorized(req, res)) return;
  try { send(res, 200, await readManifest()); } catch (e) { send(res, 502, { error: e.message }); }
};
