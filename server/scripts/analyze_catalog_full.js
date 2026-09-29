const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = require('../src/config/db');
const Medicine = require('../src/models/Medicine');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const Order = require('../src/models/Order');

async function analyze() {
  await connectDB();

  console.log('=== FULL QUICKMEDS CATALOG & INVENTORY AUDIT ===\n');

  const medicines = await Medicine.find({});
  const pharmacies = await Pharmacy.find({});
  const inventories = await PharmacyInventory.find({}).populate('medicineId').populate('pharmacyId');
  const orders = await Order.find({});

  console.log(`• Total Master Medicines in DB: ${medicines.length}`);
  console.log(`• Total Pharmacies in DB:       ${pharmacies.length}`);
  console.log(`• Total Inventory Records:      ${inventories.length}`);
  console.log(`• Total Orders in History:      ${orders.length}`);

  // 1. Identify suspicious prices in inventory
  console.log('\n--- 1. SUSPICIOUS / UNVERIFIED PRICES AUDIT ---');
  const suspiciousInvs = [];
  for (const inv of inventories) {
    if (!inv.medicineId || !inv.pharmacyId) continue;
    const mrp = inv.medicineId.mrp;
    const price = inv.price;
    const discount = mrp > 0 ? ((mrp - price) / mrp) * 100 : 0;

    // Flag if price is > 65% below MRP or price < 10 or price > 2x MRP or demo pharmacy flat pricing
    const isDemoPharmacy = inv.pharmacyId.name.includes('Demo') || inv.pharmacyId.name.includes('Test');
    const isPriceAbnormal = discount > 60 || price < 10 || price > mrp * 1.5;

    if (isDemoPharmacy || isPriceAbnormal) {
      suspiciousInvs.push({
        invId: inv._id,
        pharmacyName: inv.pharmacyId.name,
        isVerified: inv.pharmacyId.verificationStatus === 'VERIFIED',
        isDemo: isDemoPharmacy,
        medicineName: inv.medicineId.name,
        medicineId: inv.medicineId._id,
        mrp,
        price,
        discount: discount.toFixed(1) + '%',
        stock: inv.stockQuantity
      });
    }
  }

  console.log(`Found ${suspiciousInvs.length} inventory records with abnormal/demo prices:`);
  const demoOnly = suspiciousInvs.filter(i => i.isDemo);
  const nonDemoAbnormal = suspiciousInvs.filter(i => !i.isDemo);
  console.log(`  - From Demo/Test stores (e.g. flat ₹30 demo fixtures): ${demoOnly.length}`);
  console.log(`  - From real pharmacies with abnormal price: ${nonDemoAbnormal.length}`);
  if (nonDemoAbnormal.length > 0) {
    console.log('  Non-demo abnormal prices:', nonDemoAbnormal);
  }

  // 2. Systematic deduplication analysis
  console.log('\n--- 2. SYSTEMATIC PRODUCT DEDUPLICATION ANALYSIS ---');

  function normalize(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function extractPackCount(str) {
    if (!str) return null;
    const match = str.match(/(\d+)\s*(?:pack|bags|sheets|strips|pads|tampons|patches|capsules|tablets|vial|doses|ml|g|unit|s\b)/i);
    return match ? match[0].toLowerCase() : null;
  }

  // Check pairwise similarity among all active medicines
  const verifiedDuplicates = [];
  const genuineVariants = [];
  const uncertainMatches = [];

  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const m1 = medicines[i];
      const m2 = medicines[j];

      const b1 = normalize(m1.brand);
      const b2 = normalize(m2.brand);
      const f1 = normalize(m1.dosageForm);
      const f2 = normalize(m2.dosageForm);
      const s1 = normalize(m1.strength);
      const s2 = normalize(m2.strength);
      const g1 = normalize(m1.genericName);
      const g2 = normalize(m2.genericName);
      const n1 = normalize(m1.name);
      const n2 = normalize(m2.name);

      // Check if same brand (or one brand is contained in another)
      const sameBrand = b1 && b2 && (b1 === b2 || b1.includes(b2) || b2.includes(b1));

      // Same generic / core
      const sameGeneric = g1 && g2 && (g1 === g2 || g1.includes(g2) || g2.includes(g1));

      if (sameBrand && (sameGeneric || f1 === f2)) {
        // Now inspect strength / pack size
        const p1 = extractPackCount(s1) || extractPackCount(n1);
        const p2 = extractPackCount(s2) || extractPackCount(n2);

        if (s1 === s2 || p1 === p2 || (!p1 && !p2 && f1 === f2)) {
          // Both are same brand, same form, same strength/size
          // e.g. "Menstrual Cup (Sirona Reusable Medium)" vs "Sirona Reusable Menstrual Cup (Medium)"
          verifiedDuplicates.push({
            m1: { id: m1._id, name: m1.name, brand: m1.brand, mrp: m1.mrp, strength: m1.strength, form: m1.dosageForm, active: m1.active },
            m2: { id: m2._id, name: m2.name, brand: m2.brand, mrp: m2.mrp, strength: m2.strength, form: m2.dosageForm, active: m2.active },
            reason: `Same brand (${m1.brand}), same form (${m1.dosageForm}), same strength/pack (${m1.strength} vs ${m2.strength})`
          });
        } else {
          // Different strength/pack size e.g. 15 pads vs 30 pads -> GENUINE VARIANT
          genuineVariants.push({
            m1: { id: m1._id, name: m1.name, strength: m1.strength },
            m2: { id: m2._id, name: m2.name, strength: m2.strength },
            reason: `Different variant/size/pack (${m1.strength} vs ${m2.strength})`
          });
        }
      }
    }
  }

  console.log(`\nVerified Exact Duplicates Found: ${verifiedDuplicates.length}`);
  verifiedDuplicates.forEach((d, idx) => {
    console.log(`\n[Duplicate #${idx + 1}]`);
    console.log(`  Record A: [${d.m1.id}] "${d.m1.name}" (MRP ₹${d.m1.mrp}, Active: ${d.m1.active})`);
    console.log(`  Record B: [${d.m2.id}] "${d.m2.name}" (MRP ₹${d.m2.mrp}, Active: ${d.m2.active})`);
    console.log(`  Reason:   ${d.reason}`);
  });

  console.log(`\nGenuine Variants (MUST PRESERVE SEPARATE): ${genuineVariants.length}`);
  genuineVariants.forEach((v, idx) => {
    console.log(`  [Variant #${idx + 1}] "${v.m1.name}" (${v.m1.strength}) vs "${v.m2.name}" (${v.m2.strength})`);
  });

  process.exit(0);
}

analyze().catch(console.error);
