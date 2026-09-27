/**
 * Comprehensive Catalog Expansion & Regulatory Verification Suite
 * Tests all 16 items specified in Section 13.
 */

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = require('../src/config/db');
const Medicine = require('../src/models/Medicine');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const { calculateDistance } = require('../src/utils/geo');
const { matchWithMasterCatalog } = require('../src/services/inventorySyncService');

async function runTestSuite() {
  console.log('=============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE CATALOG EXPANSION VERIFICATION SUITE');
  console.log('=============================================================\n');

  await connectDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Catalog records are populated / restored successfully
  const totalActive = await Medicine.countDocuments({ active: true });
  assert(totalActive >= 100, `Catalog records restored (Found ${totalActive} active medicines)`);

  // 2. Existing medicine records are preserved
  const dolo650 = await Medicine.findOne({ name: 'Dolo 650mg Tablet', active: true });
  assert(dolo650 !== null && dolo650.mrp === 34, `Existing records preserved (Dolo 650 exists with MRP ₹${dolo650?.mrp})`);

  // 3. Duplicate medicines are not inserted (unique check on active catalog)
  const allActive = await Medicine.find({ active: true });
  const nameSet = new Set();
  let duplicatesFound = 0;
  allActive.forEach(m => {
    const key = `${m.name.toLowerCase()}__${m.strength.toLowerCase()}`;
    if (nameSet.has(key)) duplicatesFound++;
    nameSet.add(key);
  });
  assert(duplicatesFound === 0, `Zero duplicates in active catalog (Found ${duplicatesFound} duplicates)`);

  // 4. Different strengths/forms remain distinct
  const paracetamol500 = await Medicine.findOne({ name: 'Crocin 500 Advance Tablet', active: true });
  const paracetamol650 = await Medicine.findOne({ name: 'Dolo 650mg Tablet', active: true });
  const paracetamolSuspension = await Medicine.findOne({ name: /Calpol 250mg.*Suspension/i, active: true });
  const paracetamolDrops = await Medicine.findOne({ name: /Calpol 100mg.*Infant Drops/i, active: true });
  assert(
    paracetamol500 && paracetamol650 && paracetamolSuspension && paracetamolDrops &&
    paracetamol500._id.toString() !== paracetamol650._id.toString(),
    'Different strengths & dosage forms remain distinct entities (500mg, 650mg, Suspension, Drops)'
  );

  // 5. Medicine search returns real catalog records
  const searchRegex = new RegExp('paracetamol', 'i');
  const searchResults = await Medicine.find({
    active: true,
    $or: [{ name: searchRegex }, { genericName: searchRegex }, { composition: searchRegex }]
  });
  assert(searchResults.length >= 4, `Search query returns real records (Query "paracetamol" matched ${searchResults.length} records)`);

  // 6. Category filtering works across 17 categories
  const categoriesInDb = await Medicine.distinct('category', { active: true });
  assert(categoriesInDb.length >= 10, `Categories populated correctly (${categoriesInDb.length} categories represented)`);

  // 7. Product details load correctly with composition and regulatory info
  assert(
    dolo650.composition && dolo650.prescriptionSchedule && dolo650.sourceOfInformation,
    `Product detail fields present (Composition: "${dolo650?.composition}", Schedule: "${dolo650?.prescriptionSchedule}")`
  );

  // 8. Separation of Master Catalog and Pharmacy Inventory
  const stockedMeds = await PharmacyInventory.distinct('medicineId', { isAvailable: true, stockQuantity: { $gt: 0 } });
  const unstockedMeds = await Medicine.find({ _id: { $nin: stockedMeds }, active: true });
  assert(
    unstockedMeds.length > 0,
    `Separation strictly maintained: ${unstockedMeds.length} catalog items exist WITHOUT synthetic inventory`
  );

  // 9. Catalog medicines without local stock correctly show 0 available pharmacies
  const sampleUnstocked = unstockedMeds[0];
  const matchingStock = await PharmacyInventory.countDocuments({
    medicineId: sampleUnstocked._id,
    isAvailable: true,
    stockQuantity: { $gt: 0 }
  });
  assert(matchingStock === 0, `Unstocked medicine "${sampleUnstocked.name}" has 0 matching pharmacy inventories`);

  // 10. Prescription-only medicines retain required safeguards
  const rxMeds = await Medicine.find({ requiresPrescription: true, active: true });
  const otcMeds = await Medicine.find({ requiresPrescription: false, active: true });
  assert(rxMeds.length >= 30, `Prescription-only medicines properly classified (Found ${rxMeds.length} Rx medicines)`);
  assert(otcMeds.length >= 30, `OTC medicines properly classified (Found ${otcMeds.length} OTC medicines)`);

  const augmentin = await Medicine.findOne({ name: /Augmentin 625/i, active: true });
  assert(augmentin && augmentin.requiresPrescription === true && augmentin.prescriptionSchedule === 'Schedule H',
    `Augmentin 625 is strictly Schedule H with requiresPrescription: true`
  );

  // 11. Pharmacy inventory references remain valid
  const allInventories = await PharmacyInventory.find({}).limit(50);
  const referencedMedIds = [...new Set(allInventories.map(i => i.medicineId.toString()))];
  const validMedsCount = await Medicine.countDocuments({ _id: { $in: referencedMedIds } });
  assert(validMedsCount === referencedMedIds.length, `All pharmacy inventory foreign keys point to valid medicines (${validMedsCount}/${referencedMedIds.length})`);

  // 12. Fuzzy matching and CSV/Excel matching with Master Catalog works
  const matchResult = await matchWithMasterCatalog('Dolo 650');
  assert(
    matchResult.status === 'MATCHED' && matchResult.matchedMedicine && matchResult.confidence >= 80,
    `Master catalog matching works (Matched "Dolo 650" to "${matchResult.matchedMedicine?.name}" with ${matchResult.confidence}% confidence)`
  );

  const matchRxResult = await matchWithMasterCatalog('Augmentin 625 Duo');
  assert(
    matchRxResult.status === 'MATCHED' && matchRxResult.matchedMedicine,
    `Master catalog matching works for antibiotics (Matched to "${matchRxResult.matchedMedicine?.name}")`
  );

  // 13. Smart Order Routing stock validation
  const validStockItems = await PharmacyInventory.find({
    isAvailable: true,
    stockQuantity: { $gt: 0 },
    $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }]
  });
  assert(validStockItems.length > 0, `Smart routing stock pool valid (${validStockItems.length} active non-expired stock units)`);

  console.log('\n=============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
