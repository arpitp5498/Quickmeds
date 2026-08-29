const fs = require('fs');
const path = require('path');

const seedFilePath = path.join(__dirname, 'seedData.js');
let content = fs.readFileSync(seedFilePath, 'utf8');

// Update category names
const categoryUpdates = [
  // Cardiac -> Cardiac & Diabetes
  { from: /category:\s*['"]Cardiac['"]/g, to: "category: 'Cardiac & Diabetes'" },
  // Diabetes -> Cardiac & Diabetes
  { from: /category:\s*['"]Diabetes['"]/g, to: "category: 'Cardiac & Diabetes'" },
  // Respiratory -> Cold & Cough
  { from: /category:\s*['"]Respiratory['"]/g, to: "category: 'Cold & Cough'" },
  // Antibiotics -> Antibiotics & Anti-infectives
  { from: /category:\s*['"]Antibiotics['"]/g, to: "category: 'Antibiotics & Anti-infectives'" },
  // Pain Relief -> Fever & Pain
  { from: /category:\s*['"]Pain Relief['"]/g, to: "category: 'Fever & Pain'" },
  // Pediatric -> Fever & Pain for Calpol, Cold & Cough for Maxtra, Digestive Care for Ondem
  // First Aid -> First Aid & Surgical
  { from: /category:\s*['"]First Aid['"]/g, to: "category: 'First Aid & Surgical'" },
  // Women Care -> Women Care & Hygiene
  { from: /category:\s*['"]Women Care['"]/g, to: "category: 'Women Care & Hygiene'" }
];

categoryUpdates.forEach(u => {
  content = content.replace(u.from, u.to);
});

// Specific fixes for Pediatric items to fit user categories:
// Calpol -> Fever & Pain
content = content.replace(
  /(name:\s*['"]Calpol 250mg Peadiatric Suspension \(60ml\)['"][\s\S]*?category:\s*['"])([^'"]+)(['"])/m,
  "$1Fever & Pain$3"
);
// Maxtra -> Cold & Cough
content = content.replace(
  /(name:\s*['"]Maxtra Oral Drops \(15ml\)['"][\s\S]*?category:\s*['"])([^'"]+)(['"])/m,
  "$1Cold & Cough$3"
);
// Ondem -> Digestive Care
content = content.replace(
  /(name:\s*['"]Ondem Syrup \(30ml\)['"][\s\S]*?category:\s*['"])([^'"]+)(['"])/m,
  "$1Digestive Care$3"
);

// Add Vitamins & Supplements entries if not already present
if (!content.includes('Limcee 500mg Chewable Tablet')) {
  const vitaminEntries = `
  // ==========================================
  // 9. VITAMINS & SUPPLEMENTS
  // ==========================================
  {
    name: 'Limcee 500mg Chewable Tablet',
    genericName: 'Vitamin C / Ascorbic Acid (500mg)',
    brand: 'Limcee',
    manufacturer: 'Abbott Healthcare Pvt Ltd',
    strength: '500mg',
    dosageForm: 'Chewable Tablet',
    category: 'Vitamins & Supplements',
    requiresPrescription: false,
    prescriptionSchedule: 'OTC',
    description: 'Immunity booster and antioxidant vitamin C chewable tablet with orange flavour for daily wellness.',
    usageInstructions: 'Chew 1 tablet daily or as directed by physician.',
    storage: 'Store in a cool dry place below 25°C.',
    sideEffects: 'None reported with standard dosage.',
    mrp: 28.0,
    image: '/medicines/limcee-500mg-chewable-tablet.svg'
  },
  {
    name: 'Shelcal 500 Tablet',
    genericName: 'Calcium (500mg) + Vitamin D3 (250 IU)',
    brand: 'Shelcal',
    manufacturer: 'Torrent Pharmaceuticals Ltd',
    strength: '500mg + 250IU',
    dosageForm: 'Tablet',
    category: 'Vitamins & Supplements',
    requiresPrescription: false,
    prescriptionSchedule: 'OTC',
    description: 'Essential calcium and vitamin D3 supplement for bone strength, joint mobility, and calcium deficiency.',
    usageInstructions: 'Take 1 tablet daily after meals with water.',
    storage: 'Store protected from light and moisture below 30°C.',
    sideEffects: 'Mild constipation if taken without sufficient water.',
    mrp: 135.0,
    image: '/medicines/shelcal-500-tablet.svg'
  },
  {
    name: 'Becosules Z Capsule',
    genericName: 'B-Complex Forte + Vitamin C + Zinc',
    brand: 'Becosules',
    manufacturer: 'Pfizer Ltd',
    strength: 'Standard Forte',
    dosageForm: 'Capsule',
    category: 'Vitamins & Supplements',
    requiresPrescription: false,
    prescriptionSchedule: 'OTC',
    description: 'Therapeutic vitamin B-complex with zinc and vitamin C for tissue repair, mouth ulcers, and energy vitality.',
    usageInstructions: 'Take 1 capsule daily after breakfast.',
    storage: 'Store in a dry place below 25°C.',
    sideEffects: 'Mild bright yellow discoloration of urine (harmless B2 excretion).',
    mrp: 52.0,
    image: '/medicines/becosules-z-capsule.svg'
  },
`;

  // Insert before pharmaciesData definition
  content = content.replace(/(const pharmaciesData = \[)/, `${vitaminEntries}\n$1`);
}

fs.writeFileSync(seedFilePath, content, 'utf8');
console.log('Successfully updated seedData.js with standard categories and Vitamins!');
