const fs = require('fs');
const path = require('path');

const seedFilePath = path.join(__dirname, 'seedData.js');
const { medicinesData, pharmaciesData } = require('./seedData');

// Deduplicate medicines by name
const uniqueMedicines = [];
const seenNames = new Set();
for (const med of medicinesData) {
  if (!seenNames.has(med.name)) {
    seenNames.add(med.name);
    uniqueMedicines.push(med);
  }
}

console.log('Unique medicines count:', uniqueMedicines.length);

const fileHeader = `/**
 * QuickMeds Master Seed Dataset
 * File: server/src/seed/seedData.js
 * Comprehensive mock dataset with 36 essential & emergency medicines
 * and 7 verified hyperlocal pharmacies in Delhi NCR.
 */

const medicinesData = ${JSON.stringify(uniqueMedicines, null, 2)};

const pharmaciesData = ${JSON.stringify(pharmaciesData, null, 2)};

module.exports = {
  medicinesData,
  pharmaciesData
};
`;

fs.writeFileSync(seedFilePath, fileHeader, 'utf8');
console.log('Successfully formatted and deduplicated seedData.js with 36 unique medicines!');
