const express = require("express");
const app = express();

const PORT = process.env['port'] || 4000;

app.get("/", (req, res) => {
    res.send("Express on Vercel");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

module.exports = app;