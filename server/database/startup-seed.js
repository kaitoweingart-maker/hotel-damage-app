const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const db = getDb();
const hash = (pw) => bcrypt.hashSync(pw, 10);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

if (userCount === 0) {
  console.log('[startup-seed] No users found — seeding default users...');

  const insertUser = db.prepare(
    'INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)'
  );

  insertUser.run('julian', hash('Amanthos12.'), 'Julian', 'admin', null);
  insertUser.run('kaito', hash('Amanthos12.'), 'Kaito', 'admin', null);
  insertUser.run('prize', hash('12345'), 'Prize', 'reporter', 'PRZA');
  insertUser.run('mulin', hash('12345'), 'Mulin', 'reporter', 'MUBRIG');
  insertUser.run('chalet', hash('12345'), 'Chalet', 'reporter', 'HCSI');
  insertUser.run('rabo', hash('12345'), 'Rabo', 'technician', 'HCSI');
  insertUser.run('tomek', hash('12345'), 'Tomek', 'technician', null);

  console.log('[startup-seed] Users created.');
} else {
  // Ensure critical users exist and have correct hotel assignments
  const ensureUser = (username, pw, name, role, hotel) => {
    const existing = db.prepare('SELECT id, hotel FROM users WHERE username = ?').get(username);
    if (!existing) {
      db.prepare('INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)')
        .run(username, hash(pw), name, role, hotel);
      console.log(`[startup-seed] Added missing user: ${username}`);
    } else if (existing.hotel !== hotel) {
      db.prepare('UPDATE users SET hotel = ? WHERE username = ?').run(hotel, username);
      console.log(`[startup-seed] Updated hotel for ${username}: ${existing.hotel} -> ${hotel}`);
    }
  };

  ensureUser('julian', 'Amanthos12.', 'Julian', 'admin', null);
  ensureUser('kaito', 'Amanthos12.', 'Kaito', 'admin', null);
  ensureUser('prize', '12345', 'Prize', 'reporter', 'PRZA');
  ensureUser('mulin', '12345', 'Mulin', 'reporter', 'MUBRIG');
  ensureUser('chalet', '12345', 'Chalet', 'reporter', 'HCSI');
  ensureUser('rabo', '12345', 'Rabo', 'technician', 'HCSI');
  ensureUser('tomek', '12345', 'Tomek', 'technician', null);

  console.log(`[startup-seed] ${userCount} users verified.`);
}
