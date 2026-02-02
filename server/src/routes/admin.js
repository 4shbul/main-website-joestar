const express = require("express");
const crypto = require("crypto");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { generateOtpCode, generateSessionId } = require("../services/otp");
const { sendWhatsAppOtp } = require("../services/whatsapp");

const router = express.Router();

const logAdminAction = async (adminId, action, targetUserId, metadata = {}) => {
  await pool.query(
    "INSERT INTO admin_audit_log (admin_id, action, target_user_id, metadata) VALUES ($1, $2, $3, $4)",
    [adminId, action, targetUserId || null, metadata]
  );
};

router.get("/affiliates", requireAdmin, async (req, res) => {
  const search = (req.query.search || "").trim().toLowerCase();
  const status = req.query.status || "all";
  const role = req.query.role || "all";
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 10), 50);
  const offset = (page - 1) * limit;

  const filters = [];
  const values = [];
  let idx = 1;

  if (search) {
    filters.push("(LOWER(name) LIKE $1 OR LOWER(username) LIKE $1 OR LOWER(affiliate_code) LIKE $1)");
    values.push(`%${search}%`);
    idx++;
  }
  if (status !== "all") {
    filters.push(`status = $${idx++}`);
    values.push(status);
  }
  if (role !== "all") {
    filters.push(`role = $${idx++}`);
    values.push(role);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT id, name, username, status, affiliate_code, role, created_at, last_login
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users ${where}`,
      values
    );
    return res.json({
      affiliates: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat data affiliate." });
  }
});

router.patch("/affiliates/:id", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!status || !["active", "pending", "banned"].includes(status)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  try {
    await pool.query("UPDATE users SET status = $1 WHERE id = $2", [status, req.params.id]);
    await logAdminAction(req.user.id, "update_status", req.params.id, { status });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal update status." });
  }
});

router.post("/redeem-codes", requireAdmin, async (req, res) => {
  const { count } = req.body || {};
  const total = Math.min(Number(count || 1), 100);
  if (!total || total < 1) {
    return res.status(400).json({ message: "Jumlah kode tidak valid." });
  }

  const codes = Array.from({ length: total }).map(() =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );

  const values = codes.map((_, idx) => `($${idx + 1})`).join(",");
  try {
    await pool.query(
      `INSERT INTO affiliate_codes (code) VALUES ${values} ON CONFLICT DO NOTHING`,
      codes
    );
    await logAdminAction(req.user.id, "generate_codes", null, { count: total });
    return res.json({ codes });
  } catch (error) {
    return res.status(500).json({ message: "Gagal membuat kode." });
  }
});

router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body || {};
  if (!role || !["admin", "affiliate"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }

  try {
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, req.params.id]);
    await logAdminAction(req.user.id, "update_role", req.params.id, { role });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal update role." });
  }
});

router.post("/users/:id/reset-password", requireAdmin, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, username, phone FROM users WHERE id = $1",
      [req.params.id]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    const raw = crypto.randomBytes(24).toString("hex");
    const hashed = crypto.createHash("sha256").update(raw).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, hashed, expiresAt]
    );

    await sendWhatsAppOtp(user.phone, raw);
    await logAdminAction(req.user.id, "reset_password", user.id, {});
    return res.json({ ok: true, token: raw });
  } catch (error) {
    return res.status(500).json({ message: "Gagal reset password." });
  }
});

router.post("/users/:id/otp/resend", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, phone FROM users WHERE id = $1",
      [req.params.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    const code = generateOtpCode();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO otp_sessions (id, user_id, code, expires_at) VALUES ($1, $2, $3, $4)",
      [sessionId, user.id, code, expiresAt]
    );

    await sendWhatsAppOtp(user.phone, code);
    await logAdminAction(req.user.id, "resend_otp", user.id, {});
    return res.json({ ok: true, sessionId });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengirim OTP." });
  }
});

router.get("/affiliates/export", requireAdmin, async (req, res) => {
  const search = (req.query.search || "").trim().toLowerCase();
  const status = req.query.status || "all";
  const role = req.query.role || "all";

  const filters = [];
  const values = [];
  let idx = 1;

  if (search) {
    filters.push("(LOWER(name) LIKE $1 OR LOWER(username) LIKE $1 OR LOWER(affiliate_code) LIKE $1)");
    values.push(`%${search}%`);
    idx++;
  }
  if (status !== "all") {
    filters.push(`status = $${idx++}`);
    values.push(status);
  }
  if (role !== "all") {
    filters.push(`role = $${idx++}`);
    values.push(role);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT name, username, affiliate_code, status, role, created_at, last_login
       FROM users ${where} ORDER BY created_at DESC`,
      values
    );

    const header = "name,username,affiliate_code,status,role,created_at,last_login";
    const rows = result.rows
      .map((row) =>
        [
          row.name,
          row.username,
          row.affiliate_code || "",
          row.status,
          row.role,
          row.created_at.toISOString(),
          row.last_login ? row.last_login.toISOString() : "",
        ]
          .map((field) => `"${String(field).replace(/\"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"affiliates.csv\"");
    return res.send(`${header}\n${rows}`);
  } catch (error) {
    return res.status(500).json({ message: "Gagal export data." });
  }
});

router.get("/audit-log", requireAdmin, async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 20), 50);
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT l.id, l.action, l.target_user_id, l.metadata, l.created_at, u.username AS admin_username
       FROM admin_audit_log l
       LEFT JOIN users u ON u.id = l.admin_id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await pool.query("SELECT COUNT(*)::int AS total FROM admin_audit_log");
    return res.json({ logs: result.rows, total: countResult.rows[0].total, page, limit });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat audit log." });
  }
});

router.post("/orders", requireAdmin, async (req, res) => {
  const { orderNumber, totalAmount, orderDate, affiliateCode } = req.body || {};
  if (!orderNumber || !totalAmount || !orderDate) {
    return res.status(400).json({ message: "Data order tidak lengkap." });
  }

  try {
    await pool.query(
      "INSERT INTO orders (order_number, total_amount, order_date, affiliate_code) VALUES ($1, $2, $3, $4)",
      [orderNumber, totalAmount, orderDate, affiliateCode || null]
    );
    await logAdminAction(req.user.id, "create_order", null, { orderNumber, totalAmount, affiliateCode });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menyimpan order." });
  }
});

module.exports = { adminRouter: router };
