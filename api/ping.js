/** Minimal CommonJS probe — no TypeScript, no imports. */
module.exports = (req, res) => {
  res.status(200).json({ ok: true, probe: "ping" });
};
