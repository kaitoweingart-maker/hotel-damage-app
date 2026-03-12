const express = require('express');
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const notifications = db.prepare(`
    SELECT n.*, t.ticket_id as ticket_ref
    FROM notifications n
    LEFT JOIN tickets t ON n.ticket_id = t.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(req.user.id);
  res.json(notifications);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, (req, res) => {
  const db = getDb();
  const notif = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });

  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
