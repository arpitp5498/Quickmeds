# Original User Request

## Initial Request — 2026-08-28T04:42:31Z

Build all missing SIH Grand Finale features for **QuickMeds** — a zero-inventory hyperlocal emergency-medicine fulfilment platform prototype — on top of an existing working MERN codebase. This is a **demonstration prototype** for Smart India Hackathon 2026 using **simulated/mock data only**. Do NOT implement real medicine purchasing, payment processing, prescription validation, drug procurement, medical diagnosis, or dosage recommendations.

Working directory: `c:\Users\arpit\OneDrive\Documents\medirush`
Integrity mode: development

## Context — Existing Codebase

The workspace already contains a working full-stack MERN application ("QuickMeds", previously "Medirush"). Key facts:

- **Frontend** (95 files): React 18 + Vite + React Router v6 + Lucide Icons + Context API (Auth, Theme, Toast, Location, Cart, Socket.IO). Pages exist for: Landing, Auth (Login/Register), Customer Dashboard, Medicine Search/Detail/Categories, Cart, Checkout, Orders, Pharmacy Dashboard/Inventory/Orders/Prescriptions/Profile, Admin Dashboard/Analytics/AuditLogs/Orders/Pharmacies/Users/Prescriptions, Delivery Dashboard/Active/History, Notifications, Prescriptions, Nearby Pharmacies, and more. Reusable UI component library in `client/src/components/ui/`.
- **Backend** (70 files): Node.js + Express + Socket.IO + Mongoose + JWT + Multer + Helmet + CORS + express-validator + rate-limit. Controllers, routes, services, middleware, models, validators, seed data all in place. Models: User, Pharmacy, PharmacyInventory, Medicine, Order, Cart, Prescription, AuditLog, DeliveryPartner, Notification, Review, Address, etc.
- **Database**: MongoDB with Mongoose. Seed script at `server/src/seed/seed.js`. Geospatial `2dsphere` indexing.
- **Auth**: JWT with 4 roles — CUSTOMER, PHARMACY, DELIVERY_PARTNER, ADMIN. Demo accounts already seeded.
- **Current Routing Engine** (`server/src/services/pharmacyMatchService.js`): Simple nearest-pharmacy-with-stock search. Does NOT do multi-factor scoring, basket optimization, multi-pharmacy fulfillment, fallback routing, or consolidated pricing.
- **Branding**: Already rebranded to "QuickMeds" throughout.
- **CSS Design System**: `client/src/styles/variables.css` has navy/blue/green palette, Inter + Plus Jakarta Sans typography, rounded cards, shadow system.
- **Dev commands**: `npm run install:all`, `npm run seed`, `npm run dev` (starts both servers).
- **Frontend**: http://localhost:5173 | **Backend**: http://localhost:5000/api
- **MongoDB** will be running at `mongodb://localhost:27017/medirush`.

**CRITICAL**: Preserve all existing working code. Do NOT break existing functionality. Add new features on top, modify existing files only where integration is necessary.

**TECHNOLOGY CONSTRAINT**: Must stay on MERN stack (React + Node.js + Express + MongoDB + Mongoose + JWT). Do NOT switch to Next.js, Firebase, Flutter, or any other framework. The SIH PPT and prototype must show consistent architecture.

## Requirements

### R1. Smart Fulfilment Routing Engine

Replace the existing simple `pharmacyMatchService.js` with a multi-factor scoring and basket-optimization engine. The engine must:

- Accept patient GPS coordinates and a basket of requested medicines (multiple items).
- Find nearby verified pharmacies within a configurable radius.
- For each candidate pharmacy, compute scores for: medicine availability, distance, estimated delivery time (ETA), simulated pricing, and fulfilment reliability.
- For multi-item baskets: optimize the WHOLE basket (maximize coverage, minimize total cost + ETA + number of pharmacies involved) rather than independently selecting the cheapest pharmacy per item.
- Return: recommended fulfilment plan, alternative plan, and a human-readable explanation of why the recommendation was chosen.
- Present ONE consolidated demo order value to the customer — not a pharmacy-by-pharmacy comparison.
- Expose via REST API endpoint(s).
- Include unit tests (Jest) for the routing engine with various mock scenarios (single-item basket, multi-item basket, no-availability scenario, multi-pharmacy split, and pharmacy scoring).
- All data must be simulated/mock. All amounts must be clearly labeled "Demo pricing."

### R2. Fallback Routing

Implement a fallback routing simulation:

