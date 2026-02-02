# Joestar Affiliate API

## Setup
1. Create `server/.env` and fill the values.
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

## Affiliate Codes
Pre-insert redeem codes in `affiliate_codes` before signup, e.g.:
```
INSERT INTO affiliate_codes (code) VALUES ('JSR123'), ('PEPTIDE77');
```

## Orders API
To record orders (for affiliate sales), call:
```
POST /api/orders
Headers: x-admin-key: <ADMIN_KEY>
Body: { "orderNumber": "INV-001", "totalAmount": 1800000, "orderDate": "2026-01-31", "affiliateCode": "JSR123" }
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
