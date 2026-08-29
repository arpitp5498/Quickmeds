## 2026-08-28T04:54:00Z

Implement all components of Milestone 1 (R1: Smart Fulfilment Routing Engine & R2: Fallback Routing) based strictly on `m1_blueprint.md`:
1. Implement `server/src/services/smartRoutingService.js`:
   - Multi-factor scoring formula: Availability (35%), Proximity (25%), ETA (15%), Demo Price (15%), Rating (10%).
   - Calculation helper functions: `scorePharmacyCandidate`, `calculateETA`, `generateExplanation`, `calculateBasketPrice`, `findSplitBasketOption`.
   - End-to-end database query: `optimizeFulfilmentPlan(cartItems, customerCoordinates, maxDistanceKm)`.
   - Output schema matching blueprint (`recommended`, `alternative`, `allCandidates`, `basketCoverage`, `totalDemoValue`, `fulfilmentPoints`, `explanation`).
   - Fix any `stock` vs `stockQuantity` field name issues.
2. Implement `server/src/controllers/routingController.js` and `server/src/routes/routingRoutes.js`:
   - Expose `POST /api/routing/optimize` (and `GET /api/routing/optimize`).
   - Expose `GET /api/routing/pharmacies-map` returning nearby pharmacies with coordinates, availability status, and ratings.
3. Update `server/src/index.js` to mount `/api/routing`.
4. Update `server/src/models/Order.js`:
   - Add schema fields for fallback tracking: `fallbackTriggered` (Boolean), `fallbackAttempt` (Number), `fallbackReason` (String), `previousPharmacyId` (ObjectId), `previousPharmacyIds` ([ObjectId]), `routingMetadata` (Object).
5. Update `server/src/services/orderService.js` & `server/src/controllers/orderController.js`:
   - Implement `executeFallbackReassignment(orderId, reason)`.
   - Atomic stock transfer (restore to previous pharmacy, decrement from new pharmacy).
   - Implement `simulateTimeout` controller handler and register route `POST /api/orders/:id/simulate-timeout` (and `/fallback-timeout`) in `server/src/routes/orderRoutes.js`.
   - Record `AuditLog` entry and emit `order_fallback_reassigned` via Socket.IO.
6. Create comprehensive Jest unit test suite `server/tests/routing.test.js`:
   - 6 test scenarios matching `m1_blueprint.md` (single-item match, multi-item whole basket single store, multi-item split basket, zero stock fallback, exact multi-factor scoring formula weights, ETA calculation).
7. Run the test suite (`npm test` in `server/`) and verify all tests pass with zero failures.
