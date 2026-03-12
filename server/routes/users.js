const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/users
router.get('/', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, username, name, role, hotel, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// POST /api/users
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { username, password, name, role, hotel } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'username, password, name, and role are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)'
  ).run(username, hash, name, role, hotel || null);

  const user = db.prepare('SELECT id, username, name, role, hotel, created_at FROM users WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(user);
});

// PUT /api/users/:id
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { name, role, hotel, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.params.id);
  if (role) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  if (hotel !== undefined) db.prepare('UPDATE users SET hotel = ? WHERE id = ?').run(hotel || null, req.params.id);
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
  }

  const updated = db.prepare('SELECT id, username, name, role, hotel, created_at FROM users WHERE id = ?')
    .get(req.params.id);
  res.json(updated);
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Don't allow deleting yourself
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
