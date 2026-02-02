const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL missing.");
  process.exit(1);
}

const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "admin";
const phone = process.env.ADMIN_PHONE || "080000000000";

(async () => {
  const pool = new Pool({ connectionString });
  const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  if (existing.rows.length) {
    console.log("Admin already exists.");
    await pool.end();
    return;
  }

  const code = `ADMIN-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  await pool.query("INSERT INTO affiliate_codes (code, is_active) VALUES ($1, true) ON CONFLICT DO NOTHING", [code]);

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, username, phone, password_hash, affiliate_code, role, status) VALUES ($1, $2, $3, $4, $5, 'admin', 'active')",
    ["Admin", username, phone, hash, code]
  );

  console.log(`Admin created: ${username} / ${password}`);
  await pool.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
