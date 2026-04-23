const express = require('express');
const { getDb } = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function generateTicketId() {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = db.prepare(
    "SELECT COUNT(*) as c FROM tickets WHERE ticket_id LIKE ?"
  ).get(`TKT-${today}-%`);
  const num = String((count.c || 0) + 1).padStart(3, '0');
  return `TKT-${today}-${num}`;
}

function notifyUsers(db, ticketId, message, excludeUserId) {
  // Notify all technicians and admins
  const users = db.prepare(
    "SELECT id FROM users WHERE role IN ('technician', 'admin') AND id != ?"
  ).all(excludeUserId);
  const insert = db.prepare(
    'INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)'
  );
  for (const u of users) {
    insert.run(u.id, ticketId, message);
  }
}

// GET /api/tickets
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { status, hotel, urgency } = req.query;
  let sql = `
    SELECT t.*, u.name as reporter_name, tech.name as technician_name
    FROM tickets t
    LEFT JOIN users u ON t.reporter_id = u.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    WHERE 1=1
  `;
  const params = [];

  // Role-based filtering: reporters only see their own hotel's tickets
  if (req.user.role === 'reporter') {
    sql += ' AND t.reporter_id = ?';
    params.push(req.user.id);
    if (req.user.hotel) {
      sql += ' AND t.hotel = ?';
      params.push(req.user.hotel);
    }
  }

  // Technicians with a hotel assigned only see that hotel's tickets
  if (req.user.role === 'technician' && req.user.hotel) {
    sql += ' AND t.hotel = ?';
    params.push(req.user.hotel);
  }

  if (status) { sql += ' AND t.status = ?'; params.push(status); }
  if (hotel) { sql += ' AND t.hotel = ?'; params.push(hotel); }
  if (urgency) { sql += ' AND t.urgency = ?'; params.push(urgency); }

  sql += ' ORDER BY t.created_at DESC';

  const tickets = db.prepare(sql).all(...params);

  // Attach image counts
  const imgCount = db.prepare('SELECT COUNT(*) as c FROM ticket_images WHERE ticket_id = ?');
  for (const t of tickets) {
    t.image_count = imgCount.get(t.id).c;
  }

  res.json(tickets);
});

// POST /api/tickets
router.post('/', authenticate, authorize('reporter', 'admin'), upload.array('images', 5), (req, res) => {
  const db = getDb();
  let { hotel, room, description, urgency } = req.body;

  // Reporters with assigned hotel can only create tickets for their hotel
  if (req.user.role === 'reporter' && req.user.hotel) {
    hotel = req.user.hotel;
  }

  if (!hotel || !room || !description) {
    return res.status(400).json({ error: 'hotel, room, and description are required' });
  }

  const ticketId = generateTicketId();

  const result = db.prepare(
    `INSERT INTO tickets (ticket_id, hotel, room, description, urgency, reporter_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(ticketId, hotel, room, description, urgency || 'normal', req.user.id);

  // Save images
  if (req.files && req.files.length > 0) {
    const insertImg = db.prepare(
      'INSERT INTO ticket_images (ticket_id, image_path, type) VALUES (?, ?, ?)'
    );
    for (const file of req.files) {
      insertImg.run(result.lastInsertRowid, file.filename, 'report');
    }
  }

  notifyUsers(db, result.lastInsertRowid,
    `Neues Ticket: ${description.substring(0, 50)} (Zimmer ${room}, ${hotel})`,
    req.user.id
  );

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(ticket);
});

// GET /api/tickets/:id
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const ticket = db.prepare(`
    SELECT t.*, u.name as reporter_name, tech.name as technician_name
    FROM tickets t
    LEFT JOIN users u ON t.reporter_id = u.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  // Reporter can only see own tickets
  if (req.user.role === 'reporter' && ticket.reporter_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  ticket.images = db.prepare('SELECT * FROM ticket_images WHERE ticket_id = ? ORDER BY created_at').all(ticket.id);
  ticket.comments = db.prepare(`
    SELECT c.*, u.name as user_name, u.role as user_role
    FROM ticket_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.ticket_id = ?
    ORDER BY c.created_at
  `).all(ticket.id);

  res.json(ticket);
});

// PATCH /api/tickets/:id/status
router.patch('/:id/status', authenticate, authorize('technician', 'admin'), (req, res) => {
  const db = getDb();
  const { status, technician_id } = req.body;

  if (!status) return res.status(400).json({ error: 'status is required' });

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const updates = { status, updated_at: new Date().toISOString() };

  if (status === 'in_progress') {
    updates.technician_id = technician_id || req.user.id;
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE tickets SET ${setClauses} WHERE id = ?`)
    .run(...Object.values(updates), req.params.id);

  // Notify reporter
  const statusLabels = { in_progress: 'wird bearbeitet', completed: 'abgeschlossen', rejected: 'abgelehnt' };
  db.prepare('INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)')
    .run(ticket.reporter_id, ticket.id, `Ticket ${ticket.ticket_id} ${statusLabels[status] || status}`);

  const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// POST /api/tickets/:id/comments
router.post('/:id/comments', authenticate, (req, res) => {
  const db = getDb();
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'comment is required' });

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  db.prepare('INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, comment);

  db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?')
    .run(new Date().toISOString(), req.params.id);

  res.status(201).json({ success: true });
});

// POST /api/tickets/:id/completion
router.post('/:id/completion', authenticate, authorize('technician', 'admin'), upload.array('images', 5), (req, res) => {
  const db = getDb();
  const { comment } = req.body;

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  db.prepare(
    'UPDATE tickets SET status = ?, completion_comment = ?, updated_at = ? WHERE id = ?'
  ).run('completed', comment || null, new Date().toISOString(), req.params.id);

  if (req.files && req.files.length > 0) {
    const insertImg = db.prepare(
      'INSERT INTO ticket_images (ticket_id, image_path, type) VALUES (?, ?, ?)'
    );
    for (const file of req.files) {
      insertImg.run(req.params.id, file.filename, 'completion');
    }
  }

  db.prepare('INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)')
    .run(ticket.reporter_id, ticket.id, `Ticket ${ticket.ticket_id} wurde abgeschlossen`);

  const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// GET /api/stats
router.get('/stats/overview', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM tickets').get().c;
  const open = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE status = 'open'").get().c;
  const inProgress = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE status = 'in_progress'").get().c;
  const completed = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE status = 'completed'").get().c;
  const rejected = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE status = 'rejected'").get().c;
  const highUrgency = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE urgency = 'high' AND status != 'completed'").get().c;

  const byHotel = db.prepare(
    "SELECT hotel, COUNT(*) as count, SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count FROM tickets GROUP BY hotel"
  ).all();

  const recentTickets = db.prepare(`
    SELECT t.*, u.name as reporter_name
    FROM tickets t LEFT JOIN users u ON t.reporter_id = u.id
    ORDER BY t.created_at DESC LIMIT 5
  `).all();

  res.json({ total, open, inProgress, completed, rejected, highUrgency, byHotel, recentTickets });
});

// DELETE /api/tickets/:id (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  db.prepare('DELETE FROM ticket_images WHERE ticket_id = ?').run(req.params.id);
  db.prepare('DELETE FROM ticket_comments WHERE ticket_id = ?').run(req.params.id);
  db.prepare('DELETE FROM notifications WHERE ticket_id = ?').run(req.params.id);
  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);

  res.json({ success: true, deleted: ticket.ticket_id });
});

module.exports = router;
