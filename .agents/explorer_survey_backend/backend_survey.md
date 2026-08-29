# QuickMeds Backend Architecture & API Survey Report

**Author**: Explorer 1 (Backend Architecture & APIs Specialist)  
**Date**: 2026-08-28  
**Project**: QuickMeds (Zero-Inventory Hyperlocal Emergency-Medicine Fulfilment Platform Prototype)  
**Status**: Comprehensive Survey Complete  

---

## 1. Executive Summary

The QuickMeds backend is a well-structured, production-ready Node.js/Express/MongoDB REST API server with Socket.IO real-time event broadcasting, JWT role-based access control (4 roles: `CUSTOMER`, `PHARMACY`, `DELIVERY_PARTNER`, `ADMIN`), Mongoose schema definitions with geospatial (`2dsphere`) indexing, Multer document uploads, and comprehensive seed data scripts.

To meet the SIH 2026 Grand Finale requirements, the core architectural foundations are already established. However, key analytical engines and simulation endpoints must be upgraded or introduced:
1. **Smart Fulfilment Routing Engine (R1)**: Replace the naive single-pharmacy nearest query in `server/src/services/pharmacyMatchService.js` with a multi-factor scoring (availability, proximity, ETA, price index, reliability rating) and whole-basket optimization engine, accompanied by a dedicated `POST /api/routing/optimize` REST API and a Jest unit test suite (>= 5 tests).
2. **Fallback Routing (R2)**: Build automated timeout/fallback routing orchestration with candidate chain tracking, inventory handoff, audit logging (`ROUTING_FALLBACK`), and simulation endpoint `POST /api/orders/:id/simulate-timeout`.
3. **Pharmacist-in-the-Loop Verification Workflow (R4)**: Align prescription and order lifecycle states (`PENDING` → `UNDER_REVIEW` → `VERIFIED` → `REJECTED`), ensure audit logging and demo disclaimers.
4. **Delivery Tracking Simulation (R5)**: Provide a fast-forward simulation API (`POST /api/delivery/simulation/step` or `POST /api/orders/:id/simulate-step`) with coordinate interpolation along pharmacy-to-customer routes and Socket.IO broadcasts.
5. **Admin Monitoring & Research APIs (R8, R9)**: Add routing monitor analytics, configurable admin parameters (fallback timeout, scoring weights), enhanced dashboard metrics (`fallbackRate`, `basketCoverage`), and mock Research survey APIs (`GET /api/research/survey`, `PUT /api/admin/research/survey`).

---

## 2. Project Architecture & Runtime Setup

### 2.1 Directory Layout & Package Structure
```
medirush/
├── package.json                   # Root orchestrator (scripts: client, server, dev, install:all, seed, test, build)
├── server/
│   ├── package.json               # Express API package definition
│   ├── .env                       # Server environment configuration
│   ├── uploads/                   # Prescription document storage
│   ├── src/
│   │   ├── index.js               # Main HTTP & Socket.IO server entry point
│   │   ├── config/
│   │   │   ├── env.js             # Environment variable loader & defaults
│   │   │   ├── db.js              # MongoDB Mongoose connection with DNS fallback
│   │   │   └── socket.js          # Socket.IO room management and singleton emitter
│   │   ├── controllers/           # 13 Controllers (auth, order, pharmacy, delivery, admin, etc.)
│   │   ├── middleware/            # auth, errorHandler, rateLimiter, upload, validate
│   │   ├── models/                # 12 Mongoose Models
│   │   ├── routes/                # 14 Express Routers
│   │   ├── seed/                  # seed.js, seedData.js
│   │   ├── services/              # Business logic & domain services
│   │   ├── utils/                 # ApiError, ApiResponse, geo, generateOrderId, logger
│   │   └── validators/            # express-validator schemas
│   └── tests/                     # Jest & Supertest test suites
```

### 2.2 Server Entry Point (`server/src/index.js`)
- Initializes Express app and HTTP server wrapped with `Socket.IO`.
- Connects to MongoDB via `connectDB()`.
- Security middlewares: `helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })`, `cors` configured with `CLIENT_URL` credentials.
- Body parsers: `express.json({ limit: '10mb' })`, `express.urlencoded({ extended: true, limit: '10mb' })`.
- Logging: `morgan('dev')` in development mode.
- Root route `GET /` serves a clean HTML dashboard indicating server status and redirect button to client URL (`http://localhost:5173`).
- Health check route: `GET /api/health` returning JSON uptime and status.
- Centralized error handling: Catch-all 404 handler (`/api/*`) followed by `errorHandler` middleware.

