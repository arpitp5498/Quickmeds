const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = require('../src/config/db');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const Medicine = require('../src/models/Medicine');

async function run() {
  await connectDB();
  const allMeds = await Medicine.find({ active: true });

  console.log(`Active medicines count: ${allMeds.length}`);

  // Let's print all 115 active medicines so we can inspect every single one of them!
  for (let i = 0; i < allMeds.length; i++) {
    const m = allMeds[i];
    const invCount = await PharmacyInventory.countDocuments({ medicineId: m._id });
    console.log(`[${i+1}] ID: ${m._id} | Name: "${m.name}" | Brand: "${m.brand}" | Generic: "${m.genericName}" | Strength: "${m.strength}" | MRP: ₹${m.mrp} | Invs: ${invCount}`);
  }

  process.exit(0);
}

run().catch(console.error);
