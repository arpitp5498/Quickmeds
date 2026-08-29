# Milestone 1 Forensic Audit Handoff Report

**Author**: Forensic Auditor  
**Recipient**: Parent / Lead Orchestrator (`d9c7ecc8-a1cc-477c-a3f3-4d14e4bef1d7`)  
**Date**: 2026-08-28  
**Audit Target**: Milestone 1 (R1: Smart Fulfilment Routing Engine & R2: Fallback Routing)  
**Binary Verdict**: **CLEAN**

---

## 1. Observation

1. **Routing Engine Implementation (`server/src/services/smartRoutingService.js`)**:
   - `SCORING_WEIGHTS` strictly configured as `{ AVAILABILITY: 0.35, PROXIMITY: 0.25, ETA: 0.15, PRICE: 0.15, RATING: 0.10 }`.
   - `scorePharmacyCandidate` implements continuous, dynamic normalization for each sub-score in $[0.0, 1.0]$.
   - `findSplitBasketOption` implements a pairwise set-cover optimization over partial candidate sets.
   - `optimizeFulfilmentPlan` connects directly to MongoDB `Pharmacy` and `PharmacyInventory` collections, evaluating full-coverage candidates, split-basket candidates, and fallback scenarios.
   - Consolidated demonstration pricing with labeled disclaimers (`priceBreakdown.label: "Demo pricing — Demonstration data only"`).

2. **Fallback Routing Orchestration (`server/src/services/orderService.js`)**:
   - `executeFallbackReassignment` implements anti-circular routing via `order.previousPharmacyIds` exclusions.
   - Inventory handoff is atomic: `restoreInventory` releases stock at previous pharmacy before `decrementInventory` reserves stock at the newly selected pharmacy.
   - Real-time Socket.IO room events (`order_fallback_reassigned`, `order_reassigned_away`, `new_order_received`) and audit logs (`logAction` with `ROUTING_FALLBACK`) are properly dispatched.

3. **Routing Controller & REST Endpoints**:
   - `server/src/controllers/routingController.js` and `server/src/routes/routingRoutes.js` expose `POST /api/routing/optimize`, `GET /api/routing/optimize`, and `GET /api/routing/pharmacies-map`.
   - `server/src/routes/orderRoutes.js` registers fallback simulation endpoints: `POST /api/orders/:id/simulate-timeout` and `POST /api/orders/:id/fallback-timeout`.
   - Mounted in `server/src/index.js` line 119.

4. **Independent Test Execution**:
   - Ran `npm test` inside `server/`.
   - All 3 test suites passed:
     - `tests/routing.test.js` (14 tests passed)
     - `tests/auth.test.js` (3 tests passed)
     - `tests/utils.test.js` (7 tests passed)
   - Total: 24 passed, 0 failed.

---

## 2. Logic Chain

1. **Empirical Verification of Authenticity**:
   - Static inspection revealed zero hardcoded return mocks, zero fake static values, and zero environment-based bypasses.
   - The multi-factor scoring function derives composite scores from mathematical calculations over dynamic parameters (distance, stock counts, item prices, ratings).

2. **Integrity of State & Stock Management**:
   - Fallback routing prevents stock leakage by restoring quantities to previous pharmacies upon reassignment and checking inventory availability before decrementing at the target pharmacy.
   - Adding `oldPharmacyId` to `previousPharmacyIds` guarantees termination and prevents oscillating reassignments between the same pharmacies.

3. **Compliance with Ground Truth**:
   - All deliverables for R1 and R2 outlined in `ORIGINAL_REQUEST.md` and `PROJECT.md` have been built and verified.

---

## 3. Caveats

- **MongoDB NearSphere Geospatial Indexing**: `optimizeFulfilmentPlan` includes an automated fallback to find verified pharmacies if geospatial indexing is not initialized in raw mock test environments, ensuring test resiliency while retaining production geospatial capabilities.
- **Demo Disclaimers**: All calculated prices are demo figures and labeled accordingly as required for hackathon prototype compliance.

---

## 4. Conclusion

The Milestone 1 work product is **CLEAN**. There are no integrity violations, facade implementations, or hardcoded cheating patterns. Milestone 1 is approved without reservations.

---

## 5. Verification Method

To independently reproduce and verify this audit:

1. **Execute Jest Unit Tests**:
   ```bash
   cd server
   npm test
   ```
   *Expected Output*: 3 test suites pass, 24 tests pass, 0 failures.

2. **Inspect Source Files**:
   - `server/src/services/smartRoutingService.js` (Lines 10–94, 117–148, 179–628)
   - `server/src/services/orderService.js` (Lines 38–96, 106–263)
   - `server/src/models/Order.js` (Lines 156–185)
   - `server/tests/routing.test.js` (Lines 1–267)
