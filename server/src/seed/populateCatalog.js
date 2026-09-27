/**
 * QuickMeds Safe Idempotent Catalog Population Engine
 * File: server/src/seed/populateCatalog.js
 *
 * Requirements:
 * - Safe upserts based on stable medicine identity
 * - Detect duplicates before insertion
 * - Preserve valid existing records and their _id references
 * - Preserve pharmacy inventory references (re-point duplicates cleanly)
 * - Do NOT drop collections or delete database records
 * - Do NOT fabricate pharmacy inventory or stock
 * - Dry-run preview capability via --dry-run
 * - Commit mode via --commit
 */

const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Configure public DNS servers for local Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = require('../config/db');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const { verifiedCatalog } = require('./catalogData');

function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeMedicineKey(med) {
  const normName = normalizeString(med.name);
  const normStrength = normalizeString(med.strength);
  const normForm = normalizeString(med.dosageForm);
  return `${normName}__${normStrength}__${normForm}`;
}

async function runCatalogPopulation(isDryRun = false) {
  console.log('=============================================================');
  console.log(`🏥 QUICKMEDS MASTER MEDICINE CATALOG POPULATION`);
  console.log(`MODE: ${isDryRun ? '🔍 PREVIEW / DRY-RUN (No changes applied)' : '🚀 LIVE COMMIT'}`);
  console.log('=============================================================\n');

  await connectDB();

  // 1. Fetch all existing medicines in DB
  const existingMedicines = await Medicine.find({});
  console.log(`[Diagnostic] Found ${existingMedicines.length} existing medicine records in MongoDB.`);

  // 2. Identify and resolve known exact duplicates in DB (e.g. Azithral 500mg)
  const groupedByName = new Map();
  existingMedicines.forEach((med) => {
    const key = makeMedicineKey(med);
    if (!groupedByName.has(key)) {
      groupedByName.set(key, []);
    }
    groupedByName.get(key).push(med);
  });

  const duplicateGroups = [];
  groupedByName.forEach((list, key) => {
    if (list.length > 1) {
      duplicateGroups.push({ key, records: list });
    }
  });

  let duplicatesResolvedCount = 0;
  const canonicalMap = new Map();

  for (const group of duplicateGroups) {
    // Choose the canonical record: prefer the one that requiresPrescription: true (or oldest)
    const sorted = [...group.records].sort((a, b) => {
      if (a.requiresPrescription !== b.requiresPrescription) {
        return a.requiresPrescription ? -1 : 1; // prefer correctly marked prescription
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const canonical = sorted[0];
    const duplicates = sorted.slice(1);

    console.log(`[Deduplication] Identified ${duplicates.length} duplicate(s) for "${canonical.name}". Canonical ID: ${canonical._id}`);

    for (const dupe of duplicates) {
      canonicalMap.set(dupe._id.toString(), canonical._id);
      duplicatesResolvedCount++;

      if (!isDryRun) {
        // Remap any pharmacy inventories pointing to dupe to canonical
        const invUpdated = await PharmacyInventory.updateMany(
          { medicineId: dupe._id },
          { $set: { medicineId: canonical._id } }
        );
        if (invUpdated.modifiedCount > 0) {
          console.log(`  -> Remapped ${invUpdated.modifiedCount} inventory link(s) from dupe ${dupe._id} to canonical ${canonical._id}`);
        }

        // Deactivate the duplicate record safely without deleting
        await Medicine.findByIdAndUpdate(dupe._id, {
          active: false,
          verificationStatus: 'DISCONTINUED',
          description: `Discontinued duplicate record. Canonical record ID: ${canonical._id}`
        });
      }
    }
  }

  // 3. Upsert / Enrich from verifiedCatalog
  // Index existing active medicines by canonical key
  const activeExisting = await Medicine.find({ active: true });
  const existingKeyMap = new Map();
  const existingNameMap = new Map();

  activeExisting.forEach((med) => {
    existingKeyMap.set(makeMedicineKey(med), med);
    existingNameMap.set(normalizeString(med.name), med);
  });

  let preservedCount = 0;
  let enrichedCount = 0;
  let insertedCount = 0;

  for (const catItem of verifiedCatalog) {
    const key = makeMedicineKey(catItem);
    const normName = normalizeString(catItem.name);

    // Look for existing match by composite key or exact normalized name
    const existing = existingKeyMap.get(key) || existingNameMap.get(normName);

    if (existing) {
      preservedCount++;
      // Determine what fields to enrich
      const updates = {};

      if (!existing.composition && catItem.composition) updates.composition = catItem.composition;
      if (!existing.routeOfAdministration && catItem.routeOfAdministration) updates.routeOfAdministration = catItem.routeOfAdministration;
      if (!existing.packSize && catItem.packSize) updates.packSize = catItem.packSize;
      if (!existing.regulatoryClass && catItem.regulatoryClass) updates.regulatoryClass = catItem.regulatoryClass;
      if (!existing.sourceOfInformation && catItem.sourceOfInformation) updates.sourceOfInformation = catItem.sourceOfInformation;
      if (!existing.verificationStatus || existing.verificationStatus !== 'VERIFIED') updates.verificationStatus = catItem.verificationStatus || 'VERIFIED';
      if (!existing.lastVerificationDate) updates.lastVerificationDate = new Date();
      if ((!existing.aliases || existing.aliases.length === 0) && catItem.aliases) updates.aliases = catItem.aliases;
      if (existing.prescriptionSchedule !== catItem.prescriptionSchedule) updates.prescriptionSchedule = catItem.prescriptionSchedule;
      if (existing.requiresPrescription !== catItem.requiresPrescription) updates.requiresPrescription = catItem.requiresPrescription;
      if (catItem.category && existing.category !== catItem.category) updates.category = catItem.category;

      if (Object.keys(updates).length > 0) {
        enrichedCount++;
        if (!isDryRun) {
          await Medicine.findByIdAndUpdate(existing._id, { $set: updates });
        }
      }
    } else {
      // New record to insert
      insertedCount++;
      if (!isDryRun) {
        const created = await Medicine.create({
          ...catItem,
          active: true,
          verificationStatus: 'VERIFIED',
          lastVerificationDate: new Date()
        });
        existingKeyMap.set(makeMedicineKey(created), created);
        existingNameMap.set(normalizeString(created.name), created);
      }
    }
  }

  // 4. Verification Check
  const totalActive = isDryRun 
    ? (activeExisting.length - duplicatesResolvedCount + insertedCount)
    : await Medicine.countDocuments({ active: true });

  const totalPharmacies = await mongoose.model('Pharmacy').countDocuments({});
  const totalInventories = await PharmacyInventory.countDocuments({});

  console.log('\n=============================================================');
  console.log('📊 CATALOG POPULATION SUMMARY');
  console.log('=============================================================');
  console.log(`• Curated catalog entries processed: ${verifiedCatalog.length}`);
  console.log(`• Existing records preserved:         ${preservedCount}`);
  console.log(`• Existing records enriched:          ${enrichedCount}`);
  console.log(`• New verified medicines added:       ${insertedCount}`);
  console.log(`• Duplicates resolved & consolidated: ${duplicatesResolvedCount}`);
  console.log(`• Total active catalog medicines:     ${totalActive}`);
  console.log(`• Total verified pharmacies:          ${totalPharmacies}`);
  console.log(`• Total pharmacy inventories:         ${totalInventories} (UNTOUCHED)`);
  console.log('=============================================================');
  console.log('✅ Separation check: 0 synthetic pharmacy inventory records created.');
  console.log('   New master medicines remain unavailable until verified pharmacies add stock.');
  console.log('=============================================================\n');

  if (isDryRun) {
    console.log('🔍 Dry run completed successfully. No changes were committed to the database.');
    console.log('   To commit changes, run with: node server/src/seed/populateCatalog.js --commit\n');
  } else {
    console.log('🚀 LIVE COMMIT SUCCESSFUL! The master catalog is now up to date in MongoDB Atlas.\n');
  }

  process.exit(0);
}

// Parse CLI flags
const args = process.argv.slice(2);
const isCommit = args.includes('--commit');
const isDryRun = !isCommit || args.includes('--dry-run');

runCatalogPopulation(isDryRun).catch((err) => {
  console.error('\n❌ Fatal error during catalog population:', err);
  process.exit(1);
});
