module.exports = function handler(req, res) {
  const code = typeof req.query.code === 'string' ? req.query.code.trim() : '';

  if (!code) {
    return res.status(400).json({
      ok: false,
      error: 'Missing code',
    });
  }

  return res.status(200).json({
    ok: true,
    code,
  });
};
