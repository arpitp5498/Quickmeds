# Code Remediation Changes — Milestone 1 Backend Defect Fixes

## Overview
Worker 2 (Backend Remediation Engineer) has implemented genuine, production-grade remediations for the 5 defect areas identified by Challenger 1 and Challenger 2 across the QuickMeds routing, inventory, fallback, and notification layers.

---

## 1. `server/src/models/Notification.js`
- **Issue**: Mongoose validation failed when sending notifications for fallback reassignments because `'ORDER_FALLBACK_REASSIGNED'` and `'ORDER_REASSIGNED'` were missing from `notificationSchema.type.enum`.
- **Changes**:
  - Added `'ORDER_FALLBACK_REASSIGNED'` and `'ORDER_REASSIGNED'` to the enum array alongside `'PRESCRIPTION_REJECTED'`.
- **Result**: Notification dispatch succeeds without runtime `ValidationError`.

---

## 2. `server/src/models/Order.js`
- **Issue**: Need an atomic lock attribute for concurrency protection during fallback routing.
- **Changes**:
  - Added `fallbackLock: { type: Boolean, default: false }` to `orderSchema`.
- **Result**: Supports atomic compare-and-swap (CAS) queries in `orderService.js`.

---

## 3. `server/src/services/smartRoutingService.js`
- **Defect 1 — Split-Basket Coverage Inflation (lines 136, 469-478)**:
  - Clamped `jointCoverage` with `Math.min(1.0, Math.max(0, coveredMedIds.size / totalItemsCount))` in `findSplitBasketOption`.
  - Clamped `itemsCovered` with `Math.min(totalItemsCount, Math.round(jointCoverage * totalItemsCount))`.
  - Clamped `availability` score breakdown and candidate `coveragePct` across all plan branches with `Math.min(1.0, Math.max(0, ...))`.
- **Defect 2 — Null / Malformed `medicineId` in Cart Items (lines 210, 279, `calculateBasketPrice`)**:
  - Safely parsed `item?.medicineId?._id ? item.medicineId._id.toString() : (item?.medicineId ? item.medicineId.toString() : '')`.
  - Filtered out empty/falsy IDs using `.filter(Boolean)` prior to querying MongoDB with `$in`.
  - Added null safety checks for cart item iteration in `calculateBasketPrice` and `optimizeFulfilmentPlan`.
- **Defect 3 — Negative / Zero Quantity Bypass (lines 107, 284)**:
  - Normalized requested item quantities with `Math.max(1, parseInt(item?.quantity, 10) || 1)` in both `calculateBasketPrice` and candidate inventory availability checks.
  - Out-of-stock items (0 stock) can no longer appear available when negative quantities are supplied.

---

## 4. `server/src/services/orderService.js`
- **Defect 1 — Concurrency & Race Condition Guard in `executeFallbackReassignment`**:
  - Added atomic compare-and-swap (CAS) lock acquisition via `Order.findOneAndUpdate({ _id: orderId, orderStatus: { $in: ['PLACED', 'PHARMACY_REVIEW'] }, fallbackLock: { $ne: true } }, { $set: { fallbackLock: true } }, { new: true })`.
  - Returns appropriate 404 (not found), 400 (invalid state), or 400 (reassignment already in progress) errors.
  - Automatically clears `fallbackLock` on successful reassignment or in the error handling block.
- **Defect 2 — Inverted Inventory Handoff Sequence**:
  - Decrements candidate pharmacy inventory FIRST (`await decrementInventory(newPharmacyId, order.items)`).
  - Restores old pharmacy inventory SECOND (`await restoreInventory(oldPharmacyId, order.items)`).
  - Implemented compensation rollback in `catch (err)`: if any error happens after candidate decrement, candidate stock is safely restored, ensuring zero inventory leakage or phantom stock generation.

---

## 5. `server/tests/adversarialRouting.test.js`
- Updated test cases 6.5 and 6.6 to assert the remediated behavior:
  - 6.5: Confirmed `optimizeFulfilmentPlan` gracefully handles cart items with missing `medicineId` without throwing `TypeError`.
  - 6.6: Confirmed negative quantities are sanitized to >= 1, preventing 0-stock bypass and negative subtotal corruption.

---

## Verification Summary
- `npm test`: **5 passed, 5 total suites** (60 tests passed, 0 failures).
  - `tests/adversarialRouting.test.js`: **28 passed, 0 failed**
  - `tests/fallbackConcurrency.test.js`: **8 passed, 0 failed**
  - `tests/routing.test.js`: **14 passed, 0 failed**
  - `tests/auth.test.js`: **8 passed, 0 failed**
  - `tests/utils.test.js`: **2 passed, 0 failed**