### 2.3 Environment & Configuration (`server/src/config/`)
- `env.js`:
  - `PORT`: `5000` (default)
  - `NODE_ENV`: `development`
  - `MONGO_URI`: `process.env.MONGODB_URI || 'mongodb://localhost:27017/medirush'`
  - `JWT_SECRET`: `process.env.JWT_SECRET`
  - `CLIENT_URL`: `http://localhost:5173`
  - `UPLOAD_DIR`: `server/uploads`
  - `MAX_FILE_SIZE`: `5242880` (5 MB)
- `db.js`:
  - Enforces public DNS servers (`dns.setServers(['8.8.8.8', '1.1.1.1'])`) to avoid Windows/Node DNS SRV resolution issues with cloud MongoDB.
  - Auto-retries connection every 5s if disconnected in non-test mode.
- `socket.js`:
  - Manages rooms:
    - `user:${userId}` (customer personal channel)
    - `pharmacy:${pharmacyId}` (incoming order alerts)
    - `delivery:${partnerId}` (delivery task assignments)
    - `admin:room` (platform monitoring)
    - `order:${orderId}` (live tracking channel)
  - Provides `getIO()` singleton with dummy emitter fallback for testing environments.

---

## 3. Database Schema & Models Survey

All schemas are implemented using Mongoose with timestamps and appropriate indexes.

| Model | Primary File | Key Fields & Indexes | Relationships |
|---|---|---|---|
| **User** | `server/src/models/User.js` | `name`, `email` (unique), `phone`, `password` (bcrypt hashed), `role` (`CUSTOMER`, `PHARMACY`, `DELIVERY_PARTNER`, `ADMIN`), `isActive`, `pharmacyId`, `deliveryPartnerId` | Links to `Pharmacy` or `DeliveryPartner` |
| **Pharmacy** | `server/src/models/Pharmacy.js` | `userId`, `name`, `licenseNumber` (unique), `verificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`), `location` (GeoJSON `Point`, `2dsphere` index), `serviceRadiusKm`, `operatingHours`, `rating`, `totalOrdersCompleted`, `isOpen` | Belongs to `User` |
| **PharmacyInventory** | `server/src/models/PharmacyInventory.js` | `pharmacyId`, `medicineId`, `stockQuantity`, `lowStockThreshold`, `price`, `discountPercentage`, `batchNumber`, `expiryDate`, `isAvailable`. **Compound Index**: `{ pharmacyId: 1, medicineId: 1 }` (unique) | References `Pharmacy` and `Medicine` |
| **Medicine** | `server/src/models/Medicine.js` | `name`, `genericName`, `brand`, `manufacturer`, `strength`, `dosageForm`, `category`, `requiresPrescription`, `prescriptionSchedule` (`OTC`, `Schedule H`, `Schedule H1`, `Schedule X`), `mrp`, `active`. **Text Index** on search fields. | Master catalog entity |
| **Order** | `server/src/models/Order.js` | `orderId` (`MR-2026-XXXXXX`), `customerId`, `pharmacyId`, `deliveryPartnerId`, `items` (subdocument array), `subtotal`, `deliveryFee`, `total`, `deliveryAddress` (with coordinates), `prescriptionId`, `prescriptionStatus` (`NOT_REQUIRED`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`), `paymentMethod` (`COD`, `ONLINE`), `orderStatus` (`PLACED`, `PHARMACY_REVIEW`, `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `DELIVERY_ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `REJECTED`, `CANCELLED`), `statusHistory`, `distanceKm`, `estimatedDeliveryMinutes` | References `User`, `Pharmacy`, `Prescription` |
| **Prescription** | `server/src/models/Prescription.js` | `customerId`, `orderId`, `pharmacyId`, `fileUrl`, `mimeType`, `fileSize`, `status` (`UPLOADED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `EXPIRED`), `patientName`, `doctorName`, `customerNotes`, `reviewedBy`, `reviewNotes`, `rejectionReason`, `reviewedAt` | References `User`, `Order`, `Pharmacy` |
| **DeliveryPartner** | `server/src/models/DeliveryPartner.js` | `userId`, `vehicleType`, `vehicleNumber`, `drivingLicenseNumber`, `status` (`AVAILABLE`, `BUSY`, `OFFLINE`), `currentLocation` (GeoJSON `Point`, `2dsphere` index), `activeOrderId`, `completedDeliveriesCount`, `rating`, `totalEarnings` | References `User`, `Order` |
| **AuditLog** | `server/src/models/AuditLog.js` | `actorId`, `actorRole`, `action`, `entity` (`USER`, `PHARMACY`, `ORDER`, `PRESCRIPTION`, `INVENTORY`, `SYSTEM`), `entityId`, `description`, `ipAddress`, `metadata`. Index: `{ createdAt: -1 }` | References `User` |
| **Cart** | `server/src/models/Cart.js` | `customerId` (unique), `pharmacyId`, `items` (`medicineId`, `name`, `price`, `quantity`, `requiresPrescription`), `totalItems`, `subtotal`, `hasPrescriptionRequiredItems` | References `User`, `Pharmacy`, `Medicine` |
| **Notification** | `server/src/models/Notification.js` | `userId`, `type`, `title`, `message`, `link`, `isRead`. Index: `{ userId: 1, createdAt: -1 }` | References `User` |
| **Review** | `server/src/models/Review.js` | `customerId`, `pharmacyId`, `orderId`, `rating`, `comment`, `deliveryRating`, `deliveryComment` | References `User`, `Pharmacy`, `Order` |
| **Address** | `server/src/models/Address.js` | `userId`, `label`, `recipientName`, `phone`, `fullAddress`, `coordinates` (`[lng, lat]`), `isDefault` | References `User` |
| **CycleTracker** & **MedicineReminder** | `CycleTracker.js`, `MedicineReminder.js` | Menstrual health tracker and chronic medicine reminder schedules | Belongs to `User` |

