# Wallets & Adjustments API

The Wallets API manages financial containers (cash, bank accounts, liabilities) and handles balance adjustments, cross-currency inter-wallet transfers, and transaction ledger histories.

All endpoints require authentication (`auth_token` cookie).

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/wallets` | List all active/archived wallets with calculated net balances. |
| `POST` | `/api/v1/wallets` | Create a new asset or liability wallet. |
| `GET` | `/api/v1/wallets/:id` | Fetch details for a specific wallet. |
| `PUT` | `/api/v1/wallets/:id` | Update wallet title, color, icon, or order. |
| `DELETE` | `/api/v1/wallets/:id` | Delete a wallet (verifies no blocking dependency relations). |
| `POST` | `/api/v1/wallets/transfer` | Execute money transfer between two wallets with FX conversion. |
| `DELETE` | `/api/v1/wallets/transfers/:transferId` | Revert a transfer, restoring original balances. |
| `GET` | `/api/v1/wallets/:id/adjustments` | Audit log of manual balance adjustments. |
| `POST` | `/api/v1/wallets/:id/adjustments` | Record a count reconciliation or delta adjustment. |
| `DELETE` | `/api/v1/wallets/:id/adjustments/:adjustmentId` | Revert a specific adjustment. |
| `GET` | `/api/v1/wallets/:id/transactions` | Unified timeline of transfers, spendings, incomes, and adjustments. |

---

## Detailed Specifications

### 1. List Wallets
- **Method:** `GET /api/v1/wallets`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "name": "Main Checking",
      "type": "asset",
      "currentBalance": "15400.00",
      "defaultCurrency": "MAD",
      "color": "#10b981",
      "icon": "Building2",
      "status": "active"
    },
    {
      "id": "22222222-3333-4444-5555-666666666666",
      "name": "Credit Card",
      "type": "liability",
      "currentBalance": "2350.00",
      "defaultCurrency": "MAD",
      "color": "#f43f5e",
      "icon": "CreditCard",
      "status": "active"
    }
  ]
}
```

---

### 2. Create Wallet
- **Method:** `POST /api/v1/wallets`

#### Request Body
```json
{
  "name": "Emergency Cash",
  "type": "asset",
  "defaultCurrency": "MAD",
  "initialBalance": "5000.00",
  "color": "#059669",
  "icon": "Banknote"
}
```

---

### 3. Record Balance Adjustment
Adjusts the current balance using one of two strategies:
- `reconcile`: Sets the balance directly to the physical counted amount (ideal for end-of-month cash/statement checks).
- `delta`: Adds or subtracts a specific positive/negative delta.

- **Method:** `POST /api/v1/wallets/:id/adjustments`

#### Request Body (Reconciliation)
```json
{
  "adjustmentType": "reconcile",
  "amount": "15400.00",
  "adjustmentDate": "2026-11-17",
  "notes": "End of month physical count"
}
```

#### Request Body (Delta)
```json
{
  "adjustmentType": "delta",
  "amount": "-50.00",
  "adjustmentDate": "2026-11-17",
  "notes": "Bank maintenance fee adjustment"
}
```

---

### 4. Inter-Wallet Money Transfer
Transfers funds from `fromWalletId` to `toWalletId`. If currencies differ, `exchangeRate` and `targetAmount` compute the destination credit.

- **Method:** `POST /api/v1/wallets/transfer`

#### Request Body
```json
{
  "fromWalletId": "11111111-2222-3333-4444-555555555555",
  "toWalletId": "33333333-4444-5555-6666-777777777777",
  "amount": "100.00",
  "fromCurrency": "EUR",
  "targetAmount": "1080.50",
  "toCurrency": "MAD",
  "exchangeRate": "10.805000",
  "transferDate": "2026-11-17",
  "notes": "Euro repatriation to primary checking"
}
```

---

### 5. Wallet Transactions Ledger
Returns the chronological timeline of all transactions impacting the specified wallet (Transfers In, Transfers Out, Direct Fund deposits, Spendings, Incomes, and Reconciliations).

- **Method:** `GET /api/v1/wallets/:id/transactions`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-1",
      "type": "income",
      "date": "2026-11-17",
      "amount": "8500.00",
      "currency": "MAD",
      "description": "Monthly Consulting Retainer",
      "categoryName": "Consulting"
    },
    {
      "id": "tx-2",
      "type": "spending",
      "date": "2026-11-16",
      "amount": "-120.00",
      "currency": "MAD",
      "description": "Supermarket Groceries",
      "categoryName": "Food"
    }
  ]
}
```
