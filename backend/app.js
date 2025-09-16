const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const app = express();
const db = require('./db');
const port = 5000;

app.use(express.json());

app.get('/hello', (req, res) => {
   res.send('Hello World!!');
})

//CREATE user
app.post('/users', (req, res) => {
  console.log("Request body:", req.body); //debug
  const { nama, email } = req.body;

  const sql = "INSERT INTO users (nama, email) VALUES (?, ?)";
  db.query(sql, [nama, email], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "User added", id: result.insertId });
  });
});

//READ
app.get('/users', (req, res) => {
   const sql = "SELECT * FROM users";
   db.query(sql, (err, result) => {
      if(err){
         console.error("Read error:", err);
         return res.status(500).json({error: "Database error"});
      }
      res.json(result);
   });
});

app.listen(port, () => {
   console.log(`Example App Listen to ${port}`);
})