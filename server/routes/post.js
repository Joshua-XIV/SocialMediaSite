import express from 'express'
import {pool as db} from '../database.js'
const router = express.Router();

// Get all posts
router.get('/', async(req, res) => {
  try {
    const result = await db.query(`SELECT * FROM "user"`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching posts", err);
    res.status(500).json({error: "Failed to fetch posts"});
  }
});

router.post('/', async(req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is missing" });
  }

  const {username, display_name, email, password_hash} = req.body;
  const missingField = [];
  if (!username) missingField.push("Username");
  if (!display_name) missingField.push("Display Name");
  if (!email) missingField.push("Email");
  if (!password_hash) missingField.push("Password");

  if (missingField.length > 0) {
  return res.status(400).json({error: `Missing required fields: ${missingField.join(", ")}`});
  }

  try {
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
