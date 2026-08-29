# Milestone 1: Changes Log

## Overview
Implemented the **Smart Fulfilment Routing Engine (R1)** and **Fallback Routing Engine & Simulation (R2)** according to `m1_blueprint.md`.

---

## Files Created & Modified

### 1. `server/src/services/smartRoutingService.js` (CREATED)
- **Scoring Weights**: Defined SIH standard weights: Availability (35%), Proximity (25%), ETA (15%), Demo Price (15%), Rating (10%).
- **Helper Functions**:
  - `scorePharmacyCandidate`: Computes 5-factor normalized sub-scores and composite weighted score ($0.0 \dots 1.0$).
  - `calculateETA`: Implements $5\text{ min prep} + \lceil 3 \times \text{distanceKm}\rceil$ with 12-min minimum threshold.
  - `calculateBasketPrice`: Computes accurate subtotal across requested items and quantities.
  - `findSplitBasketOption`: Pairwise set-cover algorithm optimizing 2-store fulfillment coverage and combined score.
  - `generateExplanation`: Generates contextual natural-language explanations for single-store and split-basket selections.
  - `optimizeFulfilmentPlan`: End-to-end database query retrieving verified pharmacies within service radius (default 15 km), fetching inventory, evaluating single-store vs split-basket vs fallback, and calculating demo order total.

### 2. `server/src/controllers/routingController.js` (CREATED)
- `optimizeBasket`: Handles `POST /api/routing/optimize` and `GET /api/routing/optimize`. Supports request body payloads, GET query string parameters (`lat`, `lng`, `medicines`), and fallback to active user cart.
- `getPharmacyNetworkMap`: Handles `GET /api/routing/pharmacies-map` returning geo-spatial coordinates, rating, availability status, and radius for the interactive map.

### 3. `server/src/routes/routingRoutes.js` (CREATED)
- Mounted routes:
  - `POST /api/routing/optimize`
  - `GET /api/routing/optimize`
  - `GET /api/routing/pharmacies-map`
- Integrated `optionalAuth` middleware.

### 4. `server/src/index.js` (MODIFIED)
- Imported `routingRoutes`.
- Mounted `app.use('/api/routing', routingRoutes);`.

### 5. `server/src/models/Order.js` (MODIFIED)
- Added fallback tracking schema fields:
  - `fallbackTriggered` (Boolean, indexed)
  - `fallbackAttempt` (Number)
  - `fallbackReason` (String)
  - `previousPharmacyId` (ObjectId, ref: 'Pharmacy')
  - `previousPharmacyIds` ([ObjectId], ref: 'Pharmacy')
  - `routingMetadata` (Mixed)

### 6. `server/src/services/orderService.js` (MODIFIED)
- Implemented `executeFallbackReassignment(orderId, reason)` (aliased as `executeOrderFallback`).
- Added atomic stock transfer (restoring inventory at old pharmacy, decrementing at new candidate pharmacy).
- Added multi-party real-time Socket.IO broadcasts (`order_fallback_reassigned`, `order_reassigned_away`, `new_order_received`).
- Added customer & pharmacy notifications via `sendNotification`.
- Added audit logging via `logAction` with action `ROUTING_FALLBACK`.

### 7. `server/src/controllers/orderController.js` (MODIFIED)
- Implemented `simulateTimeout` controller handler to trigger fallback simulation.
- Exported `simulateTimeout`.

### 8. `server/src/routes/orderRoutes.js` (MODIFIED)
- Registered `POST /api/orders/:id/simulate-timeout` and `POST /api/orders/:id/fallback-timeout`.

### 9. `server/tests/routing.test.js` (CREATED)
- 9 test scenarios verifying:
  - Scenario 1: Single-Item Match with 100% Stock at Nearest Pharmacy (multi-factor weights check).
  - Scenario 2: Multi-Item Whole Basket Match at Single Store (full coverage preference over partial nearest).
  - Scenario 3: Split-Basket Scenario (pairwise set cover with `findSplitBasketOption` & explanation).
  - Scenario 4: Zero Stock / Empty Basket Handling & graceful explanations.
  - Scenario 5: Multi-Factor Scoring Weight sum validation ($0.35 + 0.25 + 0.15 + 0.15 + 0.10 = 1.00$).
  - Scenario 6: ETA & Distance Helper Logic (minimum buffer and linear scaling).
  - Scenario 7: Basket Price Calculation Helper.
  - Scenario 8: Order State Machine & Fallback Rules validation.
  - Scenario 9: HTTP REST API Endpoints (`POST /api/routing/optimize`, `GET /api/routing/pharmacies-map`).

---

## Test Verification Output
```
PASS tests/routing.test.js
PASS tests/auth.test.js
PASS tests/utils.test.js

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        2.086 s
Ran all test suites.
```
