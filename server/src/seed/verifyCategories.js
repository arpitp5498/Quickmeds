const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Medicine = require('../models/Medicine');

async function testCategories() {
  await connectDB();

  console.log('=== MEDICINE CATEGORY & SEARCH INTEGRATION VERIFICATION ===\n');

  const categoriesToTest = [
    'All',
    'Fever & Pain',
    'Cold & Cough',
    'Digestive Care',
    'Cardiac & Diabetes',
    'Antibiotics & Anti-infectives',
    'Vitamins & Supplements',
    'First Aid & Surgical',
    'Women Care & Hygiene'
  ];

  let allPass = true;

  for (const cat of categoriesToTest) {
    const query = { active: true };
    if (cat !== 'All') {
      if (cat === 'Fever & Pain') {
        query.category = { $in: ['Fever & Pain', 'Pain Relief', 'Pediatric'] };
      } else if (cat === 'Cold & Cough') {
        query.category = { $in: ['Cold & Cough', 'Respiratory'] };
      } else if (cat === 'Cardiac & Diabetes') {
        query.category = { $in: ['Cardiac & Diabetes', 'Cardiac', 'Diabetes'] };
      } else if (cat === 'Antibiotics & Anti-infectives') {
        query.category = { $in: ['Antibiotics & Anti-infectives', 'Antibiotics'] };
      } else if (cat === 'Digestive Care') {
        query.category = { $in: ['Digestive Care'] };
      } else if (cat === 'Vitamins & Supplements') {
        query.category = { $in: ['Vitamins & Supplements', 'Vitamins'] };
      } else if (cat === 'First Aid & Surgical') {
        query.category = { $in: ['First Aid & Surgical', 'First Aid'] };
      } else if (cat === 'Women Care & Hygiene' || cat === 'Skin & Personal Care') {
        query.category = { $in: ['Women Care & Hygiene', 'Women Care', 'Skin & Personal Care'] };
      } else {
        query.category = new RegExp(`^${cat.trim()}$`, 'i');
      }
    }

    const meds = await Medicine.find(query).sort({ name: 1 });
    const count = meds.length;
    const medNames = meds.map(m => m.name).join(', ');

    console.log(`[CATEGORY] "${cat}" -> ${count} medicines found:`);
    console.log(`   Items: ${medNames}\n`);

    if (count === 0) {
      console.error(`❌ FAIL: Category "${cat}" returned 0 medicines!`);
      allPass = false;
    }
  }

  // Test Category + Search Combo
  console.log('--- TESTING CATEGORY + SEARCH COMBINATIONS ---');
  
  // Test 1: Fever & Pain + "Dolo"
  const comboQuery1 = {
    active: true,
    category: { $in: ['Fever & Pain', 'Pain Relief', 'Pediatric'] },
    $or: [{ name: /Dolo/i }, { genericName: /Dolo/i }]
  };
  const combo1 = await Medicine.find(comboQuery1);
  console.log(`[COMBO 1] "Fever & Pain" + "Dolo" -> ${combo1.length} found (${combo1.map(m => m.name).join(', ')})`);
  if (combo1.length === 0) allPass = false;

  // Test 2: Cold & Cough + "Inhaler"
  const comboQuery2 = {
    active: true,
    category: { $in: ['Cold & Cough', 'Respiratory'] },
    $or: [{ name: /Inhaler/i }, { genericName: /Inhaler/i }]
  };
  const combo2 = await Medicine.find(comboQuery2);
  console.log(`[COMBO 2] "Cold & Cough" + "Inhaler" -> ${combo2.length} found (${combo2.map(m => m.name).join(', ')})`);
  if (combo2.length === 0) allPass = false;

  // Test 3: Vitamins + "Limcee"
  const comboQuery3 = {
    active: true,
    category: { $in: ['Vitamins & Supplements', 'Vitamins'] },
    $or: [{ name: /Limcee/i }, { genericName: /Limcee/i }]
  };
  const combo3 = await Medicine.find(comboQuery3);
  console.log(`[COMBO 3] "Vitamins & Supplements" + "Limcee" -> ${combo3.length} found (${combo3.map(m => m.name).join(', ')})`);
  if (combo3.length === 0) allPass = false;

  // Test 4: Fever & Pain + "Ciplox" (should be 0 - antibiotics not in fever)
  const comboQuery4 = {
    active: true,
    category: { $in: ['Fever & Pain', 'Pain Relief', 'Pediatric'] },
    $or: [{ name: /Ciplox/i }, { genericName: /Ciplox/i }]
  };
  const combo4 = await Medicine.find(comboQuery4);
  console.log(`[COMBO 4] "Fever & Pain" + "Ciplox" -> ${combo4.length} found (Expected 0 for cross-category query)`);

  if (allPass && combo4.length === 0) {
    console.log('\n🎉 ALL CATEGORY NAVIGATION & SEARCH TESTS PASSED PERFECTLY!');
  } else {
    console.error('\n⚠️ SOME TESTS FAILED.');
  }

  process.exit(0);
}

testCategories().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