---

## 4. API Endpoints & Routing Architecture

### 4.1 Authentication & User Routes (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register customer, pharmacy partner (creates `Pharmacy`), or delivery partner (creates `DeliveryPartner`).
- `POST /api/auth/login` — Authenticate and generate signed JWT.
- `GET /api/auth/me` — Get current profile with role-specific sub-entities.
- `PUT /api/auth/profile` — Update name, phone, avatar.
- `POST /api/auth/forgot-password` / `reset-password` — Demo reset handlers.
- `GET/POST/PUT/DELETE /api/users/addresses` — Manage customer delivery addresses.

### 4.2 Medicine & Pharmacy Routes (`/api/medicines`, `/api/pharmacies`, `/api/inventory`)
- `GET /api/medicines` — Search medicine catalog with query, category, prescription filter, location distance calculation, and inventory counts.
- `GET /api/medicines/:id` — Get medicine details + listing of all verified pharmacies stocking it with live price and distance.
- `GET /api/medicines/categories` — Aggregate categories with item counts.
- `GET /api/medicines/popular` — Popular emergency medicines.
- `GET /api/pharmacies/nearby` — Discover verified pharmacies sorted by proximity, rating, or order count within radius.
- `GET /api/pharmacies/:id` — Pharmacy details with active inventory and reviews.
- `GET/PUT /api/pharmacies/profile/me` — Pharmacist self profile management.
- `GET/POST/PUT/DELETE /api/inventory` — Pharmacist inventory management (stock quantity, prices, batch, expiry).

### 4.3 Cart & Order Routes (`/api/cart`, `/api/orders`)
- `GET /api/cart` — Customer shopping cart with live stock validation against inventory.
- `POST /api/cart/items` — Add item (handles single vs multi pharmacy conflict warning).
- `PUT /api/cart/items/:medicineId` / `DELETE /api/cart/items/:medicineId` — Item quantity update / removal.
- `DELETE /api/cart` — Clear cart.
- `POST /api/orders` — Create new order from cart with auto-assignment of nearest pharmacy, inventory atomic decrement, distance/fee computation, prescription requirement check, Socket.io alert dispatch, and audit logging.
- `GET /api/orders` — Customer order history.
- `GET /api/orders/:id` — Full order details with delivery partner location & status history (IDOR protected).
- `GET /api/orders/pharmacy/list` — Pharmacy incoming/active orders list.
- `PATCH /api/orders/:id/status` — State machine transition update (`PLACED` → `PHARMACY_REVIEW` → `ACCEPTED` → `PREPARING` → `READY_FOR_PICKUP` → `DELIVERY_ASSIGNED` → `OUT_FOR_DELIVERY` → `DELIVERED`). Restores inventory upon `REJECTED` or `CANCELLED`.
- `POST /api/orders/:id/cancel` — Customer cancellation (only before pharmacy preparation).

