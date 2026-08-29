# QuickMeds SIH Grand Finale — Specification Extraction & Feature Gap Matrix

**Date**: 2026-08-28  
**Author**: Specification Miner / Requirements Analyst  
**Authoritative Reference**: `ORIGINAL_REQUEST.md`  
**Project**: QuickMeds Hyperlocal Emergency Medicine Fulfilment Platform (SIH 2026 Prototype)  

---

## 1. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| F1 | R1: Smart Routing | Multi-Factor Pharmacy Scoring | Computes composite score for candidate pharmacies based on availability, distance, ETA, price, and reliability | Patient GPS `[lng, lat]`, item list `[{ medicineId, quantity }]`, `maxRadiusKm` | Pharmacy score object (composite + factor breakdowns) | If no pharmacy found within radius, returns empty candidate list | `ORIGINAL_REQUEST.md` § R1, `pharmacyMatchService.js` |
| F2 | R1: Smart Routing | Whole-Basket Optimization | Optimizes multi-item basket to maximize coverage while minimizing total cost, ETA, and number of fulfillment points | Basket items array `[{ medicineId, quantity }]`, candidate pharmacies | `recommended` plan, `alternative` plan, `explanation` | Returns zero coverage plan if medicines unavailable across network | `ORIGINAL_REQUEST.md` § R1 |
| F3 | R1: Smart Routing | Split-Basket Fulfillment | Handles cases where no single pharmacy has all items by selecting optimal 2-pharmacy combination | Multi-item basket, candidate pharmacy inventory | Split plan with item-to-pharmacy allocation map, `fulfilmentPoints: 2` | If coverage < 100%, highlights uncovered items | `ORIGINAL_REQUEST.md` § R1 |
| F4 | R1: Smart Routing | Consolidated Demo Pricing | Computes single unified order value for customer instead of pharmacy-by-pharmacy fragmented prices | Plan items, delivery fees, safety/platform fees | `totalDemoValue`, `medicinesSubtotal`, `deliveryFee`, `platformFee` | Zero subtotal on empty basket | `ORIGINAL_REQUEST.md` § R1, § R3 |
| F5 | R1: Smart Routing | REST API Optimization Endpoint | Exposes smart routing engine via REST endpoint for cart/checkout consumption | `POST /api/routing/optimize` with `{ items, coordinates, maxRadiusKm }` | JSON response with `recommended`, `alternative`, `explanation`, `basketCoverage`, `fulfilmentPoints`, `totalDemoValue` | `400 Bad Request` if coordinates/items missing | `ORIGINAL_REQUEST.md` § R1 |
| F6 | R1: Smart Routing | Jest Routing Test Suite | Unit tests validating single-item, multi-item, no-stock, split-basket, and scoring logic | Test fixtures & mock pharmacy inventories | Test suite pass (minimum 5 test scenarios) | Test failure if assertions fail | `ORIGINAL_REQUEST.md` § R1, Acceptance Criteria |
| F7 | R2: Fallback Routing | Configurable Confirmation Timer | Timer (default 30s) tracking pharmacy acceptance window | Order creation timestamp, `FALLBACK_TIMEOUT_SECONDS` config | Timer countdown state & timeout event | Defaults to 30s if unconfigured | `ORIGINAL_REQUEST.md` § R2 |
| F8 | R2: Fallback Routing | Automated Fallback Execution | Automatically transfers order to next best candidate pharmacy when timer expires | Order ID, timeout trigger | Updated order `pharmacyId`, stock transfer, `statusHistory` entry, socket broadcast | Reverts order to `UNFULFILLED` if no alternate pharmacy available | `ORIGINAL_REQUEST.md` § R2 |
| F9 | R2: Fallback Routing | Simulate Timeout Button | Pharmacy dashboard UI control to trigger immediate simulated fallback | Click event on order card in `/pharmacy/orders` | API call `POST /api/orders/:id/fallback-timeout`, UI update | Shows toast error if order already accepted/cancelled | `ORIGINAL_REQUEST.md` § R2 |
| F10 | R2: Fallback Routing | Fallback Audit Trail & Socket | Logs `FALLBACK_ROUTING_TRIGGERED` audit event and broadcasts real-time socket alert | Order ID, old pharmacy ID, new pharmacy ID, reason | AuditLog record, `order_fallback_triggered` socket event | Falls back to polling if socket disconnected | `ORIGINAL_REQUEST.md` § R2, § R8 |
| F11 | R3: Basket UI | Fulfilment Optimization Animation | Loading animation illustrating live search, stock check, and routing engine scoring | Cart checkout trigger | Animated 3-step pulse ("Scanning pharmacies", "Checking stock", "Optimizing route") | Dismisses on API response or error | `ORIGINAL_REQUEST.md` § R3 |
| F12 | R3: Basket UI | Consolidated Breakdown & Badges | Displays item coverage (X/X), fulfilment points, ETA, itemized demo bill, and Final Demo Order Value | Optimization plan data | Visual breakdown card with demo tags | Shows error state if optimization fails | `ORIGINAL_REQUEST.md` § R3 |
| F13 | R3: Basket UI | "How was this selected?" Drawer | Expandable drawer/accordion displaying routing factor radar/bars and plain English justification | User click on info trigger | Breakdown of availability, distance, ETA, price, and reliability scores | Shows default text if factor breakdown missing | `ORIGINAL_REQUEST.md` § R3 |
| F14 | R3: Basket UI | Demo Pricing Disclaimers | Explicit labels on all pricing components indicating demonstration prototype data | Rendered price strings | "Demo pricing — Demonstration data only" label | Always visible | `ORIGINAL_REQUEST.md` § R3 |
| F15 | R4: Pharmacist | Verification Timeline | 4-state visual timeline: `PENDING` → `UNDER_REVIEW` → `VERIFIED` → `REJECTED` | Prescription document & status history | Visual stepper with timestamps and pharmacist demo ID | Renders rejected step in red if rejected | `ORIGINAL_REQUEST.md` § R4 |
| F16 | R4: Pharmacist | Prescription Review Modal | Pharmacist dashboard modal to inspect document, verify doctor info, and enter approval notes or rejection reason | Prescription ID, review form payload | Updated Prescription & linked Order status | Form validation requires reason if status is `REJECTED` | `ORIGINAL_REQUEST.md` § R4 |
| F17 | R4: Pharmacist | Order Dispense Gating | Prevents order status advancing to `ACCEPTED`/`PREPARING` until linked prescription is approved | Order state transition attempt | Allows transition if verified; blocks with error if pending | `400 Bad Request` if unapproved Rx order is advanced | `ORIGINAL_REQUEST.md` § R4 |
| F18 | R4: Pharmacist | Verification Disclaimer | Medical/legal disclaimer on prescription review and customer upload screens | Static component | "Demonstration simulation — not actual prescription authorization" | Always rendered | `ORIGINAL_REQUEST.md` § R4 |
| F19 | R5: Tracking | 8-State Delivery Progression | Order tracking through 8 discrete stages from placement to delivery | Order state updates | Updated timeline progress bar and active status banner | Ignores invalid backwards transitions | `ORIGINAL_REQUEST.md` § R5 |
| F20 | R5: Tracking | Interactive Map Visualizer | SVG/Canvas map rendering pharmacy pin, customer pin, rider marker, and route polyline | Pharmacy coords, customer coords, rider coords | Visual map layout with animated rider position | Uses default city center coords if coordinates missing | `ORIGINAL_REQUEST.md` § R5, `MapView.jsx` |
| F21 | R5: Tracking | "Simulate Next Step" Control | SIH demo button advancing tracking order to the next sequential state instantly | Click on "Simulate Next Step" | API call `PATCH /api/orders/:id/simulate-next`, UI transition | Disabled when order reaches `DELIVERED` | `ORIGINAL_REQUEST.md` § R5 |
| F22 | R6: Demo Mode | "Launch SIH Demo" Admin Trigger | Hidden/admin button launching complete end-to-end interactive simulation | Admin button click | Opens SIH Demo Mode overlay / interactive flow | Restricted to admin/demo area | `ORIGINAL_REQUEST.md` § R6 |
| F23 | R6: Demo Mode | 13-Step Automated/Manual Flow | Sequence running through customer search, routing, approval, packing, tracking, delivery in <90s | Step timer (Auto Demo) or manual Next button | Animated step transitions with explanatory captions | Allows pause/resume and step reset | `ORIGINAL_REQUEST.md` § R6 |
| F24 | R6: Demo Mode | Demo Completion Differentiators | Fullscreen completion modal highlighting Zero-Inventory, Hyperlocal, Verified, Smart Fulfilment | Completion of Step 13 | Differentiator cards, metrics summary, restart button | Displayed upon final step completion | `ORIGINAL_REQUEST.md` § R6 |
| F25 | R7: Landing | SIH Headline & Hero Badge | Updated hero copy with "Emergency Medicine Access, Reimagined." and "Working Prototype" badge | Landing page mount | Hero layout with CTAs and live working prototype pill | Static render | `ORIGINAL_REQUEST.md` § R7, `Landing.jsx` |
| F26 | R7: Landing | 6 "Why QuickMeds?" Value Cards | Cards for Zero-Inventory, Live Inventory, Smart Routing, Pharmacist-in-the-Loop, Fallback, Live Tracking | Static content | Responsive 6-card grid with icons and descriptions | Static render | `ORIGINAL_REQUEST.md` § R7 |
| F27 | R7: Landing | Strict Medical Disclaimer | Banner stating prototype nature, no medical diagnosis, no ambulance replacement | Static component | Disclaimer text in hero footer and site footer | Always rendered | `ORIGINAL_REQUEST.md` § R7 |
| F28 | R8: Admin | Routing Monitor Visualization | Visual node graph showing Patient → Candidates → Stock Check → Scoring → Selected Fulfilment | Recent routing optimization logs / test payload | Interactive routing visualizer card in Admin dashboard | Displays empty state if no recent routing data | `ORIGINAL_REQUEST.md` § R8 |
| F29 | R8: Admin | Pharmacy Network Monitor | Map widget showing mock pharmacies, active coverage radius rings, stock health, and status | Pharmacy directory data | Network map with status pins and cluster statistics | Displays default city radius if unselected | `ORIGINAL_REQUEST.md` § R8 |
| F30 | R8: Admin | Advanced Audit Log Filtering | Filter audit logs by routing decision, fallback events, prescription reviews, and system actions | Filter query parameters `?entity=...&action=...` | Filtered tabular audit log with JSON inspector drawer | Returns empty list if no matches | `ORIGINAL_REQUEST.md` § R8, `AdminAuditLogs.jsx` |
| F31 | R8: Admin | Real-Time Metrics & KPIs | Metrics for Active Pharmacies, Orders, Fallback Rate (%), Basket Coverage (%), Average Target ETA | Admin dashboard stats API | KPI cards and trend charts | Shows 0 / N/A on empty dataset | `ORIGINAL_REQUEST.md` § R8, `AdminDashboard.jsx` |
| F32 | R9: New Pages | Technical Architecture (`/architecture`) | Visual system block diagram and technical stack cards (React, Node, Mongo, Socket, JWT) | Route `/architecture` | Full-page interactive architecture visualizer | Renders inside MainLayout | `ORIGINAL_REQUEST.md` § R9 |
| F33 | R9: New Pages | Security & Compliance (`/security`) | Architecture security controls (RBAC, JWT, IDOR, Audit Trail) + statutory disclaimer | Route `/security` | Compliance report layout with control checklists | Renders inside MainLayout | `ORIGINAL_REQUEST.md` § R9 |
| F34 | R9: New Pages | Research & Validation (`/research`) | Survey insights for patients & pharmacies, interactive charts, and admin live edit form | Route `/research` | Research visualizer with dynamic survey statistics | Persists edited numbers in state/localStorage | `ORIGINAL_REQUEST.md` § R9 |
| F35 | R10: Network Map | Dedicated Pharmacy Map Page | Full-page interactive network map with radius slider (1-15km), stock filter, and pharmacy drawer | User location, radius slider value, pharmacy dataset | Map with dynamic service rings, pin markers, and detail drawer | Graceful fallback to rich mock SVG map if Google API key absent | `ORIGINAL_REQUEST.md` § R10 |
| F36 | R10: Network Map | Routing Highlight Polyline | Highlights delivery path from patient coordinates to selected or recommended pharmacy | Selected pharmacy pin click | Rendered polyline path and distance/ETA overlay | Re-centers map if coords out of view | `ORIGINAL_REQUEST.md` § R10 |
| F37 | R11: Polish & QA | Responsive Mobile-First QA | Seamless display across mobile (375px), tablet (768px), and desktop (1240px) | Viewport resize | Clean responsive grid layouts, drawers, bottom sheets | CSS media queries prevent overflow | `ORIGINAL_REQUEST.md` § R11 |
| F38 | R11: Polish & QA | Seed Data Expansion | Seeds multi-pharmacy inventories, fallback scenarios, audit logs, and survey benchmarks | `node src/seed/seed.js` | MongoDB collections populated for all demo features | Exits with status 1 on Mongo connection error | `ORIGINAL_REQUEST.md` § R11, `seed.js` |

