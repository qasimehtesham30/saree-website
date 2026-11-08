const { REPO, BRANCH, send, authorized } = require('./_lib');

module.exports = (req, res) => {
  if (!authorized(req, res)) return;
  send(res, 200, { mode: 'hosted', repo: REPO, branch: BRANCH, changes: 0, rawBase: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`, maxBytes: 4.4 * 1024 * 1024 });
};
