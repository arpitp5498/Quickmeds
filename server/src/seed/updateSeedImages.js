const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seedData.js');
let content = fs.readFileSync(filePath, 'utf8');

const mapping = {
  'Telma 40mg Tablet': '/medicines/telma-40mg-tablet.jpg',
  'Ecosprin 75mg Tablet': '/medicines/ecosprin-75mg-tablet.jpg',
  'Sorbitrate 5mg Sublingual Tablet': '/medicines/sorbitrate-5mg-sublingual-tablet.jpg',
  'Atorva 20mg Tablet': '/medicines/atorva-20mg-tablet.jpg',
  'Asthalin 100mcg Inhaler': '/medicines/asthalin-100mcg-inhaler.jpg',
  'Budecort 200mcg Inhaler': '/medicines/budecort-200mcg-inhaler.jpg',
  'Ascoril D Plus Syrup (100ml)': '/medicines/ascoril-d-plus-syrup.jpg',
  'Benadryl Cough Formula Syrup (150ml)': '/medicines/benadryl-cough-formula-syrup.jpg',
  'Otrivin Oxy Fast Relief Nasal Spray (10ml)': '/medicines/otrivin-oxy-fast-relief-nasal-spray.svg',
  'Augmentin 625 Duo Tablet': '/medicines/augmentin-625-duo-tablet.svg',
  'Azithral 500mg Tablet': '/medicines/azithral-500mg-tablet.svg',
  'Ciplox 500mg Tablet': '/medicines/ciplox-500mg-tablet.svg',
  'Taxim-O 200mg Tablet': '/medicines/taxim-o-200mg-tablet.svg',
  'Dolo 650mg Tablet': '/medicines/dolo-650mg-tablet.svg',
  'Crocin 500 Advance Tablet': '/medicines/crocin-500-advance-tablet.jpg',
  'Combiflam Tablet': '/medicines/combiflam-tablet.jpg',
  'Meftal Spas Tablet': '/medicines/meftal-spas-tablet.svg',
  'Saridon Headache Relief Tablet': '/medicines/saridon-headache-relief-tablet.svg',
  'Volini Pain Relief Gel (50g)': '/medicines/volini-pain-relief-gel.svg',
  'Glycomet-GP 1 Tablet': '/medicines/glycomet-gp-1-tablet.svg',
  'Janumet 50mg/500mg Tablet': '/medicines/janumet-50mg-500mg-tablet.svg',
  'Human Mixtard 30/70 100IU/ml Injection': '/medicines/human-mixtard-30-70-injection.svg',
  'Calpol 250mg Peadiatric Suspension (60ml)': '/medicines/calpol-250mg-paediatric-suspension.svg',
  'Maxtra Oral Drops (15ml)': '/medicines/maxtra-oral-drops.svg',
  'Ondem Syrup (30ml)': '/medicines/ondem-syrup.jpg',
  'Pan-D Capsule': '/medicines/pan-d-capsule.jpg',
  'Digene Acidity Relief Gel Mint (200ml)': '/medicines/digene-acidity-relief-gel-mint.svg',
  'Electral ORS Powder (21.8g Sachet)': '/medicines/electral-ors-powder.svg',
  'Betadine 10% Microbicidal Ointment (20g)': '/medicines/betadine-10-microbicidal-ointment.svg',
  'Dettol Antiseptic Liquid (250ml)': '/medicines/dettol-antiseptic-liquid.svg',
  'Hansaplast Regular Bandage Strips (Pack of 20)': '/medicines/hansaplast-regular-bandage-strips.svg',
  'Whisper Ultra Clean Sanitary Pads XL (30 Pads)': '/medicines/whisper-ultra-clean-sanitary-pads.svg',
  'VWash Plus Intimate Hygiene Wash (200ml)': '/medicines/vwash-plus-intimate-hygiene-wash.svg'
};

let replacedCount = 0;
for (const [name, imgPath] of Object.entries(mapping)) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(name:\\s*['"]${escapedName}['"][\\s\\S]*?image:\\s*['"])([^'"]+)(['"])`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `$1${imgPath}$3`);
    replacedCount++;
  } else {
    console.warn('Could not match:', name);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully updated seedData.js with ${replacedCount} realistic medicine image paths!`);
