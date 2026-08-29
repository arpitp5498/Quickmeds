# Project: QuickMeds SIH Grand Finale Prototype

## Architecture
- **Tech Stack**: MERN (MongoDB / Mongoose 8.3, Express 4.19, React 18.2 + Vite 5.2, Node.js) with Socket.IO 4.7 real-time event broadcasting and Jest unit test suite.
- **Backend Layout**: `server/src/`
  - `controllers/`: `routingController.js`, `orderController.js`, `prescriptionController.js`, `pharmacyController.js`, `adminController.js`, `deliveryController.js`, `researchController.js`
  - `services/`: `smartRoutingService.js` (multi-factor scoring & whole-basket optimization), `orderService.js`, `socketService.js`, `auditService.js`
  - `models/`: `User.js`, `Pharmacy.js`, `PharmacyInventory.js`, `Medicine.js`, `Order.js`, `Prescription.js`, `DeliveryPartner.js`, `AuditLog.js`, `ResearchSurvey.js`, `Notification.js`
  - `routes/`: `routingRoutes.js`, `orderRoutes.js`, `prescriptionRoutes.js`, `adminRoutes.js`, `deliveryRoutes.js`, `researchRoutes.js`
  - `tests/`: `routing.test.js`, `adversarialRouting.test.js`, `fallbackConcurrency.test.js`, `research.test.js`, `auth.test.js`, `utils.test.js`
