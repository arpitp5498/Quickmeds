# QuickMeds Frontend Architecture & UI Comprehensive Survey Report
**Project**: QuickMeds — Zero-Inventory Hyperlocal Emergency-Medicine Fulfilment Platform
**Milestone**: Smart India Hackathon (SIH) 2026 Grand Finale Prototype Survey
**Date**: 2026-08-28
**Author**: Explorer 2 (Frontend Architecture & UI Specialist)

---

## 1. Executive Summary

QuickMeds is an existing full-stack MERN application with a well-structured React 18 + Vite frontend (95 source files). The existing codebase provides an exceptional visual foundation, clean component architecture, role-based dashboards (Customer, Pharmacy, Delivery, Admin), and Socket.IO real-time event scaffolding.

However, to meet the authoritative requirements for the **SIH 2026 Grand Finale (R1–R11)**, the frontend requires key feature enhancements and new dedicated demonstration pages. Specifically:
- **Basket Optimization UI (R3)**: Multi-factor scoring display, optimization animations, and consolidated demo pricing.
- **Pharmacist Verification Workflow (R4)**: 4-stage visual timeline, demo ID stamps, and regulatory disclaimers.
- **Delivery Tracking Simulation (R5)**: Step-by-step interactive simulator advancing all 8 order states in <30 seconds with dynamic live map tracking.
- **SIH Demo Mode (R6)**: Dedicated 13-step auto-runner with milestone completion screens.
- **Landing Page Enhancement (R7)**: SIH Grand Finale headlines, visual workflow pipeline, and 6 "Why QuickMeds" differentiator cards.
- **Admin Routing Monitor & Metrics (R8)**: Routing decision graph, network map, and KPI metrics (Fallback Rate, Basket Coverage, Target ETA).
- **New Presentation Pages (R9)**: `/architecture` (System Diagram & Tech Cards), `/security` (Compliance & Trust Controls), and `/research` (Validation Survey Charts & Admin Form).
- **Pharmacy Network Map (R10)**: Interactive map page (`/pharmacy-network`) with service radius rings and stock availability.
- **Quality & Polish (R11)**: Fix runtime reference errors (e.g. missing `Badge` import in `AdminAnalytics.jsx`), update footer branding to SIH 2026 Grand Finale, and ensure mobile responsiveness.

---

## 2. Frontend Technology Stack & Build Setup

### 2.1 Core Dependencies (`client/package.json`)
- **Framework / Runtime**: React 18.2.0 (`react`, `react-dom`)
- **Bundler & Tooling**: Vite 5.2.0 (`@vitejs/plugin-react`)
- **Routing**: React Router DOM v6.22.3 (`react-router-dom`)
- **HTTP Client**: Axios 1.6.8 (`axios`) with custom interceptors (`/api` proxy)
- **Icons**: Lucide React 0.368.0 (`lucide-react`)
- **Real-Time WebSockets**: Socket.IO Client 4.7.5 (`socket.io-client`)
- **CSS Utility**: `clsx` 2.1.0

### 2.2 Styling & Design System
- **Pure CSS with CSS Custom Properties**: `client/src/styles/variables.css`, `global.css`, `dark.css`.
- **Palette**: Deep Healthcare Navy Blue (`--primary-600: #0284c7`, `--primary-900: #0c4a6e`), Fresh Medical Green (`--secondary-600: #16a34a`), Emergency Crimson (`--accent-600: #e11d48`), Neutral Grays (`#f8fafc` to `#0f172a`).
- **Typography**: Inter (Body) + Plus Jakarta Sans (Headings).
- **Component UI Library**: 18 pre-built UI primitives in `client/src/components/ui/` (`Button`, `Card`, `Badge`, `Modal`, `Timeline`, `StatCard`, `Input`, `FileUpload`, `SearchBar`, `Skeleton`, `Pagination`, `Tabs`, etc.).

### 2.3 Build Verification
- Current build command: `npm run build` executed inside `client/`.
- Build result: **Success (0 errors, 1.69s build time)**, generating clean minified output in `client/dist/`.

---

## 3. Route Map & Layout Hierarchy

The application organizes routes via `client/src/routes/AppRoutes.jsx` guarded by `ProtectedRoute.jsx` across 5 distinct layout wrappers:

