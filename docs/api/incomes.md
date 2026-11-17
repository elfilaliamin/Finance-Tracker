# Incomes & Sources API

The Incomes API handles revenue streams, income sources (clients, employers), income classifications, and automated wallet deposits.

All endpoints require authentication (`auth_token` cookie).

---

## Incomes Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/incomes` | List incomes with optional date, source, category, or wallet filters. |
| `GET` | `/api/v1/incomes/years` | Get list of distinct years containing income transactions. |
| `GET` | `/api/v1/incomes/:id` | Fetch specific income record. |
| `POST` | `/api/v1/incomes` | Record a new income (optionally crediting a wallet). |
| `PUT` | `/api/v1/incomes/:id` | Update an income record and adjust linked wallet balances. |
| `DELETE` | `/api/v1/incomes/:id` | Soft-delete income and deduct from linked wallet balance. |

---

## Detailed Specifications

### 1. Record New Income
When `walletId` is supplied, the destination wallet's balance is automatically incremented by the specified `amount`, and the entry is recorded into the wallet's transaction history.

- **Method:** `POST /api/v1/incomes`

#### Request Body
```json
{
  "date": "2026-11-17",
  "sourceId": "55555555-6666-7777-8888-999999999999",
  "categoryId": "44444444-5555-6666-7777-888888888888",
  "walletId": "11111111-2222-3333-4444-555555555555",
  "amount": "12500.00",
  "currency": "MAD",
  "description": "November Engineering Retainer",
  "notes": "Direct bank wire"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
    "date": "2026-11-17",
    "amount": "12500.00",
    "currency": "MAD",
    "walletId": "11111111-2222-3333-4444-555555555555",
    "description": "November Engineering Retainer"
  }
}
```

---

## Income Sources & Categories

Income classification endpoints:

### Income Sources (`/api/v1/income-sources`)
- `GET /api/v1/income-sources`: List active income sources.
- `POST /api/v1/income-sources`: Create source (`{ name, description, color }`).
- `PUT /api/v1/income-sources/:id`: Update source.
- `DELETE /api/v1/income-sources/:id`: Mark source inactive / soft-delete.

### Income Categories (`/api/v1/categories/income`)
- `GET /api/v1/categories/income`: List revenue categories.
- `POST /api/v1/categories/income`: Create category (`{ name, color, icon }`).
- `PUT /api/v1/categories/income/:id`: Update category.
- `DELETE /api/v1/categories/income/:id`: Soft-delete category.
