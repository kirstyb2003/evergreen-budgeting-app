const express = require('express');
const bodyParser = require("body-parser");
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const app = express();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;
const DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

console.log(`DB URL: ${DATABASE_URL}`);
console.log(`Process.env: ${process.env.DB_DATABASE}`);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Wrap the call in the allowCors function to indicate that the call from the frontend is allowed
app.post('/api/register', allowCors(async (req, res) => {
  const { username, email, password, default_currency, starting_balance } = req.body;

  console.log(req.body);

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, default_currency, starting_balance)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
      [username, email, password, default_currency, starting_balance]
    );

    console.log('Query result:', result.rows[0]);

    res.status(201).json({ userId: result.rows[0].user_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

app.get('/api/status', (req, res) => {
  res.json({info: 'Node.js, Express, and Postgres API 2.0'});
});
app.get('/', (req, res) => {
  res.send('Evergreen Budgeting Server up and running...');
});

// Listen to the specified port, otherwise 3080
const PORT = process.env.PORT || 3080;
const server = app.listen(PORT, () => {
  console.log(`Server Running: http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server Close: Process Terminated!');
    });
});

module.exports = app;