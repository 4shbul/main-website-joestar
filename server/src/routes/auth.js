const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { generateOtpCode, generateSessionId } = require("../services/otp");
const { sendWhatsAppOtp } = require("../services/whatsapp");

const router = express.Router();

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 30;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
  });

const createRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(48).toString("hex");
  const hashed = hashToken(raw);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, hashed, expiresAt]
  );

  return { token: raw, expiresAt };
};

const revokeRefreshToken = async (rawToken) => {
  if (!rawToken) return;
  const hashed = hashToken(rawToken);
  await pool.query(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
    [hashed]
  );
};

router.post("/signup", async (req, res) => {
  const { name, username, password, redeemCode, phone } = req.body || {};
  if (!name || !username || !password || !redeemCode || !phone) {
    return res.status(400).json({ message: "Data signup tidak lengkap." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Username sudah terdaftar." });
    }

    const codeCheck = await client.query(
      "SELECT code FROM affiliate_codes WHERE code = $1 AND assigned_user_id IS NULL AND is_active = true",
      [redeemCode]
    );
    if (!codeCheck.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Kode redeem tidak valid atau sudah dipakai." });
    }

    const status = process.env.REQUIRE_APPROVAL === "true" ? "pending" : "active";
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      "INSERT INTO users (name, username, phone, password_hash, affiliate_code, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [name, username, phone, passwordHash, redeemCode, status]
    );

    await client.query(
      "UPDATE affiliate_codes SET assigned_user_id = $1 WHERE code = $2",
      [userResult.rows[0].id, redeemCode]
    );

    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Gagal membuat akun." });
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi." });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const result = await pool.query(
      "SELECT id, username, phone, password_hash, status, failed_attempts, locked_until, role FROM users WHERE username = $1",
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      await pool.query(
        "INSERT INTO login_attempts (email, ip_address, success) VALUES ($1, $2, false)",
        [username, ip]
      );
      return res.status(401).json({ message: "Username atau password salah." });
    }

    if (user.status === "banned") {
      return res.status(403).json({ message: "Akun diblokir. Hubungi admin." });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Akun menunggu persetujuan admin." });
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return res.status(429).json({ message: "Akun sementara terkunci. Coba lagi nanti." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const failed = (user.failed_attempts || 0) + 1;
      const lock = failed >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60000) : null;
      await pool.query(
        "UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3",
        [failed, lock, user.id]
      );
      await pool.query(
        "INSERT INTO login_attempts (user_id, email, ip_address, success) VALUES ($1, $2, $3, false)",
        [user.id, username, ip]
      );
      return res.status(401).json({ message: "Username atau password salah." });
    }

    await pool.query(
      "UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1",
      [user.id]
    );

    const code = generateOtpCode();
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await pool.query(
      "INSERT INTO otp_sessions (id, user_id, code, expires_at) VALUES ($1, $2, $3, $4)",
      [sessionId, user.id, code, expiresAt]
    );

    await sendWhatsAppOtp(user.phone, code);

    return res.json({ otpRequired: true, sessionId });
  } catch (error) {
    return res.status(500).json({ message: "Gagal login." });
  }
});

router.post("/otp/resend", async (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ message: "Session OTP tidak valid." });
  }

  try {
    const result = await pool.query(
      "SELECT id, user_id, requested_at, used_at, expires_at FROM otp_sessions WHERE id = $1",
      [sessionId]
    );
    const session = result.rows[0];
    if (!session || session.used_at) {
      return res.status(400).json({ message: "OTP tidak valid." });
    }

    const lastRequest = new Date(session.requested_at).getTime();
    if (Date.now() - lastRequest < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ message: "Tunggu sebentar sebelum kirim ulang OTP." });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await pool.query(
      "UPDATE otp_sessions SET code = $1, expires_at = $2, requested_at = NOW() WHERE id = $3",
      [code, expiresAt, sessionId]
    );

    const userResult = await pool.query("SELECT phone FROM users WHERE id = $1", [session.user_id]);
    await sendWhatsAppOtp(userResult.rows[0].phone, code);

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengirim OTP." });
  }
});

router.post("/otp/verify", async (req, res) => {
  const { sessionId, code } = req.body || {};
  if (!sessionId || !code) {
    return res.status(400).json({ message: "OTP tidak valid." });
  }

  try {
    const result = await pool.query(
      "SELECT id, user_id, code, expires_at, used_at FROM otp_sessions WHERE id = $1",
      [sessionId]
    );
    const session = result.rows[0];
    if (!session || session.used_at) {
      return res.status(400).json({ message: "OTP sudah digunakan atau tidak valid." });
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP sudah kedaluwarsa." });
    }

    if (session.code !== code) {
      return res.status(400).json({ message: "OTP salah." });
    }

    await pool.query("UPDATE otp_sessions SET used_at = NOW() WHERE id = $1", [sessionId]);

    const userResult = await pool.query(
      "SELECT id, username, name, affiliate_code, role, status FROM users WHERE id = $1",
      [session.user_id]
    );
    const user = userResult.rows[0];
    const token = signAccessToken(user);
    const refresh = await createRefreshToken(user.id);

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
    await pool.query(
      "INSERT INTO login_attempts (user_id, email, success) VALUES ($1, $2, true)",
      [user.id, user.username]
    );

    return res.json({
      token,
      refreshToken: refresh.token,
      user: {
        username: user.username,
        name: user.name,
        affiliateCode: user.affiliate_code,
        role: user.role,
        status: user.status || "active",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal verifikasi OTP." });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token tidak ada." });
  }

  try {
    const hashed = hashToken(refreshToken);
    const result = await pool.query(
      "SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1",
      [hashed]
    );
    const row = result.rows[0];
    if (!row || row.revoked_at) {
      return res.status(401).json({ message: "Refresh token tidak valid." });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(401).json({ message: "Refresh token kadaluarsa." });
    }

    await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [row.id]);

    const userResult = await pool.query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [row.user_id]
    );
    const user = userResult.rows[0];
    const token = signAccessToken(user);
    const refresh = await createRefreshToken(user.id);

    return res.json({ token, refreshToken: refresh.token });
  } catch (error) {
    return res.status(500).json({ message: "Gagal refresh token." });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body || {};
  await revokeRefreshToken(refreshToken);
  return res.json({ ok: true });
});

router.post("/password/forgot", async (req, res) => {
  const { username } = req.body || {};
  if (!username) {
    return res.status(400).json({ message: "Username wajib diisi." });
  }

  try {
    const result = await pool.query("SELECT id, phone FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) {
      return res.json({ ok: true });
    }

    const raw = crypto.randomBytes(24).toString("hex");
    const hashed = hashToken(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, hashed, expiresAt]
    );

    await sendWhatsAppOtp(user.phone, raw);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengirim token reset." });
  }
});

router.post("/password/reset", async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ message: "Token dan password wajib diisi." });
  }

  try {
    const hashed = hashToken(token);
    const result = await pool.query(
      "SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1",
      [hashed]
    );
    const row = result.rows[0];
    if (!row || row.used_at) {
      return res.status(400).json({ message: "Token reset tidak valid." });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: "Token reset kadaluarsa." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      row.user_id,
    ]);
    await pool.query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1", [row.id]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Gagal reset password." });
  }
});

module.exports = { authRouter: router };
