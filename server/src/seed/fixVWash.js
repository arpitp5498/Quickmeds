const fs = require('fs');
const path = require('path');

const seedFilePath = path.join(__dirname, 'seedData.js');
let { medicinesData, pharmaciesData } = require('./seedData');

const vwash = medicinesData.find(m => m.name.includes('VWash'));
if (vwash) vwash.category = 'Women Care & Hygiene';

const fileHeader = `/**
 * QuickMeds Master Seed Dataset
 * File: server/src/seed/seedData.js
 */

const medicinesData = ${JSON.stringify(medicinesData, null, 2)};

const pharmaciesData = ${JSON.stringify(pharmaciesData, null, 2)};

module.exports = {
  medicinesData,
  pharmaciesData
};
`;

fs.writeFileSync(seedFilePath, fileHeader, 'utf8');
console.log('Fixed VWash category successfully!');
