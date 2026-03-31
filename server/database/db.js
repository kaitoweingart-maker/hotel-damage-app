const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use persistent disk path on Render, fallback to local for development
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'app.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure directory exists for persistent disk
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);

    console.log(`Database: ${DB_PATH}`);
  }
  return db;
}

module.exports = { getDb };