| Route Path | Layout / Guard | Page Component | Current Status |
|---|---|---|---|
| `/` | `MainLayout` (Public) | `Landing.jsx` | Exists; needs SIH Grand Finale copy & workflow cards (R7) |
| `/medicines` | `MainLayout` (Public) | `MedicineSearch.jsx` | Fully working search & category filters |
| `/medicines/:id` | `MainLayout` (Public) | `MedicineDetail.jsx` | Fully working; displays stock & nearby pharmacies |
| `/categories` | `MainLayout` (Public) | `MedicineCategories.jsx`| Fully working category grid |
| `/pharmacies` | `MainLayout` (Public) | `NearbyPharmacies.jsx` | List & map preview of nearby pharmacies |
| `/pharmacies/:id` | `MainLayout` (Public) | `PharmacyDetail.jsx` | Pharmacy inventory & license view |
| `/cart` | `MainLayout` (Public/Customer) | `Cart.jsx` | Needs Basket Optimization & demo pricing (R3) |
| `/about`, `/safety`, `/disclaimer`, `/privacy`, `/terms`, `/contact` | `MainLayout` (Public) | Public info pages | Exists |
| `/architecture` | `MainLayout` (Public) | **NEW**: `Architecture.jsx` | **MISSING (R9)** — System Diagram & Tech Stack |
| `/security` | `MainLayout` (Public) | **NEW**: `Security.jsx` | **MISSING (R9)** — Security, RBAC & Compliance |
| `/research` | `MainLayout` (Public) | **NEW**: `Research.jsx` | **MISSING (R9)** — Survey Data & Admin Simulator |
| `/pharmacy-network` | `MainLayout` (Public) | **NEW**: `PharmacyNetworkMap.jsx`| **MISSING (R10)** — Interactive Network Map |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | `AuthLayout` | Auth pages | Fully working with JWT auth & demo credentials |
| `/dashboard` | `DashboardLayout` (Customer) | `CustomerDashboard.jsx` | Active order banner, quick search, recent history |
| `/checkout` | `DashboardLayout` (Customer) | `Checkout.jsx` | Needs Basket Optimization breakdown (R3) |
| `/orders` | `DashboardLayout` (Customer) | `OrderList.jsx` | Order history list with status badges |
| `/orders/:id` | `DashboardLayout` (Customer) | `OrderDetail.jsx` | Needs "Simulate Next Step" delivery button (R5) |
| `/prescriptions` | `DashboardLayout` (Customer) | `MyPrescriptions.jsx` | Customer uploaded prescriptions |
| `/prescriptions/upload` | `DashboardLayout` (Customer) | `PrescriptionUpload.jsx` | Prescription file upload form |
| `/profile`, `/addresses`, `/notifications`, `/reviews/write`, `/reminders`, `/cycle-tracker` | `DashboardLayout` (Customer) | Various customer pages | Functional |
| `/pharmacy` | `PharmacyLayout` (Pharmacy) | `PharmacyDashboard.jsx` | Live incoming orders, inventory stats, review queue |
| `/pharmacy/orders` | `PharmacyLayout` (Pharmacy) | `PharmacyOrders.jsx` | Orders management |
| `/pharmacy/orders/:id` | `PharmacyLayout` (Pharmacy) | `PharmacyOrderDetail.jsx`| Needs "Simulate Pharmacy Timeout" button (R2) |
| `/pharmacy/inventory` | `PharmacyLayout` (Pharmacy) | `PharmacyInventory.jsx` | Stock & pricing editor |
| `/pharmacy/prescriptions` | `PharmacyLayout` (Pharmacy) | `PharmacyPrescriptions.jsx`| Needs 4-state Rx timeline & disclaimer (R4) |
| `/pharmacy/profile` | `PharmacyLayout` (Pharmacy) | `PharmacyProfile.jsx` | License & store settings |
| `/delivery` | `DeliveryLayout` (Delivery Partner)| `DeliveryDashboard.jsx`| Task metrics & earnings |
| `/delivery/active` | `DeliveryLayout` (Delivery Partner)| `DeliveryActive.jsx` | Step progression & rider GPS broadcast |
| `/delivery/history`, `/delivery/profile` | `DeliveryLayout` (Delivery Partner)| Delivery history & profile | Functional |
| `/admin` | `AdminLayout` (Admin) | `AdminDashboard.jsx` | Needs Routing Monitor & extended KPIs (R8) |
| `/admin/demo` | `AdminLayout` (Admin) | **NEW**: `AdminDemo.jsx` | **MISSING (R6)** — 13-step SIH Demo Runner |
| `/admin/pharmacies`, `/admin/pharmacies/:id` | `AdminLayout` (Admin) | Pharmacy verification pages | Functional |
| `/admin/users`, `/admin/orders`, `/admin/prescriptions` | `AdminLayout` (Admin) | Admin management tables | Functional |
| `/admin/analytics` | `AdminLayout` (Admin) | `AdminAnalytics.jsx` | Fix missing `Badge` import; add fallback rate |
| `/admin/audit-logs` | `AdminLayout` (Admin) | `AdminAuditLogs.jsx` | Needs routing & fallback audit events |