### 4.4 Prescription Verification (`/api/prescriptions`)
- `POST /api/prescriptions/upload` — Multer upload (5MB, JPEG/PNG/PDF), creates Prescription (`UPLOADED`).
- `GET /api/prescriptions` — Customer prescription list.
- `GET /api/prescriptions/:id` — Single prescription view (IDOR protected: owner, assigned pharmacy, or admin).
- `GET /api/prescriptions/pharmacy/queue` — Pharmacist verification queue.
- `PUT /api/prescriptions/:id/review` — Pharmacist approves or rejects prescription. Updates linked order `prescriptionStatus`, broadcasts `prescription_status_update` via Socket.IO, logs audit trail.

### 4.5 Delivery Partner Routes (`/api/delivery`)
- `GET /api/delivery/active` — Active delivery task.
- `POST /api/delivery/status` — Advance delivery state (`OUT_FOR_DELIVERY`, `DELIVERED`).
- `PUT /api/delivery/availability` — Toggle driver online/offline.
- `POST /api/delivery/location` — Update GPS coordinates and broadcast `driver_moved` to order tracking room.
- `GET /api/delivery/history` — Completed deliveries and earnings.

### 4.6 Admin & Audit Routes (`/api/admin`)
- `GET /api/admin/dashboard` — Platform overview metrics (users, pharmacies, orders, revenue, 7-day trend, status breakdown).
- `GET /api/admin/users` & `PATCH /api/admin/users/:id/status` — User management and suspension.
- `GET /api/admin/pharmacies` & `PATCH /api/admin/pharmacies/:id/verify` — Pharmacy license verification (`VERIFIED`, `REJECTED`, `SUSPENDED`).
- `GET /api/admin/orders` & `POST /api/admin/orders/:id/assign-delivery` — Global orders and manual delivery dispatch.
- `GET /api/admin/prescriptions` — Global prescriptions audit.
- `GET /api/admin/audit-logs` — Immutable platform audit trail.

---

## 5. Seed Data & Test Infrastructure Survey

### 5.1 Seed Data Assets (`server/src/seed/`)
- `seed.js` completely bootstraps the database with clean relationships:
  - **1 Admin**: `admin@quickmeds.in` (`Admin@123`)
  - **2 Customers**: `rahul@example.com`, `priya@example.com` (`Customer@123`)
  - **2 Delivery Drivers**: `delivery1@quickmeds.in`, `delivery2@quickmeds.in` (`Delivery@123`)
  - **5 Pharmacies**:
    1. Apollo Pharmacy — Connaught Place (`apollo.cp@pharmacy.com`, `Pharmacy@123`) — `VERIFIED`
    2. MedPlus Chemist — Karol Bagh (`medplus.kb@pharmacy.com`, `Pharmacy@123`) — `VERIFIED`
    3. Guardian Health — South Extension (`guardian.southex@pharmacy.com`) — `VERIFIED`
    4. Netmeds Hyperlocal — Lajpat Nagar (`netmeds.lajpat@pharmacy.com`) — `VERIFIED`
    5. Wellness Forever — Janakpuri (`wellness.janakpuri@pharmacy.com`) — `PENDING` (for Admin verification testing)
  - **22+ Master Medicines** across 8 categories with accurate packaging, MRP, prescription schedules, and CDN images.
  - **Full Inventory Records** with pricing discounts, batch numbers, expiry dates, and varied stock levels.
  - **3 Live Demo Orders**:
    - Order 1: `DELIVERED` with customer review & rating.
    - Order 2: `OUT_FOR_DELIVERY` (assigned to Suresh Kumar with active route tracking).
    - Order 3: `PREPARING` at MedPlus Karol Bagh.
  - **Prescriptions, Notifications, and Audit Logs**.

