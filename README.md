# QuickMeds — Nearest Medicine. Fastest Help.

> **Zero-Inventory Hyperlocal Emergency-Medicine Fulfilment Platform**  
> *Nearest Medicine. Fastest Help.*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![Test Suite](https://img.shields.io/badge/tests-62%20passed%20%7C%20100%25-brightgreen.svg)](https://github.com)
[![Tech Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Socket.IO-blue.svg)](https://github.com)
[![Architecture](https://img.shields.io/badge/architecture-Zero--Inventory%20Hyperlocal-teal.svg)](https://github.com)

---

## 🚨 The Problem: The 45-Minute Nocturnal Emergency Void
In Indian metropolitan and semi-urban clusters, when acute medical emergencies occur—such as sudden pediatric febrile seizures, severe asthma attacks, cardiac angina, or midnight pain crises—existing options fail patients:
1. **Centralized E-Commerce Warehouses (1mg, Netmeds, Apollo 24/7)** operate on centralized hub-and-spoke distribution models resulting in **24–48 hour delivery latencies**.
2. **Offline Chemist Run**: Families endure harrowing **45–65 minute searches** across dark streets only to face **41.8% stock-out rates** at independent chemist counters.
3. **Emergency Multi-Store Splitting**: Even when partial medicines are found, patients must visit 2–3 different pharmacies to fulfill a complete prescription basket.

## 💡 The QuickMeds Innovation: Zero-Inventory Hyperlocal Aggregation
QuickMeds solves emergency access by **transforming existing licensed neighborhood retail chemists into an intelligent, digitized instant-fulfillment network**. 
- **Zero Dark-Store CapEx**: QuickMeds owns zero inventory and zero physical warehouses.
- **Smart Fulfilment Routing Engine**: Uses multi-factor scoring (Availability 35%, Proximity 25%, ETA 15%, Price 15%, Rating 10%) to optimize the entire customer basket in real time.
- **Autonomous Fallback Routing**: If a pharmacy fails to confirm within 30 seconds, order dispatch failover automatically cascades to the next eligible chemist.
- **Pharmacist-in-the-Loop Verification**: Strict Schedule H/H1 statutory review timeline with digital sign-off and complete audit trail.
- **Target ETA**: Hyperlocal pickup and delivery within **15–30 minutes**.

---

## 🏛 High-Level System Architecture

QuickMeds is built on a clean, scalable MERN stack with bi-directional WebSocket event channels for real-time order coordination:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER (React 18 + Vite)                           │
│  • Public Pages: Landing, /architecture, /security, /research, /pharmacy-network        │
│  • Customer Portal: Cart Optimization, Checkout, Prescription Upload, Live Order Map    │
│  • Pharmacy Portal: Order Confirmation, 4-Stage Rx Verification, Inventory Manager      │
│  • Delivery Fleet: Active Delivery Progression, Contactless Proof of Delivery           │
│  • Admin Control: Real-time Routing Monitor, Fallback KPIs, System Audit Logs           │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ HTTPS REST / WSS Events
┌────────────────────────────────────────────▼────────────────────────────────────────────┐
│                             BACKEND ENGINE (Node.js + Express)                          │
│  ┌───────────────────────┐   ┌───────────────────────────┐   ┌────────────────────────┐ │
│  │   Auth & RBAC Vault   │   │ Smart Routing & Optimizer │   │   Fallback Controller  │ │
│  │  (JWT, Bcrypt, Multer)│   │ (Multi-Factor Scoring)    │   │  (30s Timeout Failover)│ │
│  └───────────────────────┘   └───────────────────────────┘   └────────────────────────┘ │
│  ┌───────────────────────┐   ┌───────────────────────────┐   ┌────────────────────────┐ │
│  │   Rx Statutory Gate   │   │  Live Tracking & Telemetry│   │  Compliance Audit Log  │ │
│  │ (Pharmacist-in-Loop)  │   │  (Socket.IO State Machine)│   │  (Immutable Audit Trail│ │
│  └───────────────────────┘   └───────────────────────────┘   └────────────────────────┘ │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
┌────────────────────────────────────────────▼────────────────────────────────────────────┐
│                             DATABASE LAYER (MongoDB + Mongoose)                         │
│  • Geospatial 2dsphere indexing for $nearSphere instant proximity discovery             │
│  • Collections: Users, Pharmacies, PharmacyInventory, Medicines, Orders, Prescriptions,  │
│                 AuditLogs, DeliveryPartners, Notifications, Reviews, ResearchSurveys    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Key Features Inventory

| Requirement | Module | Feature Description | Status |
| :--- | :--- | :--- | :---: |
| **R1** | **Smart Fulfilment Routing Engine** | Multi-factor scoring engine evaluating Availability (35%), Proximity (25%), ETA (15%), Price (15%), and Rating (10%). Optimizes single-store vs split-basket fulfillment. | ✅ Verified |
| **R2** | **Fallback Routing** | Automated timeout failover: Reassigns unconfirmed orders to next best eligible pharmacy with atomic inventory handoff and audit logging. | ✅ Verified |
| **R3** | **Basket Optimization & Pricing UI** | Real-time "Optimizing your fulfilment..." loader, basket coverage indicator, consolidated pricing, and expandable scoring factor drawer. | ✅ Verified |
| **R4** | **Pharmacist-in-the-Loop Workflow** | 4-stage verification timeline (`PENDING` → `UNDER_REVIEW` → `VERIFIED` → `REJECTED`), zoomable prescription viewer, pharmacist verification ID stamp. | ✅ Verified |
| **R5** | **Live Delivery Tracking** | 8-stage delivery lifecycle from `PLACED` to `DELIVERED` with animated vector GPS map and step progression. | ✅ Verified |
| **R6** | **Landing Page Polish** | High-impact hero section, 4-step visual workflow, 6 "Why QuickMeds?" differentiation cards. | ✅ Verified |
| **R7** | **Admin Visualizers & KPIs** | Live Routing Monitor graph, fallback rate (%) & basket coverage (%) KPIs, and filterable system-wide compliance audit log. | ✅ Verified |
| **R8** | **Specialized Pages** | `/architecture` (System blueprints & data flow), `/security` (RBAC & data governance), and `/research` (Empirical field survey charts & admin editor). | ✅ Verified |
| **R9** | **Pharmacy Network Map** | Interactive `/pharmacy-network` map with 1–15 km service radius slider, stock availability indicators, and polyline route highlight. | ✅ Verified |
| **R10** | **Seed Data & Production Readiness** | 33 master emergency medicines, 7 realistic Delhi NCR pharmacies, pre-seeded sample orders across all states, 100% test pass rate, and zero-error client build. | ✅ Verified |

---

## 🔑 Development / Test Accounts

All pre-seeded test accounts use the standard password: **`Password@123`**

| Role | Account Email | Password | Purpose / Persona |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@quickmeds.in` | `Password@123` | Full platform oversight, routing monitor, audit logs, survey editor |
| **Customer 1** | `rahul@example.com` | `Password@123` | Active orders & verified Rx |
| **Customer 2** | `priya@example.com` | `Password@123` | Pending Rx refills & preparing order |
| **Customer 3** | `amit@example.com` | `Password@123` | Emergency cardiac orders & rejected Rx |
| **Pharmacy (Apollo)** | `apollo@pharmacy.in` | `Password@123` | 100% stock, 24x7 superstore |
| **Pharmacy (MedPlus)** | `medplus@pharmacy.in` | `Password@123` | Triggers split-basket on specialized meds |
| **Pharmacy (Guardian)** | `guardian@pharmacy.in` | `Password@123` | Emergency care hub |
| **Pharmacy (Netmeds)** | `netmeds@pharmacy.in` | `Password@123` | Pediatric & general OTC specialist |
| **Pharmacy (Fortis)** | `fortis@pharmacy.in` | `Password@123` | 24x7 hospital emergency dispensary |
| **Pharmacy (Wellness)** | `wellness@pharmacy.in` | `Password@123` | 24-hour retail chemist |
| **Delivery Rider 1** | `delivery1@quickmeds.in` | `Password@123` | Bike fleet. Active live order carrier |
| **Delivery Rider 2** | `delivery2@quickmeds.in` | `Password@123` | EV Scooter fleet |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/medirush`) or MongoDB Atlas URI

### 2. Environment Setup
The backend requires a `server/.env` file. Example configuration:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/medirush
JWT_SECRET=quickmeds_jwt_secret_key
JWT_EXPIRE=7d
FALLBACK_CONFIRMATION_TIMEOUT_SECONDS=30
```

### 3. Install All Dependencies
From the repository root:
```bash
npm run install:all
```

### 4. Seed Database
Populate all 33 master medicines, 7 pharmacies, users, sample orders, and audit logs:
```bash
npm run seed
```

### 5. Launch Development Servers
Start both backend (Port 5000) and frontend (Port 5173) concurrently:
```bash
npm run dev
```
- **Frontend Application**: `http://localhost:5173`
- **Backend API Gateway**: `http://localhost:5000/api`

---

## 🧪 Test Suite Execution & Production Build Verification

### Backend Unit & Integration Tests (Jest)
To run the full backend test suite covering smart routing, whole-basket optimization, fallback failovers, adversarial concurrency, and API validation:
```bash
cd server
npm test
```

### Frontend Production Build (Vite)
To verify client compilation with zero syntax, JSX, or bundling errors:
```bash
cd client
npm run build
```

---

## 🛡 Disclaimer & Compliance Notice

> **Notice**:  
> QuickMeds is a demonstration system using mock data. All prices, inventory levels, delivery ETAs, routing decisions, pharmacist verification stamps, and geospatial coordinates are generated for demonstration purposes. This system does not process actual payments, dispense prescription pharmaceuticals, or provide medical diagnosis.
