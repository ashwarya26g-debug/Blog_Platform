const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // passwordHash gets hashed by the beforeCreate hook on the model
  const user = await User.create({ name, email, passwordHash: password });
  const token = signToken(user);

  return res.status(201).json({ token, user: toPublicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  return res.json({ token, user: toPublicUser(user) });
}

async function me(req, res) {
  return res.json({ user: toPublicUser(req.user) });
}

module.exports = { register, login, me };
