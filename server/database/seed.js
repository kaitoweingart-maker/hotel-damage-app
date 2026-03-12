const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const db = getDb();

// Clear all data and reset autoincrement
db.exec('DELETE FROM notifications');
db.exec('DELETE FROM ticket_comments');
db.exec('DELETE FROM ticket_images');
db.exec('DELETE FROM tickets');
db.exec('DELETE FROM users');
db.exec("DELETE FROM sqlite_sequence");

const hash = (pw) => bcrypt.hashSync(pw, 10);

// Insert users
const insertUser = db.prepare(
  'INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)'
);

insertUser.run('julian', hash('Amanthos12.'), 'Julian', 'admin', null);     // 1
insertUser.run('kaito', hash('Amanthos12.'), 'Kaito', 'admin', null);       // 2
insertUser.run('prize', hash('12345'), 'Prize', 'reporter', 'PRZA');        // 3
insertUser.run('mulin', hash('12345'), 'Mulin', 'reporter', 'MUBRIG');      // 4
insertUser.run('chalet', hash('12345'), 'Chalet', 'reporter', 'HCSI');      // 5
insertUser.run('rabo', hash('12345'), 'Rabo', 'technician', null);          // 6

// Look up IDs to avoid hardcoding
const userId = (name) => db.prepare('SELECT id FROM users WHERE username = ?').get(name).id;
const prize = userId('prize');
const mulin = userId('mulin');
const chalet = userId('chalet');
const rabo = userId('rabo');

// Insert sample tickets
const insertTicket = db.prepare(
  `INSERT INTO tickets (ticket_id, hotel, room, description, urgency, status, reporter_id, technician_id, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

insertTicket.run('TKT-20260310-001', 'PRZA', '201', 'Wasserhahn tropft im Badezimmer', 'normal', 'open', prize, null, '2026-03-10 09:30:00');
insertTicket.run('TKT-20260310-002', 'PRZA', '105', 'Fenster lässt sich nicht schliessen', 'high', 'in_progress', prize, rabo, '2026-03-10 14:15:00');
insertTicket.run('TKT-20260311-001', 'MUBRIG', '302', 'Lampe im Flur defekt', 'low', 'open', mulin, null, '2026-03-11 08:00:00');
insertTicket.run('TKT-20260311-002', 'HCSI', '12', 'Heizung funktioniert nicht', 'high', 'completed', chalet, rabo, '2026-03-11 10:45:00');

// Look up ticket IDs
const ticketId = (ref) => db.prepare('SELECT id FROM tickets WHERE ticket_id = ?').get(ref).id;
const tkt2 = ticketId('TKT-20260310-002');
const tkt1 = ticketId('TKT-20260310-001');

// Insert sample comments
db.prepare('INSERT INTO ticket_comments (ticket_id, user_id, comment, created_at) VALUES (?, ?, ?, ?)')
  .run(tkt2, rabo, 'Werde morgen vorbeikommen um das Fenster zu reparieren.', '2026-03-10 16:00:00');

// Insert sample notifications
const insertNotification = db.prepare('INSERT INTO notifications (user_id, ticket_id, message) VALUES (?, ?, ?)');
insertNotification.run(rabo, tkt1, 'Neues Ticket: Wasserhahn tropft im Badezimmer (Zimmer 201)');
insertNotification.run(prize, tkt2, 'Ihr Ticket TKT-20260310-002 wird bearbeitet');

console.log('Database seeded successfully!');
console.log('Admins: julian/Amanthos12., kaito/Amanthos12.');
console.log('Mitarbeiter: prize/12345, mulin/12345, chalet/12345');
console.log('Handwerker: rabo/12345');
