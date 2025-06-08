import express from 'express'
import {pool as db} from '../database.js'
import bcrypt from 'bcrypt'

const saltRounds = 10;
const router = express.Router();

// Test of getting posts
router.get('/test', async(req, res) => {
  try {
    const result = await db.query(`SELECT * FROM "user"`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching posts", err);
    res.status(500).json({error: "Failed to fetch posts"});
  }
});

// Make post request
router.post('/create-account', async(req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is missing" });
  }

  const {username, display_name, email, password} = req.body;
  const missingField = [];
  if (!username) missingField.push("Username");
  if (username.length > 20) return res.status(400).json({ error: "Username can't be longer than 20 characters"});
  if (!display_name) missingField.push("Display Name");
  if (display_name.length > 40) return res.status(400).json({ error: "Display Name can't be longer than 40 characters"});
  if (!email) missingField.push("Email");
  if (!password) missingField.push("Password");
  if (password.length > 64) return res.status(400).json({ error: "Password can't be longer than 64 characters"});

  if (missingField.length > 0) {
    return res.status(400).json({error: `Missing required fields: ${missingField.join(", ")}`});
  }

  try {
    const password_hash = await bcrypt.hash(password, saltRounds);

    const post = await db.query(`INSERT INTO "user" (username, display_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, display_name, email, password_hash]
    );
    res.status(201).json(post.rows[0]);
  }
  catch (err) {
    console.log("Error: ", err);
    if (err.code === '23505')
    {
      if (err.detail && err.detail.includes("username")) {
        res.status(409).json({error: "Username Taken"})
      }
      if (err.detail && err.detail.includes("email")) {
        res.status(409).json({error: "Email Taken"})
      }
    }
    else {
      res.status(500).json("Something went wrong");
    }
  }
})

export default router;
