const express = require('express');
const { createUser, findUserByUsername, findUserByEmail } = require('./database-queries/users');
const allowCors = require('./allow-cors');

const router = express.Router();

router.post('/users/register', allowCors(async (req, res) => {
  const { username, email, password, default_currency, starting_balance } = req.body;

  try {
    const user = await createUser(username, email, password, default_currency, starting_balance);
    res.status(201).json({ userId: user.user_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

router.get('/users/find/username/:value', allowCors(async (req, res) => {
  const { value } = req.params;

  try {
    const users = await findUserByUsername(value);
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

router.get('/users/find/email/:value', allowCors(async (req, res) => {
    const { value } = req.params;
  
    try {
      const users = await findUserByEmail(value);
      res.status(200).json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal server error" });
    }
}));

module.exports = router;