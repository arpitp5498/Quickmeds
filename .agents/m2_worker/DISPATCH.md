## 2026-08-28T05:13:57Z
You are Worker M2 (Basket Optimization UI & Pharmacist Verification Workflow Specialist) for QuickMeds SIH Grand Finale prototype.

Your working directory is: `c:\Users\arpit\OneDrive\Documents\medirush\.agents\m2_worker`
Project root: `c:\Users\arpit\OneDrive\Documents\medirush`
Authoritative user requirements: `c:\Users\arpit\OneDrive\Documents\medirush\ORIGINAL_REQUEST.md`
Project master document: `c:\Users\arpit\OneDrive\Documents\medirush\PROJECT.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Mission (Milestone 2: R3 Basket Optimization & Pricing UI + R4 Pharmacist Verification Workflow + R2 Pharmacy Timeout Button):
1. Create `client/src/components/routing/BasketOptimizationBreakdown.jsx`:
   - "Optimizing your fulfilment..." animated loading pulse during API call to `/api/routing/optimize`.
   - Basket Coverage indicator badge (e.g. "Basket Coverage: 3/3 items (100%)" or "Split Fulfilment: 2 Pharmacies").
   - Consolidated demonstration price breakdown (Subtotal, Delivery Fee, Platform Fee, Total Demo Value) with clear demo disclaimer tag: "Demo pricing — Demonstration data only".
   - Expandable "How was this option selected?" accordion / modal displaying the 5 multi-factor scoring criteria with exact weights:
     - Stock Availability (35%)
     - Proximity to Customer (25%)
     - Estimated Preparation & Delivery Time (15%)
     - Demo Price Index (15%)
     - Pharmacy Rating & Reliability (10%)
   - Selected pharmacy details (Name, Address, Distance in km, ETA in mins, Rating stars).
2. Integrate into `client/src/pages/cart/Cart.jsx` and `client/src/pages/checkout/Checkout.jsx`:
   - Connect with `/api/routing/optimize` passing current cart items and customer coordinates.
   - Render `BasketOptimizationBreakdown` seamlessly above checkout actions.
   - Add prescription upload notice / disclaimer on checkout.
3. Upgrade Pharmacist-in-the-Loop Workflow in `client/src/pages/pharmacy/PharmacyPrescriptions.jsx` and `client/src/pages/prescriptions/MyPrescriptions.jsx`:
   - 4-stage visual verification timeline: `PENDING` -> `UNDER_REVIEW` -> `VERIFIED` (or `REJECTED`).
   - Prescription inspection modal with zoomable preview, patient info, and medicine list.
   - Approval & Rejection controls with mandatory rejection reason dropdown (e.g. "Expired Prescription", "Illegible Handwriting", "Dosage Mismatch", "Invalid Doctor Registration").
   - Display Pharmacist Demo License / ID ("Verified by: Lic #DL-PH-2026-98124") and review timestamp upon approval.
   - Prominent statutory simulation disclaimer: "Statutory Requirement: Under Indian Pharmacy Practice Regulations, all Schedule H/X drugs require licensed pharmacist verification. (Simulated for SIH Demo)."
4. Add "Simulate Pharmacy Timeout" button in `client/src/pages/pharmacy/PharmacyOrders.jsx` and `PharmacyOrderDetail.jsx`:
   - Action button calling `POST /api/orders/:id/simulate-timeout`.
   - Displays real-time toast and updates order card to show fallback reassignment banner with old vs new pharmacy name.
5. Verify build: run `npm run build` in `client/` and verify zero errors.

Deliverables:
Document all files modified and created in `c:\Users\arpit\OneDrive\Documents\medirush\.agents\m2_worker\changes.md` and write your handoff to `c:\Users\arpit\OneDrive\Documents\medirush\.agents\m2_worker\handoff.md`.
Send a completion message back when finished.
