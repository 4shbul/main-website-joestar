const express = require("express");
const crypto = require("crypto");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { generateOtpCode, generateSessionId } = require("../services/otp");
const { sendWhatsAppOtp } = require("../services/whatsapp");

const router = express.Router();

const logAdminAction = async (adminId, action, targetUserId, metadata = {}, executor = pool) => {
  await executor.query(
    "INSERT INTO admin_audit_log (admin_id, action, target_user_id, metadata) VALUES ($1, $2, $3, $4)",
    [adminId, action, targetUserId || null, metadata]
  );
};

const resolveAffiliateCode = async (code) => {
  if (!code) return null;
  const normalized = String(code).trim().toUpperCase();
  if (!normalized) return null;

  const result = await pool.query(
    `SELECT u.affiliate_code
     FROM users u
     INNER JOIN affiliate_codes a ON a.code = u.affiliate_code
     WHERE u.affiliate_code = $1
       AND u.status = 'active'
       AND u.role IN ('affiliate', 'admin')
       AND a.assigned_user_id = u.id
       AND a.is_active = true
     LIMIT 1`,
    [normalized]
  );
  return result.rows[0]?.affiliate_code || null;
};

const normalizeOrderPaymentStatus = (value) => String(value || "").trim().toLowerCase();
const isOrderNumberValid = (value) => /^[A-Za-z0-9._-]{6,80}$/.test(String(value || "").trim());
const normalizeAffiliateCodeInput = (value) => String(value || "").trim().toUpperCase();
const isAffiliateCodeFormatValid = (value) => /^[A-Z0-9-]{6,24}$/.test(normalizeAffiliateCodeInput(value));

