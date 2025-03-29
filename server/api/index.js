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

// Server setup
const PORT = process.env.PORT || 3080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server Running: http://localhost:${PORT}`);
  });
}

module.exports = app;