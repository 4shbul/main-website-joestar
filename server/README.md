# Joestar Affiliate API

## Setup
1. Create `server/.env` and fill the values.
   - Untuk payment gateway QRIS (Xendit):
     - `XENDIT_SECRET_KEY=<xnd_development_... atau xnd_production_...>`
     - `XENDIT_WEBHOOK_TOKEN=<token_rahasia_webhook>`
     - `XENDIT_TIMEOUT_MS=15000` (opsional, timeout request ke Xendit dalam ms)
     - `XENDIT_INVOICE_DURATION_SECONDS=1800` (opsional, 300-86400 detik)
     - `APP_URL=https://domain-frontend-anda` (atau `http://localhost:5500` untuk lokal)
2. Create database tables:
   - Run the SQL in `server/sql/schema.sql`.
   - For existing DBs, run `server/sql/upgrade_auth.sql`.

## Default Admin
Saat server start, jika belum ada user admin, akan dibuat:
- Username: `admin`
- Password: `admin`
Ubah di `.env` (DEFAULT_ADMIN_*) setelah login pertama.
3. Install deps and start the server:
   - `npm install`
   - `npm start`

## Affiliate Signup & Codes
- Signup sekarang punya opsi role:
  - `isAffiliate: true` -> role `affiliate` + mendapatkan `affiliateCode` unik.
  - `isAffiliate: false` (default) -> role `customer` tanpa `affiliateCode`.
- Response signup sekarang mengembalikan code tersebut:
```
POST /api/auth/signup
Body: { "name": "John", "username": "john", "phone": "08xxx", "password": "secret", "isAffiliate": true }
Response: { "ok": true, "affiliateCode": "JPXXXXXXXX", "role": "affiliate" }
```
- Code ini bisa dipakai customer saat checkout dan dipakai admin saat input order (`affiliateCode`).
- User customer yang sudah login juga bisa upgrade mandiri:
```
POST /api/affiliate/become
Authorization: Bearer <JWT user>
Response: { "ok": true, "affiliateCode": "JPXXXXXXXX", "role": "affiliate" }
```
- Format share link affiliate yang bisa dibagikan:
```
https://www.joestarpeptides.com/?ref=JPXXXXXXXX
```
Website akan otomatis menyimpan `ref` dan mengisi kode affiliate di form checkout.

## Orders API
To record orders (for affiliate sales), call:
```
POST /api/orders
Headers: x-admin-key: <ADMIN_KEY>
Body: { "orderNumber": "INV-001", "totalAmount": 1800000, "orderDate": "2026-01-31", "affiliateCode": "JSR123" }
```
`affiliateCode` akan divalidasi ke user affiliate aktif. Jika tidak valid, request ditolak.

## Payment Gateway (QRIS Only via Xendit)
Checkout web menggunakan endpoint:
```
POST /api/payments/checkout
Body: {
  "name": "John Doe",
  "phone": "0812xxxx",
  "city": "Jakarta",
  "postal": "12345",
  "address": "Alamat lengkap",
  "notes": "Catatan opsional",
  "affiliateCode": "JPXXXXXX",
  "items": [
    { "id": "ret-5", "quantity": 1 }
  ]
}
Response: { "ok": true, "orderNumber": "JPWEB-...", "redirectUrl": "https://checkout.xendit.co/..." }
```
- `items.unitPrice` dari frontend tidak dipakai untuk perhitungan. Harga divalidasi dari katalog backend untuk mencegah manipulasi.
- Metode pembayaran dibatasi QRIS saja.

Webhook Xendit invoice:
```
POST /api/payments/xendit/invoice/webhook
```
- URL ini harus didaftarkan di Xendit Dashboard.
- Header `x-callback-token` diverifikasi pakai `XENDIT_WEBHOOK_TOKEN`.
- Status pembayaran order akan diupdate otomatis (`pending`, `paid`, `cancelled`, `failed`).
- Komisi affiliate dihitung dari order `payment_status = 'paid'`.

Cek status pembayaran (dipakai frontend setelah redirect balik dari Xendit):
```
GET /api/payments/status/:orderNumber
Response: {
  "ok": true,
  "orderNumber": "JPWEB-...",
  "paymentStatus": "pending|paid|cancelled|failed",
  "message": "..."
}
```

## Admin API (Login-only)
Gunakan header `Authorization: Bearer <JWT>` (role = admin).

Generate kode:
```
POST /api/admin/redeem-codes
Body: { "count": 10 }
```

Set role admin:
```
PATCH /api/admin/users/<USER_ID>/role
Body: { "role": "admin" }
```

Export CSV:
```
GET /api/admin/affiliates/export
```

Resend OTP user:
```
POST /api/admin/users/<USER_ID>/otp/resend
```

Reset password user:
```
POST /api/admin/users/<USER_ID>/reset-password
```

Audit log:
```
GET /api/admin/audit-log
```

Manual WhatsApp order:
```
POST /api/admin/orders
Body: { "orderNumber": "INV-1001", "totalAmount": 1800000, "orderDate": "2026-02-01", "affiliateCode": "JSR123" }
```
`affiliateCode` akan divalidasi ke user affiliate aktif.
