const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db');
const config = require('./config');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Email Transporter (Gmail Example)
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'youremail@gmail.com',
    pass: process.env.EMAIL_PASS || 'yourpassword'
  }
});

// Routes

// Home Redirect
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// Register Page
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/register.html');
});

// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user || !req.session.user.verified) return res.redirect('/login');

  db.all("SELECT COUNT(*) AS total_clients FROM clients", [], (err, clientRow) => {
    db.all("SELECT COUNT(*) AS total_loans FROM loans", [], (err, loanRow) => {
      db.all("SELECT SUM(amount) AS total_loan_amount FROM loans WHERE status='Disbursed'", [], (err, disbursedRow) => {
        res.send(`
          <h2>Welcome Admin</h2>
          <p>App Name: ${config.appName}</p>
          <ul>
            <li>Total Clients: ${clientRow[0].total_clients}</li>
            <li>Total Loans: ${loanRow[0].total_loans}</li>
            <li>Total Disbursed: $${disbursedRow[0].total_loan_amount || 0}</li>
          </ul>
          <a href="/clients">Manage Clients</a><br>
          <a href="/loans">Apply New Loan</a><br>
          <a href="/logout">Logout</a>
        `);
      });
    });
  });
});

// Client List
app.get('/clients', (req, res) => {
  if (!req.session.user || !req.session.user.verified) return res.redirect('/login');

  db.all("SELECT * FROM clients", [], (err, rows) => {
    let html = `<h2>Clients</h2><table border="1" cellpadding="10"><tr><th>Name</th><th>ID</th><th>Phone</th></tr>`;
    rows.forEach(row => {
      html += `<tr><td>${row.full_name}</td><td>${row.national_id}</td><td>${row.phone}</td></tr>`;
    });
    html += `</table><br><a href="/client-form">Add New Client</a> | <a href="/dashboard">Back</a>`;
    res.send(html);
  });
});

// Add Client Form
app.get('/client-form', (req, res) => {
  if (!req.session.user || !req.session.user.verified) return res.redirect('/login');
  res.sendFile(__dirname + '/views/client-form.html');
});

// Submit Client Form
app.post('/client-form', (req, res) => {
  const { full_name, national_id, dob, gender, marital_status, phone, email, address, next_of_kin, kin_phone, occupation, employer, income, years_in_job } = req.body;
  db.run(`INSERT INTO clients (
    full_name, national_id, dob, gender, marital_status, phone, email, address, next_of_kin, kin_phone, occupation, employer, income, years_in_job
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [full_name, national_id, dob, gender, marital_status, phone, email, address, next_of_kin, kin_phone, occupation, employer, income, years_in_job],
  function(err) {
    if (err) return res.send("Error saving client.");
    res.redirect('/clients');
  });
});

// Loan Application Form
app.get('/loans', (req, res) => {
  if (!req.session.user || !req.session.user.verified) return res.redirect('/login');
  res.sendFile(__dirname + '/views/loan-form.html');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