---

## 2. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| E1 | Smart Fulfilment Routing | Cart contains medicine not stocked by any pharmacy in network | Engine returns `basketCoverage < 1.0` (e.g. 2/3), highlights missing medicine, provides best partial plan and explanation ("Paracetamol out of stock across all nearby partners; fulfilled 2 of 3 items"). |
| E2 | Smart Fulfilment Routing | Single pharmacy has 100% stock vs Split 2-pharmacy basket with lower price | Single pharmacy is prioritized to minimize dispatch overhead unless cost/ETA delta exceeds configurable threshold; explanation explicitly clarifies single-point dispatch rationale. |
| E3 | Smart Fulfilment Routing | Patient coordinates are outside all pharmacy service radiuses (>15km) | Engine expands radius to maximum allowable limit (25km) or returns `noAvailability` with fallback recommendation and nearest pharmacy distance. |
| E4 | Fallback Routing | Primary pharmacy times out, but 2nd candidate pharmacy is currently closed/busy | Fallback engine inspects candidate queue in descending score order, skips ineligible/closed pharmacies, and reassigns to the next available verified pharmacy. |
| E5 | Fallback Routing | "Simulate Timeout" triggered on an order that is already `DELIVERED` or `CANCELLED` | Backend rejects transition with `400 Bad Request` ("Cannot trigger fallback on completed or cancelled order"); UI displays informative toast. |
| E6 | Basket Optimization UI | User adds/removes items while optimization results are displayed | UI triggers automatic re-optimization debounce, shows quick recalculation spinner, and updates consolidated demo value. |
| E7 | Pharmacist Verification | Pharmacist rejects prescription without typing a rejection reason | Client form validation blocks submit; server returns `400 Bad Request` ("Rejection reason is mandatory"). |
| E8 | Delivery Tracking | User clicks "Simulate Next Step" repeatedly in rapid succession | Button debounces requests with loading state, transitions step-by-step without skipping intermediate audit logs. |
| E9 | SIH Demo Mode | User navigates away from demo tab mid-sequence | Demo timer pauses on visibility change / tab switch and resumes smoothly without desynchronizing UI steps. |
| E10 | Pharmacy Network Map | Google Maps API key is missing or invalid in environment | Component automatically renders high-fidelity SVG/Canvas vector map abstraction with full interactivity, pins, radius rings, and click drawers without throwing console errors. |

