const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { pool, query } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check (no DB)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// DB health check
app.get("/api/db-health", async (req, res) => {
  try {
    const result = await query("SELECT NOW() as now");
    res.json({ status: "ok", postgresTime: result.rows[0].now });
  } catch (err) {
    console.error("DB health check failed:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Example CRUD: users
app.get("/api/users", async (req, res) => {
  try {
    const result = await query("SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT 100");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email required" });
  }
  try {
    const result = await query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Ensure table exists, then start
async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Postgres connected, users table ready");
  } catch (err) {
    console.error("Postgres init failed:", err.message);
    console.error("Server starting anyway. Check DATABASE_URL.");
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

init();
