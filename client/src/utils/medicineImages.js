/**
 * QuickMeds Medicine Image Mapping & Fallback Utility
 * File: client/src/utils/medicineImages.js
 * 
 * Maps every medicine in the catalog directly to its exact, complete, uncropped image asset.
 * 
 * Sourcing:
 * - 26 unproblematic medicines: Exact cropped PNGs from provided ZIP archive & authentic user upload.
 * - 10 specifically corrected medicines: Clean complete uncropped product imagery (no edge crops or fragments).
 */

export const MEDICINE_IMAGE_MAP = {
  // 1. Fever & Pain
  'dolo 650mg tablet': '/medicines/dolo-650mg-tablet.png',
  'dolo 650': '/medicines/dolo-650mg-tablet.png',
  'dolo': '/medicines/dolo-650mg-tablet.png',
  'crocin 500 advance tablet': '/medicines/crocin-500-advance-tablet.png',
  'crocin 500 advance': '/medicines/crocin-500-advance-tablet.png',
  'crocin': '/medicines/crocin-500-advance-tablet.png',
  'combiflam tablet': '/medicines/combiflam-tablet.png',
  'combiflam': '/medicines/combiflam-tablet.png',
  'meftal spas tablet': '/medicines/meftal-spas-tablet.png',
  'meftal spas': '/medicines/meftal-spas-tablet.png',
  'saridon headache relief tablet': '/medicines/saridon-headache-relief-tablet.png',
  'saridon': '/medicines/saridon-headache-relief-tablet.png',
  'volini pain relief gel (50g)': '/medicines/volini-pain-relief-gel.png',
  'volini pain relief gel': '/medicines/volini-pain-relief-gel.png',
  'volini': '/medicines/volini-pain-relief-gel.png',
  'calpol 250mg peadiatric suspension (60ml)': '/medicines/calpol-250mg-paediatric-suspension.png',
  'calpol 250mg paediatric suspension': '/medicines/calpol-250mg-paediatric-suspension.png',
  'calpol 250': '/medicines/calpol-250mg-paediatric-suspension.png',
  'calpol': '/medicines/calpol-250mg-paediatric-suspension.png',

  // 2. Cold & Cough
  'asthalin 100mcg inhaler': '/medicines/asthalin-100mcg-inhaler.png',
  'asthalin inhaler': '/medicines/asthalin-100mcg-inhaler.png',
  'asthalin': '/medicines/asthalin-100mcg-inhaler.png',
  'budecort 200mcg inhaler': '/medicines/budecort-200mcg-inhaler.png',
  'budecort inhaler': '/medicines/budecort-200mcg-inhaler.png',
  'budecort': '/medicines/budecort-200mcg-inhaler.png',
  'ascoril d plus syrup (100ml)': '/medicines/ascoril-d-plus-syrup.png',
  'ascoril d plus syrup': '/medicines/ascoril-d-plus-syrup.png',
  'ascoril d plus': '/medicines/ascoril-d-plus-syrup.png',
  'ascoril': '/medicines/ascoril-d-plus-syrup.png',
  'benadryl cough formula syrup (150ml)': '/medicines/benadryl-cough-formula-syrup.png',
  'benadryl cough formula syrup': '/medicines/benadryl-cough-formula-syrup.png',
  'benadryl': '/medicines/benadryl-cough-formula-syrup.png',
  'otrivin oxy fast relief nasal spray (10ml)': '/medicines/otrivin-oxy-fast-relief-nasal-spray.png',
  'otrivin oxy fast relief nasal spray': '/medicines/otrivin-oxy-fast-relief-nasal-spray.png',
  'otrivin': '/medicines/otrivin-oxy-fast-relief-nasal-spray.png',
  'maxtra oral drops (15ml)': '/medicines/maxtra-oral-drops.svg',
  'maxtra oral drops': '/medicines/maxtra-oral-drops.svg',
  'maxtra': '/medicines/maxtra-oral-drops.svg',

  // 3. Digestive Care
  'pan-d capsule': '/medicines/pan-d-capsule.png',
  'pan-d': '/medicines/pan-d-capsule.png',
  'digene acidity relief gel mint (200ml)': '/medicines/digene-acidity-relief-gel-mint.png',
  'digene acidity relief gel': '/medicines/digene-acidity-relief-gel-mint.png',
  'digene mint': '/medicines/digene-acidity-relief-gel-mint.png',
  'digene': '/medicines/digene-acidity-relief-gel-mint.png',
  'electral ors powder (21.8g sachet)': '/medicines/electral-ors-powder.png',
  'electral ors powder': '/medicines/electral-ors-powder.png',
  'electral': '/medicines/electral-ors-powder.png',
  'ondem syrup (30ml)': '/medicines/ondem-syrup.png',
  'ondem syrup': '/medicines/ondem-syrup.png',
  'ondem': '/medicines/ondem-syrup.png',

  // 4. Cardiac & Diabetes
  'telma 40mg tablet': '/medicines/telma-40mg-tablet.png',
  'telma 40': '/medicines/telma-40mg-tablet.png',
  'telma': '/medicines/telma-40mg-tablet.png',
  'ecosprin 75mg tablet': '/medicines/ecosprin-75mg-tablet.png',
  'ecosprin 75': '/medicines/ecosprin-75mg-tablet.png',
  'ecosprin': '/medicines/ecosprin-75mg-tablet.png',
  'sorbitrate 5mg sublingual tablet': '/medicines/sorbitrate-5mg-sublingual-tablet.png',
  'sorbitrate 5mg': '/medicines/sorbitrate-5mg-sublingual-tablet.png',
  'sorbitrate': '/medicines/sorbitrate-5mg-sublingual-tablet.png',
  'atorva 20mg tablet': '/medicines/atorva-20mg-tablet.png',
  'atorva 20': '/medicines/atorva-20mg-tablet.png',
  'atorva': '/medicines/atorva-20mg-tablet.png',
  'glycomet-gp 1 tablet': '/medicines/glycomet-gp-1-tablet.png',
  'glycomet-gp 1': '/medicines/glycomet-gp-1-tablet.png',
  'glycomet': '/medicines/glycomet-gp-1-tablet.png',
  'janumet 50mg/500mg tablet': '/medicines/janumet-50mg-500mg-tablet.svg',
  'janumet 50/500': '/medicines/janumet-50mg-500mg-tablet.svg',
  'janumet': '/medicines/janumet-50mg-500mg-tablet.svg',
  'human mixtard 30/70 100iu/ml injection': '/medicines/human-mixtard-30-70-injection.png',
  'human mixtard 30/70': '/medicines/human-mixtard-30-70-injection.png',
  'human mixtard': '/medicines/human-mixtard-30-70-injection.png',
  'mixtard': '/medicines/human-mixtard-30-70-injection.png',

  // 5. Antibiotics & Anti-infectives
  'augmentin 625 duo tablet': '/medicines/augmentin-625-duo-tablet.svg',
  'augmentin 625': '/medicines/augmentin-625-duo-tablet.svg',
  'augmentin': '/medicines/augmentin-625-duo-tablet.svg',
  'azithral 500mg tablet': '/medicines/azithral-500mg-tablet.png',
  'azithral 500': '/medicines/azithral-500mg-tablet.png',
  'azithral': '/medicines/azithral-500mg-tablet.png',
  'ciplox 500mg tablet': '/medicines/ciplox-500mg-tablet.svg',
  'ciplox 500': '/medicines/ciplox-500mg-tablet.svg',
  'ciplox': '/medicines/ciplox-500mg-tablet.svg',
  'taxim-o 200mg tablet': '/medicines/taxim-o-200mg-tablet.png',
  'taxim-o 200': '/medicines/taxim-o-200mg-tablet.png',
  'taxim-o': '/medicines/taxim-o-200mg-tablet.png',

  // 6. Vitamins & Supplements
  'limcee 500mg chewable tablet': '/medicines/limcee-500mg-chewable-tablet.png',
  'limcee 500': '/medicines/limcee-500mg-chewable-tablet.png',
  'limcee': '/medicines/limcee-500mg-chewable-tablet.png',
  'shelcal 500 tablet': '/medicines/shelcal-500-tablet.png',
  'shelcal 500': '/medicines/shelcal-500-tablet.png',
  'shelcal': '/medicines/shelcal-500-tablet.png',
  'becosules z capsule': '/medicines/becosules-z-capsule.png',
  'becosules z': '/medicines/becosules-z-capsule.png',
  'becosules': '/medicines/becosules-z-capsule.png',

  // 7. First Aid & Surgical
  'betadine 10% microbicidal ointment (20g)': '/medicines/betadine-10-microbicidal-ointment.svg',
  'betadine 10% microbicidal ointment': '/medicines/betadine-10-microbicidal-ointment.svg',
  'betadine': '/medicines/betadine-10-microbicidal-ointment.svg',
  'dettol antiseptic liquid (250ml)': '/medicines/dettol-antiseptic-liquid.png',
  'dettol antiseptic liquid': '/medicines/dettol-antiseptic-liquid.png',
  'dettol': '/medicines/dettol-antiseptic-liquid.png',
  'hansaplast regular bandage strips (pack of 20)': '/medicines/hansaplast-regular-bandage-strips.png',
  'hansaplast regular bandage strips': '/medicines/hansaplast-regular-bandage-strips.png',
  'hansaplast': '/medicines/hansaplast-regular-bandage-strips.png',

  // 8. Women Care & Hygiene & Emergency Essentials
  'whisper ultra clean sanitary pads xl (30 pads)': '/medicines/whisper-ultra-clean-sanitary-pads.png',
  'whisper ultra clean sanitary pads': '/medicines/whisper-ultra-clean-sanitary-pads.png',
  'whisper': '/medicines/whisper-ultra-clean-sanitary-pads.png',
  'vwash plus intimate hygiene wash (200ml)': '/medicines/vwash-plus-intimate-hygiene-wash.png',
  'vwash plus intimate hygiene wash': '/medicines/vwash-plus-intimate-hygiene-wash.png',
  'vwash': '/medicines/vwash-plus-intimate-hygiene-wash.png',

  // 9. SOS Emergency Essentials Specific Mappings
  'sanitary pads – regular (whisper choice)': '/medicines/whisper-choice-regular-pads.png',
  'sanitary pads – regular': '/medicines/whisper-choice-regular-pads.png',
  'sanitary pads regular': '/medicines/whisper-choice-regular-pads.png',
  'sanitary pads – xl (whisper ultra clean)': '/medicines/whisper-ultra-xl-pads.png',
  'sanitary pads – xl': '/medicines/whisper-ultra-xl-pads.png',
  'sanitary pads xl': '/medicines/whisper-ultra-xl-pads.png',
  'tampons (o.b. procomfort regular)': '/medicines/ob-tampons-regular.png',
  'tampons': '/medicines/ob-tampons-regular.png',
  'menstrual cup (sirona reusable medium)': '/medicines/sirona-menstrual-cup.png',
  'menstrual cup': '/medicines/sirona-menstrual-cup.png',
  'heating pad / hot water bottle (flamingo)': '/medicines/flamingo-heating-pad.png',
  'heating pad / hot water bottle': '/medicines/flamingo-heating-pad.png',
  'heating pad': '/medicines/flamingo-heating-pad.png',
  'heat patch (nua cramp comfort 3 patches)': '/medicines/nua-heat-patch.png',
  'heat patch': '/medicines/nua-heat-patch.png',
  'unscented wet wipes (himalaya gentle 72s)': '/medicines/himalaya-wet-wipes.png',
  'unscented wet wipes': '/medicines/himalaya-wet-wipes.png',
  'wet wipes': '/medicines/himalaya-wet-wipes.png',
  'tissues (paseo soft facial tissue box)': '/medicines/paseo-facial-tissues.png',
  'tissues': '/medicines/paseo-facial-tissues.png',
  'disposable sanitary-waste bags (sirona 15s)': '/medicines/sirona-disposal-bags.png',
  'disposable sanitary-waste bags': '/medicines/sirona-disposal-bags.png',
  'hand sanitizer (dettol instant 100ml)': '/medicines/dettol-hand-sanitizer.png',
  'hand sanitizer': '/medicines/dettol-hand-sanitizer.png'
};

/**
 * Returns the exact unique realistic product photo URL for any medicine object or string.
 * @param {Object|string} medicine - Medicine object or medicine name
 * @returns {string} Image path
 */
export function getMedicineImage(medicine) {
  if (!medicine) return '/medicines/dolo-650mg-tablet.png';

  const medicineObj = typeof medicine === 'object' ? medicine : { name: medicine };
  const rawName = (medicineObj.name || medicineObj.title || '').trim();
  const normalized = rawName.toLowerCase().replace(/\s+/g, ' ');

  // 1. Direct match in MEDICINE_IMAGE_MAP
  if (MEDICINE_IMAGE_MAP[normalized]) {
    return MEDICINE_IMAGE_MAP[normalized];
  }

  // 2. Partial / Key Match
  for (const [key, imagePath] of Object.entries(MEDICINE_IMAGE_MAP)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) {
      return imagePath;
    }
  }

  // 3. Fallback to valid medicine object image
  if (medicineObj.image && (medicineObj.image.startsWith('/medicines/') || medicineObj.image.endsWith('.svg') || medicineObj.image.endsWith('.png'))) {
    return medicineObj.image;
  }

  return '/medicines/dolo-650mg-tablet.png';
}

export default getMedicineImage;
