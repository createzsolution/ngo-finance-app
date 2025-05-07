const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db');
const config = require('./config');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false })); // <-- VERY important
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
