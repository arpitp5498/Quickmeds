# Adversarial Challenge Report — Milestone 1: Smart Fulfilment Routing Engine

## Challenge Summary

**Overall risk assessment**: HIGH
**Binary Verdict**: `REQUEST_CHANGES`

The Smart Fulfilment Routing Engine (`server/src/services/smartRoutingService.js`) demonstrates solid architectural foundations for single-store multi-factor scoring (availability, proximity, ETA, demo price competitiveness, and partner rating) and handles common division-by-zero scenarios (e.g. `minPrice == maxPrice`, `totalItemsCount == 0`, `maxDistanceKm <= 0`) gracefully.

However, adversarial stress testing and invariant property fuzzing revealed **3 critical/high-impact defects** that violate mathematical invariants, cause uncaught 500 runtime exceptions on edge-case cart payloads, and allow out-of-stock items to pass availability checks under negative quantities.

---

## Confirmed Vulnerabilities & Failure Modes

### [High] Challenge 1: Unbounded Coverage & Availability Inflation in Split-Basket Search (`findSplitBasketOption`)

- **Assumption challenged**: Assumes `coveredMedIds.size <= totalItemsCount` under all cart compositions.
- **Attack scenario**: 
  - Cart specifies 3 target medicines (`totalItemsCount = 3`).
  - Pharmacy A partially stocks items `[m1, m2]`.
  - Pharmacy B partially stocks items `[m3, m4]`.
  - In `findSplitBasketOption` (`server/src/services/smartRoutingService.js:136`):
    ```javascript
    const jointCoverage = totalItemsCount > 0 ? coveredMedIds.size / totalItemsCount : 0;
    ```
    Here `coveredMedIds.size` is 4, leading to `jointCoverage = 4 / 3 = 1.3333` (133.3% coverage).
- **Blast radius**:
  1. `recommendedPlan.basketCoverage` is set to `1.3333` (> 100%).
  2. `recommendedPlan.itemsCovered` computes as `Math.round(1.3333 * 3) = 4` items covered out of 3 total items.
  3. `recommendedPlan.scoreBreakdown.availability` is set to `1.3333`, violating the `[0.0, 1.0]` normalized score contract.
- **Mitigation**:
  Enforce mathematical clamping:
  ```javascript
  const jointCoverage = totalItemsCount > 0 
    ? Math.min(1.0, Math.max(0, coveredMedIds.size / totalItemsCount)) 
    : 0;
  ```
  Additionally, clamp all candidate coverage percentages at lines 358, 417, 435, 537, and 566 with `Math.min(1.0, ...)`.

---

### [Medium] Challenge 2: Uncaught `TypeError` on Missing / Malformed `medicineId` in Cart Items

- **Assumption challenged**: Assumes every cart item object has a defined `medicineId` property.
- **Attack scenario**:
  - A client sends an item missing `medicineId` (e.g. `{ name: 'Paracetamol', quantity: 2 }` or `{ medicineId: null }`).
  - At line 210 and line 279 in `smartRoutingService.js`:
    ```javascript
    const medicineIds = cartItems.map(item => {
      return (item.medicineId?._id || item.medicineId).toString();
    });
    ```
  - `(item.medicineId?._id || item.medicineId)` evaluates to `undefined` or `null`. Calling `.toString()` throws `TypeError: Cannot read properties of undefined (reading 'toString')`.
- **Blast radius**:
  - `optimizeFulfilmentPlan` crashes with an unhandled 500 error instead of returning a 400 validation error or skipping invalid items.
- **Mitigation**:
  Adopt safe extraction (consistent with line 102 in `calculateBasketPrice`):
  ```javascript
  const medIdStr = (item.medicineId?._id || item.medicineId || '').toString();
  ```
  Filter out empty IDs before database queries:
  ```javascript
  const medicineIds = cartItems
    .map(item => (item.medicineId?._id || item.medicineId || '').toString())
    .filter(Boolean);
  ```

---

### [Low-Medium] Challenge 3: Negative Quantity Input Bypasses Stock Verification

- **Assumption challenged**: Assumes `item.quantity` is always a positive integer >= 1.
- **Attack scenario**:
  - Client sends an item with `quantity: -3` where pharmacy stock is `0`.
  - At line 284:
    ```javascript
    const reqQty = item.quantity || 1; // reqQty = -3 because -3 is truthy!
    const stock = inv ? ... : 0; // stock = 0
    if (inv && stock >= reqQty) { ... } // (0 >= -3) is TRUE!
    ```
  - The zero-stock item is categorized as `availableItems` instead of `missingItems`.
  - `basketPrice` adds `unitPrice * (-3)`, resulting in negative basket totals and negative demo order values.
- **Blast radius**:
  - Ghost fulfillment of out-of-stock items, corrupted price breakdowns with negative order totals.
- **Mitigation**:
  Sanitize requested quantity:
  ```javascript
  const reqQty = Math.max(1, parseInt(item.quantity, 10) || 1);
  ```

---

## Empirical Stress Test Results