---

## 4. State Management & API Services

### 4.1 Context Architecture (`client/src/context/`)
1. **`AuthContext.jsx`**:
   - Manages JWT token in `localStorage` (`quickmeds_token`), authenticated `user` object, and role helpers (`isCustomer`, `isPharmacy`, `isDelivery`, `isAdmin`).
   - Handles auto-login on refresh via `GET /api/auth/me`.
2. **`CartContext.jsx`**:
   - Maintains active cart items, subtotal, quantity updates, and pharmacy assignment.
   - Note: Needs enhancement to work seamlessly with multi-item baskets optimized across candidate pharmacies.
3. **`LocationContext.jsx`**:
   - Stores current customer coordinates (`lat`, `lng`), city, and street address.
   - Default: Connaught Place, New Delhi (`28.629, 77.214`).
   - Supports `detectCurrentLocation()` via HTML5 Geolocation.
4. **`SocketContext.jsx`**:
   - Initializes Socket.IO client connection.
   - Joins role-specific rooms (`join_user`, `join_pharmacy`, `join_delivery`, `join_admin`) and provides order room tracking (`track_order`).
5. **`ToastContext.jsx`**:
   - Global notification manager supporting `success`, `error`, `warning`, and `info` toasts with icons and auto-dismiss.
6. **`ThemeContext.jsx`**:
   - Light/Dark theme manager synced with `data-theme` DOM attribute and `localStorage`.

### 4.2 API Client (`client/src/services/api.js`)
- Axios instance with base URL `/api`.
- Request interceptor automatically injects `Authorization: Bearer <token>`.
- Response interceptor unwraps `response.data` and handles 401 token expiry.

---

## 5. Detailed Gap Analysis against SIH Requirements (R1–R11)

### R3. Basket Optimization & Pricing UI
- **Current State**: `Cart.jsx` and `Checkout.jsx` display a basic item list with hardcoded delivery (`₹25`) and safety fee (`₹5`). They lack smart routing integration.
- **Gaps to Address**:
  1. Add an "Optimizing your fulfilment..." animated loading banner upon cart change / checkout load.
  2. Display the smart fulfilment results:
     - **Basket Coverage**: e.g., "3 of 3 items covered (100%)".
     - **Fulfilment Points**: Number of pharmacies involved (e.g., "Single Pharmacy Fulfilment" or "Optimized 2-Pharmacy Split").
     - **Target ETA**: "~20–25 Minutes (Hyperlocal Target)".
     - **Itemized Breakdown**: Medicine subtotal, hyperlocal delivery charge, platform safety charge.
     - **Consolidated Final Demo Order Value**: Prominently displayed single price.
  3. Expandable **"How was this option selected?"** accordion showing candidate scores (Availability, Proximity/Distance, Target ETA, Simulated Price, Reliability).
  4. Mandatory disclaimer text: *"Demo pricing — Demonstration data only."*
- **Recommended Component**: Create reusable `client/src/components/routing/BasketOptimizationBreakdown.jsx`.

### R4. Pharmacist-in-the-Loop Verification Workflow
- **Current State**: `PharmacyPrescriptions.jsx` has a simple Approve/Reject modal, and `OrderDetail.jsx` shows a simple text badge.
- **Gaps to Address**:
  1. Implement a 4-state visual verification timeline: `PENDING` ➔ `UNDER_REVIEW` ➔ `VERIFIED` ➔ `REJECTED`.
  2. Include details on verification: Pharmacist Demo ID (`PHARM-DL-8492`), review timestamp, and verification notes.
  3. Strict simulated approval gate before order processing can advance to `ACCEPTED` / `PREPARING`.
  4. Prominent legal disclaimer: *"Demonstration simulation — not actual prescription authorization under Drugs and Cosmetics Act."*

