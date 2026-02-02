const express = require("express");
const { pool } = require("../db");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, name, affiliate_code, status, role, last_login FROM users WHERE id = $1",
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
      status: user.status,
      role: user.role,
      lastLogin: user.last_login,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat data user." });
  }
});

router.get("/sales", auth, async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ message: "Kode redeem dibutuhkan." });
  }

  try {
    const userResult = await pool.query(
      "SELECT affiliate_code FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = userResult.rows[0];
    if (!user || user.affiliate_code !== code) {
      return res.status(403).json({ message: "Kode redeem tidak sesuai akun." });
    }

    const salesResult = await pool.query(
      "SELECT order_number, total_amount, order_date FROM orders WHERE affiliate_code = $1 ORDER BY order_date DESC",
      [code]
    );

    const sales = salesResult.rows.map((row) => ({
      orderNumber: row.order_number,
      totalAmount: Number(row.total_amount),
      orderDate: row.order_date.toISOString().split("T")[0],
    }));

    const total = sales.reduce((sum, row) => sum + row.totalAmount, 0);
    const commissionRate = 0.04;
    const commissionTotal = Math.round(total * commissionRate);

    return res.json({ sales, total, commissionRate, commissionTotal });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat data penjualan." });
  }
});

module.exports = { affiliateRouter: router };