| Test ID | Scenario | Expected Behavior | Actual Behavior | Status |
|---|---|---|---|---|
| **1.1** | Zero available stock across all candidate pharmacies | `recommendedPlan: null`, `basketCoverage: 0`, `fulfilmentPoints: 0`, `availability: 0` | Returned null recommended plan with clear explanation | **PASS** |
| **1.2** | Requested quantity > 1000 units exceeding stock | Item flagged as missing, `availableCount: 0` | Item accurately placed in `missingItems` | **PASS** |
| **1.3** | Candidate distance exactly at max radius (15.0 km) | `proximityScore === 0.0` | `proximityScore: 0.0` | **PASS** |
| **1.4** | Candidate distance far beyond radius (> 15 km, 120 km) | Proximity and ETA clamped to `0.0`, no negative scores | `proximity: 0.0`, `eta: 0.0`, composite finite | **PASS** |
| **1.5** | Candidate distance 0.0 km (co-located) | `proximity: 1.0`, ETA buffer >= 12 mins | `proximity: 1.0`, `eta: 12 mins` | **PASS** |
| **1.6** | Negative distance input (-5.0 km) | Clamped safely without crash or score > 1.0 | Score <= 1.0, ETA = 12 mins | **PASS** |
| **2.1** | Price normalization: `minBasketPrice === maxBasketPrice` | `priceScore: 1.0`, no division by zero | `priceScore: 1.0`, composite finite | **PASS** |
| **2.2** | Price normalization: 0 min and 0 max price | `priceScore: 1.0`, no NaN | `priceScore: 1.0` | **PASS** |
| **2.3** | Availability normalization: `totalItemsCount === 0` | `availabilityScore: 0.0`, no division by zero | `availability: 0.0` | **PASS** |
| **2.4** | Distance normalization: `maxDistanceKm <= 0` | Falls back to default 15.0 km | Used 15.0 km default | **PASS** |
| **2.5** | Rating normalization: undefined, 0, negative, > 5.0 | Defaults to 4.5 or clamped to 1.0 | Handled safely | **PASS** |
| **2.6** | Floating point precision rounding | Scores rounded to 4 decimal places | Max 4 decimals | **PASS** |
| **3.1** | Disjoint inventories split-basket pairing | Discovers pair covering 100% | Selected pair with 100% joint coverage | **PASS** |
| **3.2** | Equal coverage tie-breaking | Selects pair with higher composite score | Selected highest scoring pair | **PASS** |
| **3.3** | Fewer than 2 candidates in split search | Returns null without throwing | Returned `null` safely | **PASS** |
| **3.4** | Identical candidate composite scores | Stable sort and valid alternative plan | Stable sort and distinct IDs | **PASS** |
| **4.1** | Identical coordinates distance | 0.0 km | 0.0 km | **PASS** |
| **4.2** | Missing coordinates input | 0.0 km without throw | 0.0 km | **PASS** |
| **4.3** | Extreme coordinates (Poles & Equator) | Accurate spherical Haversine distance | Pole-to-pole: 20015 km | **PASS** |
| **4.4** | Delivery fee ceiling tier | Capped at ₹120 for long distances | Capped at ₹120 | **PASS** |
| **5.1** | 1,000 Randomized Invariant Fuzzing Runs | `0.0 <= compositeScore <= 1.0` | 1,000 runs passed within `[0.0, 1.0]` | **PASS** |
| **5.2** | Invariant check for `findSplitBasketOption` bounds | `jointCoverage <= 1.0` | `jointCoverage = 1.3333` (> 1.0) | **FAIL** |
| **6.1** | End-to-end zero stock fallback with mock DB | Fallback message returned | Expected fallback response returned | **PASS** |
| **6.2** | End-to-end split basket resolution | `type: SPLIT_BASKET`, `fulfilmentPoints: 2` | Returned split basket plan | **PASS** |
| **6.3** | `excludePharmacyIds` query filter | Correct `$nin` query filter applied | `$nin` correctly passed | **PASS** |
| **6.4** | Non-array / malformed coordinates objects | Fallback to Delhi default coords | Handled gracefully | **PASS** |
| **6.5** | Malformed cart item with missing `medicineId` | Graceful validation / handling | Throws unhandled `TypeError` | **FAIL** (Reproduced) |
| **6.6** | Negative item quantity input | Prevent zero stock bypass | `0 >= -3` marks zero stock available | **FAIL** (Reproduced) |

---

## Unchallenged Areas

- **Database-level concurrency / transaction locks during simultaneous order placement**: Out of scope for pure routing engine mathematical validation; evaluated by Challenger 2 in concurrency testing.
- **Geocoding API network degradation**: The engine currently uses direct Haversine calculations without external HTTP geocoding calls, so network latency risks for coordinate calculations do not apply.

---

## Conclusion & Recommended Action

**Verdict**: `REQUEST_CHANGES`

The developer must apply the 3 targeted mitigations in `server/src/services/smartRoutingService.js`:
1. Clamp `jointCoverage` with `Math.min(1.0, Math.max(0, ...))` in `findSplitBasketOption` (line 136) and in candidate evaluations (lines 358, 417, 435, 537, 566).
2. Use safe `medicineId` extraction `(item.medicineId?._id || item.medicineId || '').toString()` at lines 210 and 279.
3. Sanitize item quantities with `Math.max(1, parseInt(item.quantity, 10) || 1)` at line 284.