---

## 3. Granular Specification Extraction (R1 – R11)

### R1. Smart Fulfilment Routing Engine
- **Scoring Formula & Multi-Factor Weights**:
  $$\text{Composite Score} = (w_{avail} \times S_{avail}) + (w_{dist} \times S_{dist}) + (w_{eta} \times S_{eta}) + (w_{price} \times S_{price}) + (w_{rel} \times S_{rel})$$
  - Recommended default weights: $w_{avail} = 0.35$, $w_{dist} = 0.20$, $w_{eta} = 0.20$, $w_{price} = 0.15$, $w_{rel} = 0.10$.
  - Availability ($S_{avail}$): $1.0$ if all items in stock, proportional for partial.
  - Distance ($S_{dist}$): $1 - (d / d_{max})$ where $d_{max}$ is search radius (e.g. 15km).
  - ETA ($S_{eta}$): $1 - (\text{ETA} / 60\text{ min})$.
  - Pricing ($S_{price}$): comparative ratio of item sum against max catalog price.
  - Reliability ($S_{rel}$): pharmacy rating $/ 5.0$.
- **Basket Optimization Strategy**:
  - Step 1: Candidate discovery via geospatial query (`location: { $nearSphere: ... }`).
  - Step 2: Single-pharmacy candidate scoring.
  - Step 3: Split-pharmacy combination generation (pairs of pharmacies) for baskets unfulfillable by a single pharmacy or where split optimizes coverage.
  - Step 4: Selection of `recommended` (highest score) and `alternative` (next best distinct option).
  - Step 5: Formulation of human-readable `explanation`.
