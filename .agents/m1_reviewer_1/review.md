# Milestone 1 Independent Review & Adversarial Audit Report

**Target**: Milestone 1 (R1: Smart Fulfilment Routing Engine & R2: Fallback Routing)  
**Reviewer**: Reviewer 1 (Quality Reviewer & Adversarial Critic)  
**Date**: 2026-08-28  
**Working Directory**: `.agents/m1_reviewer_1`  

---

## 1. Executive Summary & Verdict

**Verdict**: **`APPROVE`**  
**Integrity Status**: **PASS** (Zero integrity violations; genuine dynamic logic with no hardcoded shortcuts, facade implementations, or bypasses).  
**Test Suite Status**: **PASS** (3 test suites, 24 unit & integration tests passing with 0 failures in 2.15s).

---

## 2. Review Dimensions & Technical Findings

### A. Mathematical Precision of Multi-Factor Scoring (R1)
- **Weight Distribution**:
  - Availability: $35\%$ (`AVAILABILITY: 0.35`)
  - Proximity: $25\%$ (`PROXIMITY: 0.25`)
  - Estimated Time of Arrival (ETA): $15\%$ (`ETA: 0.15`)
  - Price Competitiveness: $15\%$ (`PRICE: 0.15`)
  - Pharmacy Rating / Reliability: $10\%$ (`RATING: 0.10`)
  - **Sum of Weights**: $0.35 + 0.25 + 0.15 + 0.15 + 0.10 = 1.0000$ (Exact normalization).
- **Sub-Score Normalization**:
  - **Availability ($[0.0, 1.0]$)**: $\min(1.0, \max(0, \frac{\text{availableCount}}{\text{totalItemsCount}}))$. Handles $\text{totalItemsCount} = 0$ safely without division by zero.
  - **Proximity ($[0.0, 1.0]$)**: $\max(0, \min(1.0, 1 - \frac{\text{distanceKm}}{\text{safeMaxDist}}))$. Clamps smoothly to 0 at or beyond $15\text{ km}$ service horizon.
  - **ETA ($[0.0, 1.0]$)**: $\max(0, \min(1.0, 1 - \frac{\text{etaMinutes}}{60.0}))$. Accurately bounds delivery time against 60-minute benchmark.
  - **Price ($[0.0, 1.0]$)**: Relative min-max normalization among eligible candidates. If price spread is zero ($\max = \min$), defaults safely to $1.0$ (no division by zero).
  - **Rating ($[0.0, 1.0]$)**: Normalized against $5.0$-star standard scale ($\frac{\text{rating}}{5.0}$).

### B. Whole-Basket & Split-Basket Optimization (R1)
- **Single-Store Preference**: Correctly identifies candidates fulfilling $100\%$ of requested basket items (`fullCoverageCandidates`) and selects the candidate maximizing composite multi-factor score.
- **Pairwise Split-Basket Set-Cover**: When no single pharmacy can fulfill the entire basket, `findSplitBasketOption` performs pairwise set-cover evaluation across partial candidates:
  - Maximizes joint union coverage ($\text{Set}(A \cup B)$).
  - Secondary objective maximizes joint average score.
  - Dedupes items between stores so each medicine is fulfilled by exactly one store.
  - Adds a $+3\text{ min}$ dispatch buffer for synchronized multi-courier delivery.
- **Consolidated Demo Pricing**: Correctly outputs consolidated `totalDemoValue` ($= \text{subtotal} + \text{deliveryFee}$) and explicit disclaimer badge `Demo pricing — Demonstration data only` matching R1 & R3 requirements.

### C. Fallback Routing & Atomicity (R2)
- **State Machine Guard**: Reassignment restricted strictly to `'PLACED'` and `'PHARMACY_REVIEW'` states, preventing invalid failovers during active preparation or transit.
- **Circular Reassignment Prevention**: Tracks candidate chain in `previousPharmacyIds` ($[\text{ObjectId}]$) and enforces MongoDB `$nin` filter on all subsequent optimization passes.
- **Atomic Stock Handoff**: `restoreInventory` restores reserved stock to `oldPharmacyId` before `decrementInventory` reserves stock at `newPharmacyId`.
- **Multi-Party Real-Time Observability**:
  - Emits `order_fallback_reassigned` to the order room (`order:<id>`).
  - Emits `order_reassigned_away` to the previous pharmacy (`pharmacy:<oldId>`).
  - Emits `new_order_received` to the new candidate pharmacy (`pharmacy:<newId>`).
  - Dispatches customer and pharmacy notifications via `sendNotification`.
  - Records full audit event `ROUTING_FALLBACK` in `AuditLog` collection.

