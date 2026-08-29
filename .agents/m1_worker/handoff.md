# Milestone 1 Handoff Report: Smart Fulfilment Routing Engine (R1) & Fallback Routing (R2)

**Author**: Worker 1 (Backend Engineer)  
**Recipient**: Orchestrator / Sentinel Auditor  
**Date**: 2026-08-28  
**Status**: Milestone 1 Implementation Complete — 100% Tests Passing  

---

## 1. Observation

- **Routing Logic & Scoring Formula**: Implemented in `server/src/services/smartRoutingService.js` with exact weight coefficients:
  - Availability ($35\%$)
  - Proximity ($25\%$)
  - ETA ($15\%$)
  - Price Competitiveness ($15\%$)
  - Reliability / Rating ($10\%$)
- **Basket Optimization**: Single-store vs. split-basket pairwise set-cover search algorithm implemented in `optimizeFulfilmentPlan` and `findSplitBasketOption`.
- **API Endpoints**:
  - `POST /api/routing/optimize` and `GET /api/routing/optimize` exposed via `server/src/controllers/routingController.js` and `server/src/routes/routingRoutes.js`.
  - `GET /api/routing/pharmacies-map` returning real-time verified pharmacy network geo-coordinates and metadata.
  - Mounted in `server/src/index.js` at `/api/routing`.
- **Order Model & Fallback Schema**: `server/src/models/Order.js` updated with `fallbackTriggered`, `fallbackAttempt`, `fallbackReason`, `previousPharmacyId`, `previousPharmacyIds`, and `routingMetadata`.
- **Fallback Service & Controller**:
  - `executeFallbackReassignment` implemented in `server/src/services/orderService.js` with atomic stock restoration/decrement, Socket.IO broadcasts (`order_fallback_reassigned`), customer/pharmacy notifications, and audit trail logging in `AuditLog`.
  - `simulateTimeout` controller handler implemented in `server/src/controllers/orderController.js` and exposed on `POST /api/orders/:id/simulate-timeout` and `POST /api/orders/:id/fallback-timeout` in `server/src/routes/orderRoutes.js`.
- **Jest Test Suite**: `server/tests/routing.test.js` created with 9 comprehensive test scenarios.
- **Verification Execution**: `npm test` executed across all suites:
  - `tests/routing.test.js`: 14 tests passing
  - `tests/auth.test.js`: 3 tests passing
  - `tests/utils.test.js`: 7 tests passing
  - **Total**: 3 passed suites, 24 passed tests, 0 failures.

---

## 2. Logic Chain

1. **Scoring Integrity**:
   - The multi-factor scoring function `scorePharmacyCandidate` normalizes availability ($[0,1]$), proximity ($[0,1]$ via linear distance degradation over 15 km), ETA ($[0,1]$ against 60-minute window), demo basket price ($[0,1]$ relative to candidate range), and rating ($[0,1]$ against 5.0 scale).
   - This ensures candidate evaluation balances rapid delivery with inventory availability and cost predictability.

2. **Whole Basket vs. Split Basket Optimization**:
   - If a single verified pharmacy has 100% stock for all items in the basket, it is selected as the primary single-store recommendation.
   - If no single pharmacy can fulfill 100%, `findSplitBasketOption` computes pairwise intersections to find two pharmacies whose combined stock fulfills the basket, minimizing total transit and maximizing collective score.
   - If zero stock is available across the entire 15 km network, the engine gracefully reports zero coverage and returns informative natural language guidance.

3. **Atomic Stock & Fallback Safety**:
   - Reassignment restores reserved stock quantity to the original pharmacy (`previousPharmacyId`) before decrementing stock at the new pharmacy.
   - The previous pharmacy is permanently added to `previousPharmacyIds` and excluded from subsequent routing optimization passes, preventing circular reassignments.

---

## 3. Caveats

- **Demo Pricing Transparency**: Pricing data across the prototype represents demonstration values with clearly labeled breakdowns (`priceBreakdown.label: "Demo pricing — Demonstration data only"`).
- **Socket.IO Fallback in Headless Tests**: Socket.IO emissions and push notifications are wrapped with try/catch guards so unit tests without active Socket.IO clients or mock socket configurations run without unhandled promise rejections.

---

## 4. Conclusion

Milestone 1 (Smart Fulfilment Routing Engine R1 & Fallback Routing R2) is fully implemented, strictly adheres to `m1_blueprint.md`, and satisfies all functional and architectural requirements. All 24 unit and integration tests pass with 0 errors.

---

## 5. Verification Method

To independently verify the implementation:

1. **Run Backend Test Suite**:
   ```bash
   cd server
   npm test
   ```
   **Expected Result**: All 3 test suites (`tests/routing.test.js`, `tests/auth.test.js`, `tests/utils.test.js`) pass with 24 tests passing.

2. **Verify Route Mounting**:
   - Inspect `server/src/index.js` line 30 & 119 to confirm `/api/routing` is mounted.
   - Inspect `server/src/routes/orderRoutes.js` lines 19-21 to confirm `/simulate-timeout` and `/fallback-timeout` endpoints are registered.

3. **Verify Fallback Data Model**:
   - Inspect `server/src/models/Order.js` lines 155-185 for fallback schema fields.
