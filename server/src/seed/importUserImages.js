const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\arpit\\.gemini\\antigravity\\brain\\8cabef4e-9ef7-43ec-96b1-f84cdf89d73f\\extracted_images';
const destDir = path.join(__dirname, '../../../client/public/medicines');

const fileMap = {
  '02_Crocin_500_Advance_Tablet.png': 'crocin-500-advance-tablet.png',
  '03_Combiflam_Tablet.png': 'combiflam-tablet.png',
  '04_Meftal_Spas_Tablet.png': 'meftal-spas-tablet.png',
  '05_Saridon_Headache_Relief_Tablet.png': 'saridon-headache-relief-tablet.png',
  '06_Volini_Pain_Relief_Gel_50g.png': 'volini-pain-relief-gel.png',
  '07_Calpol_250mg_Paediatric_Suspension_60ml.png': 'calpol-250mg-paediatric-suspension.png',
  '08_Asthalin_100mcg_Inhaler.png': 'asthalin-100mcg-inhaler.png',
  '09_Budecort_200mcg_Inhaler.png': 'budecort-200mcg-inhaler.png',
  '10_Ascoril_D_Plus_Syrup_100ml.png': 'ascoril-d-plus-syrup.png',
  '11_Benadryl_Cough_Formula_Syrup_150ml.png': 'benadryl-cough-formula-syrup.png',
  '12_Otrivin_Oxy_Fast_Relief_Nasal_Spray_10ml.png': 'otrivin-oxy-fast-relief-nasal-spray.png',
  '13_Maxtra_Oral_Drops_15ml.png': 'maxtra-oral-drops.png',
  '14_Pan-D_Capsule.png': 'pan-d-capsule.png',
  '15_Digene_Acidity_Relief_Gel_Mint_200ml.png': 'digene-acidity-relief-gel-mint.png',
  '16_Electral_ORS_Powder_Sachet_21.8g.png': 'electral-ors-powder.png',
  '17_Ondem_Syrup_30ml.png': 'ondem-syrup.png',
  '18_Telma_40mg_Tablet.png': 'telma-40mg-tablet.png',
  '19_Ecosprin_75mg_Tablet.png': 'ecosprin-75mg-tablet.png',
  '20_Sorbitrate_5mg_Sublingual_Tablet.png': 'sorbitrate-5mg-sublingual-tablet.png',
  '21_Atorva_20mg_Tablet.png': 'atorva-20mg-tablet.png',
  '22_Glycomet-GP_1_Tablet.png': 'glycomet-gp-1-tablet.png',
  '23_Janumet_50_500mg_Tablet.png': 'janumet-50mg-500mg-tablet.png',
  '24_Human_Mixtard_30_70_100IU_ml_Injection.png': 'human-mixtard-30-70-injection.png',
  '25_Augmentin_625_Duo_Tablet.png': 'augmentin-625-duo-tablet.png',
  '26_Azithral_500mg_Tablet.png': 'azithral-500mg-tablet.png',
  '27_Ciplox_500mg_Tablet.png': 'ciplox-500mg-tablet.png',
  '28_Taxim-O_200mg_Tablet.png': 'taxim-o-200mg-tablet.png',
  '29_Limcee_500mg_Chewable_Tablet.png': 'limcee-500mg-chewable-tablet.png',
  '30_Shelcal_500_Tablet.png': 'shelcal-500-tablet.png',
  '31_Becosules_Z_Capsule.png': 'becosules-z-capsule.png',
  '32_Betadine_10%_Ointment_20g.png': 'betadine-10-microbicidal-ointment.png',
  '33_Dettol_Antiseptic_Liquid_250ml.png': 'dettol-antiseptic-liquid.png',
  '34_Hansaplast_Regular_Bandage_Strips_20.png': 'hansaplast-regular-bandage-strips.png',
  '35_Whisper_Ultra_Clean_XL_30_Pads.png': 'whisper-ultra-clean-sanitary-pads.png',
  '36_VWash_Plus_Intimate_Wash_200ml.png': 'vwash-plus-intimate-hygiene-wash.png'
};

let copied = 0;
for (const [srcName, destName] of Object.entries(fileMap)) {
  const srcFile = path.join(srcDir, srcName);
  const destFile = path.join(destDir, destName);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    copied++;
    console.log(`Copied: ${srcName} -> ${destName}`);
  } else {
    console.warn(`Source file not found: ${srcFile}`);
  }
}

console.log(`\nSuccessfully copied ${copied} user-supplied medicine images to ${destDir}!`);