- When a pharmacy receives an order, start a configurable confirmation timer (default: 30 seconds for demo).
- If pharmacy does not confirm within the timeout, automatically select the next eligible pharmacy from the routing engine results.
- Update order status and notify the patient.
- Add a visible "Simulate Pharmacy Timeout" button in the pharmacy dashboard.
- Show fallback event logs and make timeout configurable from admin settings.
- Integrate with the existing Order state machine and Socket.IO notifications.

### R3. Basket Optimization & Pricing UI

Build the customer-facing basket optimization experience:

- After patient adds medicines, show "Optimizing your fulfilment..." animation.
- Display the optimized result: items covered (X/X), fulfilment points (number of pharmacies), estimated ETA, itemized breakdown (medicine value, delivery charge, platform charge), and FINAL DEMO ORDER VALUE.
- Add expandable "How was this option selected?" with routing factors shown.
- Clearly label all amounts as "Demo pricing — Demonstration data only."
- Integrate into the existing cart/checkout flow.

### R4. Pharmacist-in-the-Loop Verification Workflow

Enhance the existing prescription workflow with a visible verification timeline:

- States: PENDING → UNDER_REVIEW → VERIFIED → REJECTED.
- Show verification timestamp, pharmacist demo ID, audit event, and status.
- Order proceeds only after simulated approval.
- Add a clear disclaimer: "Demonstration simulation — not actual prescription authorization."

### R5. Delivery Tracking Simulation

Build a demo delivery tracking module:

- Order states: ORDER_PLACED → PHARMACY_VERIFICATION → PHARMACY_CONFIRMED → PREPARING → DELIVERY_ASSIGNED → PICKUP → OUT_FOR_DELIVERY → DELIVERED.
- Simulated map showing pharmacy location, delivery partner position, destination, route line, and ETA.
- "Simulate Next Step" button for SIH demonstration to advance through states.
- Use mock coordinates. Do NOT connect to real delivery services.
- Target: entire tracking demo completable in under 30 seconds.

### R6. SIH Demo Mode

Create a special demo mode accessible via an admin/hidden button:

- "Launch SIH Demo" runs the complete workflow with mock data in 45–60 seconds.
- Scenario: Patient selects 3 medicines → Location detected → Nearby pharmacies appear → Inventory matching → Pricing evaluation → Smart routing runs → Best fulfilment option shown → Consolidated order value → Pharmacist verification → Pharmacy confirmation → Delivery assignment → Live tracking → Delivered.
- Each step animates smoothly with "Next Step" and "Auto Demo" buttons.
- At the end, show completion screen with key differentiators: ZERO-INVENTORY, HYPERLOCAL, VERIFIED, SMART FULFILMENT.
- Place access in admin/demo area, NOT in top-level navigation.

### R7. Landing Page Enhancement

Enhance the existing landing page to be SIH Grand Finale ready:

- Hero: "QUICKMEDS — Nearest Medicine. Fastest Help."
- Main headline: "Emergency Medicine Access, Reimagined."
- Subheadline: zero-inventory hyperlocal fulfilment network concept.
- Primary CTA: "Find Medicine" | Secondary CTA: "View How It Works."
- Three core benefits: Hyperlocal, Verified, Fast.
- Visual workflow: Patient → Location → Nearby Pharmacy → Stock Match → Verification → Delivery.
- "Why QuickMeds?" cards: Zero-Inventory Network, Live Inventory Matching, Smart Fulfilment Routing, Pharmacist-in-the-Loop, Fallback Routing, Live Order Tracking.
- "Working Prototype" badge.
- No medical claims or diagnosis claims.

### R8. Admin Enhancements

Enhance the existing admin dashboard with:

- Routing monitor visualization: Patient → Candidate Pharmacies → Stock Match → Optimization → Selected Fulfilment.
- Pharmacy network map showing mock pharmacies, service radius, stock availability, ETA.
- Enhanced audit log with: order created, pharmacy discovered, stock checked, routing decision, verification event, confirmation, dispatch, delivery events.
- Dashboard metrics: Active Pharmacies, Active Orders, Successful Fulfilments, Average ETA, Fallback Rate, Basket Coverage, Orders by Area.

### R9. Additional SIH Pages

Create these new pages:

