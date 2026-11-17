# Core Financial Workflows

Finance Tracker implements structured financial flows to ensure ledger consistency across multi-currency accounts and itemized receipts.

---

## 1. Itemized Receipts & "Direct Funds"

When recording a purchase receipt with multiple items, users may either pay out of an existing wallet or fund the expense on the spot (e.g. from an unlisted cash source or immediate reimbursement).

```
   [User enters spending receipt]
                |
                v
        Direct Funds checked?
       /                     \
    (Yes)                    (No)
      |                       |
   Credit wallet balance      Deduct spending total
   with spending total        from selected wallet
      |                       |
   Deduct spending total      Record line items in DB
   from selected wallet       
      |
   Net balance unchanged;
   Expense & receipt tracked!
```

### Direct Funds Mechanism
- When **Direct Funds** is enabled on a spending receipt:
  1. The backend automatically performs a credit to the chosen wallet matching the receipt total.
  2. The spending record is saved and immediately debits the wallet.
  3. The final wallet balance remains balanced, eliminating the need to manually execute an adjustment prior to entering the receipt.

---

## 2. Wallet Balance Reconciliation vs Delta Adjustments

Physical cash and bank statements frequently require reconciliation against the system's registered balance.

```
+-------------------------------------------------------------------------------+
|                       Balance Update Strategies                               |
+-------------------------------------------------------------------------------+
| Strategy          | Input Value      | Ledger Result                          |
+-------------------+------------------+----------------------------------------+
| Reconciliation    | Counted Balance  | Overwrites registered balance to the   |
| (Exact Count)     | (e.g. 15,400 MAD)| exact count. Records delta in audit log|
+-------------------+------------------+----------------------------------------+
| Delta             | Positive/Negative| Adds/subtracts offset from current     |
| (+/- Adjustment)  | Offset (+50 MAD) | balance.                               |
+-------------------+------------------+----------------------------------------+
```

- **Reconciliation:** Recommended for weekly cash audits or end-of-month bank statement verification. The system calculates the discrepancy behind the scenes and stores both the previous and resulting balances.
- **Delta:** Recommended for ad-hoc adjustments like unaccounted bank fees or small interest credits.

---

## 3. Multi-Currency Transfers

Transferring funds between different accounts (such as a EUR account and a MAD account):

1. **Source Deduction:** The `fromAmount` is deducted in the source wallet's currency.
2. **Exchange Calculation:** The backend applies the user-provided or cached exchange rate:
   $$\text{targetAmount} = \text{fromAmount} \times \text{exchangeRate}$$
3. **Destination Credit:** The target wallet is credited with `targetAmount` in its native currency.
4. **Audit Trail:** An entry in `wallet_transfers` links both sides of the movement. If deleted, both wallets automatically revert to their pre-transfer balances.

---

## 4. Income-to-Wallet Deposits

When an income is logged:
- If a destination wallet is selected (`wallet_id`), the wallet's balance is automatically credited.
- The transaction appears in the wallet's transaction history with an **Income** badge.
- If the income entry is deleted or adjusted, the linked wallet balance is automatically kept in sync.
