const express = require("express");
const crypto = require("crypto");
const { pool } = require("../db");

const router = express.Router();

const normalizeAffiliateCode = (value) => String(value || "").trim().toUpperCase();
const normalizeText = (value) => String(value || "").trim();
const normalizePhone = (value) => String(value || "").trim().replace(/[^\d+]/g, "");
const normalizePostal = (value) => String(value || "").trim().replace(/[^\dA-Za-z-]+/g, "");
const normalizeOrderNumber = (value) => String(value || "").trim();
const normalizeProductId = (value) => String(value || "").trim().toLowerCase();

const isAffiliateCodeValid = (value) => /^[A-Z0-9-]{6,24}$/.test(normalizeAffiliateCode(value));
const isOrderNumberValid = (value) => /^[A-Za-z0-9._-]{6,80}$/.test(normalizeOrderNumber(value));

const MANUAL_QRIS_IMAGE_URL = normalizeText(process.env.MANUAL_QRIS_IMAGE_URL || "");
const MANUAL_QRIS_MERCHANT = normalizeText(process.env.MANUAL_QRIS_MERCHANT || "Joestar Peptide");
const MANUAL_QRIS_LABEL = normalizeText(
  process.env.MANUAL_QRIS_LABEL || "Scan QRIS di halaman ini lalu konfirmasi pembayaran ke admin."
);
const MANUAL_PAYMENT_WHATSAPP = normalizePhone(process.env.MANUAL_PAYMENT_WHATSAPP || "6287732013193");
const IS_PRODUCTION = String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";
const QRIS_DEMO_MODE =
  String(process.env.QRIS_DEMO_MODE || (IS_PRODUCTION ? "false" : "true"))
    .trim()
    .toLowerCase() === "true";
const QRIS_DEMO_IMAGE_URL = normalizeText(process.env.QRIS_DEMO_IMAGE_URL || "/img/qris-demo.svg");

// Important: order pricing is validated from backend catalog (do not trust client price payload).
const PRODUCT_CATALOG = Object.freeze({
  "ret-5": { name: "Retatrutide 5mg", price: 1150000, available: true },
  "ret-10": { name: "Retatrutide 10mg", price: 1600000, available: true },
  "ret-30": { name: "Retatrutide 30mg", price: 4200000, available: true },
  "cjc-ipa": { name: "CJC (no dac) + IPA 10mg", price: 1300000, available: true },
  "ghk-cu": { name: "GHK-Cu 100mg", price: 1300000, available: true },
  semax: { name: "Semax 10mg", price: 1150000, available: true },
  motsc: { name: "MOTS-c 10mg", price: 1000000, available: true },
  dsip: { name: "DSIP 10mg", price: 1150000, available: true },
  wolverine: { name: "Wolverine 10mg", price: 1300000, available: true },
  "bpc-157": { name: "BPC-157 10mg", price: 700000, available: true },
  "pt-141": { name: "PT-141 10mg", price: 1150000, available: true },
  glutathione: { name: "Glutathione 1500mg", price: 1300000, available: true },
  klow: { name: "Klow 80mg", price: 2500000, available: true },
  "bac-3": { name: "Bac Water 3ml", price: 300000, available: true },
  "bac-10": { name: "Bac Water 10ml", price: 450000, available: true },
  "disposable-syringe-insulin": { name: "Disposable Syringe Insulin 1 biji", price: 7000, available: true },
});

const resolveAffiliateCode = async (code) => {
  const normalized = normalizeAffiliateCode(code);
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

const buildOrderNumber = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `JPWEB-${timestamp}-${random}`;
};

const paymentStatusMessage = (status) => {
  if (status === "paid") return "Pembayaran sudah diverifikasi. Pesanan Anda sedang diproses.";
  if (status === "pending") return "Menunggu pembayaran dan verifikasi admin.";
  if (status === "cancelled") return "Pembayaran dibatalkan.";
  if (status === "failed") return "Pembayaran gagal. Silakan hubungi admin.";
  return "Status pembayaran belum final.";
};

