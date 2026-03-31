const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const db = getDb();

const hash = (pw) => bcrypt.hashSync(pw, 10);

// Only seed if database is empty (no users exist)
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

if (userCount > 0) {
  console.log(`Database already has ${userCount} users — skipping seed to preserve data.`);

  // Still ensure all required users exist (upsert)
  const ensureUser = (username, pw, name, role, hotel) => {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!existing) {
      db.prepare('INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)')
        .run(username, hash(pw), name, role, hotel);
      console.log(`  Added missing user: ${username}`);
    }
  };

  ensureUser('julian', 'Amanthos12.', 'Julian', 'admin', null);
  ensureUser('kaito', 'Amanthos12.', 'Kaito', 'admin', null);
  ensureUser('prize', '12345', 'Prize', 'reporter', 'PRZA');
  ensureUser('mulin', '12345', 'Mulin', 'reporter', 'MUBRIG');
  ensureUser('chalet', '12345', 'Chalet', 'reporter', 'HCSI');
  ensureUser('rabo', '12345', 'Rabo', 'technician', null);

  process.exit(0);
}

console.log('Empty database — seeding users...');

// Insert users only — no sample tickets
const insertUser = db.prepare(
  'INSERT INTO users (username, password_hash, name, role, hotel) VALUES (?, ?, ?, ?, ?)'
);

insertUser.run('julian', hash('Amanthos12.'), 'Julian', 'admin', null);
insertUser.run('kaito', hash('Amanthos12.'), 'Kaito', 'admin', null);
insertUser.run('prize', hash('12345'), 'Prize', 'reporter', 'PRZA');
insertUser.run('mulin', hash('12345'), 'Mulin', 'reporter', 'MUBRIG');
insertUser.run('chalet', hash('12345'), 'Chalet', 'reporter', 'HCSI');
insertUser.run('rabo', hash('12345'), 'Rabo', 'technician', null);

console.log('Database seeded — users only, no sample tickets.');
console.log('Admins: julian/Amanthos12., kaito/Amanthos12.');
console.log('Mitarbeiter: prize/12345, mulin/12345, chalet/12345');
console.log('Handwerker: rabo/12345');
