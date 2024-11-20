const express = require('express');
const bodyParser = require("body-parser");
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

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

app.post('/api/register', async (req, res) => {
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
})

app.get('/api/status', (req, res) => {
  res.json({info: 'Node.js, Express, and Postgres API'});
});
app.get('/', (req, res) => {
  res.send('Express on Vercel');
});
// Listen to the specified port, otherwise 3080
const PORT = process.env.PORT || 3080;
const server = app.listen(PORT, () => {
  console.log(`Server Running: http://localhost:${PORT}`);
});
/**
 * The SIGTERM signal is a generic signal used to cause program 
 * termination. Unlike SIGKILL , this signal can be blocked, 
 * handled, and ignored. It is the normal way to politely ask a 
 * program to terminate. The shell command kill generates 
 * SIGTERM by default.
 */
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server Close: Process Terminated!');
    });
});

module.exports = app;