- **Frontend Layout**: `client/src/`
  - `pages/`:
    - Public: `Landing.jsx`, `Architecture.jsx`, `Security.jsx`, `Research.jsx`
    - Customer: `Cart.jsx`, `Checkout.jsx`, `OrderDetail.jsx`, `MyPrescriptions.jsx`
    - Pharmacy: `PharmacyOrders.jsx`, `PharmacyOrderDetail.jsx`, `PharmacyPrescriptions.jsx`, `NearbyPharmacies.jsx`, `PharmacyNetworkMap.jsx`
    - Admin: `AdminDashboard.jsx`, `AdminAnalytics.jsx`, `AdminAuditLogs.jsx`, `AdminDemo.jsx`
  - `components/`: `routing/BasketOptimizationBreakdown.jsx`, `admin/RoutingMonitor.jsx`, `common/MapView.jsx`, `prescriptions/PrescriptionTimeline.jsx`, `prescriptions/PrescriptionInspectionModal.jsx`, `common/Navbar.jsx`, `common/Footer.jsx`, `common/Sidebar.jsx`
  - `routes/AppRoutes.jsx`

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Multi-Factor Routing Scoring | Availability (35%), Proximity (25%), ETA (15%), Price (15%), Rating (10%) composite scoring | M1 | ORIGINAL_REQUEST R1 |
| 2 | Whole-Basket Optimization | Evaluates single-pharmacy vs split-pharmacy fulfilment with totalDemoValue and explanation | M1 | ORIGINAL_REQUEST R1 |
| 3 | Routing REST API & Schema | `POST /api/routing/optimize` returning recommended, alternative, scores, coverage, and breakdown | M1 | ORIGINAL_REQUEST R1 |
| 4 | Routing Engine Jest Tests | 5+ unit tests covering single item, whole basket, split basket, zero stock, score weights | M1 | ORIGINAL_REQUEST R1 |
| 5 | Fallback Routing Logic | Timeout failover to 2nd best pharmacy with inventory reassignment and candidate chain | M1 | ORIGINAL_REQUEST R2 |
| 6 | Timeout Simulation API | `POST /api/orders/:id/simulate-timeout` for demo triggering fallback failover | M1 | ORIGINAL_REQUEST R2 |
| 7 | Configurable Timer & Audit | Admin configurable timeout timer + audit log entries for all fallback events | M1 | ORIGINAL_REQUEST R2 |
| 8 | Pharmacy Timeout Button | "Simulate Pharmacy Timeout" action button in pharmacy order management UI | M2 | ORIGINAL_REQUEST R2 |
| 9 | Optimization Animation & Chip | "Optimizing your fulfilment..." loading state and basket coverage (X/X) badge | M2 | ORIGINAL_REQUEST R3 |
| 10 | Scoring Factor Drawer | "How was this option selected?" breakdown modal/drawer with factors and weights | M2 | ORIGINAL_REQUEST R3 |
| 11 | Demo Pricing Disclaimers | Prominent "Demo pricing — Demonstration data only" notices on cart and checkout | M2 | ORIGINAL_REQUEST R3 |
| 12 | 4-Stage Rx Verification Timeline | Visual stepper: `PENDING` -> `UNDER_REVIEW` -> `VERIFIED` -> `REJECTED` | M2 | ORIGINAL_REQUEST R4 |
| 13 | Pharmacist Review Modal | Zoomable prescription viewer, structured rejection reason dropdown, pharmacist demo ID | M2 | ORIGINAL_REQUEST R4 |
| 14 | Pharmacist Safety Disclaimer | Simulation notice and order progression safety gate based on Rx verification | M2 | ORIGINAL_REQUEST R4 |
| 15 | 8-State Delivery Progression | Multi-state lifecycle from `PLACED` to `DELIVERED` with realistic ETA countdown | M3 | ORIGINAL_REQUEST R5 |
| 16 | Interactive Simulated Map | SVG/vector route map with dynamic rider waypoint animation and status indicators | M3 | ORIGINAL_REQUEST R5 |
| 17 | "Simulate Next Step" Control | Interactive action button advancing delivery state in <30 seconds for SIH judges | M3 | ORIGINAL_REQUEST R5 |
| 18 | Dedicated Network Map Page | `/pharmacy-network` with interactive radius slider (1-15km), service rings, filters | M3 | ORIGINAL_REQUEST R10 |
| 19 | Routing Polyline Highlight | Interactive route visualization from selected pharmacy to customer location on map | M3 | ORIGINAL_REQUEST R10 |
| 20 | SIH Landing Page Polish | Hero: "Emergency Medicine Access, Reimagined.", "Working Prototype" badge, medical disclaimer | M4 | ORIGINAL_REQUEST R7 |
| 21 | Workflow Visual & Why Cards | 4-step workflow diagram and 6 "Why QuickMeds?" differentiation cards | M4 | ORIGINAL_REQUEST R7 |
| 22 | `/architecture` Page | System architecture diagrams, component layers, data flow, tech stack breakdown | M4 | ORIGINAL_REQUEST R9 |
| 23 | `/security` Page | Patient data privacy, role-based access control, prescription handling, simulation boundaries | M4 | ORIGINAL_REQUEST R9 |
| 24 | `/research` Page & Admin Editor | Interactive survey charts (access times, pharmacy density) + admin edit form | M4 | ORIGINAL_REQUEST R9 |
| 25 | Admin Routing Monitor | Visual graph of live and historical routing decisions with factor weights in admin | M4 | ORIGINAL_REQUEST R8 |
| 26 | Admin Analytics & Audit Filter | Fallback Rate (%) and Basket Coverage (%) KPIs, audit log routing filter, fix Badge import | M4 | ORIGINAL_REQUEST R8 |
| 27 | 13-Step SIH Demo Runner | `/admin/demo` & `/demo` automated and manual 13-step workflow completing in <90 seconds | M5 | ORIGINAL_REQUEST R6 |
| 28 | Demo Completion Summary | Modal highlighting QuickMeds key differentiators upon demo completion | M5 | ORIGINAL_REQUEST R6 |
| 29 | Comprehensive Seed Data | Enriched medicines (33 items), pharmacies (7 stores), sample orders across all 8 states | M6 | ORIGINAL_REQUEST R11 |
| 30 | Responsive Design & Mobile QA | Cross-viewport testing (mobile, tablet, desktop) ensuring no horizontal overflow | M6 | ORIGINAL_REQUEST R11 |
| 31 | Documentation & Pitch README | README update with SIH pitch, problem statement, architecture, demo credentials | M6 | ORIGINAL_REQUEST R11 |
| 32 | Build & Test Validation | 100% unit test pass rate (62/62 tests in `npm test`) and clean build (`npm run build`) | M6 | ORIGINAL_REQUEST R11 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Smart Fulfilment Routing Engine & Fallback Routing | R1, R2 backend services, controllers, routes, fallback failover, Jest unit test suite | none | DONE |
| M2 | Basket Optimization UI & Pharmacist Verification Workflow | R3, R4 UI components, Cart/Checkout integration, 4-stage Rx timeline, review modal | M1 | DONE |
| M3 | Delivery Tracking Simulation & Pharmacy Network Map | R5, R10 delivery states, "Simulate Next Step", MapView animation, /pharmacy-network page | M1 | DONE |
| M4 | Landing Page, Additional Pages & Admin Visualizers | R7, R8, R9 Landing hero & cards, /architecture, /security, /research, Routing Monitor, KPIs | none | DONE |
| M5 | SIH Demo Mode & Automation | R6 13-step automated/manual demo runner (<90s), progress bar, completion modal | M1, M2, M3, M4 | DONE |
| M6 | Final Polish, QA, Responsive Design, Documentation & Validation | R11 Seed data, responsive QA, README, 100% npm test & npm run build pass | M1, M2, M3, M4, M5 | DONE |
