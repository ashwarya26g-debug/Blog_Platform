const jwt = require('jsonwebtoken');
const { User } = require('../models');

// requireAuth: blocks the request if no valid token is present.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// attachUserIfPresent: does NOT block the request, but attaches req.user
// when a valid token is present. Used on public routes (e.g. viewing a
// post) so we can conditionally show "did I like this?" state.
async function attachUserIfPresent(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub, {
      attributes: ['id', 'name', 'email'],
    });
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

module.exports = { requireAuth, attachUserIfPresent };