- **Payload Contracts**:
  ```json
  {
    "success": true,
    "data": {
      "recommended": {
        "planType": "SINGLE_PHARMACY",
        "fulfilmentPoints": 1,
        "basketCoverage": { "covered": 3, "total": 3, "percentage": 100 },
        "pharmacies": [{ "pharmacyId": "...", "name": "Apollo Pharmacy", "distanceKm": 1.8, "etaMinutes": 20, "items": [...] }],
        "breakdown": { "medicinesSubtotal": 227, "deliveryFee": 25, "platformFee": 5, "totalDemoValue": 257 },
        "scoreBreakdown": { "composite": 94.2, "availability": 100, "distance": 88, "eta": 90, "pricing": 95, "reliability": 98 }
      },
      "alternative": {
        "planType": "SPLIT_BASKET",
        "fulfilmentPoints": 2,
        "basketCoverage": { "covered": 3, "total": 3, "percentage": 100 },
        "pharmacies": [...],
        "breakdown": { "medicinesSubtotal": 220, "deliveryFee": 40, "platformFee": 5, "totalDemoValue": 265 },
        "scoreBreakdown": { "composite": 86.5 }
      },
      "explanation": "Apollo Pharmacy was selected as the optimal single-point fulfillment partner because it has 100% item availability within 1.8km, offering the fastest delivery ETA (20 mins) with a single delivery charge."
    }
  }
  ```
