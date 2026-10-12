/**
 * QuickMeds Initial Starter Promotions Seed Script
 * File: server/src/seed/seedPromotions.js
 * 
 * Sets up modest, compliant promotional discounts on selected eligible OTC
 * and everyday healthcare categories/products.
 */

const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const User = require('../models/User');

const seedPromotions = async () => {
  try {
    const count = await Promotion.countDocuments();
    if (count > 0) {
      console.log(`[Promotions] Database already has ${count} promotions. Skipping seed.`);
      return;
    }

    // Find admin user for createdBy
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      admin = await User.findOne();
    }
    const adminId = admin ? admin._id : new mongoose.Types.ObjectId();

    const now = new Date();
    const oneMonthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const starterPromotions = [
      {
        name: 'Essential Fever & Pain Relief',
        description: 'Special 10% seasonal discount on everyday pain relief and fever essentials.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 30,
        applicableTo: 'CATEGORY',
        categories: ['Pain & Fever', 'Fever & Pain'],
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Active since yesterday
        validTo: oneMonthAhead,
        isActive: true,
        priority: 1,
        createdBy: adminId
      },
      {
        name: 'Daily Hydration & Electrolytes Care',
        description: '12% discount on rehydration salts, energy powders and essential electrolytes.',
        discountType: 'PERCENTAGE',
        discountValue: 12,
        maxDiscountAmount: 25,
        applicableTo: 'CATEGORY',
        categories: ['Oral Rehydration & Electrolytes'],
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        validTo: oneMonthAhead,
        isActive: true,
        priority: 1,
        createdBy: adminId
      },
      {
        name: 'Vitality & Vitamin Supplements',
        description: '15% savings on daily wellness vitamins, B-complex and calcium supplements.',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        maxDiscountAmount: 50,
        applicableTo: 'CATEGORY',
        categories: ['Vitamins & Mineral Supplements', 'Bone & Nutritional Support'],
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        validTo: oneMonthAhead,
        isActive: true,
        priority: 1,
        createdBy: adminId
      },
      {
        name: 'Acidity & Digestive Comfort',
        description: '10% off antacids, digestive gels and heartburn relief essentials.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 30,
        applicableTo: 'CATEGORY',
        categories: ['Acidity & Reflux', 'Gastrointestinal Care'],
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        validTo: oneMonthAhead,
        isActive: true,
        priority: 1,
        createdBy: adminId
      },
      {
        name: 'First Aid & Antiseptic Essentials',
        description: '10% off wound antiseptics, burn care lotions and first aid supplies.',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 30,
        applicableTo: 'CATEGORY',
        categories: ['Wound Care & Antiseptics'],
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        validTo: oneMonthAhead,
        isActive: true,
        priority: 1,
        createdBy: adminId
      },
      {
        name: 'Women Health & Hygiene Essentials',
        description: '15% discount on sanitary protection, intimate washes and cramp relief patches.',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        maxDiscountAmount: 50,
        applicableTo: 'CATEGORY',
        categories: ['Women Health & Hygiene'],
        validFrom: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        validTo: oneMonthAhead,
        isActive: true,
        priority: 1,
        createdBy: adminId
      }
    ];

    await Promotion.insertMany(starterPromotions);
    console.log(`[Promotions] ✅ Seeded ${starterPromotions.length} starter promotions successfully.`);
  } catch (error) {
    console.warn('[Promotions] Error seeding promotions:', error.message);
  }
};

module.exports = seedPromotions;

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedPromotions();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
