# E2E Test Infra: QuickMeds SIH Grand Finale

## Test Philosophy
- Opaque-box, requirement-driven testing covering all 11 core requirements (R1–R11) and 18 Acceptance Criteria.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Test Tiers Overview
| Tier | Description | Target Scenarios |
|------|-------------|------------------|
| Tier 1: Feature Coverage | Happy path tests verifying each requirement in isolation | Routing API, fallback failover, cart breakdown, 4-stage Rx, delivery state changes, admin monitor, research data |
| Tier 2: Boundary & Corner Cases | Zero stock, maximum distance, split basket, rejected prescriptions, rapid step simulation | Edge cases in scoring formula, fallback exhausted, invalid coordinates, empty cart |
| Tier 3: Cross-Feature Interactions | Full lifecycle integration | Upload Rx -> Verify Rx -> Multi-Factor Routing -> Place Order -> Fallback Timeout -> Delivery Simulation -> Audit Log |
| Tier 4: Real-World SIH Demo Scenarios | End-to-end 13-step Grand Finale workflow execution | <90s presentation flow matching SIH jury evaluation |

## Test Runner & Verification Commands
- **Backend Unit & Integration Tests**:
  ```bash
  cd server && npm test
  ```
  Target: 100% passing tests across `routing.test.js`, `auth.test.js`, and `utils.test.js`.
- **Frontend Production Build**:
  ```bash
  cd client && npm run build
  ```
  Target: 0 compilation/bundle errors.
- **Runtime Seed Verification**:
  ```bash
  cd server && npm run seed
  ```
  Target: Complete seed data population without errors.

## Feature Verification Matrix
| Feature | Tier 1 (Isolated) | Tier 2 (Boundary) | Tier 3 (Integration) | Tier 4 (SIH Workload) |
|---|:---:|:---:|:---:|:---:|
| R1: Smart Routing Engine | ✓ | ✓ | ✓ | ✓ |
| R2: Fallback Routing Failover | ✓ | ✓ | ✓ | ✓ |
| R3: Basket Optimization UI | ✓ | ✓ | ✓ | ✓ |
| R4: Pharmacist-in-the-Loop | ✓ | ✓ | ✓ | ✓ |
| R5: Delivery Simulation | ✓ | ✓ | ✓ | ✓ |
| R6: 13-Step Demo Mode | ✓ | ✓ | ✓ | ✓ |
| R7: Landing Page Polish | ✓ | ✓ | ✓ | ✓ |
| R8: Admin Visualizers & Metrics | ✓ | ✓ | ✓ | ✓ |
| R9: Architecture, Security, Research | ✓ | ✓ | ✓ | ✓ |
| R10: Pharmacy Network Map | ✓ | ✓ | ✓ | ✓ |
| R11: Polish, Responsive QA, Docs | ✓ | ✓ | ✓ | ✓ |