- **Jest Test Suite**: Must pass at least 5 scenarios in `server/tests/routing.test.js`.

---

### R2. Fallback Routing Simulation
- **Confirmation Timer**: 30-second default countdown stored in state/order document.
- **Failover Logic**:
  1. Triggered on timer expiry or manual "Simulate Pharmacy Timeout" button click.
  2. Order transitions from `PLACED` / `PHARMACY_REVIEW` to `FALLBACK_REASSIGNED`.
  3. Original pharmacy inventory stock is restored.
  4. Next eligible candidate pharmacy from routing plan is assigned.
  5. New pharmacy inventory stock is decremented.
  6. Socket event `order_fallback_triggered` emitted to order and customer rooms.
  7. Audit log created with action `FALLBACK_ROUTING_TRIGGERED`.
- **Configurability**: Timeout duration configurable in backend config / admin settings.

---

### R3. Basket Optimization & Pricing UI
- **Customer Experience**:
  - Live animated routing computation banner on Cart and Checkout.
  - Coverage chip: "100% Basket Covered (3/3 Items)".
  - Fulfillment chip: "⚡ Single Pharmacy Dispatch (Apollo Pharmacy)".
  - Expandable drawer: "How was this option selected?" with radar/progress bars for each scoring dimension and full human-readable rationale.
  - Prominent "Demo pricing — Demonstration data only" label next to all currency values.

---

### R4. Pharmacist-in-the-Loop Verification Workflow
- **State Machine**: `PENDING` → `UNDER_REVIEW` → `VERIFIED` → `REJECTED`.
- **Pharmacist Controls**:
  - Inspection modal with zoomable prescription preview.
  - Review form with approval notes or mandatory rejection reason dropdown (Dosage unclear, Expired Rx, Controlled substance restriction, Illegible document).
  - Verified banner stamped with Pharmacist Demo ID (`Dr. S. K. Gupta, Reg. Pharmacist #DL-9942`) and UTC timestamp.
  - Hard order gate: Order cannot move to `PREPARING` without `VERIFIED` status.
  - Visible disclaimer: "Demonstration simulation — not actual prescription authorization."

---

### R5. Delivery Tracking Simulation
- **8 Discrete States**:
  1. `ORDER_PLACED`
  2. `PHARMACY_VERIFICATION`
  3. `PHARMACY_CONFIRMED`
  4. `PREPARING`
  5. `DELIVERY_ASSIGNED`
  6. `PICKUP`
  7. `OUT_FOR_DELIVERY`
  8. `DELIVERED`
- **Simulation Control**: "⚡ Simulate Next Step" button on `OrderDetail.jsx` allowing manual step advance with instant visual map update, rider coordinate movement, and status timeline update. Target: complete in under 30s.

