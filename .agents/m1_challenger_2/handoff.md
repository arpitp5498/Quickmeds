# Handoff Report — Milestone 1: Challenger 2 (Adversarial Fallback & Concurrency Verifier)

**Author**: Challenger 2  
**Date**: 2026-08-28  
**Verdict**: `REQUEST_CHANGES`  
**Handoff Type**: Hard Handoff  

---

## 1. Observation

Direct empirical observations gathered during static review and test harness execution:

### Observation 1.1: Notification Enum Mismatch
- **File**: `server/src/services/orderService.js`, Line 222
  ```javascript
  await sendNotification({
    userId: order.customerId._id || order.customerId,
    type: 'ORDER_FALLBACK_REASSIGNED',
    title: 'Order Reassigned for Faster Delivery',
    message: `Your order ${order.orderId} was reassigned to ${newPharmacy.name} to ensure fast delivery.`,
    link: `/orders/${order._id}`
  });
  ```
- **File**: `server/src/models/Notification.js`, Lines 12-28
  ```javascript
  enum: [
    'ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_REJECTED',
    'PRESCRIPTION_APPROVED', 'PRESCRIPTION_REJECTED',
    'ORDER_PREPARING', 'ORDER_READY', 'DELIVERY_ASSIGNED',
    'OUT_FOR_DELIVERY', 'ORDER_DELIVERED', 'ORDER_CANCELLED',
    'PHARMACY_VERIFIED', 'PHARMACY_REJECTED', 'SYSTEM_ALERT'
  ]
  ```
- **Execution Log**:
  `npm test` in `server/` outputs:
  ```
  [ERROR]: Error sending notification: Notification validation failed: type: `ORDER_FALLBACK_REASSIGNED` is not a valid enum value for path `type`.
  ```

### Observation 1.2: Concurrent Fallback Race Condition
- **File**: `server/src/services/orderService.js`, Lines 106-180 (`executeFallbackReassignment`)
- **Execution Result**:
  In `server/tests/fallbackConcurrency.test.js`, running parallel calls `Promise.allSettled([executeFallbackReassignment(orderId), executeFallbackReassignment(orderId)])` resulted in both requests executing concurrently:
  - Pharmacy P0 `restoreInventory` was called twice (+6 units restored for a 3-unit order), leaking phantom stock.
  - Pharmacy P1 `decrementInventory` was called twice (-6 units decremented for a 3-unit order).

### Observation 1.3: Inverted Inventory Handoff Sequence
- **File**: `server/src/services/orderService.js`, Lines 146-149
  ```javascript
  // 2. Atomic Stock Handoff: Restore old pharmacy stock and decrement new pharmacy stock
  await restoreInventory(oldPharmacyId, order.items);
  await decrementInventory(newPharmacyId, order.items);
  ```
- If `decrementInventory` fails with `ApiError.badRequest`, `restoreInventory` has already completed, leaving the old pharmacy with inflated inventory while still holding the active order.

### Observation 1.4: Unbounded Joint Coverage in Split-Basket
- **File**: `server/src/services/smartRoutingService.js`, Line 136
  ```javascript
  const jointCoverage = totalItemsCount > 0 ? coveredMedIds.size / totalItemsCount : 0;
  ```
- **Execution Log**:
  `tests/adversarialRouting.test.js:478` failed with:
  ```
  expect(received).toBeLessThanOrEqual(expected)
  Expected: <= 1
  Received:    1.3333333333333333
  ```

### Observation 1.5: Successful Fallback Mechanism Validation
- **File**: `server/tests/fallbackConcurrency.test.js`
- Sequential fallback routing across candidate pharmacies (`P0 -> P1 -> P2 -> P3`), circular reassignment prevention (`previousPharmacyIds`), exhaustion error handling, and state machine validation passed all functional tests.

---

## 2. Logic Chain

1. **Notification Failure**:
   - `orderService.js:222` attempts to insert a Notification document with `type: 'ORDER_FALLBACK_REASSIGNED'`.
   - `Notification.js` schema strictly validates `type` against its `enum`. Because `'ORDER_FALLBACK_REASSIGNED'` is not in the array, Mongoose aborts insertion and throws a `ValidationError`.
   - While caught in a `try/catch` block, the notification is lost, preventing the customer from receiving updates when their order is routed to an alternative pharmacy.

2. **Concurrency Race Condition**:
   - `executeFallbackReassignment` reads the order document via `Order.findById(orderId)` without an optimistic lock, version check (`__v`), or CAS update.
   - When two triggers occur simultaneously (e.g. concurrent webhook/timeout + manual trigger), both read the order in `PLACED` status.
   - Both proceed to call `restoreInventory` on `oldPharmacyId` and `decrementInventory` on `newPharmacyId`, causing duplicate stock increments on the source and duplicate decrements on the target.

3. **Inventory Leak under Decrement Failure**:
   - Calling `restoreInventory` before `decrementInventory` without a database transaction means that a failure in the second operation leaves the database in an inconsistent state where the first operation's mutation persists.

4. **Coverage Calculation Overflow**:
   - Dividing `coveredMedIds.size` by `totalItemsCount` without capping at `1.0` produces values > 1.0 when candidate stores have more unique matching medicines than requested, skewing candidate scoring.

---

## 3. Caveats

- Tests were run against the remote MongoDB Atlas cluster configured in `server/.env`.
- Physical delivery route mapping used spherical Euclidean approximations (`haversine` in `utils/geo.js`).
- No modifications were made to implementation files in accordance with the `Review-only` constraint.

---

## 4. Conclusion

The fallback routing architecture is structurally sound with robust candidate ranking, exclusion tracking, and state machine transitions. However, due to the **runtime notification validation error**, **concurrency race vulnerability**, and **inventory handoff sequence inversion**, the binary verdict is:

### **`REQUEST_CHANGES`**

### Required Action Items:
1. In `server/src/models/Notification.js`, add `'ORDER_FALLBACK_REASSIGNED'` to the `type.enum` list.
2. In `server/src/services/orderService.js`:
   - Add an atomic lock (e.g. `Order.findOneAndUpdate({ _id: orderId, orderStatus: { $in: ['PLACED', 'PHARMACY_REVIEW'] }, fallbackLock: { $ne: true } }, { $set: { fallbackLock: true } })`) to guard `executeFallbackReassignment`.
   - Invert inventory handoff: execute `decrementInventory` on the candidate first, then `restoreInventory` on the old pharmacy.
3. In `server/src/services/smartRoutingService.js`:
   - Change line 136 to `const jointCoverage = totalItemsCount > 0 ? Math.min(1.0, coveredMedIds.size / totalItemsCount) : 0;`.

---

## 5. Verification Method

To independently verify these findings and execute the full test suite:

1. Run the test command in `server/`:
   ```bash
   cd server
   npm test
   ```
2. Inspect test suite execution:
   - `server/tests/fallbackConcurrency.test.js`: Validates exhaustion handling, circular reassignment prevention, atomic stock conservation, and reproduces concurrency/notification logs.
   - `server/tests/adversarialRouting.test.js`: Confirms `jointCoverage` invariant violation.
3. Invalidation conditions:
   - All tests pass with zero console validation errors when `'ORDER_FALLBACK_REASSIGNED'` is added to `Notification.js` and `Math.min(1.0, ...)` is applied to `smartRoutingService.js`.
