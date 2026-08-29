# Adversarial Challenge Report — Milestone 1: Fallback Routing & Concurrency

**Challenger**: Challenger 2 (Adversarial Fallback & Concurrency Verifier)  
**Date**: 2026-08-28  
**Scope**: `server/src/services/orderService.js`, `server/src/controllers/orderController.js`, `server/src/models/Order.js`, `server/src/models/Notification.js`, `server/src/services/smartRoutingService.js`  
**Test Suite**: `server/tests/fallbackConcurrency.test.js`, `server/tests/routing.test.js`, `server/tests/adversarialRouting.test.js`  
**Binary Verdict**: `REQUEST_CHANGES`

---

## Executive Summary

An exhaustive empirical stress-test and adversarial analysis was conducted on the Fallback Routing and Inventory Reassignment mechanisms in Medirush. 

While sequential fallback cycling, candidate ranking, and circular reassignment prevention (`previousPharmacyIds`) function correctly under nominal conditions, empirical verification revealed **3 high-severity defects** and **1 mathematical boundary defect** that require remediation before Milestone 1 sign-off:

1. **CRITICAL: Missing `ORDER_FALLBACK_REASSIGNED` in `Notification.js` Enum**  
   Every fallback execution throws a Mongoose `ValidationError` on notification dispatch, completely preventing customers from receiving fallback reassignment notifications.
2. **HIGH: Race Condition on Concurrent Fallback Triggers (No Optimistic Lock)**  
   Simultaneous timeout triggers on the same order cause duplicate `restoreInventory` (creating phantom stock) and duplicate `decrementInventory` (over-decrementing candidate inventory).
3. **HIGH: Non-Atomic Inventory Restoration Order**  
   Restoring stock at the old pharmacy *before* decrementing stock at the new pharmacy creates inventory leaks if the new pharmacy decrement fails.
4. **MEDIUM: Unbounded `jointCoverage` in Split-Basket Evaluation (`smartRoutingService.js:136`)**  
   `jointCoverage` exceeds `1.0` (e.g. `1.333`, `1.5`) when candidate stores hold items across distinct IDs, distorting composite scoring weights.

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

| Challenge ID | Severity | Component | Finding |
|---|---|---|---|
| **CHALLENGE-01** | CRITICAL | `Notification.js` / `orderService.js` | `ORDER_FALLBACK_REASSIGNED` missing from Notification enum; all fallback notifications crash with ValidationError. |
| **CHALLENGE-02** | HIGH | `orderService.js` | Race condition on concurrent fallback triggers; causes double inventory restoration and over-decrement. |
| **CHALLENGE-03** | HIGH | `orderService.js` | `restoreInventory` called before `decrementInventory` without transaction; causes stock leak if candidate decrement fails. |
| **CHALLENGE-04** | MEDIUM | `smartRoutingService.js` | `jointCoverage` can exceed 1.0 (unbounded division `coveredMedIds.size / totalItemsCount`). |

---

## Detailed Challenges & Evidence

### [Critical] CHALLENGE-01: Runtime ValidationError on Customer Fallback Notifications

- **Assumption Challenged**: System successfully notifies customer and pharmacy when fallback reassignment occurs.
- **Observed Behavior**:
  In `server/src/services/orderService.js` (lines 220-227):
  ```javascript
  await sendNotification({
    userId: order.customerId._id || order.customerId,
    type: 'ORDER_FALLBACK_REASSIGNED',
    title: 'Order Reassigned for Faster Delivery',
    message: `Your order ${order.orderId} was reassigned to ${newPharmacy.name} to ensure fast delivery.`,
    link: `/orders/${order._id}`
  });
  ```
  In `server/src/models/Notification.js` (lines 12-28):
  ```javascript
  type: {
    type: String,
    enum: [
      'ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_REJECTED',
      'PRESCRIPTION_APPROVED', 'PRESCRIPTION_REJECTED',
      'ORDER_PREPARING', 'ORDER_READY', 'DELIVERY_ASSIGNED',
      'OUT_FOR_DELIVERY', 'ORDER_DELIVERED', 'ORDER_CANCELLED',
      'PHARMACY_VERIFIED', 'PHARMACY_REJECTED', 'SYSTEM_ALERT'
    ],
    required: true
  }
  ```
  The type `ORDER_FALLBACK_REASSIGNED` is omitted from `notificationSchema.type.enum`.