### 5.2 Test Infrastructure (`server/tests/`)
- Test framework: Jest 29.7 + Supertest 6.3.
- Command: `npm test` (or `cd server && npm test`).
- Current test suites:
  - `server/tests/auth.test.js` (3 tests: registration schema validation, email format, password presence).
  - `server/tests/utils.test.js` (6 tests: Haversine distance, zero distance, base fee, tiered fee, ETA calculation, order ID format regex, ApiError instantiation).
- Current test count: 9 tests passing.
- Test coverage gap: Zero tests currently exist for pharmacy smart routing, basket optimization, fallback routing, or delivery simulation.

---

## 6. Gap Analysis Against Grand Finale Requirements

| Requirement | Current Implementation Status | Identified Gaps / Required Backend Additions | Priority |
|---|---|---|---|
| **R1. Smart Fulfilment Routing Engine** | ⚠️ Naive 70-line `pharmacyMatchService.js` with simple `$nearSphere` search and a schema bug (`stock` instead of `stockQuantity`). | 1. Implement multi-factor scoring engine considering: **Stock availability/coverage (40%)**, **Proximity/Distance (25%)**, **Estimated Delivery Time (15%)**, **Simulated Pricing/Discount (10%)**, and **Reliability/Rating (10%)**.<br>2. Multi-item basket optimization (single-store optimal vs multi-store split when single store cannot fulfill all items).<br>3. Plan generator returning: `recommendedPlan`, `alternativePlan`, `explanation`, `fulfilmentPoints`, `basketCoverage`, and consolidated `totalDemoValue`.<br>4. Dedicated REST API endpoint: `POST /api/routing/optimize` and `GET /api/routing/optimize`.<br>5. Jest unit test suite (`server/tests/routing.test.js`) with at least 5 tests covering single item, multi-item, no stock, multi-pharmacy split, and scoring algorithms. | **HIGH** |
| **R2. Fallback Routing Simulation** | ❌ None. Pharmacy rejection simply marks order `REJECTED` and halts. | 1. Track fallback candidate queue on Order or in memory.<br>2. Endpoint `POST /api/orders/:id/simulate-timeout` and `POST /api/orders/:id/fallback` to trigger re-routing to next best candidate.<br>3. Automatically reassign `pharmacyId`, transfer reserved stock (decrement new, restore old), update `statusHistory`, emit Socket.IO event `order_status_changed`, notify customer, and log `ROUTING_FALLBACK` audit log.<br>4. Configurable timeout parameter (default 30s) in admin settings. | **HIGH** |
| **R3. Basket Optimization & Pricing Support** | ⚠️ Partial. Cart controller only validates single pharmacy stock. | Backend must support consolidated checkout with demo pricing summary breakdown (medicine subtotal, delivery fee, platform fee, consolidated `totalDemoValue`) without exposing confusing per-pharmacy fragmentation to customer. | **MEDIUM** |
| **R4. Pharmacist Verification Workflow** | ⚠️ Exists in `prescriptionController.js` but needs alignment with Grand Finale timeline. | 1. Ensure clean progression: `PENDING`/`UPLOADED` → `UNDER_REVIEW` → `VERIFIED`/`APPROVED` → `REJECTED`.<br>2. Include pharmacist demo ID, license details, and explicit verification disclaimer in API responses.<br>3. Automatically advance linked order from `PHARMACY_REVIEW` to `ACCEPTED`/`PREPARING` on verification approval. | **MEDIUM** |
| **R5. Delivery Tracking Simulation** | ⚠️ Basic driver location update exists. | 1. Build delivery simulation controller endpoint: `POST /api/delivery/simulation/step` or `POST /api/orders/:id/simulate-step`.<br>2. Allows instant single-click advancement through tracking states (`PLACED` → `PHARMACY_REVIEW` → `ACCEPTED` → `PREPARING` → `DELIVERY_ASSIGNED` → `OUT_FOR_DELIVERY` → `DELIVERED`).<br>3. Calculate and emit interpolated GPS coordinates between pharmacy and destination coordinates along with ETA countdown. | **HIGH** |
| **R8. Admin Visualizers & Metrics** | ⚠️ Basic admin dashboard exists (`getDashboardStats`). | 1. Add `GET /api/admin/routing-monitor` endpoint returning live/recent routing decisions, scored candidate lists, fallback events, and fulfillment graphs.<br>2. Add enhanced metrics to dashboard: `fallbackRate`, `basketCoverage`, `averageEta`, `activePharmaciesCount`, `totalFulfillments`.<br>3. Add `GET /api/admin/settings` and `PUT /api/admin/settings` to allow configuring fallback timeout and routing algorithm weights in real time. | **MEDIUM** |
| **R9. Research & Survey Data APIs** | ❌ None. | 1. Add `GET /api/research/survey` returning mock survey dataset (patient pain points, delivery urgency, pharmacy digital adoption).<br>2. Add `PUT /api/admin/research/survey` to let admin dynamically update survey statistics. | **LOW / MEDIUM** |