### R5. Delivery Tracking Simulation
- **Current State**: `OrderDetail.jsx` has a static timeline with 6 steps and an SVG map placeholder, but lacks interactive step simulation.
- **Gaps to Address**:
  1. Support the complete 8-state progression:
     `ORDER_PLACED` ➔ `PHARMACY_VERIFICATION` ➔ `PHARMACY_CONFIRMED` ➔ `PREPARING` ➔ `DELIVERY_ASSIGNED` ➔ `PICKUP` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
  2. Add an interactive **"Simulate Next Step"** button allowing judges and evaluators to advance order states on demand.
  3. Enhance `MapView.jsx` to dynamically animate the rider position along the route vector as states advance from `PICKUP` to `DELIVERED`.
  4. Ensure the entire tracking simulation can be demonstrated within 30 seconds.

### R6. SIH Demo Mode
- **Current State**: Not implemented.
- **Gaps to Address**:
  1. Build `client/src/pages/admin/AdminDemo.jsx` accessible at `/admin/demo` (linked from Admin Dashboard and Sidebar).
  2. Implement **"Launch SIH Demo"** with 13 automated/manual steps:
     - Step 1: Patient Selects 3 Medicines (Dolo 650, Augmentin, Cetirizine).
     - Step 2: Hyperlocal Location Detected (Connaught Place).
     - Step 3: Candidate Pharmacies Discovered (Apollo, MedPlus, Wellness).
     - Step 4: Live Inventory Matching (Stock verified across stores).
     - Step 5: Multi-Factor Scoring & Pricing Evaluation.
     - Step 6: Smart Fulfilment Routing Recommends Optimal Route.
     - Step 7: Consolidated Demo Order Value Presented.
     - Step 8: Pharmacist Verification Review (Rx Approved).
     - Step 9: Pharmacy Confirms Order.
     - Step 10: Delivery Partner Auto-Assigned.
     - Step 11: Package Picked Up & Tamper-Sealed.
     - Step 12: Live GPS Tracking Simulation.
     - Step 13: Order Delivered Successfully.
  3. Controls: "Next Step", "Auto Demo" (with progress bar, running in ~45–60s), "Pause", and "Reset".
  4. Grand Finale Completion Screen displaying the 4 core QuickMeds differentiators:
     - **ZERO-INVENTORY**: Asset-light, zero warehousing overhead.
     - **HYPERLOCAL**: Leveraging existing neighbourhood retail chemists within 3–5 km.
     - **VERIFIED**: Licensed pharmacies and registered pharmacist verification.
     - **SMART FULFILMENT**: Multi-factor scoring and basket-level optimization.

### R7. Landing Page Enhancement
- **Current State**: `Landing.jsx` is functional, but uses generic headers and capstone references.
- **Gaps to Address**:
  1. Top Badge: *"QUICKMEDS — Nearest Medicine. Fastest Help."*
  2. Hero Headline: *"Emergency Medicine Access, Reimagined."*
  3. Subheadline: Explaining the zero-inventory hyperlocal emergency-medicine fulfilment platform prototype.
  4. Action CTAs: Primary **"Find Medicine"** (navigates to `/medicines`) and Secondary **"View How It Works"** (smooth scrolls to visual workflow).
  5. Three Core Value Props: **Hyperlocal**, **Verified**, **Fast**.
  6. Visual Workflow Pipeline: Patient ➔ Location ➔ Nearby Pharmacy ➔ Stock Match ➔ Verification ➔ Delivery.
  7. 6 "Why QuickMeds?" Feature Cards:
     - Zero-Inventory Network
     - Live Inventory Matching
     - Smart Fulfilment Routing
     - Pharmacist-in-the-Loop
     - Fallback Routing
     - Live Order Tracking
  8. Prominent **"Working Prototype — SIH 2026 Grand Finale"** badge.
  9. Strict compliance disclaimer (zero medical claims, emergency 112/102 advisory).

