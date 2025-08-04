const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const dbRoutes = require('./database-routes');
const errorHandler = require('./error-handler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', dbRoutes);
app.get('/api/status', (req, res) => res.json({ info: 'Node.js, Express, and Postgres API' }));
app.get('/', (req, res) => res.send('Evergreen Budgeting Server up and running...'));

// Error handling
app.use(errorHandler);

const cron = require('node-cron');
const { pingDatabase } = require('./database-queries/ping');

cron.schedule('0 12 * * *', async () => {
  try {
    await pingDatabase();
    console.log('Database pinged to prevent sleep.');
  } catch (error) {
    console.error('Error pinging the database: ', error.message);
  }
});

app.get('/api/ping', async (req, res) => {
  try {
    await pingDatabase();
    res.send('Database is awake!');
  } catch (err) {
    res.status(500).send('Database ping failed');
  }
});

// Server setup
const PORT = process.env.PORT || 3080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server Running: http://localhost:${PORT}`);
  });
}

module.exports = app;