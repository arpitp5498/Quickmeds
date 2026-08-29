# Handoff Report — Milestone 1: Challenger 1 (Adversarial Routing Verifier)

## 1. Observation

Direct empirical observations from source inspection and test executions:

1. **Unbounded `jointCoverage` in `findSplitBasketOption`**:
   - File: `server/src/services/smartRoutingService.js`, Line 136:
     ```javascript
     const jointCoverage = totalItemsCount > 0 ? coveredMedIds.size / totalItemsCount : 0;
     ```
   - Verbatim Test Output in `server/tests/adversarialRouting.test.js`:
     ```
     ● Adversarial & Boundary Verification for Smart Routing Service › 5. Fuzzing & Invariant Stress Harness (1,000 Random Inputs) › 5.2 Stress-test findSplitBasketOption bounds and detect whether jointCoverage exceeds 1.0

       expect(received).toBeLessThanOrEqual(expected)

       Expected: <= 1
       Received:    1.3333333333333333
     ```
   - When combined partial pharmacies stock more unique medicines than `totalItemsCount`, `jointCoverage` exceeds 1.0 (133.3%), setting `recommendedPlan.basketCoverage = 1.3333`, `recommendedPlan.itemsCovered = 4` (when `totalItems = 3`), and `scoreBreakdown.availability = 1.3333`.

2. **Uncaught `TypeError` on null/undefined `medicineId`**:
   - File: `server/src/services/smartRoutingService.js`, Line 210 & Line 279:
     ```javascript
     const medicineIds = cartItems.map(item => {
       return (item.medicineId?._id || item.medicineId).toString();
     });
     ```
   - Verbatim Test Output in `server/tests/adversarialRouting.test.js` (Test 6.5):
     Calling `optimizeFulfilmentPlan([{ name: 'Paracetamol', quantity: 1 }])` throws `TypeError: Cannot read properties of undefined (reading 'toString')`, bypassing all error handling and crashing the API route.

3. **Negative Quantity Stock Bypass & Negative Subtotals**:
   - File: `server/src/services/smartRoutingService.js`, Line 284:
     ```javascript
     const reqQty = item.quantity || 1;
     const stock = inv ? (inv.stockQuantity !== undefined ? inv.stockQuantity : (inv.stock || 0)) : 0;
     if (inv && stock >= reqQty) { ... }
     ```
   - Passing `quantity = -3` on an item with `stock = 0` evaluates `0 >= -3` as `true`, treating an out-of-stock medicine as available and returning a negative demo order subtotal (e.g. ₹-150).

4. **Tested Boundary & Normalization Pass Matrix**:
   - `minPrice == maxPrice` price division by zero is safely guarded (`priceScore = 1.0`).
   - `totalItemsCount == 0` availability division by zero is safely guarded (`availabilityScore = 0.0`).
   - `maxDistanceKm <= 0` falls back to `DEFAULT_MAX_DISTANCE_KM` (15.0 km).
   - Rating normalization handles out-of-bounds, negative, and missing ratings with fallback `4.5`.
   - Distances at 0.0 km, exactly 15.0 km, and > 120.0 km are clamped cleanly in `[0.0, 1.0]`.
   - 1,000 randomized property fuzzing iterations verified finite composite scores within `[0.0, 1.0]`.

---

## 2. Logic Chain

1. **Step 1 (Observation 1)**: `coveredMedIds.size` represents the cardinality of unique medicine IDs across candidate pairs. If candidate partial pharmacies stock more distinct medicines than `totalItemsCount`, `coveredMedIds.size > totalItemsCount`.
2. **Step 2 (Observation 1)**: Without `Math.min(1.0, ...)`, `jointCoverage` evaluates to > 1.0. This directly violates the contract that `basketCoverage` is a percentage in `[0.0, 1.0]`, yields impossible values for `itemsCovered` (`Math.round(jointCoverage * totalItemsCount) > totalItemsCount`), and produces an unnormalized availability score in `scoreBreakdown`.
3. **Step 3 (Observation 2)**: At lines 210 and 279, calling `.toString()` on `(item.medicineId?._id || item.medicineId)` without a null/undefined fallback throws a runtime `TypeError` on any malformed cart item payload, causing an HTTP 500 server error.
4. **Step 4 (Observation 3)**: At line 284, `item.quantity || 1` retains negative values because non-zero numbers are truthy in JavaScript. Consequently, `stock >= reqQty` evaluates `0 >= -X` as true, falsely confirming availability for depleted stock and corrupting pricing math.
5. **Step 5 (Conclusion)**: Although the engine handles single-store scoring and division-by-zero well, these three vulnerabilities represent serious integrity and stability flaws that require remediation before Milestone 1 signoff.

---

## 3. Caveats

- Database-level concurrency and race conditions under simultaneous order placement were not tested here as they fall under Challenger 2's concurrency test remit.
- Real Google Maps Distance Matrix API latency was not tested because the application intentionally uses simulated local Haversine calculations per SIH prototype specifications.

---

## 4. Conclusion

**Verdict**: `REQUEST_CHANGES`

The developer must implement the following 3 targeted fixes in `server/src/services/smartRoutingService.js`:
1. Clamp split-basket joint coverage:
   ```javascript
   const jointCoverage = totalItemsCount > 0 
     ? Math.min(1.0, Math.max(0, coveredMedIds.size / totalItemsCount)) 
     : 0;
   ```
   and clamp candidate coverage percentages at lines 358, 417, 435, 537, 566 with `Math.min(1.0, ...)`.
2. Safeguard medicine ID extraction:
   ```javascript
   const medIdStr = (item.medicineId?._id || item.medicineId || '').toString();
   ```
3. Sanitize requested quantities:
   ```javascript
   const reqQty = Math.max(1, parseInt(item.quantity, 10) || 1);
   ```

---

## 5. Verification Method

To independently reproduce and verify these findings:
1. Run the empirical adversarial test suite:
   ```bash
   cd server
   npx jest tests/adversarialRouting.test.js --runInBand
   ```
2. Observe test failure on `5.2 Stress-test findSplitBasketOption bounds and detect whether jointCoverage exceeds 1.0`.
3. Verify test cases `6.5` and `6.6` documenting `TypeError` and negative quantity stock bypass.
4. Once fixes are applied by the developer, re-run `npx jest tests/adversarialRouting.test.js --runInBand` and verify all 28 tests pass with 0 failures.