const normalizeItemsFromCatalog = (rawItems) => {
  const items = Array.isArray(rawItems) ? rawItems : [];
  if (!items.length) {
    return { error: "Keranjang masih kosong." };
  }

  const normalizedItems = [];
  let grossAmount = 0;
  for (const item of items) {
    const id = normalizeProductId(item?.id);
    const quantity = Number(item?.quantity);

    if (!id || !Number.isInteger(quantity) || quantity <= 0 || quantity > 20) {
      return { error: "Item checkout tidak valid." };
    }

    const catalog = PRODUCT_CATALOG[id];
    if (!catalog) {
      return { error: `Produk tidak dikenali: ${id}` };
    }
    if (!catalog.available) {
      return { error: `${catalog.name} saat ini tidak tersedia.` };
    }

    const price = Number(catalog.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: `${catalog.name} belum dapat dibayar secara online.` };
    }

    normalizedItems.push({
      id: id.slice(0, 50),
      name: String(catalog.name).slice(0, 255),
      quantity,
      price: Math.round(price),
      category: "Research Product",
    });
    grossAmount += Math.round(price) * quantity;
  }

  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    return { error: "Total checkout tidak valid." };
  }

  return { items: normalizedItems, grossAmount };
};

const buildConfirmationMessage = ({ orderNumber, totalAmount, name, phone }) => {
  const lines = [
    "Halo admin Joestar, saya sudah checkout.",
    `Order: ${orderNumber}`,
    `Total: Rp ${Number(totalAmount || 0).toLocaleString("id-ID")}`,
    `Nama: ${name}`,
    `WA: ${phone}`,
    "Saya sudah melakukan pembayaran QRIS, mohon verifikasi.",
  ];
  return lines.join("\n");
};

const resolveQrisConfig = () => {
  if (MANUAL_QRIS_IMAGE_URL) {
    return {
      imageUrl: MANUAL_QRIS_IMAGE_URL,
      isDemo: false,
      label: MANUAL_QRIS_LABEL,
      merchant: MANUAL_QRIS_MERCHANT,
    };
  }
  if (QRIS_DEMO_MODE && QRIS_DEMO_IMAGE_URL) {
    return {
      imageUrl: QRIS_DEMO_IMAGE_URL,
      isDemo: true,
      label: "QRIS DEMO untuk testing. Jangan transfer dana real.",
      merchant: `${MANUAL_QRIS_MERCHANT} (DEMO)`,
    };
  }
  return null;
};