---

## 3. Adversarial Stress-Testing & Edge Cases

| Scenario / Stress Vector | Input Condition | Expected System Response | Verified Code Behavior | Result |
|---|---|---|---|---|
| **Zero Distance** | `distanceKm = 0` | Prep buffer $5\text{m}$, minimum $12\text{m}$ ETA threshold | `Math.max(12, 5 + 0) = 12` | **PASS** |
| **Far Distance Exceeding Radius** | `distanceKm = 25.0` (> 15 km) | Clamped proximity score $0.0$, no negative scores | `Math.max(0, 1 - 25/15) = 0` | **PASS** |
| **Identical Pricing Across Network** | `maxBasketPrice == minBasketPrice` | Avoid division by zero, neutral price score $1.0$ | `priceScore = 1.0` branch executed | **PASS** |
| **Empty Shopping Basket** | `cartItems = []` | Graceful zero-coverage response, HTTP 400 on REST | Returns coverage $0$, HTTP 400 Bad Request | **PASS** |
| **Repeated Failover Attempts** | Multiple timeouts on same order | Appends to candidate chain without circular loop | `order.previousPharmacyIds.push(oldId)` & `$nin` | **PASS** |
| **Non-Geospatial Fallback** | Test or unindexed DB environment | Graceful fallback to non-spatial query | `try { $nearSphere } catch { Pharmacy.find() }` | **PASS** |

---

## 4. Integrity Violation Audit

- **Hardcoded Result Detection**: Audited `smartRoutingService.js` and `orderService.js`. All scoring calculations, distances, ETAs, and set-cover algorithms are calculated dynamically from database inputs.
- **Dummy Implementations**: Full implementation of scoring helpers, basket price calculators, split-basket search, database models, controller endpoints, and Socket.IO/audit service integrations.
- **Test Integrity**: Test assertions in `server/tests/routing.test.js` evaluate computed values against independent mathematical expectations (`toBeCloseTo`, `toBeGreaterThan`, `toHaveProperty`, `toThrow`).

---

## 5. Verified Claims & Test Execution Log

```
PASS tests/routing.test.js
  Smart Fulfilment Routing Engine (Milestone 1 Test Suite)
    Scenario 1: Single-Item Match with 100% Stock at Nearest Pharmacy
      ✓ should compute high composite score for nearest pharmacy with 100% availability (4 ms)
    Scenario 2: Multi-Item Whole Basket Match at Single Store
      ✓ should favor full coverage pharmacy over closer pharmacy with partial coverage (2 ms)
    Scenario 3: Split-Basket Scenario when Multiple Stores are Needed
      ✓ should generate valid split-basket explanation and combined coverage (2 ms)
      ✓ should correctly determine optimal split basket pair using findSplitBasketOption (1 ms)
    Scenario 4: Zero Stock / No Coverage Fallback
      ✓ should assign zero availability score when zero items are in stock (1 ms)
      ✓ should handle single-store explanation generation correctly (1 ms)
      ✓ should return zero coverage plan structure when cart is empty in optimizeFulfilmentPlan (2 ms)
    Scenario 5: Multi-Factor Scoring Weight Validation
      ✓ should strictly adhere to defined scoring weights summing to 1.00 (1 ms)
    Scenario 6: ETA & Distance Helper Logic
      ✓ should compute minimum 12 minute ETA buffer and scale with distance (1 ms)
    Scenario 7: Basket Price Calculation Helper
      ✓ should compute accurate subtotal across requested items and quantities (1 ms)
    Scenario 8: Order State Machine & Fallback Rules
      ✓ should validate legitimate order state transitions (1 ms)
      ✓ should reject illegal state transitions with ApiError (8 ms)
    Scenario 9: HTTP REST API Endpoints
      ✓ POST /api/routing/optimize should reject empty items with 400 (18 ms)
      ✓ GET /api/routing/pharmacies-map should return pharmacy network map data (15 ms)

PASS tests/auth.test.js
PASS tests/utils.test.js

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        2.153 s
```

---

## 6. Conclusion

The Milestone 1 implementation of the Smart Fulfilment Routing Engine (R1) and Fallback Routing Engine (R2) is architecturally sound, mathematically precise, resilient against edge cases, and completely integrated with the database, real-time Socket.IO, and audit logging layers. Full approval is granted.
