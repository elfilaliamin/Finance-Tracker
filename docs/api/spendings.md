# Spendings & Receipts API

The Spendings API processes itemized expenditure receipts. Receipts break down into line items with independent categories, unit prices, and decimal quantities.

All endpoints require authentication (`auth_token` cookie).

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/spendings` | List spendings with pagination and filters (store, category, wallet, dates). |
| `GET` | `/api/v1/spendings/:id` | Retrieve full spending receipt with all itemized line items. |
| `POST` | `/api/v1/spendings` | Record an itemized bill (supports Direct Funds). |
| `PUT` | `/api/v1/spendings/:id` | Update spending receipt metadata or line items. |
| `DELETE` | `/api/v1/spendings/:id` | Soft-delete spending and refund deducted wallet balance. |

---

## Detailed Specifications

### 1. Record Itemized Spending Receipt
When `directFunds: true` is passed:
1. The backend automatically injects the calculated total amount into the destination wallet (`paidFromWalletId`) as a pre-funding adjustment.
2. The spending transaction immediately deducts the total amount from that same wallet.
3. This creates a balanced ledger trace without requiring a manual balance adjustment first.

- **Method:** `POST /api/v1/spendings`

#### Request Body
```json
{
  "date": "2026-11-17",
  "paidFromWalletId": "11111111-2222-3333-4444-555555555555",
  "store": "Carrefour Market",
  "currency": "MAD",
  "notes": "Weekly household groceries",
  "directFunds": false,
  "items": [
    {
      "articleName": "Organic Milk",
      "categoryId": "22222222-3333-4444-5555-666666666666",
      "unitPrice": 12.50,
      "quantity": 2
    },
    {
      "articleName": "Fresh Apples",
      "categoryId": "22222222-3333-4444-5555-666666666666",
      "unitPrice": 18.00,
      "quantity": 1.5
    }
  ]
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "88888888-9999-aaaa-bbbb-cccccccccccc",
    "date": "2026-11-17",
    "store": "Carrefour Market",
    "totalAmount": "52.00",
    "currency": "MAD",
    "paidFromWalletId": "11111111-2222-3333-4444-555555555555",
    "items": [
      {
        "id": "item-1",
        "articleName": "Organic Milk",
        "quantity": "2.000",
        "unitPrice": "12.50",
        "lineTotal": "25.00"
      },
      {
        "id": "item-2",
        "articleName": "Fresh Apples",
        "quantity": "1.500",
        "unitPrice": "18.00",
        "lineTotal": "27.00"
      }
    ]
  }
}
```

---

## Spending Categories

Categorization endpoints under `/api/v1/categories/spending`:
- `GET /api/v1/categories/spending`: List spending categories.
- `POST /api/v1/categories/spending`: Create category (`{ name, description, color, icon }`).
- `PUT /api/v1/categories/spending/:id`: Update category.
- `DELETE /api/v1/categories/spending/:id`: Soft-delete category.
