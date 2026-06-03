/** Minimal probe — CommonJS (see api/package.json type). */
module.exports = function handler(_req, res) {
  res.status(200).json({ ok: true, probe: "ping" });
};
