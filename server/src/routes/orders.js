const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { orderNumber, totalAmount, orderDate, affiliateCode } = req.body || {};
  if (!orderNumber || !totalAmount || !orderDate) {
    return res.status(400).json({ message: "Data order tidak lengkap." });
  }

  try {
    await pool.query(
      "INSERT INTO orders (order_number, total_amount, order_date, affiliate_code) VALUES ($1, $2, $3, $4)",
      [orderNumber, totalAmount, orderDate, affiliateCode || null]
    );
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menyimpan order." });
  }
});

module.exports = { ordersRouter: router };
