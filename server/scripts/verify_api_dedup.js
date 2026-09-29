const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const env = require('../src/config/env');
const Medicine = require('../src/models/Medicine');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const Pharmacy = require('../src/models/Pharmacy');

async function testApiLogic() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  // 1. Test search query for "Sirona"
  const sironaRegex = /sirona/i;
  const searchResults = await Medicine.find({
    active: true,
    isMerged: { $ne: true },
    verificationStatus: { $ne: 'MERGED' },
    $or: [
      { name: sironaRegex },
      { genericName: sironaRegex },
      { brand: sironaRegex }
    ]
  });

  console.log(`Found ${searchResults.length} active non-merged medicines matching "Sirona":`);
  for (const m of searchResults) {
    // Check inventories
    const invs = await PharmacyInventory.find({
      medicineId: m._id,
      isAvailable: true,
      stockQuantity: { $gt: 0 }
    }).populate('pharmacyId');

    const verifiedInvs = invs.filter(i => i.pharmacyId && !i.isPriceSuspicious && !i.pharmacyId.isDemo);
    const lowestPrice = verifiedInvs.length > 0 ? Math.min(...verifiedInvs.map(i => i.price)) : m.mrp;

    console.log(`- [${m._id}] "${m.name}" | MRP: ₹${m.mrp} | Authentic Lowest Price: ₹${lowestPrice} | Verified Pharmacies: ${verifiedInvs.length}`);
  }

  // 2. Test duplicate redirection: Fetch by the old duplicate ID
  const oldDuplicateId = '6ab93034a8079ca663982cf0';
  let duplicateDoc = await Medicine.findById(oldDuplicateId);
  console.log(`\nTesting lookup of old merged duplicate ID [${oldDuplicateId}]:`);
  console.log(`- Duplicate doc found? isMerged: ${duplicateDoc?.isMerged}, canonicalId: ${duplicateDoc?.canonicalMedicineId}`);
  if (duplicateDoc && duplicateDoc.isMerged && duplicateDoc.canonicalMedicineId) {
    const canonical = await Medicine.findById(duplicateDoc.canonicalMedicineId);
    console.log(`- Resolved canonical medicine: "${canonical.name}" [${canonical._id}]`);
  }

  // 3. Test Whisper pads (Variants vs Duplicates)
  console.log('\nTesting Whisper Products in Catalog:');
  const whisperResults = await Medicine.find({
    active: true,
    isMerged: { $ne: true },
    verificationStatus: { $ne: 'MERGED' },
    name: /whisper/i
  });
  console.log(`Found ${whisperResults.length} distinct Whisper products (variants preserved):`);
  whisperResults.forEach(w => console.log(`- [${w._id}] "${w.name}" (Strength: ${w.strength}, DosageForm: ${w.dosageForm})`));

  // 4. Test Total Active Medicines
  const totalActive = await Medicine.countDocuments({
    active: true,
    isMerged: { $ne: true },
    verificationStatus: { $ne: 'MERGED' }
  });
  const totalMerged = await Medicine.countDocuments({
    isMerged: true
  });
  console.log(`\nCatalog summary: Total Active Non-Merged: ${totalActive}, Total Consolidated Merged: ${totalMerged}`);

  await mongoose.disconnect();
}

testApiLogic().catch(console.error);
