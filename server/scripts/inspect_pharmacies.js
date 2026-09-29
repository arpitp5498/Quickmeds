const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = require('../src/config/db');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyInventory = require('../src/models/PharmacyInventory');

async function run() {
  await connectDB();
  const allPharms = await Pharmacy.find({});
  console.log(`Total pharmacies in DB: ${allPharms.length}`);
  for (const p of allPharms) {
    const invCount = await PharmacyInventory.countDocuments({ pharmacyId: p._id });
    console.log(`- Pharmacy [${p._id}]: "${p.name}" | Status: ${p.verificationStatus || p.status} | IsActive: ${p.isActive} | Inventories: ${invCount}`);
  }
  process.exit(0);
}

run().catch(console.error);
