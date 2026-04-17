require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { pool } = require("./db");
const { authRouter } = require("./routes/auth");
const { affiliateRouter } = require("./routes/affiliate");
const { ordersRouter } = require("./routes/orders");
const { adminRouter } = require("./routes/admin");
const { paymentsRouter } = require("./routes/payments");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
  })
);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ ok: true, db: "ok" });
  } catch (error) {
    return res.status(503).json({ ok: false, db: "down" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/affiliate", affiliateRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentsRouter);

const ensureDefaultAdmin = async () => {
  const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin";
  const phone = process.env.DEFAULT_ADMIN_PHONE || "080000000000";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows.length) return;

    const code = `ADMIN-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    await pool.query("INSERT INTO affiliate_codes (code, is_active) VALUES ($1, true)", [code]);

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, username, phone, password_hash, affiliate_code, role, status) VALUES ($1, $2, $3, $4, $5, 'admin', 'active')",
      ["Admin", username, phone, passwordHash, code]
    );

    console.log(`[ADMIN] Default admin created: ${username} / ${password}`);
  } catch (error) {
    console.log("[ADMIN] Failed to create default admin.", error.message);
  }
};

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try {
    await pool.query("SELECT 1");
    console.log("[DB] Connection OK");
  } catch (error) {
    console.log("[DB] Connection failed.", error.code || error.message);
  }
  await ensureDefaultAdmin();
  console.log(`API running on port ${port}`);
});