---

### R6. SIH Demo Mode
- **Access**: Located inside `/admin`, admin bar, or quick launch banner (NOT in main public customer navbar).
- **Automated / Step-by-Step 13-Step Workflow**:
  - Steps 1-13 progressing from patient selection to delivery completion in 45-60s (<90s).
  - Controls: "Auto Demo (45s)", "Next Step", "Previous Step", "Restart Demo".
  - Floating progress overlay with animated step description.
  - Grand Finale Completion Screen with 4 core value propositions (Zero-Inventory, Hyperlocal, Verified, Smart Fulfilment).

---

### R7. Landing Page Enhancement
- **Hero Title**: "Emergency Medicine Access, Reimagined."
- **Badge**: "QuickMeds — Nearest Medicine. Fastest Help. | Working Prototype"
- **CTAs**: Primary "Find Medicine" (`/medicines`), Secondary "View How It Works".
- **Visual Workflow**: 6-step visual path (Location → Stock Match → Smart Routing → Verification → Express Packing → Live Tracking).
- **6 "Why QuickMeds?" Value Cards**: Zero-Inventory Network, Live Inventory Matching, Smart Fulfilment Routing, Pharmacist-in-the-Loop, Fallback Routing, Live Order Tracking.
- **Medical Disclaimer**: Stating zero clinical diagnosis claims, prototype demonstration only.

---

### R8. Admin Enhancements
- **Routing Monitor Visualization**: Dynamic visual flowchart of Patient Request ➔ Candidate Search ➔ Stock Filter ➔ Scoring ➔ Plan Recommendation.
- **Network Map**: Interactive overview of active pharmacies, radius zones, and stock levels.
- **Audit Logs Filtering**: Dropdown filter for `ROUTING_DECISION`, `FALLBACK_TRIGGERED`, `PRESCRIPTION_VERIFIED`, `ORDER_DISPATCHED`, etc., with JSON detail view.
- **Metrics**: Fallback Rate (%), Basket Coverage (%), Average Target ETA, Active Pharmacies, Orders by Area.

---

### R9. Additional SIH Pages
- **`/architecture`**: Full interactive system architecture diagram & technology stack cards.
- **`/security`**: Security architecture, RBAC, JWT, IDOR protection, encryption, statutory compliance disclaimers.
- **`/research`**: Patient and pharmacy survey data, charts, key takeaways, and admin live edit form.

---

### R10. Dedicated Pharmacy Network Map
- **Features**: Interactive radius slider (1-15km), stock availability filter, pharmacy pin detail drawer, routing highlight polyline, and graceful Google Maps fallback.

---

### R11. Final Polish, QA, Documentation & Tests
- Responsive mobile-first design, 100% passing test suite (including 5 routing unit tests), updated `seed.js` mock data, updated `README.md` demo walkthrough, clean build.

---

## 4. Comprehensive Feature Gap Matrix

