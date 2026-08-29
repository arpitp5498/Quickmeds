# Milestone 1 Handoff Report: Reviewer 1 Independent Verification

**Author**: Reviewer 1 (Quality Reviewer & Adversarial Critic)  
**Recipient**: Orchestrator (`d9c7ecc8-a1cc-477c-a3f3-4d14e4bef1d7`)  
**Date**: 2026-08-28  
**Status**: Review Complete — Verdict: `APPROVE`  

---

## 1. Observation

- **Multi-Factor Scoring Engine** (`server/src/services/smartRoutingService.js`):
  - Constants in lines 11–17: `AVAILABILITY: 0.35`, `PROXIMITY: 0.25`, `ETA: 0.15`, `PRICE: 0.15`, `RATING: 0.10` sum to $1.0000$.
  - Normalization in lines 53–94: All 5 factors bounded in $[0.0, 1.0]$. Clamped against division-by-zero on zero items or homogeneous prices.
  - Set-cover split-basket search in lines 117–148 (`findSplitBasketOption`) computes pairwise combinations, union coverage sets, and deduplicated multi-store fulfillment plans.
  - End-to-end plan optimization in lines 179–628 (`optimizeFulfilmentPlan`) queries verified pharmacies with radius filtering, integrates inventory stock checks, calculates demo prices, and produces structured responses.
- **REST Endpoints & Controllers**:
  - `server/src/controllers/routingController.js`: Handles `POST /api/routing/optimize`, `GET /api/routing/optimize`, and `GET /api/routing/pharmacies-map`.
  - `server/src/routes/routingRoutes.js`: Exposes routing routes with `optionalAuth`.
  - `server/src/index.js`: Mounted at `app.use('/api/routing', routingRoutes)` (line 119).
- **Fallback Routing & Schema**:
  - `server/src/models/Order.js`: Added lines 157–184 (`fallbackTriggered`, `fallbackAttempt`, `fallbackReason`, `previousPharmacyId`, `previousPharmacyIds`, `routingMetadata`).
  - `server/src/services/orderService.js`: `executeFallbackReassignment` (lines 106–263) validates order state (`PLACED`/`PHARMACY_REVIEW`), excludes previously attempted pharmacies (`previousPharmacyIds` in `$nin`), executes atomic stock handoff (`restoreInventory` -> `decrementInventory`), emits Socket.IO events (`order_fallback_reassigned`, `order_reassigned_away`, `new_order_received`), dispatches notifications, and logs `ROUTING_FALLBACK` audit events.
  - `server/src/routes/orderRoutes.js`: Registered `POST /api/orders/:id/simulate-timeout` and `POST /api/orders/:id/fallback-timeout` (lines 20–21).
- **Test Suite Execution**:
  - Executed `npm test` in `server/`.
  - Result: 3 passed suites, 24 passed tests, 0 failures in 2.153s.

---

## 2. Logic Chain

1. **Scoring Accuracy & Weight Conformance**:
   - The weights ($0.35, 0.25, 0.15, 0.15, 0.10$) strictly match SIH Grand Finale specifications from `ORIGINAL_REQUEST.md` (R1) and `PROJECT.md`.
   - Scoring formulas map raw real-world units (km, minutes, currency, star ratings) to dimensionless $[0, 1]$ ratios before composite dot-product calculation.
2. **Whole Basket vs. Split Basket Optimization**:
   - Single-store fulfillment is prioritized when full inventory exists.
   - When no single pharmacy has 100% stock, the pairwise set-cover algorithm maximizes coverage with the minimum number of fulfillment points (2 stores).
   - Price breakdown explicitly aggregates items subtotal and delivery fee into a single consolidated `totalDemoValue` with mandatory demo disclaimers.
3. **Fallback Robustness & State Machine Safety**:
   - Failovers are prevented if the order has transitioned past pharmacy review.
   - Circular reassignments are strictly prevented by passing all historic pharmacy IDs into the routing engine exclusion list.
   - Atomic stock restoration and deduction prevents phantom inventory loss or double reservation.
4. **Integrity & Authenticity**:
   - No mock bypasses, hardcoded results, or dummy facade implementations exist in the source files.

---

## 3. Caveats

- In test/mock environments where MongoDB geospatial 2dsphere indexes are not active, the routing service contains a fallback to standard query (`try { $nearSphere } catch { Pharmacy.find() }`).
- Demonstration pricing disclaimers (`priceBreakdown.label: "Demo pricing — Demonstration data only"`) are present on all API outputs to comply with hackathon demonstration boundaries.

---

## 4. Conclusion

**Verdict**: **`APPROVE`**  
The Milestone 1 work product satisfies all functional, architectural, mathematical, and adversarial requirements. The backend routing and fallback services are fully functional, robust, and verified.

---

## 5. Verification Method

To independently verify the implementation:
1. **Execute Jest Tests**:
   ```bash
   cd server
   npm test
   ```
   **Expected**: 3 suites, 24 tests passing.
2. **Verify Mathematical Precision**:
   Inspect `server/src/services/smartRoutingService.js` lines 11–17 and lines 53–94.
3. **Verify Fallback Endpoints and Logic**:
   Inspect `server/src/routes/orderRoutes.js` lines 20–21 and `server/src/services/orderService.js` lines 106–263.
4. **Verify Routing REST Route Mounting**:
   Inspect `server/src/index.js` lines 30 and 119.