- **Technical Architecture Page** (`/architecture`): Visual diagram of the system — Patient Web → API/Backend → Auth → Smart Routing Engine → Pharmacy Network → Order Management → Delivery Tracking. Technology cards for React, Node, Express, MongoDB, JWT, Geolocation, Multer.
- **Security & Compliance Page** (`/security`): Architecture-level controls — RBAC, JWT, secure file handling, audit trail, pharmacy verification, human-in-the-loop, input validation, API authorization. Include disclaimer about regulatory validation needed for actual deployment.
- **Research & Validation Section** (`/research`): Patient survey and pharmacy survey sections with mock summary data. Charts for pain points, delivery urgency, pharmacy digital adoption. Admin form to update survey numbers. Label: "Survey data will be updated from actual Google Form responses."

### R10. Pharmacy Network Map

Create a dedicated pharmacy network visualization page:

- Show patient location, verified mock pharmacies on a map (or map abstraction if no API key).
- Active service radius, stock availability indicators, estimated ETA.
- Click a pharmacy to see: verification status, availability, distance, ETA, fulfilment score.
- Highlight recommended pharmacy/fulfilment plan.
- Google Maps API key loaded from environment variable — NEVER expose in frontend code.

### R11. Final Polish & QA

- Ensure responsive mobile-first design across all new pages.
- All routes navigable, no broken links, no console errors.
- Empty states, loading states, and error states for all new features.
- Premium healthcare-tech aesthetic: Navy + teal + green palette, white background, rounded cards, clean typography.
- 20–30 minute delivery presented as a "TARGET" not a guaranteed SLA.
- Every important feature demonstrable within 2–3 clicks.
- README updated with all new features, routes, and demo instructions.

## Acceptance Criteria

### Smart Routing Engine
- [ ] `npm test` passes at least 5 routing engine unit tests covering: single-item basket, multi-item basket, no-availability scenario, multi-pharmacy split, and pharmacy scoring
- [ ] `GET /api/routing/optimize` (or equivalent) returns a JSON response with `recommended`, `alternative`, and `explanation` fields when called with valid mock coordinates and medicine IDs
- [ ] Multi-item basket response shows `fulfilmentPoints` (number of pharmacies) and `basketCoverage` (items covered / total items)
- [ ] Response includes consolidated `totalDemoValue` field (not per-pharmacy prices)

### Fallback Routing
- [ ] A "Simulate Pharmacy Timeout" button exists in the pharmacy dashboard and triggers visible fallback to next eligible pharmacy
- [ ] Fallback timeout is configurable (verify by checking admin settings or config)
- [ ] Order status updates and fallback event is logged in audit trail

### Basket Optimization UI
- [ ] Cart/checkout page shows optimization animation and then displays: items covered, fulfilment points, ETA, itemized breakdown, and FINAL DEMO ORDER VALUE
- [ ] "How was this option selected?" expandable section is present with routing factors
- [ ] All pricing labels include "Demo" or "Demonstration" disclaimers

### Pharmacist Verification
- [ ] Verification workflow shows timeline with states: PENDING → UNDER_REVIEW → VERIFIED → REJECTED
- [ ] Pharmacy dashboard shows verification controls (approve/reject)
- [ ] Disclaimer text is visible stating this is a demonstration simulation

### Delivery Tracking
- [ ] Tracking page shows order state progression through all defined states
- [ ] "Simulate Next Step" button advances the state visually
- [ ] Simulated map or map placeholder shows pharmacy, delivery partner, and destination positions

### SIH Demo Mode
- [ ] "Launch SIH Demo" button exists in admin area (not in main navigation)
- [ ] Demo plays through complete workflow (13 steps as specified) with "Next Step" and "Auto Demo" controls
- [ ] Demo completes in under 90 seconds on "Auto Demo"
- [ ] Completion screen shows QuickMeds differentiators

### Landing Page
- [ ] Landing page displays hero, workflow visualization, "Why QuickMeds?" cards, and "Working Prototype" badge
- [ ] "Find Medicine" CTA navigates to medicine search
- [ ] No medical claims or diagnosis language present

### Admin Enhancements
- [ ] Admin dashboard shows routing monitor visualization
- [ ] Audit log page shows routing-specific events (routing decision, fallback events)
- [ ] Dashboard metrics include fallback rate and basket coverage

### New Pages
- [ ] `/architecture` page renders system architecture diagram
- [ ] `/security` page shows compliance controls with regulatory disclaimer
- [ ] `/research` page shows survey data sections with charts

### Build & Runtime
- [ ] `npm run build` (client) completes without errors
- [ ] `npm run seed` populates all necessary mock data for new features
- [ ] `npm run dev` starts both servers without crashes
- [ ] No console errors on page load for any new page/route
- [ ] All new routes are accessible and render correctly