### R8. Admin Enhancements
- **Current State**: Basic analytics, user list, pharmacy list, and audit logs.
- **Gaps to Address**:
  1. **Routing Monitor Visualization**: Visual pipeline component displaying Candidate Pharmacies ➔ Stock Check ➔ Multi-Factor Scores ➔ Optimization ➔ Selected Fulfilment.
  2. **Admin Pharmacy Network Map**: Map view displaying active pharmacies, service radius overlays (3km, 5km, 7km), stock status, and ETA.
  3. **Extended KPI Cards**: Active Pharmacies, Active Orders, Successful Fulfilments, Average ETA (~20-25 min target), Fallback Rate (%), Basket Coverage (%), Orders by Area.
  4. **Audit Trail Extension**: Displaying routing decisions, fallback timeout triggers, prescription reviews, and dispatch handoffs.

### R9. Additional SIH Pages
- **Current State**: None of these 3 pages exist in the codebase.
- **Pages to Build**:
  1. **`client/src/pages/public/Architecture.jsx` (`/architecture`)**:
     - Visual system architecture flowchart: Patient Client ➔ API Gateway ➔ Auth/JWT ➔ Smart Fulfilment Routing Engine ➔ Pharmacy Network ➔ Order State Machine ➔ Real-Time Socket Delivery Engine.
     - Interactive Technology Cards: React 18, Node.js, Express, MongoDB Geospatial (2dsphere), Socket.IO, Multer, JWT, Vite.
  2. **`client/src/pages/public/Security.jsx` (`/security`)**:
     - Architecture-level security controls: RBAC (4 roles), JWT stateless tokens, Bcrypt password hashing, Multer file sanitization, tamper-evident audit logs, pharmacist human-in-the-loop gate, Express rate-limiting & Helmet headers.
     - Regulatory Disclaimer: Explicitly stating that commercial deployment requires statutory CDSCO / State Drug Controller licensing compliance.
  3. **`client/src/pages/public/Research.jsx` (`/research`)**:
     - Patient survey summary: Pain points with traditional delivery apps (delays, stockouts, emergency availability).
     - Pharmacy survey summary: Digital adoption interest, inventory turnover improvements.
     - Visual metric bars and interactive Admin form to adjust simulated survey numbers.
     - Explicit label: *"Survey data will be updated from actual Google Form responses."*

### R10. Pharmacy Network Map
- **Current State**: `NearbyPharmacies.jsx` only shows a basic card list with a small static map header.
- **Gaps to Address**:
  1. Create dedicated page: `client/src/pages/pharmacies/PharmacyNetworkMap.jsx` (`/pharmacy-network`).
  2. Map visualization of patient location and verified mock pharmacies.
  3. Service radius circles (3 km, 5 km, 7 km), stock availability indicators (Green: >90%, Yellow: 70–90%, Red: <70%), and estimated ETA.
  4. Clickable pharmacy drawer showing license verification status, stock match percentage, distance, target ETA, and smart fulfilment score.
  5. Visual highlighting of the recommended / optimal pharmacy.
  6. Environment variable support (`VITE_GOOGLE_MAPS_KEY` with graceful SVG/interactive fallback).

### R11. UI Polish, Layout & Navigation
- **Gaps & Bug Fixes**:
  1. Fix runtime bug in `AdminAnalytics.jsx`: Line 60 uses `<Badge>` but fails to import it. Add `import Badge from '../../components/ui/Badge';`.
  2. Update `Footer.jsx`: Change "B.Tech Capstone Project" on line 183 to "Smart India Hackathon (SIH) 2026 Grand Finale Prototype", and add navigation links to `/architecture`, `/security`, `/research`, `/pharmacy-network`.
  3. Update `Navbar.jsx`: Add links to "Network Map", "Architecture", and ensure clean mobile responsiveness.
  4. Update `Sidebar.jsx`: Add links to "SIH Demo Mode", "Routing Monitor", "Network Map", "Architecture", "Security", and "Research".
  5. Ensure all delivery ETAs are presented as **"TARGET"** (~20–30 mins), not guaranteed SLAs.

---

## 6. Implementation Blueprint & Exact Files to Modify/Create

### 6.1 Files to Create (7 new files)

1. **`client/src/pages/public/Architecture.jsx`**
   - Implements `/architecture` (R9)
   - Visual architectural diagram and technology cards.
2. **`client/src/pages/public/Security.jsx`**
   - Implements `/security` (R9)
   - 8 architecture-level security controls, RBAC grid, and statutory CDSCO disclaimer.