router.get("/status/:orderNumber", async (req, res) => {
  const orderNumber = normalizeOrderNumber(req.params.orderNumber);
  if (!isOrderNumberValid(orderNumber)) {
    return res.status(400).json({ message: "Nomor order tidak valid." });
  }

  try {
    const result = await pool.query(
      `SELECT order_number, total_amount, order_date, affiliate_code,
              payment_status, payment_method, payment_transaction_status,
              payment_gateway, payment_redirect_url, created_at, updated_at
       FROM orders
       WHERE order_number = $1
       LIMIT 1`,
      [orderNumber]
    );
    const order = result.rows[0];
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan." });
    }

    const status = String(order.payment_status || "pending");
    return res.json({
      ok: true,
      orderNumber: order.order_number,
      totalAmount: Number(order.total_amount || 0),
      orderDate: order.order_date,
      affiliateCode: order.affiliate_code || null,
      paymentGateway: order.payment_gateway || null,
      paymentMethod: order.payment_method || null,
      paymentTransactionStatus: order.payment_transaction_status || null,
      paymentStatus: status,
      canRetry: status === "failed" || status === "cancelled",
      message: paymentStatusMessage(status),
      redirectUrl: order.payment_redirect_url || null,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat status pembayaran." });
  }
});

router.post("/checkout", async (req, res) => {
  const qrisConfig = resolveQrisConfig();
  if (!qrisConfig?.imageUrl) {
    return res.status(503).json({ message: "QRIS belum dikonfigurasi di server." });
  }

  const payload = req.body || {};
  const name = normalizeText(payload.name);
  const phone = normalizePhone(payload.phone);
  const city = normalizeText(payload.city);
  const postal = normalizePostal(payload.postal);
  const address = normalizeText(payload.address);
  const notes = normalizeText(payload.notes);
  const rawAffiliateCode = normalizeAffiliateCode(payload.affiliateCode);

  if (!name || !phone || !city || !postal || !address) {
    return res.status(400).json({ message: "Data checkout tidak lengkap." });
  }
  if (rawAffiliateCode && !isAffiliateCodeValid(rawAffiliateCode)) {
    return res.status(400).json({ message: "Format kode affiliate tidak valid." });
  }

  const normalizedItemsResult = normalizeItemsFromCatalog(payload.items);
  if (normalizedItemsResult.error) {
    return res.status(400).json({ message: normalizedItemsResult.error });
  }

  const normalizedItems = normalizedItemsResult.items;
  const grossAmount = normalizedItemsResult.grossAmount;

  try {
    const affiliateCode = await resolveAffiliateCode(rawAffiliateCode);
    if (rawAffiliateCode && !affiliateCode) {
      return res.status(400).json({ message: "Kode affiliate tidak valid." });
    }

    const orderNumber = buildOrderNumber();
    const orderDate = new Date().toISOString().slice(0, 10);
    const confirmationMessage = buildConfirmationMessage({
      orderNumber,
      totalAmount: grossAmount,
      name,
      phone,
    });
    const whatsappLink = MANUAL_PAYMENT_WHATSAPP
      ? `https://wa.me/${MANUAL_PAYMENT_WHATSAPP}?text=${encodeURIComponent(confirmationMessage)}`
      : null;

    const payloadForDb = {
      mode: qrisConfig.isDemo ? "manual_qris_web_demo" : "manual_qris_web",
      item_count: normalizedItems.length,
      items: normalizedItems,
      qris_merchant: qrisConfig.merchant || null,
      qris_image_url: qrisConfig.imageUrl,
      qris_is_demo: Boolean(qrisConfig.isDemo),
      confirmation_channel: "whatsapp",
      confirmation_whatsapp: MANUAL_PAYMENT_WHATSAPP || null,
    };

    await pool.query(
      `INSERT INTO orders (
        order_number, total_amount, order_date, affiliate_code,
        checkout_channel, customer_name, customer_phone, customer_city, customer_postal, customer_address, notes,
        payment_gateway, payment_status, payment_method, payment_transaction_status, payment_payload
      ) VALUES (
        $1, $2, $3, $4, $11, $5, $6, $7, $8, $9, $10,
        'manual', 'pending', 'QRIS', 'awaiting_transfer', $12::jsonb
      )`,
      [
        orderNumber,
        grossAmount,
        orderDate,
        affiliateCode,
        name,
        phone,
        city,
        postal,
        address,
        notes || null,
        qrisConfig.isDemo ? "manual_qris_web_demo" : "manual_qris_web",
        JSON.stringify(payloadForDb),
      ]
    );

    return res.json({
      ok: true,
      orderNumber,
      totalAmount: grossAmount,
      paymentStatus: "pending",
      paymentMethod: "QRIS",
      paymentGateway: "manual",
      message: qrisConfig.isDemo
        ? "Order demo dibuat. Silakan gunakan QRIS demo untuk testing tampilan."
        : "Order dibuat. Silakan scan QRIS di halaman ini.",
      qris: {
        merchant: qrisConfig.merchant || null,
        label: qrisConfig.label || null,
        imageUrl: qrisConfig.imageUrl,
        isDemo: Boolean(qrisConfig.isDemo),
      },
      confirmation: {
        whatsappNumber: MANUAL_PAYMENT_WHATSAPP || null,
        whatsappLink,
        message: confirmationMessage,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal membuat checkout pembayaran." });
  }
});

router.post("/xendit/invoice/webhook", async (_req, res) => {
  return res.status(410).json({ message: "Xendit dinonaktifkan. Gunakan QRIS manual di web." });
});

router.post("/midtrans/webhook", async (_req, res) => {
  return res.status(410).json({ message: "Midtrans dinonaktifkan. Gunakan QRIS manual di web." });
});

module.exports = { paymentsRouter: router };
