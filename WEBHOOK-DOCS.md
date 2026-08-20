# Webhook & API Payload Documentation

Dokumentasi lengkap semua webhook dan payload yang digunakan dalam sistem UMKM MANAGEMENT.

---

## Daftar Isi

1. [API Routes (Backend)](#1-api-routes-backend)
2. [Midtrans → Backend Webhook](#2-midtrans--backend-webhook)
3. [Backend → N8N Webhooks](#3-backend--n8n-webhooks)
4. [Flow Diagram](#4-flow-diagram)

---

## 1. API Routes (Backend)

Base URL: `http://localhost:3000`

### Payment Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/payments/webhook` | Midtrans notification callback |
| `GET` | `/api/payments/order/:orderId/status` | Cek & update status pembayaran dari Midtrans |

---

## 2. Midtrans → Backend Webhook

Midtrans akan mengirim HTTP POST ke backend ketika status transaksi berubah. 
Tetapi saat ini saya tidak memiliki VPS atau Host
untuk menguji ini, jadi saya coba menggunakan manual dengan POSTMAN

**URL:** `POST http://<backend-host>:3000/api/payments/webhook`

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "transaction_time": "2026-08-20 09:15:30",
  "transaction_status": "capture",
  "transaction_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status_message": "Success, transaction is found",
  "status_code": "200",
  "signature_key": "abc123def456...",
  "settlement_time": "2026-08-20 09:16:00",
  "payment_type": "bank_transfer",
  "payment_amount": 150000,
  "order_id": "ORD-20260820-001",
  "merchant_id": "G00000000",
  "gross_amount": "150000.00",
  "fraud_status": "accept",
  "executor_id": "SP-001",
  "acquirer": "bca",
  "card_type": "credit",
  "bank": "bca",
  "authorization_time": "2026-08-20 09:15:32",
  "va_number": "1234567890123"
}
```

### Field Reference

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `order_id` | string | ✅ | Nomor order (harus cocok dengan `order_number` di DB) |
| `transaction_status` | string | ✅ | Status dari Midtrans: `capture`, `settlement`, `pending`, `deny`, `cancel`, `expire` |
| `transaction_id` | string | ✅ | ID unik transaksi dari Midtrans |
| `signature_key` | string | ⚠️ | Signature key untuk verifikasi (SHA-512 hash) |
| `status_code` | string | ✅ | HTTP status code dari Midtrans |
| `gross_amount` | string | ✅ | Total pembayaran (string, desimal) |
| `fraud_status` | string | ❌ | Status fraud check: `accept`, `challenge`, `reject` |
| `payment_type` | string | ❌ | Tipe pembayaran: `bank_transfer`, `credit_card`, `gopay`, `shopeepay`, dll |
| `payment_amount` | number | ❌ | Jumlah yang dibayarkan |
| `settlement_time` | string | ❌ | Waktu settlement |
| `bank` | string | ❌ | Nama bank (untuk bank_transfer) |
| `va_number` | string | ❌ | Virtual Account number |

### Signature Verification

Backend memverifikasi signature dengan:

```
SHA512(order_id + status_code + gross_amount + server_key)
```

### Status Mapping

| Midtrans `transaction_status` | `fraud_status` | → Internal Status |
|-------------------------------|-----------------|--------------------|
| `capture` | `accept` | `PAID` |
| `capture` | `challenge` | `PENDING` |
| `capture` | `reject` | `FAILED` |
| `settlement` | — | `PAID` |
| `pending` | — | `PENDING` |
| `deny` | — | `FAILED` |
| `expire` | — | `EXPIRED` |
| `cancel` | — | `CANCELLED` |

### Response (Success)

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {}
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Invalid payload",
  "data": null
}
```

---

## 3. Backend → N8N Webhooks

Backend mengirim POST request ke N8N webhook setelah payment berhasil diproses.

**Base URL:** `N8N_WEBHOOK_URL` (default: `http://n8n:5678/webhook`)

---

### 3.1 Payment Notification Webhook

Dikirim ke N8N ketika pembayaran berhasil (status = `PAID`).

**URL:** `POST {N8N_WEBHOOK_URL}/payment-notification`

**Trigger:** `processSuccessfulPayment()` di `backend/src/modules/payment/service.ts`

#### Request Body

```json
{
  "orderId": 42,
  "orderNumber": "ORD-20260820-001",
  "amount": 150000,
  "customerEmail": "customer@example.com"
}
```

#### Field Reference

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `orderId` | number | ID internal order di database |
| `orderNumber` | string | Nomor order unik (contoh: `ORD-20260820-001`) |
| `amount` | number | Total pembayaran dalam Rupiah |
| `customerEmail` | string | Email customer |

#### N8N Processing Flow

```
Webhook Trigger → Validate Data → Format Notification → Log Notification → Respond OK → Send Gmail
```

#### N8N Response

**Success:**
```json
{
  "success": true,
  "message": "Notification processed"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Invalid data"
}
```

#### Gmail Output

Setelah diproses, N8N mengirim email dengan format:

**Subject:** `Payment Confirmed - Order ORD-20260820-001`

**Body:**
```
Hello!

Your payment has been confirmed.

Order Number: ORD-20260820-001
Amount: Rp150.000
Customer Email: customer@example.com

Thank you for your purchase!

Best regards,
```

---
  

## 4. Testing

### Test Midtrans Webhook (Manual)

```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-20260820-001",
    "transaction_status": "settlement",
    "transaction_id": "test-txn-001",
    "status_code": "200",
    "gross_amount": "150000.00",
    "signature_key": ""
  }'
```

### Test N8N Payment Notification

```bash
curl -X POST http://localhost:5678/webhook/payment-notification \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 42,
    "orderNumber": "ORD-20260820-001",
    "amount": 150000,
    "customerEmail": "test@example.com"
  }'
```
  
