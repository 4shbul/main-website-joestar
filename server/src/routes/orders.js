const express = require("express");
const { pool } = require("../db");

const router = express.Router();

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

router.post("/", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

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
      ) VALUES ($1, $2, $3, $4, 'manual_api', 'paid', NOW())`,
      [normalizedOrderNumber, parsedTotal, normalizedDate, validAffiliateCode]
    );
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menyimpan order." });
  }
});

module.exports = { ordersRouter: router };