| Req # | Requirement Name | Existing Code Status | Missing / Incomplete Components | Target Files to Modify / Create | Acceptance / Verification Criteria |
|---|---|---|---|---|---|
| **R1** | Smart Fulfilment Routing Engine | **Partial (Naive nearest)** | - Multi-factor scoring formula (availability, distance, ETA, pricing, reliability)<br>- Whole-basket optimization<br>- Multi-pharmacy split-basket generation<br>- Consolidated `totalDemoValue`<br>- `explanation` generator<br>- Dedicated REST endpoint `POST /api/routing/optimize`<br>- Jest unit tests for 5 scenarios | **Create:**<br>- `server/src/services/smartRoutingService.js`<br>- `server/src/controllers/routingController.js`<br>- `server/src/routes/routingRoutes.js`<br>- `server/tests/routing.test.js`<br>**Modify:**<br>- `server/src/index.js`<br>- `server/src/controllers/orderController.js`<br>- `server/src/services/pharmacyMatchService.js` | 1. `POST /api/routing/optimize` returns `recommended`, `alternative`, `explanation`, `fulfilmentPoints`, `basketCoverage`, `totalDemoValue`.<br>2. `npm test` passes all 5 routing test scenarios in `server/tests/routing.test.js`. |
| **R2** | Fallback Routing Simulation | **Missing** | - Configurable 30s confirmation timer logic<br>- Auto-fallback handler on timeout<br>- Fallback API endpoint `POST /api/orders/:id/fallback-timeout`<br>- "Simulate Pharmacy Timeout" button on pharmacy order card<br>- `FALLBACK_ROUTING_TRIGGERED` audit logging & socket broadcast<br>- Admin timeout configuration | **Create / Modify:**<br>- `server/src/services/fallbackRoutingService.js`<br>- `server/src/controllers/orderController.js`<br>- `server/src/routes/orderRoutes.js`<br>- `client/src/pages/pharmacy/PharmacyOrders.jsx`<br>- `client/src/pages/pharmacy/PharmacyDashboard.jsx`<br>- `client/src/pages/admin/AdminAuditLogs.jsx` | 1. Clicking "Simulate Pharmacy Timeout" in Pharmacy Orders moves order to next pharmacy.<br>2. Audit log records `FALLBACK_ROUTING_TRIGGERED`.<br>3. Customer receives real-time fallback notification. |
| **R3** | Basket Optimization & Pricing UI | **Partial (Basic cart)** | - "Optimizing your fulfilment..." animated loading state<br>- Basket coverage chip & fulfillment points display<br>- "How was this option selected?" expandable drawer with routing factor scores & plain English explanation<br>- "Demo pricing — Demonstration data only" disclaimers on all pricing elements<br>- Integration with `/api/routing/optimize` | **Modify:**<br>- `client/src/pages/cart/Cart.jsx`<br>- `client/src/pages/checkout/Checkout.jsx`<br>- `client/src/context/CartContext.jsx`<br>**Create:**<br>- `client/src/components/common/BasketOptimizationCard.jsx` | 1. Cart/checkout displays optimization animation and shows items covered (X/X), fulfilment points, ETA, and breakdown.<br>2. Expandable explanation drawer shows routing factor scores.<br>3. Demo pricing labels visible. |
| **R4** | Pharmacist-in-the-Loop Verification | **Partial (Basic Rx approval)** | - Visual 4-state verification timeline (`PENDING` → `UNDER_REVIEW` → `VERIFIED` → `REJECTED`)<br>- Review modal with zoomable prescription preview and rejection reason dropdown<br>- Verified badge with Pharmacist Demo ID and timestamp<br>- Order progression gating on Rx status<br>- Demonstration simulation disclaimer | **Modify:**<br>- `client/src/pages/prescriptions/MyPrescriptions.jsx`<br>- `client/src/pages/pharmacy/PharmacyPrescriptions.jsx`<br>- `client/src/pages/pharmacy/PharmacyOrderDetail.jsx`<br>- `server/src/controllers/prescriptionController.js`<br>- `server/src/controllers/orderController.js` | 1. Pharmacy review modal allows approving with notes or rejecting with reason.<br>2. Verification timeline displays pharmacist demo ID.<br>3. Order cannot proceed without verification. |
| **R5** | Delivery Tracking Simulation | **Partial (Static map)** | - 8-state order progression (`ORDER_PLACED` to `DELIVERED`)<br>- "Simulate Next Step" button for SIH demo<br>- Dynamic animated rider movement along route polyline<br>- Simulated route progression endpoint `PATCH /api/orders/:id/simulate-next` | **Modify:**<br>- `client/src/pages/orders/OrderDetail.jsx`<br>- `client/src/components/common/MapView.jsx`<br>- `server/src/controllers/orderController.js`<br>- `server/src/routes/orderRoutes.js`<br>- `server/src/services/orderService.js` | 1. "Simulate Next Step" button advances order state through all 8 stages.<br>2. MapView shows animated rider along polyline with ETA.<br>3. Entire demo completable in under 30s. |
| **R6** | SIH Demo Mode | **Missing** | - "Launch SIH Demo" button in admin area / demo bar<br>- 13-step automated/manual sequence (<90s)<br>- Interactive step controls ("Auto Demo", "Next Step", "Restart")<br>- Floating progress overlay with step captions<br>- Grand finale completion summary screen with 4 differentiators | **Create:**<br>- `client/src/pages/demo/SihDemoMode.jsx`<br>- `client/src/components/demo/DemoOverlay.jsx`<br>- `client/src/components/demo/DemoCompletionModal.jsx`<br>**Modify:**<br>- `client/src/routes/AppRoutes.jsx`<br>- `client/src/pages/admin/AdminDashboard.jsx`<br>- `client/src/components/common/Navbar.jsx` | 1. "Launch SIH Demo" in admin area opens 13-step sequence.<br>2. "Auto Demo" finishes full workflow in <90s.<br>3. Completion screen shows key differentiators. |
| **R7** | Landing Page Enhancement | **Partial (Old copy)** | - Hero title: "Emergency Medicine Access, Reimagined."<br>- "Working Prototype" badge<br>- "Find Medicine" & "View How It Works" CTAs<br>- 6-step visual workflow graphic<br>- 6 "Why QuickMeds?" value cards<br>- Medical & regulatory prototype disclaimer | **Modify:**<br>- `client/src/pages/public/Landing.jsx`<br>- `client/src/components/common/Footer.jsx` | 1. Landing page displays exact SIH headlines, working prototype badge, 6 workflow steps, and 6 value cards.<br>2. Medical disclaimer rendered prominently. |
| **R8** | Admin Enhancements | **Partial (Basic stats)** | - Routing monitor visualizer (Patient ➔ Candidates ➔ Stock ➔ Scoring ➔ Plan)<br>- Pharmacy network overview widget<br>- Advanced audit log filtering by routing/fallback/verification actions<br>- KPI metrics: Fallback Rate (%), Basket Coverage (%), Average Target ETA | **Modify:**<br>- `client/src/pages/admin/AdminDashboard.jsx`<br>- `client/src/pages/admin/AdminAuditLogs.jsx`<br>- `client/src/pages/admin/AdminAnalytics.jsx`<br>- `server/src/services/adminService.js`<br>- `server/src/controllers/adminController.js` | 1. Admin dashboard renders Routing Monitor Visualizer.<br>2. Audit logs filterable by routing/fallback events.<br>3. Metrics show Fallback Rate and Basket Coverage. |
| **R9** | Additional SIH Pages | **Missing** | - Technical Architecture Page (`/architecture`) with interactive diagram & stack cards<br>- Security & Compliance Page (`/security`) with architecture controls & statutory disclaimer<br>- Research & Validation Page (`/research`) with survey charts & admin edit form | **Create:**<br>- `client/src/pages/public/Architecture.jsx`<br>- `client/src/pages/public/SecurityCompliance.jsx`<br>- `client/src/pages/public/ResearchValidation.jsx`<br>**Modify:**<br>- `client/src/routes/AppRoutes.jsx`<br>- `client/src/components/common/Navbar.jsx`<br>- `client/src/components/common/Footer.jsx` | 1. `/architecture`, `/security`, and `/research` routes render without console errors.<br>2. Research page allows editing survey numbers in demo.<br>3. Navigable from header/footer. |
| **R10** | Dedicated Pharmacy Network Map | **Partial (Basic list)** | - Dedicated network map page (`/pharmacies/map` or full interactive view)<br>- Interactive radius slider (1–15km)<br>- Live service radius circles & stock indicators<br>- Pharmacy pin click detail drawer (score, ETA, distance)<br>- Routing highlight polyline from user to pharmacy<br>- Env-based Google Maps loader with mock SVG fallback | **Create:**<br>- `client/src/pages/pharmacies/PharmacyNetworkMap.jsx`<br>**Modify:**<br>- `client/src/pages/pharmacies/NearbyPharmacies.jsx`<br>- `client/src/components/common/MapView.jsx`<br>- `client/src/routes/AppRoutes.jsx` | 1. Radius slider dynamically adjusts search radius and visible pharmacies.<br>2. Clicking pharmacy shows score, distance, and routing polyline.<br>3. Seamless mock SVG fallback if no API key. |
| **R11** | Final Polish, QA, Documentation & Tests | **Partial** | - Responsive mobile-first verification<br>- Expanded seed data (multi-pharmacy inventories, fallback scenarios, audit logs, survey numbers)<br>- Jest test suite pass (`npm test`)<br>- Clean client build (`npm run build`)<br>- Updated `README.md` with demo scripts and API docs | **Modify:**<br>- `server/src/seed/seed.js`<br>- `server/src/seed/seedData.js`<br>- `README.md` | 1. `npm test` runs with 100% passing tests.<br>2. `npm run build` succeeds without warnings/errors.<br>3. README document contains full SIH demo guide. |

---