3. **`client/src/pages/public/Research.jsx`**
   - Implements `/research` (R9)
   - Patient and pharmacy survey data visualization with interactive admin update form.
4. **`client/src/pages/pharmacies/PharmacyNetworkMap.jsx`**
   - Implements `/pharmacy-network` (R10)
   - Dedicated map visualization, service radius overlays, and pharmacy details drawer.
5. **`client/src/pages/admin/AdminDemo.jsx`**
   - Implements `/admin/demo` (R6)
   - 13-step automated/interactive SIH Demo Mode runner with progress bar and completion screen.
6. **`client/src/components/routing/BasketOptimizationBreakdown.jsx`**
   - Implements R3 & R1 UI components
   - "Optimizing..." animation, coverage progress, fulfilment points, consolidated demo price, and expandable scoring factors.
7. **`client/src/components/admin/RoutingMonitor.jsx`**
   - Implements R8 Admin Routing Monitor
   - Visual candidate pharmacy scoring and match pipeline graph.

### 6.2 Files to Modify (13 existing files)

1. **`client/src/routes/AppRoutes.jsx`**:
   - Register routes: `/architecture`, `/security`, `/research`, `/pharmacy-network`, `/admin/demo`.
2. **`client/src/components/common/Navbar.jsx`**:
   - Add links for "Network Map" and "Architecture".
3. **`client/src/components/common/Footer.jsx`**:
   - Update footer branding to SIH 2026 Grand Finale and add links to `/architecture`, `/security`, `/research`, `/pharmacy-network`.
4. **`client/src/components/common/Sidebar.jsx`**:
   - Add admin navigation items for "SIH Demo Mode", "Routing Monitor", "Architecture", and "Network Map".
5. **`client/src/pages/public/Landing.jsx`**:
   - Update Hero to "Emergency Medicine Access, Reimagined.", add "Working Prototype" badge, visual workflow pipeline, and 6 "Why QuickMeds?" cards.
6. **`client/src/pages/cart/Cart.jsx`**:
   - Integrate `BasketOptimizationBreakdown`, optimization animation, and "Demo pricing" notices.
7. **`client/src/pages/checkout/Checkout.jsx`**:
   - Integrate `BasketOptimizationBreakdown` and consolidated order value.
8. **`client/src/pages/orders/OrderDetail.jsx`**:
   - Add "Simulate Next Step" delivery button, 8-state progression, and dynamic live tracking map.
9. **`client/src/pages/pharmacy/PharmacyPrescriptions.jsx`**:
   - Add 4-state verification timeline (`PENDING` ➔ `UNDER_REVIEW` ➔ `VERIFIED` ➔ `REJECTED`), pharmacist demo ID, and disclaimer.
10. **`client/src/pages/pharmacy/PharmacyOrderDetail.jsx` & `PharmacyOrders.jsx`**:
    - Add "Simulate Pharmacy Timeout" button for fallback routing (R2).
11. **`client/src/pages/admin/AdminDashboard.jsx`**:
    - Embed `RoutingMonitor`, network map preview, SIH Demo launch banner, and extended metrics.
12. **`client/src/pages/admin/AdminAnalytics.jsx`**:
    - Fix missing `Badge` import, add Fallback Rate and Basket Coverage metric indicators.
13. **`client/src/components/common/MapView.jsx`**:
    - Enhance map with live step simulation updates and route highlighting.

---

## 7. Quality Assurance & Verification Plan

1. **Build Validation**:
   - Execute `npm run build` in `client/` after all modifications to guarantee zero JSX, bundle, or import errors.
2. **Route Accessibility Testing**:
   - Verify every route (`/`, `/medicines`, `/cart`, `/checkout`, `/orders/:id`, `/pharmacy`, `/admin`, `/architecture`, `/security`, `/research`, `/pharmacy-network`, `/admin/demo`) loads without console errors.
3. **Responsive Verification**:
   - Test layouts across mobile (375px), tablet (768px), and desktop (1280px).
4. **Demonstration Speed**:
   - Verify SIH Demo Mode completes in <60s on Auto Demo, and Order Tracking simulator advances all states in <30s.

---
*Report prepared for QuickMeds Teamwork Orchestrator and Implementer Specialists.*
