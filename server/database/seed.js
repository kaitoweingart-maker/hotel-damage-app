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

insertUser.run('julian', hash('Amanthos12.'), 'Julian', 'admin', null);
insertUser.run('kaito', hash('Amanthos12.'), 'Kaito', 'admin', null);
insertUser.run('prize', hash('12345'), 'Prize', 'reporter', 'GBAL');
insertUser.run('mulin', hash('12345'), 'Mulin', 'reporter', 'GNBE');
insertUser.run('rabo', hash('12345'), 'Rabo', 'technician', null);

// Insert sample tickets
const insertTicket = db.prepare(
  `INSERT INTO tickets (ticket_id, hotel, room, description, urgency, status, reporter_id, technician_id, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

insertTicket.run('TKT-20260310-001', 'GBAL', '201', 'Wasserhahn tropft im Badezimmer', 'normal', 'open', 3, null, '2026-03-10 09:30:00');
insertTicket.run('TKT-20260310-002', 'GBAL', '105', 'Fenster lässt sich nicht schliessen', 'high', 'in_progress', 3, 5, '2026-03-10 14:15:00');
insertTicket.run('TKT-20260311-001', 'GNBE', '302', 'Lampe im Flur defekt', 'low', 'open', 4, null, '2026-03-11 08:00:00');
insertTicket.run('TKT-20260311-002', 'GBAL', '410', 'Heizung funktioniert nicht', 'high', 'completed', 3, 5, '2026-03-11 10:45:00');

// Insert sample comments
const insertComment = db.prepare(
  'INSERT INTO ticket_comments (ticket_id, user_id, comment, created_at) VALUES (?, ?, ?, ?)'
);
insertComment.run(2, 5, 'Werde morgen vorbeikommen um das Fenster zu reparieren.', '2026-03-10 16:00:00');

// Insert sample notifications
const insertNotification = db.prepare(
  'INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)'
);
insertNotification.run(5, 1, 'Neues Ticket: Wasserhahn tropft im Badezimmer (Zimmer 201)');
insertNotification.run(3, 2, 'Ihr Ticket TKT-20260310-002 wird bearbeitet');

console.log('Database seeded successfully!');
console.log('Admins: julian/Amanthos12., kaito/Amanthos12.');
console.log('Mitarbeiter: prize/12345, mulin/12345');
console.log('Handwerker: rabo/12345');
