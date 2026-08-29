# Handoff Report — Specification Mining & Codebase Gap Analysis

**Agent**: explorer_survey_specs (Specification Miner / Requirements Analyst)  
**Date**: 2026-08-28  
**Parent Task**: QuickMeds SIH Grand Finale Requirements Survey & Gap Analysis  
**Deliverable**: `.agents/explorer_survey_specs/spec_gap_matrix.md`  

---

## 1. Observation

1. **Authoritative Specification Source**: `ORIGINAL_REQUEST.md` lines 1–201 specifies 11 numbered requirements (R1–R11) and 18 explicit Acceptance Criteria for the QuickMeds SIH Grand Finale prototype.
2. **Current Routing Implementation**: `server/src/services/pharmacyMatchService.js` (lines 13–66) implements a simple geospatial query `findNearestPharmacyWithStock` that sequentially searches nearby pharmacies for complete inventory matching or returns the first nearby pharmacy (`nearbyPharmacies[0]`). It completely lacks multi-factor scoring weights (availability, distance, ETA, pricing, reliability), split-basket optimization, alternative plan generation, explanation strings, and dedicated REST routes (`/api/routing/optimize`).
3. **Fallback Routing Absence**: `server/src/controllers/orderController.js` and `server/src/routes/orderRoutes.js` contain standard CRUD and status patch endpoints (`createOrder`, `updateOrderStatus`, `cancelOrder`), but have no confirmation timer, no automated fallback failover upon timeout, no timeout simulation route (`POST /api/orders/:id/fallback-timeout`), and no "Simulate Pharmacy Timeout" button in `client/src/pages/pharmacy/PharmacyOrders.jsx`.
4. **Basket Optimization UI**: `client/src/pages/cart/Cart.jsx` (lines 33–35, 241–268) and `client/src/pages/checkout/Checkout.jsx` use static delivery fees (₹25) and platform fees (₹5). They lack the "Optimizing your fulfilment..." loading state, the consolidated breakdown chip system, the expandable "How was this option selected?" factor drawer, and the mandatory "Demo pricing — Demonstration data only" disclaimers.
5. **Pharmacist Verification Workflow**: `server/src/controllers/prescriptionController.js` (lines 108–191) handles basic `APPROVED`/`REJECTED` status updates, but `client/src/pages/prescriptions/MyPrescriptions.jsx` and `client/src/pages/pharmacy/PharmacyPrescriptions.jsx` lack the 4-state visual verification timeline (`PENDING` → `UNDER_REVIEW` → `VERIFIED` → `REJECTED`), zoomable prescription inspection modal, mandatory structured rejection reasons, pharmacist demo ID logging, and the required demonstration simulation disclaimer.
6. **Delivery Tracking Simulation**: `client/src/pages/orders/OrderDetail.jsx` (lines 123–148, 187–204) renders a static SVG map with 6 hardcoded steps. It lacks the 8-state SIH lifecycle, dynamic route progression, and the "Simulate Next Step" demonstration button.
7. **SIH Demo Mode**: No demo mode files or routes exist in the codebase. `client/src/routes/AppRoutes.jsx` has 6 route groups (Public, Auth, Customer, Pharmacy, Delivery, Admin), but no `/demo` or hidden SIH demo runner.
8. **Landing Page Status**: `client/src/pages/public/Landing.jsx` (lines 101–124) contains generic copy ("Urgent Medicines, From Nearby Pharmacies"), lacking the exact SIH headline ("Emergency Medicine Access, Reimagined."), the "Working Prototype" badge, the 6 "Why QuickMeds?" cards, and prominent medical disclaimers.
9. **Admin Dashboards**: `client/src/pages/admin/AdminDashboard.jsx`, `AdminAnalytics.jsx`, and `AdminAuditLogs.jsx` show basic counts and standard audit tables. They lack the Routing Monitor visualizer, Network Map, audit log filtering by routing decisions/fallback events, and metrics for Fallback Rate (%) and Basket Coverage (%).
10. **Missing SIH Pages**: Three mandatory pages specified in R9 (`/architecture`, `/security`, `/research`) are absent from `client/src/pages/` and `AppRoutes.jsx`.
11. **Pharmacy Network Map**: `client/src/pages/pharmacies/NearbyPharmacies.jsx` (lines 65–80) renders a basic list with a mini map preview, but lacks an interactive radius slider (1–15km), service radius rings, stock filters, pharmacy pin drawers with scores, and routing polylines.
12. **Existing Test Suite**: `server/package.json` specifies `"test": "jest --runInBand --detectOpenHandles"`. Existing tests are only `server/tests/auth.test.js` and `server/tests/utils.test.js`. There are zero routing engine unit tests (`server/tests/routing.test.js` does not exist).