const generateUniqueAffiliateCode = async (client) => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `JP${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const exists = await client.query(
      `SELECT 1 FROM users WHERE affiliate_code = $1
       UNION
       SELECT 1 FROM affiliate_codes WHERE code = $1
       LIMIT 1`,
      [code]
    );
    if (!exists.rows.length) return code;
  }
  throw new Error("AFFILIATE_CODE_GENERATION_FAILED");
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
    filters.push("(LOWER(u.name) LIKE $1 OR LOWER(u.username) LIKE $1 OR LOWER(u.affiliate_code) LIKE $1)");
    values.push(`%${search}%`);
    idx++;
  }
  if (status !== "all") {
    filters.push(`u.status = $${idx++}`);
    values.push(status);
  }
  if (role !== "all") {
    filters.push(`u.role = $${idx++}`);
    values.push(role);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.username, u.status, u.affiliate_code, u.role, u.created_at, u.last_login,
              CASE
                WHEN u.affiliate_code IS NULL THEN NULL
                ELSE COALESCE(a.is_active, false)
              END AS affiliate_code_verified
       FROM users u
       LEFT JOIN affiliate_codes a ON a.code = u.affiliate_code
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users u ${where}`,
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

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT id, role, affiliate_code FROM users WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    await client.query("UPDATE users SET status = $1 WHERE id = $2", [status, req.params.id]);

    const normalizedCode = normalizeAffiliateCodeInput(user.affiliate_code);
    const hasAffiliateRole = ["affiliate", "admin"].includes(String(user.role || "").toLowerCase());
    if (normalizedCode && hasAffiliateRole) {
      if (status === "active") {
        const shouldBeActiveByDefault = String(user.role || "").toLowerCase() === "admin";
        await client.query(
          `INSERT INTO affiliate_codes (code, assigned_user_id, is_active)
           VALUES ($1, $2, $3)
           ON CONFLICT (code) DO UPDATE SET assigned_user_id = EXCLUDED.assigned_user_id`,
          [normalizedCode, user.id, shouldBeActiveByDefault]
        );
      } else {
        await client.query("UPDATE affiliate_codes SET is_active = false WHERE code = $1", [normalizedCode]);
      }
    }

    await logAdminAction(req.user.id, "update_status", req.params.id, { status }, client);
    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return res.status(500).json({ message: "Gagal update status." });
  } finally {
    if (client) client.release();
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
  if (!role || !["admin", "affiliate", "customer"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const userResult = await client.query(
      "SELECT id, role, affiliate_code FROM users WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    let affiliateCode = user.affiliate_code || null;
    if (role === "affiliate" || role === "admin") {
      if (!affiliateCode) {
        affiliateCode = await generateUniqueAffiliateCode(client);
      }
      const isActive = role === "admin";
      await client.query(
        "INSERT INTO affiliate_codes (code, assigned_user_id, is_active) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET assigned_user_id = EXCLUDED.assigned_user_id, is_active = EXCLUDED.is_active",
        [affiliateCode, user.id, isActive]
      );
    }

    if (role === "customer" && affiliateCode) {
      await client.query(
        "UPDATE affiliate_codes SET is_active = false, assigned_user_id = NULL WHERE code = $1",
        [affiliateCode]
      );
      affiliateCode = null;
    }

    await client.query(
      "UPDATE users SET role = $1, affiliate_code = $2 WHERE id = $3",
      [role, affiliateCode, req.params.id]
    );
    await logAdminAction(req.user.id, "update_role", req.params.id, { role, affiliateCode }, client);
    await client.query("COMMIT");
    return res.json({ ok: true, role, affiliateCode });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return res.status(500).json({ message: "Gagal update role." });
  } finally {
    if (client) client.release();
  }
});

router.patch("/users/:id/affiliate-code", requireAdmin, async (req, res) => {
  const rawCode = req.body?.affiliateCode;
  const affiliateCode = normalizeAffiliateCodeInput(rawCode);

  if (!isAffiliateCodeFormatValid(affiliateCode)) {
    return res.status(400).json({ message: "Format kode affiliate tidak valid (6-24, A-Z, 0-9, -)." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT id, role, affiliate_code FROM users WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    if (!["affiliate", "admin"].includes(user.role)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User harus ber-role affiliate/admin untuk punya kode affiliate." });
    }

    const currentCode = normalizeAffiliateCodeInput(user.affiliate_code);
    if (currentCode === affiliateCode) {
      await client.query("COMMIT");
      return res.json({ ok: true, affiliateCode, unchanged: true });
    }

    const existingOwner = await client.query(
      "SELECT id FROM users WHERE affiliate_code = $1 AND id <> $2 LIMIT 1",
      [affiliateCode, user.id]
    );
    if (existingOwner.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Kode affiliate sudah dipakai user lain." });
    }

    const existingCode = await client.query(
      "SELECT code, assigned_user_id FROM affiliate_codes WHERE code = $1 FOR UPDATE",
      [affiliateCode]
    );
    const existing = existingCode.rows[0];
    if (existing && existing.assigned_user_id && existing.assigned_user_id !== user.id) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Kode affiliate sudah terpakai." });
    }

    await client.query("UPDATE users SET affiliate_code = $1 WHERE id = $2", [affiliateCode, user.id]);

    if (currentCode && currentCode !== affiliateCode) {
      await client.query(
        "UPDATE affiliate_codes SET is_active = false, assigned_user_id = NULL WHERE code = $1",
        [currentCode]
      );
    }

    if (existing) {
      await client.query(
        "UPDATE affiliate_codes SET assigned_user_id = $2, is_active = false WHERE code = $1",
        [affiliateCode, user.id]
      );
    } else {
      await client.query(
        "INSERT INTO affiliate_codes (code, assigned_user_id, is_active) VALUES ($1, $2, false)",
        [affiliateCode, user.id]
      );
    }

    await logAdminAction(req.user.id, "set_affiliate_code", req.params.id, {
      oldCode: currentCode || null,
      newCode: affiliateCode,
    }, client);

    await client.query("COMMIT");
    return res.json({ ok: true, affiliateCode });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return res.status(500).json({ message: "Gagal mengubah kode affiliate." });
  } finally {
    if (client) client.release();
  }
});

router.patch("/users/:id/affiliate-verification", requireAdmin, async (req, res) => {
  const { verified } = req.body || {};
  if (typeof verified !== "boolean") {
    return res.status(400).json({ message: "Field verified harus boolean." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT id, role, status, affiliate_code FROM users WHERE id = $1 FOR UPDATE",
      [req.params.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User tidak ditemukan." });
    }
    if (!["affiliate", "admin"].includes(user.role)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User harus ber-role affiliate/admin." });
    }
    const affiliateCode = normalizeAffiliateCodeInput(user.affiliate_code);
    if (!isAffiliateCodeFormatValid(affiliateCode)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User belum punya kode affiliate yang valid." });
    }
    if (verified && user.status !== "active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User harus berstatus active untuk verifikasi kode." });
    }

    const existingCodeResult = await client.query(
      "SELECT assigned_user_id FROM affiliate_codes WHERE code = $1 FOR UPDATE",
      [affiliateCode]
    );
    const existingCode = existingCodeResult.rows[0];
    if (existingCode && existingCode.assigned_user_id && existingCode.assigned_user_id !== user.id) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Kode affiliate sudah terpakai user lain." });
    }

    if (existingCode) {
      await client.query(
        "UPDATE affiliate_codes SET assigned_user_id = $2, is_active = $3 WHERE code = $1",
        [affiliateCode, user.id, verified]
      );
    } else {
      await client.query(
        "INSERT INTO affiliate_codes (code, assigned_user_id, is_active) VALUES ($1, $2, $3)",
        [affiliateCode, user.id, verified]
      );
    }

    await logAdminAction(req.user.id, "set_affiliate_verification", req.params.id, {
      affiliateCode,
      verified,
    }, client);

    await client.query("COMMIT");
    return res.json({ ok: true, affiliateCode, verified });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return res.status(500).json({ message: "Gagal mengubah verifikasi kode affiliate." });
  } finally {
    if (client) client.release();
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
    filters.push("(LOWER(u.name) LIKE $1 OR LOWER(u.username) LIKE $1 OR LOWER(u.affiliate_code) LIKE $1)");
    values.push(`%${search}%`);
    idx++;
  }
  if (status !== "all") {
    filters.push(`u.status = $${idx++}`);
    values.push(status);
  }
  if (role !== "all") {
    filters.push(`u.role = $${idx++}`);
    values.push(role);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT u.name, u.username, u.affiliate_code, u.status, u.role, u.created_at, u.last_login,
              CASE
                WHEN u.affiliate_code IS NULL THEN NULL
                ELSE COALESCE(a.is_active, false)
              END AS affiliate_code_verified
       FROM users u
       LEFT JOIN affiliate_codes a ON a.code = u.affiliate_code
       ${where}
       ORDER BY u.created_at DESC`,
      values
    );

    const header = "name,username,affiliate_code,affiliate_code_verified,status,role,created_at,last_login";
    const rows = result.rows
      .map((row) =>
        [
          row.name,
          row.username,
          row.affiliate_code || "",
          row.affiliate_code_verified === null ? "" : String(Boolean(row.affiliate_code_verified)),
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
  const normalizedOrderNumber = String(orderNumber).trim();
  const parsedTotal = Number(totalAmount);
  const normalizedDate = String(orderDate).trim();
  if (!normalizedOrderNumber || !Number.isFinite(parsedTotal) || parsedTotal <= 0) {
    return res.status(400).json({ message: "Data order tidak valid." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    return res.status(400).json({ message: "Format tanggal order tidak valid." });
  }
  const parsedDate = new Date(`${normalizedDate}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== normalizedDate) {
    return res.status(400).json({ message: "Tanggal order tidak valid." });
  }

  try {
    const validAffiliateCode = await resolveAffiliateCode(affiliateCode);
    if (affiliateCode && !validAffiliateCode) {
      return res.status(400).json({ message: "Kode affiliate tidak valid." });
    }

    await pool.query(
      `INSERT INTO orders (
        order_number, total_amount, order_date, affiliate_code,
        checkout_channel, payment_status, paid_at
      ) VALUES ($1, $2, $3, $4, 'admin_manual', 'paid', NOW())`,
      [normalizedOrderNumber, parsedTotal, normalizedDate, validAffiliateCode]
    );
    await logAdminAction(req.user.id, "create_order", null, {
      orderNumber: normalizedOrderNumber,
      totalAmount: parsedTotal,
      affiliateCode: validAffiliateCode,
    });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menyimpan order." });
  }
});

router.patch("/orders/:orderNumber/payment", requireAdmin, async (req, res) => {
  const orderNumber = String(req.params.orderNumber || "").trim();
  const status = normalizeOrderPaymentStatus(req.body?.status);
  const reference = String(req.body?.reference || "").trim().slice(0, 120);
  const note = String(req.body?.note || "").trim().slice(0, 300);
  const method = String(req.body?.method || "QRIS").trim().slice(0, 40) || "QRIS";
  const allowed = new Set(["pending", "paid", "cancelled", "failed"]);

  if (!isOrderNumberValid(orderNumber)) {
    return res.status(400).json({ message: "Nomor order tidak valid." });
  }
  if (!allowed.has(status)) {
    return res.status(400).json({ message: "Status pembayaran tidak valid." });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET payment_status = $2,
           payment_method = COALESCE(NULLIF($3, ''), payment_method, 'QRIS'),
           payment_reference = COALESCE(NULLIF($4, ''), payment_reference),
           payment_transaction_status = CASE
             WHEN $2 = 'paid' THEN 'verified_by_admin'
             WHEN $2 = 'pending' THEN 'awaiting_transfer'
             WHEN $2 = 'cancelled' THEN 'cancelled_by_admin'
             ELSE 'failed_by_admin'
           END,
           paid_at = CASE
             WHEN $2 = 'paid' THEN COALESCE(paid_at, NOW())
             ELSE NULL
           END,
           cancelled_at = CASE
             WHEN $2 IN ('cancelled', 'failed') THEN COALESCE(cancelled_at, NOW())
             ELSE NULL
           END,
           notes = CASE
             WHEN $5 = '' THEN notes
             WHEN notes IS NULL OR notes = '' THEN '[PAYMENT] ' || $5
             ELSE notes || E'\n[PAYMENT] ' || $5
           END,
           updated_at = NOW()
       WHERE order_number = $1
       RETURNING order_number, payment_status, payment_reference, payment_method, payment_transaction_status`,
      [orderNumber, status, method, reference, note]
    );

    const updated = result.rows[0];
    if (!updated) {
      return res.status(404).json({ message: "Order tidak ditemukan." });
    }

    await logAdminAction(req.user.id, "update_order_payment", null, {
      orderNumber,
      status,
      reference: reference || null,
      method,
      note: note || null,
    });

    return res.json({
      ok: true,
      orderNumber: updated.order_number,
      paymentStatus: updated.payment_status,
      paymentReference: updated.payment_reference || null,
      paymentMethod: updated.payment_method || null,
      paymentTransactionStatus: updated.payment_transaction_status || null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengubah status pembayaran." });
  }
});

module.exports = { adminRouter: router };