- **Empirical Proof**:
  During test runs (`npm test` in `server/tests/fallbackConcurrency.test.js`), every fallback invocation output:
  ```
  [ERROR]: Error sending notification: Notification validation failed: type: `ORDER_FALLBACK_REASSIGNED` is not a valid enum value for path `type`.
  ```
- **Blast Radius**: Customers receive no in-app alert when their order is reassigned away from a non-responsive pharmacy.
- **Recommended Mitigation**: Add `'ORDER_FALLBACK_REASSIGNED'` to the enum array in `server/src/models/Notification.js`.

---

### [High] CHALLENGE-02: Race Condition on Concurrent Fallback Triggers

- **Assumption Challenged**: `executeFallbackReassignment` is thread-safe and idempotent under concurrent timeout invocations.
- **Attack Scenario**:
  Two parallel timeout triggers or manual fallback calls execute simultaneously on the same order (`orderId` in `PLACED` status):
  1. Process A and Process B both read `orderStatus === 'PLACED'` and `pharmacyId === P0`.
  2. Process A executes `restoreInventory(P0)` (+3 units) and `decrementInventory(P1)` (-3 units).
  3. Process B executes `restoreInventory(P0)` (+3 units) and `decrementInventory(P1)` (-3 units).
- **Empirical Evidence**:
  In `tests/fallbackConcurrency.test.js` (Section 4.1), two parallel promises `Promise.allSettled([executeFallbackReassignment(...), executeFallbackReassignment(...)])` both successfully entered execution without locking:
  - Pharmacy P0 received **two** stock restorations (+6 units instead of +3), artificially inflating inventory above initial capacity (phantom stock leak).
  - Pharmacy P1 received **two** stock decrements (-6 units instead of -3).
  - Duplicate socket events and duplicate notifications were dispatched.
- **Blast Radius**: Inventory divergence and phantom stock generation in production when network latency triggers duplicate timeout events.
- **Recommended Mitigation**: Implement an atomic compare-and-swap (CAS) lock before executing reassignment:
  ```javascript
  const lockedOrder = await Order.findOneAndUpdate(
    { _id: orderId, orderStatus: { $in: ['PLACED', 'PHARMACY_REVIEW'] }, fallbackLock: { $ne: true } },
    { $set: { fallbackLock: true } },
    { new: true }
  );
  if (!lockedOrder) {
    throw ApiError.badRequest('Fallback reassignment already in progress or invalid order status.');
  }
  ```

---

### [High] CHALLENGE-03: Inversion of Inventory Handoff Sequence

- **Assumption Challenged**: Inventory handoff is atomic and fault-tolerant.
- **Attack Scenario**:
  In `orderService.js` (lines 147-148):
  ```javascript
  // 2. Atomic Stock Handoff: Restore old pharmacy stock and decrement new pharmacy stock
  await restoreInventory(oldPharmacyId, order.items);
  await decrementInventory(newPharmacyId, order.items);
  ```
  If `restoreInventory(oldPharmacyId)` succeeds, but `decrementInventory(newPharmacyId)` subsequently throws an `ApiError.badRequest` (e.g. stock depleted between optimization plan computation and reservation execution):
  - `oldPharmacyId` stock was already restored (+qty).
  - `order` is NOT updated (fails before `order.save()`).
  - `order.pharmacyId` still points to `oldPharmacyId`.
  - The old pharmacy now has +qty extra stock while still holding the active order. If the customer subsequently cancels, `cancelOrder` calls `restoreInventory` a second time, compounding the stock inflation.