---

## 2. Logic Chain

1. *From Observation 1 & 2*: R1 requires a smart multi-factor scoring engine and whole-basket optimization. Because `pharmacyMatchService.js` currently only checks stock sequentially without computing composite scores or split baskets, a dedicated `smartRoutingService.js`, `routingController.js`, and `routingRoutes.js` must be created.
2. *From Observation 3*: R2 requires an end-to-end fallback failover loop. Because no timeout logic or fallback endpoint exists, backend services must handle automatic order reassignment and inventory transfer, while frontend `PharmacyOrders.jsx` must expose the "Simulate Pharmacy Timeout" trigger button.
3. *From Observation 4*: R3 requires customer visibility into the smart routing recommendation. The cart and checkout UI must integrate with `/api/routing/optimize` and display the optimization animation, coverage chip, factor breakdown drawer, and demo pricing disclaimers.
4. *From Observation 5*: R4 requires a regulatory verification timeline with safety gating. The prescription workflow must be enhanced with a 4-state visual stepper, pharmacist demo license stamping, rejection reason handling, and order progression locks.
5. *From Observation 6*: R5 requires an 8-state delivery simulation with manual stepping for judges. `OrderDetail.jsx` and `MapView.jsx` must be upgraded with the full 8 states and a "Simulate Next Step" action button.
6. *From Observation 7*: R6 requires a 13-step automated demo runner under 90 seconds. A dedicated `SihDemoMode.jsx` page and components must be added in the admin section with auto/manual playback controls and a final differentiators summary.
7. *From Observation 8*: R7 requires Grand Finale marketing polish. `Landing.jsx` must be updated with the exact headlines, working prototype pill, 6 value cards, and medical disclaimers.
8. *From Observation 9 & 10*: R8 and R9 require admin routing visibility and presentation pages. Admin dashboards must include the Routing Visualizer and Network Map; new pages `/architecture`, `/security`, and `/research` must be created and linked into `AppRoutes.jsx`.
9. *From Observation 11*: R10 requires an interactive network exploration view. A dedicated `PharmacyNetworkMap.jsx` with a radius slider, service rings, and drawer must be implemented.
10. *From Observation 12*: R11 requires test and build verification. At least 5 Jest unit tests must be added to `server/tests/routing.test.js`, seed data expanded in `seed.js`, and `npm run build` validated.

---

## 3. Caveats

- **No Live Medical or Financial Integration**: Per `ORIGINAL_REQUEST.md`, all payment transactions, prescription checks, medicine procurement, and map GPS movements are strictly simulated and mock.
- **Google Maps API Key**: If a live Google Maps API key is not supplied via environment variables, all map components will automatically fall back to the vector/SVG map abstraction without breaking or throwing runtime errors.
- **MERN Stack Integrity**: All additions must remain strictly within React 18, Vite, Node.js, Express, MongoDB/Mongoose, and Socket.IO.

---

## 4. Conclusion

A comprehensive feature-by-feature specification extraction and gap matrix has been compiled in `.agents/explorer_survey_specs/spec_gap_matrix.md`.

All 11 requirements (R1 to R11) have been analyzed against the current codebase with exact file paths, line numbers, missing components, target modification files, and verification criteria. The implementation path is clear and ready for execution by backend, frontend, and QA agents.

---

## 5. Verification Method

To independently verify this gap analysis:
1. **Inspect Spec Gap Matrix**: View `.agents/explorer_survey_specs/spec_gap_matrix.md` to confirm all 11 requirements, 38 discovered features, 10 edge cases, and target files.
2. **Inspect Existing Backend Routing**: View `server/src/services/pharmacyMatchService.js` to confirm lack of multi-factor scoring and split-basket logic.
3. **Inspect Existing Frontend Pages**: View `client/src/routes/AppRoutes.jsx` to confirm absence of `/architecture`, `/security`, `/research`, and `/demo`.
4. **Inspect Existing Tests**: View `server/tests/` to confirm only `auth.test.js` and `utils.test.js` exist, and routing unit tests are missing.
