# Milestone 1 Handoff Report: Smart Fulfilment Routing & Fallback Routing

**Agent**: Milestone 1 Technical Explorer & Architect  
**Recipient**: Orchestrator / Implementer  
**Date**: 2026-08-28  
**Scope**: R1 (Smart Fulfilment Routing Engine) & R2 (Fallback Routing Simulation)  

---

## 1. Observation

1. **Current Routing Engine**:
   - Located at `server/src/services/pharmacyMatchService.js:13-66`.
   - Uses basic `$nearSphere` search:
     ```javascript
     const nearbyPharmacies = await Pharmacy.find({
       verificationStatus: 'VERIFIED',
       isOpen: true,
       location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: maxDistanceKm * 1000 } }
     }).limit(20);
     ```
   - Checks stock count with naive query `inventoryCount >= medicineIds.length` using incorrect field name `stock` instead of `stockQuantity`.
   - Lacks multi-factor candidate scoring, basket optimization, multi-store split-basket resolution, natural language reasoning, and consolidated demo pricing breakdown.

2. **Current Order Lifecycle & State Machine**:
   - Located at `server/src/services/orderService.js:7-18`.
   - States defined: `PLACED`, `PHARMACY_REVIEW`, `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `DELIVERY_ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `REJECTED`, `CANCELLED`.
   - Stock management handled via `decrementInventory` (`orderService.js:36-55`) and `restoreInventory` (`orderService.js:60-75`).
   - No fallback routing, candidate ranking chain, or timeout simulation mechanism exists.

3. **Current Order Schema**:
   - Located at `server/src/models/Order.js:37-160`.
   - Contains fields for single `pharmacyId`, `items`, `subtotal`, `deliveryFee`, `total`, `orderStatus`, `statusHistory`.
   - Lacks fields for fallback tracking: `fallbackTriggered`, `fallbackAttempt`, `fallbackReason`, `previousPharmacyId`, `previousPharmacyIds`, and `routingMetadata`.

4. **API Route Wiring**:
   - `server/src/index.js:104-118` mounts routes under `/api/*`.
   - No route currently mounted at `/api/routing`.

5. **Test Infrastructure**:
   - `server/tests/` contains `auth.test.js` (3 tests) and `utils.test.js` (6 tests).
   - Test framework is Jest 29.7 with Supertest 6.3.
   - Zero unit tests exist for smart routing or fallback mechanisms.

---

## 2. Logic Chain

1. **Requirement R1 Decomposition**:
   - Patients requiring emergency medicines need optimal basket fulfillment. Multi-factor scoring must prioritize availability (35%), followed by proximity (25%), ETA (15%), demo price competitiveness (15%), and pharmacy rating (10%).
   - When no single pharmacy has 100% of the basket in stock, a single-store selection leads to unfulfilled items. A greedy pairwise set-cover algorithm must evaluate multi-store combinations (`SPLIT_BASKET`) to achieve 100% coverage with minimum fulfilment points ($K=2$).
   - A dedicated `smartRoutingService.js` implementing both modular calculation helpers (`scorePharmacyCandidate`, `calculateETA`, `generateExplanation`) and end-to-end database query resolvers (`optimizeFulfilmentPlan`) ensures clean decoupling and isolated unit testability.

2. **Requirement R2 Decomposition**:
   - In emergency scenarios, if the assigned pharmacy fails to confirm within 30 seconds, the order must not get canceled. Instead, it must automatically fall back to the next highest-scoring eligible candidate pharmacy.
   - Fallback requires atomic stock transfer: restoring reserved stock to `oldPharmacyId` via `restoreInventory()` and reserving stock at `newPharmacyId` via `decrementInventory()`.
   - To provide real-time updates to customer, pharmacy, and admin dashboards, the engine must emit `order_fallback_reassigned` via Socket.IO, persist an audit record in `AuditLog` (`action: 'ROUTING_FALLBACK'`), and log the event in `order.statusHistory`.
   - Endpoints `POST /api/orders/:id/simulate-timeout` and `POST /api/orders/:id/fallback-timeout` allow demo triggers from the Pharmacy and Admin dashboards.

3. **Routing Route & Controller Design**:
   - Creating `server/src/controllers/routingController.js` and `server/src/routes/routingRoutes.js` mounted at `/api/routing` allows frontend cart/checkout pages, admin monitors, and SIH demo wizards to query `/api/routing/optimize` via both POST (JSON body) and GET (URL query parameters).

4. **Test Suite Design**:
   - Structuring `server/tests/routing.test.js` with 6 dedicated test cases guarantees deterministic validation of scoring weights, whole basket single-store match, split-basket combination, zero-stock handling, ETA calculation, and fallback candidate ranking.

---

## 3. Caveats

1. **Mock Data Scope**: All pricing, pharmacy locations, and inventory levels are demonstration data. All endpoints return consolidated totals with demo disclaimers.
2. **Geospatial Queries in Test Environment**: MongoDB `$nearSphere` queries require active 2dsphere indexes. Pure calculation functions (`scorePharmacyCandidate`, `calculateETA`, `generateExplanation`) in `smartRoutingService.js` are tested in Jest without requiring a live MongoDB instance, while integration tests can execute against seeded local MongoDB.
3. **Split-Basket Order Representation**: For Milestone 1, the order model maintains a primary `pharmacyId` and captures split-basket metadata in `routingMetadata` for checkout presentation.

---

## 4. Conclusion

The Milestone 1 technical blueprint (`.agents/m1_explorer/m1_blueprint.md`) provides complete, production-ready specifications for:
1. `server/src/services/smartRoutingService.js` (Multi-factor scoring formula with exact 35/25/15/15/10 weights, single-store vs. split-basket optimization, and natural language explanation generation).
2. `server/src/controllers/routingController.js` and `server/src/routes/routingRoutes.js` mounted at `/api/routing`.
3. Fallback routing execution logic in `server/src/services/orderService.js` and simulation handlers in `server/src/controllers/orderController.js`.
4. Schema additions in `server/src/models/Order.js` (`fallbackTriggered`, `fallbackAttempt`, `previousPharmacyId`, `routingMetadata`).
5. A comprehensive 6-scenario Jest test suite in `server/tests/routing.test.js`.

---

## 5. Verification Method

Once implemented, verify Milestone 1 through the following commands:

1. **Run Jest Unit Tests**:
   ```bash
   cd server && npm test
   ```
   *Expected Result*: All tests in `routing.test.js`, `auth.test.js`, and `utils.test.js` pass ($\ge 15$ passing assertions).

2. **Test Smart Routing API**:
   ```bash
   curl -X POST http://localhost:5000/api/routing/optimize \
     -H "Content-Type: application/json" \
     -d "{\"coordinates\":[77.2090, 28.6139], \"items\":[{\"medicineId\":\"65f12345678901234567890a\",\"quantity\":2}]}"
   ```
   *Expected Result*: Status 200 JSON with `recommended`, `alternative`, `basketCoverage`, `totalDemoValue`, `fulfilmentPoints`, and `explanation`.

3. **Test Fallback Simulation API**:
   ```bash
   curl -X POST http://localhost:5000/api/orders/<ORDER_ID>/simulate-timeout \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```
   *Expected Result*: Status 200 JSON with `fallbackTriggered: true`, `fallbackAttempt: 1`, and updated `pharmacyId`.

4. **Inspect Files**:
   - `server/src/services/smartRoutingService.js`
   - `server/src/controllers/routingController.js`
   - `server/src/routes/routingRoutes.js`
   - `server/src/models/Order.js`
   - `server/tests/routing.test.js`
