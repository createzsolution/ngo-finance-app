const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

if (!fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error creating DB:", err);
    else console.log("New SQLite DB created");
  });

  db.serialize(() => {
    db.run(`CREATE TABLE admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      verified BOOLEAN DEFAULT 0
    )`);

    db.run(`CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      national_id TEXT,
      dob DATE,
      gender TEXT,
      marital_status TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      next_of_kin TEXT,
      kin_phone TEXT,
      occupation TEXT,
      employer TEXT,
      income REAL,
      years_in_job INTEGER
    )`);

    db.run(`CREATE TABLE loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      amount REAL,
      purpose TEXT,
      term_months INTEGER,
      status TEXT DEFAULT 'Pending',
      disbursed_date DATE,
      FOREIGN KEY(client_id) REFERENCES clients(id)
    )`);

    db.run(`CREATE TABLE guarantors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER,
      full_name TEXT,
      national_id TEXT,
      dob DATE,
      gender TEXT,
      phone TEXT,
      address TEXT,
      occupation TEXT,
      employer TEXT,
      income REAL,
      relationship TEXT,
      FOREIGN KEY(loan_id) REFERENCES loans(id)
    )`);
  });

  db.close();
} else {
  console.log("Using existing database.");
}

module.exports = new sqlite3.Database(dbPath);
