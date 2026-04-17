const express = require("express");
const crypto = require("crypto");
const { pool } = require("../db");
const { auth } = require("../middleware/auth");

const router = express.Router();
const DEFAULT_COMMISSION_RATE = 0.04;
const MAX_SALES_LIMIT = 100;

const normalizeAffiliateCodeInput = (value) => String(value || "").trim().toUpperCase();
const isAffiliateCodeFormatValid = (value) => /^[A-Z0-9-]{6,24}$/.test(normalizeAffiliateCodeInput(value));
const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
};
const commissionRate = (() => {
  const parsed = Number(process.env.AFFILIATE_COMMISSION_RATE || DEFAULT_COMMISSION_RATE);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) return DEFAULT_COMMISSION_RATE;
  return parsed;
})();

const formatOrderDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const maskIdentity = (value) => {
  const source = String(value || "").trim();
  if (!source) return "affiliate";
  if (source.length <= 2) return `${source[0] || "*"}*`;
  return `${source.slice(0, 2)}${"*".repeat(Math.min(6, source.length - 2))}`;
};

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

router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.username, u.name, u.affiliate_code, u.status, u.role, u.last_login,
              CASE
                WHEN u.affiliate_code IS NULL THEN NULL
                ELSE COALESCE(a.is_active, false)
              END AS affiliate_code_verified
       FROM users u
       LEFT JOIN affiliate_codes a ON a.code = u.affiliate_code
       WHERE u.id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }
    return res.json({
      username: user.username,
      name: user.name,
      affiliateCode: user.affiliate_code,
      affiliateCodeVerified: user.affiliate_code_verified,
      status: user.status,
      role: user.role,
      lastLogin: user.last_login,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat data user." });
  }
});

router.get("/code/:code", async (req, res) => {
  const code = normalizeAffiliateCodeInput(req.params.code);
  if (!isAffiliateCodeFormatValid(code)) {
    return res.status(400).json({ message: "Format kode affiliate tidak valid." });
  }

  try {
    const ownerResult = await pool.query(
      `SELECT u.username, u.name, u.role
       FROM users u
       INNER JOIN affiliate_codes a ON a.code = u.affiliate_code
       WHERE u.affiliate_code = $1
         AND u.status = 'active'
         AND u.role IN ('affiliate', 'admin')
         AND a.assigned_user_id = u.id
         AND a.is_active = true
       LIMIT 1`,
      [code]
    );
    const owner = ownerResult.rows[0];

    if (!owner) {
      return res.json({
        ok: true,
        valid: false,
        code,
        message: "Kode affiliate tidak ditemukan atau belum diverifikasi admin.",
      });
    }

    return res.json({
      ok: true,
      valid: true,
      code,
      owner: {
        alias: maskIdentity(owner.username || owner.name),
        role: owner.role || null,
      },
      message: "Kode affiliate valid dan siap dipakai saat checkout.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memverifikasi kode affiliate." });
  }
});

router.post("/become", auth, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      "SELECT id, username, role, status, affiliate_code FROM users WHERE id = $1 FOR UPDATE",
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    if (user.status === "banned") {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Akun diblokir. Tidak dapat mengaktifkan affiliate." });
    }

    if (["affiliate", "admin"].includes(user.role) && user.affiliate_code) {
      await client.query("COMMIT");
      return res.json({
        ok: true,
        affiliateCode: user.affiliate_code,
        role: user.role,
        status: user.status,
      });
    }

    const affiliateCode = user.affiliate_code || (await generateUniqueAffiliateCode(client));
    const shouldBeActive = user.role === "admin";
    if (user.role === "admin") {
      await client.query("UPDATE users SET affiliate_code = $1 WHERE id = $2", [affiliateCode, user.id]);
    } else {
      await client.query("UPDATE users SET role = 'affiliate', affiliate_code = $1 WHERE id = $2", [
        affiliateCode,
        user.id,
      ]);
    }
    await client.query(
      "INSERT INTO affiliate_codes (code, assigned_user_id, is_active) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET assigned_user_id = EXCLUDED.assigned_user_id, is_active = EXCLUDED.is_active",
      [affiliateCode, user.id, shouldBeActive]
    );

    await client.query("COMMIT");
    return res.json({
      ok: true,
      affiliateCode,
      role: user.role === "admin" ? "admin" : "affiliate",
      status: user.status,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    return res.status(500).json({ message: "Gagal mengaktifkan akun affiliate." });
  } finally {
    if (client) client.release();
  }
});

router.get("/sales", auth, async (req, res) => {
  const requestedCode = normalizeAffiliateCodeInput(req.query.code);
  if (requestedCode && !isAffiliateCodeFormatValid(requestedCode)) {
    return res.status(400).json({ message: "Format kode affiliate tidak valid." });
  }
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 20), MAX_SALES_LIMIT);
  const offset = (page - 1) * limit;

  try {
    const userResult = await pool.query(
      "SELECT affiliate_code, role FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }
    if (!["affiliate", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Akun Anda belum terdaftar sebagai affiliate." });
    }

    const ownCode = normalizeAffiliateCodeInput(user.affiliate_code);
    if (!ownCode) {
      return res.status(400).json({ message: "Akun Anda belum memiliki kode affiliate aktif." });
    }
    if (requestedCode && requestedCode !== ownCode) {
      return res.status(403).json({ message: "Kode affiliate tidak sesuai akun." });
    }

    const code = ownCode;
    const salesResult = await pool.query(
      `SELECT order_number, total_amount, order_date
       FROM orders
       WHERE affiliate_code = $1
         AND COALESCE(payment_status, 'paid') = 'paid'
       ORDER BY order_date DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [code, limit, offset]
    );

    const summaryResult = await pool.query(
      `SELECT COUNT(*)::int AS total_orders,
              COALESCE(SUM(total_amount), 0)::numeric AS total_sales
       FROM orders
       WHERE affiliate_code = $1
         AND COALESCE(payment_status, 'paid') = 'paid'`,
      [code]
    );

    const sales = salesResult.rows.map((row) => ({
      orderNumber: row.order_number,
      totalAmount: Number(row.total_amount),
      orderDate: formatOrderDate(row.order_date),
    }));

    const totalOrders = Number(summaryResult.rows[0]?.total_orders || 0);
    const total = Number(summaryResult.rows[0]?.total_sales || 0);
    const commissionTotal = Math.round(total * commissionRate);
    const totalPages = Math.max(Math.ceil(totalOrders / limit), 1);

    return res.json({
      sales,
      total,
      commissionRate,
      commissionTotal,
      affiliateCode: code,
      page,
      limit,
      totalOrders,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat data penjualan." });
  }
});

module.exports = { affiliateRouter: router };
