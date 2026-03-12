const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const db = getDb();

// Clear existing data
db.exec('DELETE FROM notifications');
db.exec('DELETE FROM ticket_comments');
db.exec('DELETE FROM ticket_images');
db.exec('DELETE FROM tickets');
db.exec('DELETE FROM users');

const hash = (pw) => bcrypt.hashSync(pw, 10);

// Insert users
const insertUser = db.prepare(
  'INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)'
);

insertUser.run('admin', hash('admin123'), 'Admin User', 'admin', null);
insertUser.run('mitarbeiter1', hash('pass123'), 'Max Müller', 'reporter', 'GBAL');
insertUser.run('mitarbeiter2', hash('pass123'), 'Anna Schmidt', 'reporter', 'GNBE');
insertUser.run('handwerker1', hash('pass123'), 'Peter Meier', 'technician', null);
insertUser.run('handwerker2', hash('pass123'), 'Hans Weber', 'technician', null);

// Insert sample tickets
const insertTicket = db.prepare(
  `INSERT INTO tickets (ticket_id, hotel, room, description, urgency, status, reporter_id, technician_id, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

insertTicket.run('TKT-20260310-001', 'GBAL', '201', 'Wasserhahn tropft im Badezimmer', 'normal', 'open', 2, null, '2026-03-10 09:30:00');
insertTicket.run('TKT-20260310-002', 'GBAL', '105', 'Fenster lässt sich nicht schliessen', 'high', 'in_progress', 2, 4, '2026-03-10 14:15:00');
insertTicket.run('TKT-20260311-001', 'GNBE', '302', 'Lampe im Flur defekt', 'low', 'open', 3, null, '2026-03-11 08:00:00');
insertTicket.run('TKT-20260311-002', 'GBAL', '410', 'Heizung funktioniert nicht', 'high', 'completed', 2, 4, '2026-03-11 10:45:00');

// Insert sample comments
const insertComment = db.prepare(
  'INSERT INTO ticket_comments (ticket_id, user_id, comment, created_at) VALUES (?, ?, ?, ?)'
);
insertComment.run(2, 4, 'Werde morgen vorbeikommen um das Fenster zu reparieren.', '2026-03-10 16:00:00');

// Insert sample notifications
const insertNotification = db.prepare(
  'INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)'
);
insertNotification.run(4, 1, 'Neues Ticket: Wasserhahn tropft im Badezimmer (Zimmer 201)');
insertNotification.run(2, 2, 'Ihr Ticket TKT-20260310-002 wird bearbeitet');

console.log('Database seeded successfully!');
console.log('Users: admin/admin123, mitarbeiter1/pass123, mitarbeiter2/pass123, handwerker1/pass123, handwerker2/pass123');