- **Recommended Mitigation**:
  Invert the execution order: decrement candidate inventory first; only restore old inventory once decrement succeeds.
  ```javascript
  // 1. Decrement new candidate first
  await decrementInventory(newPharmacyId, order.items);
  // 2. Restore old pharmacy inventory
  try {
    await restoreInventory(oldPharmacyId, order.items);
  } catch (restoreErr) {
    // Compensation rollback if restore fails
    await restoreInventory(newPharmacyId, order.items);
    throw restoreErr;
  }
  ```

---

### [Medium] CHALLENGE-04: Unbounded `jointCoverage` in `smartRoutingService.js`

- **Assumption Challenged**: Basket coverage is strictly normalized to `[0.0, 1.0]`.
- **Observed Behavior**:
  In `server/src/services/smartRoutingService.js` (line 136):
  ```javascript
  const jointCoverage = totalItemsCount > 0 ? coveredMedIds.size / totalItemsCount : 0;
  ```
  If candidates contain items that sum to more distinct IDs than `totalItemsCount`, `coveredMedIds.size / totalItemsCount` computes values > 1.0 (e.g. `4 / 3 = 1.333`).
- **Empirical Evidence**:
  `tests/adversarialRouting.test.js:478` failed with:
  ```
  Expected: <= 1
  Received: 1.3333333333333333
  ```
- **Recommended Mitigation**:
  Enforce ceiling:
  ```javascript
  const jointCoverage = totalItemsCount > 0 ? Math.min(1.0, coveredMedIds.size / totalItemsCount) : 0;
  ```

---

## Stress Test Results

| Test ID | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **ST-01** | Sequential fallback P0 -> P1 -> P2 -> P3 | Reassigns sequentially along candidate ranking | Reassigned sequentially; attempt count incremented | **PASS** |
| **ST-02** | Fallback Exhaustion (no candidates left) | Throws 400 Bad Request; preserves order state | Throws exact 400 error; order state preserved | **PASS** |
| **ST-03** | Circular Reassignment Prevention | Never reassigns back to IDs in `previousPharmacyIds` | `$nin` excludes all previous IDs; zero circular loops | **PASS** |
| **ST-04** | Inventory Conservation (Sum + Reserved) | Baseline 80 units conserved across 3 fallbacks | System inventory exactly matches 80 units | **PASS** |
| **ST-05** | Candidate Stock Insufficiency | Prevents reassignment; preserves existing reservation | Throws 400; leaves stock untouched | **PASS** |
| **ST-06** | State Machine Guard (ACCEPTED / DELIVERED) | Rejects fallback trigger with 400 | Rejects with badRequest error | **PASS** |
| **ST-07** | Non-existent Order ID Fallback | Returns 404 Not Found | Throws 404 ApiError | **PASS** |
| **ST-08** | Concurrent Fallback Race Condition | Serialized / Idempotent execution | Parallel execution causes double restoration leak | **FAIL** (Vulnerability 2) |
| **ST-09** | Fallback Notification Dispatch | Notification successfully created in MongoDB | Throws enum `ValidationError` on type | **FAIL** (Vulnerability 1) |
| **ST-10** | Split-Basket Joint Coverage Boundary | `jointCoverage <= 1.0` | `jointCoverage = 1.333` | **FAIL** (Vulnerability 4) |

---

## Unchallenged Areas

- **Payment Gateway Refund Integration**: Live payment gateway webhooks during fallback (mocked/in-memory for Milestone 1).
- **Physical GPS Device Tracking**: Mock coordinates used based on standard Delhi coordinates `[77.2090, 28.6139]`.

---

## Final Verdict & Action Items

### **Verdict**: `REQUEST_CHANGES`

### Required Changes Before Milestone 1 Sign-Off:
1. **Fix `models/Notification.js`**: Add `'ORDER_FALLBACK_REASSIGNED'` to `type.enum`.
2. **Fix `services/orderService.js`**:
   - Add optimistic lock / CAS guard to `executeFallbackReassignment` to prevent concurrent execution races.
   - Invert inventory handoff order: decrement candidate first, then restore old pharmacy.
3. **Fix `services/smartRoutingService.js`**: Wrap `jointCoverage` with `Math.min(1.0, ...)`.