---

## 7. Recommended Backend Implementation Blueprint

### Step 1: Smart Routing Engine Service (`server/src/services/smartRoutingService.js`)
Create a pure, modular routing and optimization engine that:
1. Accepts `{ coordinates: [lng, lat], items: [{ medicineId, quantity }] }` and configurable weights.
2. Queries candidate verified pharmacies within `maxDistanceKm` (default 15 km).
3. Fetches inventory records for all requested medicine IDs across candidate pharmacies.
4. Computes normalized sub-scores (0–100):
   - **Coverage Score**: `(items_available / total_requested_items) * 100`
   - **Proximity Score**: `Math.max(0, 100 - (distanceKm / maxDistanceKm) * 100)`
   - **ETA Score**: `Math.max(0, 100 - (etaMinutes / 60) * 100)`
   - **Price Score**: Evaluates discounts against standard MRP.
   - **Reliability Score**: `(pharmacy.rating / 5) * 80 + Math.min(20, pharmacy.totalOrdersCompleted / 10)`
5. Evaluates single-store candidates vs multi-store splits (if no single store has 100% coverage, greedy set-cover to minimize number of fulfillment points).
6. Constructs:
   - `recommended`: Primary plan with store(s), total price, ETA, coverage, breakdown.
   - `alternative`: Secondary plan (e.g. fastest delivery vs lowest cost).
   - `explanation`: Clear human-readable bullet points detailing why the option was ranked #1.
   - Consolidated `totalDemoValue` with demo disclaimers.

### Step 2: Routing Controller & Router (`server/src/controllers/routingController.js`, `server/src/routes/routingRoutes.js`)
- Expose `POST /api/routing/optimize` and `GET /api/routing/optimize`.
- Mount in `server/src/index.js` as `app.use('/api/routing', routingRoutes)`.

### Step 3: Fallback Routing Controller & Order Integration
- In `orderController.js` / `orderService.js`:
  - Attach `fallbackCandidates` (ranked list of backup pharmacy IDs) on order creation.
  - Expose `POST /api/orders/:id/simulate-timeout` (accessible by customer, pharmacy, or admin).
  - Automatically re-route to `fallbackCandidates[0]`, reallocate stock atomically, emit Socket.io `order_status_changed`, log `ROUTING_FALLBACK` audit log.

### Step 4: Fast-Forward Delivery Simulation API
- Expose `POST /api/delivery/simulation/step` taking `{ orderId }`.
- Automatically transitions order through next lifecycle state, generates interpolated GPS waypoint between store and customer, and emits live Socket.io events.

### Step 5: Admin Routing Monitor & Research Survey APIs
- `GET /api/admin/routing-monitor`: Aggregates recent routing runs and fallback statistics.
- `GET /api/research/survey` & `PUT /api/admin/research/survey`: Serves and persists mock healthcare market research numbers.
- `GET /api/admin/settings` & `PUT /api/admin/settings`: Exposes dynamic settings for fallback timeout and scoring weights.

### Step 6: Jest Unit Test Suite (`server/tests/routing.test.js`)
Implement rigorous unit tests verifying:
1. Single-item basket routing with nearest pharmacy selection.
2. Multi-item basket complete fulfillment by single pharmacy.
3. Multi-pharmacy split optimization when no single pharmacy has all items.
4. No-availability scenario graceful fallback handling.
5. Pharmacy scoring algorithm weighting verification (distance vs rating vs price).
6. Consolidated pricing calculation integrity.

---

## 8. Conclusion

The QuickMeds backend is cleanly structured and well-architected. With the additions outlined in the Blueprint above, all Grand Finale backend requirements (R1, R2, R4, R5, R8, R9) can be seamlessly delivered with zero disruption to existing working features.
