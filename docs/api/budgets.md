# Budgets & Goals API

The Budgets API manages financial thresholds and savings targets. It features a unified engine supporting both **spending limits** (spending ceilings per category/period) and **saving goals** (target milestones linked to specific wallets).

All endpoints require authentication (`auth_token` cookie).

---

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/budgets` | List all budgets and goals with real-time progress calculations. |
| `POST` | `/api/v1/budgets` | Create a new spending limit or saving goal. |
| `PUT` | `/api/v1/budgets/:id` | Update budget targets, dates, or active status. |
| `DELETE` | `/api/v1/budgets/:id` | Soft-delete a budget or goal. |

---

## Budget Types

### 1. Spending Limits (`type: "spending_limit"`)
Enforces maximum allowable spending within a given category and timeframe:
- Evaluates actual spending in `spending_items` for the period.
- Computes `spentAmount`, `remainingAmount`, and `percentageUsed`.
- Alerts visually when threshold surpasses 80% or 100%.

#### Request Payload
```json
{
  "name": "Dining & Entertainment Limit",
  "type": "spending_limit",
  "categoryId": "22222222-3333-4444-5555-666666666666",
  "period": "monthly",
  "startDate": "2026-11-01",
  "targetAmount": "1500.00",
  "currency": "MAD"
}
```

---

### 2. Saving Goals (`type: "saving_goal"`)
Tracks target savings accumulated within a designated wallet:
- Inspects `wallets.current_balance` for the linked `walletId`.
- Computes `currentSaved`, `remainingAmount`, and `completionRate`.

#### Request Payload
```json
{
  "name": "Vacation Fund 2027",
  "type": "saving_goal",
  "walletId": "33333333-4444-5555-6666-777777777777",
  "period": "custom",
  "startDate": "2026-11-01",
  "endDate": "2027-06-30",
  "targetAmount": "25000.00",
  "currency": "MAD"
}
```
