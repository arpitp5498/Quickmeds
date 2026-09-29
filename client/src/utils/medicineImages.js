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
  'hand sanitizer': '/medicines/dettol-hand-sanitizer.png',

  // 10. Additional Tablets & Capsules
  'allegra 120mg tablet': '/medicines/allegra-120mg-tablet.svg',
  'allegra 120mg': '/medicines/allegra-120mg-tablet.svg',
  'allegra 120': '/medicines/allegra-120mg-tablet.svg',
  'allegra': '/medicines/allegra-120mg-tablet.svg',

  'amlong 5mg tablet': '/medicines/amlong-5mg-tablet.svg',
  'amlong 5mg': '/medicines/amlong-5mg-tablet.svg',
  'amlong': '/medicines/amlong-5mg-tablet.svg',

  'avil 25mg tablet': '/medicines/avil-25mg-tablet.svg',
  'avil 25mg': '/medicines/avil-25mg-tablet.svg',
  'avil': '/medicines/avil-25mg-tablet.svg',

  'brufen 400mg tablet': '/medicines/brufen-400mg-tablet.svg',
  'brufen 400mg': '/medicines/brufen-400mg-tablet.svg',
  'brufen 400': '/medicines/brufen-400mg-tablet.svg',
  'brufen': '/medicines/brufen-400mg-tablet.svg',

  'calpol 650mg tablet': '/medicines/calpol-650mg-tablet.svg',
  'calpol 650mg': '/medicines/calpol-650mg-tablet.svg',
  'calpol 650': '/medicines/calpol-650mg-tablet.svg',

  'cardace 5mg tablet': '/medicines/cardace-5mg-tablet.svg',
  'cardace 5mg': '/medicines/cardace-5mg-tablet.svg',
  'cardace': '/medicines/cardace-5mg-tablet.svg',

  'cartigen 1500mg tablet': '/medicines/cartigen-1500mg-tablet.svg',
  'cartigen 1500mg': '/medicines/cartigen-1500mg-tablet.svg',
  'cartigen 1500': '/medicines/cartigen-1500mg-tablet.svg',
  'cartigen': '/medicines/cartigen-1500mg-tablet.svg',

  'cetzine 10mg tablet': '/medicines/cetzine-10mg-tablet.svg',
  'cetzine 10mg': '/medicines/cetzine-10mg-tablet.svg',
  'cetzine': '/medicines/cetzine-10mg-tablet.svg',

  'deplatt 75mg tablet': '/medicines/deplatt-75mg-tablet.svg',
  'deplatt 75mg': '/medicines/deplatt-75mg-tablet.svg',
  'deplatt 75': '/medicines/deplatt-75mg-tablet.svg',
  'deplatt': '/medicines/deplatt-75mg-tablet.svg',

  'drotin ds 80mg tablet': '/medicines/drotin-ds-80mg-tablet.svg',
  'drotin ds 80mg': '/medicines/drotin-ds-80mg-tablet.svg',
  'drotin ds': '/medicines/drotin-ds-80mg-tablet.svg',
  'drotin': '/medicines/drotin-ds-80mg-tablet.svg',

  'dulcolax 5mg tablet': '/medicines/dulcolax-5mg-tablet.svg',
  'dulcolax 5mg': '/medicines/dulcolax-5mg-tablet.svg',
  'dulcolax': '/medicines/dulcolax-5mg-tablet.svg',

  'flagyl 400mg tablet': '/medicines/flagyl-400mg-tablet.svg',
  'flagyl 400mg': '/medicines/flagyl-400mg-tablet.svg',
  'flagyl 400': '/medicines/flagyl-400mg-tablet.svg',
  'flagyl': '/medicines/flagyl-400mg-tablet.svg',

  'folvite 5mg tablet': '/medicines/folvite-5mg-tablet.svg',
  'folvite 5mg': '/medicines/folvite-5mg-tablet.svg',
  'folvite': '/medicines/folvite-5mg-tablet.svg',

  'glycomet 500mg sr tablet': '/medicines/glycomet-500mg-sr-tablet.svg',
  'glycomet 500mg sr': '/medicines/glycomet-500mg-sr-tablet.svg',
  'glycomet 500 sr': '/medicines/glycomet-500mg-sr-tablet.svg',
  'glycomet 500': '/medicines/glycomet-500mg-sr-tablet.svg',

  'glycomet-gp 2 tablet': '/medicines/glycomet-gp-2-tablet.svg',
  'glycomet-gp 2': '/medicines/glycomet-gp-2-tablet.svg',
  'glycomet gp 2 tablet': '/medicines/glycomet-gp-2-tablet.svg',
  'glycomet gp 2': '/medicines/glycomet-gp-2-tablet.svg',

  'levocet 5mg tablet': '/medicines/levocet-5mg-tablet.svg',
  'levocet 5mg': '/medicines/levocet-5mg-tablet.svg',
  'levocet': '/medicines/levocet-5mg-tablet.svg',

  'montair-lc tablet': '/medicines/montair-lc-tablet.svg',
  'montair-lc': '/medicines/montair-lc-tablet.svg',
  'montair lc tablet': '/medicines/montair-lc-tablet.svg',
  'montair lc': '/medicines/montair-lc-tablet.svg',
  'montair': '/medicines/montair-lc-tablet.svg',

  'neurobion forte tablet': '/medicines/neurobion-forte-tablet.svg',
  'neurobion forte': '/medicines/neurobion-forte-tablet.svg',
  'neurobion': '/medicines/neurobion-forte-tablet.svg',

  'omez 20mg capsule': '/medicines/omez-20mg-capsule.svg',
  'omez 20mg': '/medicines/omez-20mg-capsule.svg',
  'omez 20': '/medicines/omez-20mg-capsule.svg',
  'omez': '/medicines/omez-20mg-capsule.svg',

  'ondem md 4mg tablet': '/medicines/ondem-md-4mg-tablet.svg',
  'ondem md 4mg': '/medicines/ondem-md-4mg-tablet.svg',
  'ondem md': '/medicines/ondem-md-4mg-tablet.svg',

  // 11. Additional Verified Indian Medicines
  // Tablets
  'orofer-xt tablet': '/medicines/orofer-xt-tablet.svg',
  'orofer-xt': '/medicines/orofer-xt-tablet.svg',
  'orofer xt': '/medicines/orofer-xt-tablet.svg',
  'orofer': '/medicines/orofer-xt-tablet.svg',

  'pan 40mg tablet': '/medicines/pan-40mg-tablet.svg',
  'pan 40mg': '/medicines/pan-40mg-tablet.svg',
  'pan 40': '/medicines/pan-40mg-tablet.svg',

  'razo 20mg tablet': '/medicines/razo-20mg-tablet.svg',
  'razo 20mg': '/medicines/razo-20mg-tablet.svg',
  'razo 20': '/medicines/razo-20mg-tablet.svg',
  'razo': '/medicines/razo-20mg-tablet.svg',

  'rosuvas 10mg tablet': '/medicines/rosuvas-10mg-tablet.svg',
  'rosuvas 10mg': '/medicines/rosuvas-10mg-tablet.svg',
  'rosuvas 10': '/medicines/rosuvas-10mg-tablet.svg',
  'rosuvas': '/medicines/rosuvas-10mg-tablet.svg',

  'telma-am tablet': '/medicines/telma-am-tablet.svg',
  'telma-am': '/medicines/telma-am-tablet.svg',
  'telma am': '/medicines/telma-am-tablet.svg',

  'tenlimac 20mg tablet': '/medicines/tenlimac-20mg-tablet.svg',
  'tenlimac 20mg': '/medicines/tenlimac-20mg-tablet.svg',
  'tenlimac 20': '/medicines/tenlimac-20mg-tablet.svg',
  'tenlimac': '/medicines/tenlimac-20mg-tablet.svg',

  'trapic-mf tablet': '/medicines/trapic-mf-tablet.svg',
  'trapic-mf': '/medicines/trapic-mf-tablet.svg',
  'trapic mf': '/medicines/trapic-mf-tablet.svg',
  'trapic': '/medicines/trapic-mf-tablet.svg',

  'voveran 50mg tablet': '/medicines/voveran-50mg-tablet.svg',
  'voveran 50mg': '/medicines/voveran-50mg-tablet.svg',
  'voveran 50': '/medicines/voveran-50mg-tablet.svg',
  'voveran': '/medicines/voveran-50mg-tablet.svg',

  'zenflox-oz tablet': '/medicines/zenflox-oz-tablet.svg',
  'zenflox-oz': '/medicines/zenflox-oz-tablet.svg',
  'zenflox oz': '/medicines/zenflox-oz-tablet.svg',
  'zenflox': '/medicines/zenflox-oz-tablet.svg',

  'zerodol-p tablet': '/medicines/zerodol-p-tablet.svg',
  'zerodol-p': '/medicines/zerodol-p-tablet.svg',
  'zerodol p': '/medicines/zerodol-p-tablet.svg',
  'zerodol': '/medicines/zerodol-p-tablet.svg',

  'forxiga 10mg tablet': '/medicines/forxiga-10mg-tablet.svg',
  'forxiga 10mg': '/medicines/forxiga-10mg-tablet.svg',
  'forxiga 10': '/medicines/forxiga-10mg-tablet.svg',
  'forxiga': '/medicines/forxiga-10mg-tablet.svg',

  // Capsules & Softgels
  'redotil 100mg capsule': '/medicines/redotil-100mg-capsule.svg',
  'redotil 100mg': '/medicines/redotil-100mg-capsule.svg',
  'redotil 100': '/medicines/redotil-100mg-capsule.svg',
  'redotil': '/medicines/redotil-100mg-capsule.svg',

  'lopamide 2mg capsule': '/medicines/lopamide-2mg-capsule.svg',
  'lopamide 2mg': '/medicines/lopamide-2mg-capsule.svg',
  'lopamide 2': '/medicines/lopamide-2mg-capsule.svg',
  'lopamide': '/medicines/lopamide-2mg-capsule.svg',

  'caldikind plus capsule': '/medicines/caldikind-plus-capsule.svg',
  'caldikind-plus capsule': '/medicines/caldikind-plus-capsule.svg',
  'caldikind-plus tablet': '/medicines/caldikind-plus-capsule.svg',
  'caldikind-plus': '/medicines/caldikind-plus-capsule.svg',
  'caldikind plus': '/medicines/caldikind-plus-capsule.svg',
  'caldikind': '/medicines/caldikind-plus-capsule.svg',

  'uprise-d3 60k softgel capsule': '/medicines/uprise-d3-60k-softgel.svg',
  'uprise-d3 60k softgel': '/medicines/uprise-d3-60k-softgel.svg',
  'uprise-d3 60k capsule': '/medicines/uprise-d3-60k-softgel.svg',
  'uprise-d3 60k': '/medicines/uprise-d3-60k-softgel.svg',
  'uprise d3 60k': '/medicines/uprise-d3-60k-softgel.svg',
  'uprise-d3': '/medicines/uprise-d3-60k-softgel.svg',
  'uprise d3': '/medicines/uprise-d3-60k-softgel.svg',

  // Syrups & Suspensions & Solutions
  'ascoril ls syrup (100ml)': '/medicines/ascoril-ls-syrup.svg',
  'ascoril ls syrup': '/medicines/ascoril-ls-syrup.svg',
  'ascoril ls': '/medicines/ascoril-ls-syrup.svg',

  'augmentin duo dry syrup (30ml)': '/medicines/augmentin-duo-dry-syrup.svg',
  'augmentin duo dry syrup': '/medicines/augmentin-duo-dry-syrup.svg',
  'augmentin duo dry': '/medicines/augmentin-duo-dry-syrup.svg',

  'duphalac oral solution (150ml)': '/medicines/duphalac-oral-solution.svg',
  'duphalac oral solution': '/medicines/duphalac-oral-solution.svg',
  'duphalac 150ml': '/medicines/duphalac-oral-solution.svg',
  'duphalac': '/medicines/duphalac-oral-solution.svg',

  'gelusil mps liquid antacid mint (200ml)': '/medicines/gelusil-mps-liquid.svg',
  'gelusil mps liquid': '/medicines/gelusil-mps-liquid.svg',
  'gelusil mps': '/medicines/gelusil-mps-liquid.svg',
  'gelusil': '/medicines/gelusil-mps-liquid.svg',

  // Powders & Regulators
  'softovac bowel regulator (100g)': '/medicines/softovac-bowel-regulator.svg',
  'softovac bowel regulator': '/medicines/softovac-bowel-regulator.svg',
  'softovac 100g': '/medicines/softovac-bowel-regulator.svg',
  'softovac': '/medicines/softovac-bowel-regulator.svg',

  // 12. Drops, Creams, Sprays, Inhalers, Powders & Essentials (SVGs)
  // Calpol 100mg/ml Infant Drops
  'calpol 100mg/ml infant drops (15ml)': '/medicines/calpol-100mg-infant-drops.svg',
  'calpol 100mg/ml infant drops': '/medicines/calpol-100mg-infant-drops.svg',
  'calpol 100mg infant drops': '/medicines/calpol-100mg-infant-drops.svg',
  'calpol infant drops': '/medicines/calpol-100mg-infant-drops.svg',
  'calpol drops': '/medicines/calpol-100mg-infant-drops.svg',

  // Domstal Baby Oral Drops
  'domstal baby oral drops (30ml)': '/medicines/domstal-baby-oral-drops.svg',
  'domstal baby oral drops': '/medicines/domstal-baby-oral-drops.svg',
  'domstal baby drops': '/medicines/domstal-baby-oral-drops.svg',
  'domstal drops': '/medicines/domstal-baby-oral-drops.svg',
  'domstal': '/medicines/domstal-baby-oral-drops.svg',

  // Nasoclear Paediatric Nasal Drops
  'nasoclear paediatric nasal drops (15ml)': '/medicines/nasoclear-paediatric-drops.svg',
  'nasoclear paediatric nasal drops': '/medicines/nasoclear-paediatric-drops.svg',
  'nasoclear paediatric drops': '/medicines/nasoclear-paediatric-drops.svg',
  'nasoclear drops': '/medicines/nasoclear-paediatric-drops.svg',

  // Nasoclear Saline Nasal Spray
  'nasoclear saline nasal spray (20ml)': '/medicines/nasoclear-saline-nasal-spray.svg',
  'nasoclear saline nasal spray': '/medicines/nasoclear-saline-nasal-spray.svg',
  'nasoclear saline spray': '/medicines/nasoclear-saline-nasal-spray.svg',
  'nasoclear spray': '/medicines/nasoclear-saline-nasal-spray.svg',

  // Ciplox 0.3% Eye/Ear Drops
  'ciplox 0.3% eye/ear drops (10ml)': '/medicines/ciplox-eye-ear-drops.svg',
  'ciplox 0.3% eye/ear drops': '/medicines/ciplox-eye-ear-drops.svg',
  'ciplox eye/ear drops': '/medicines/ciplox-eye-ear-drops.svg',
  'ciplox eye drops': '/medicines/ciplox-eye-ear-drops.svg',
  'ciplox ear drops': '/medicines/ciplox-eye-ear-drops.svg',
  'ciplox drops': '/medicines/ciplox-eye-ear-drops.svg',

  // Clearwax Ear Drops
  'clearwax ear drops (10ml)': '/medicines/clearwax-ear-drops.svg',
  'clearwax ear drops': '/medicines/clearwax-ear-drops.svg',
  'clearwax drops': '/medicines/clearwax-ear-drops.svg',
  'clearwax': '/medicines/clearwax-ear-drops.svg',

  // Refresh Tears 0.5% Eye Drops
  'refresh tears 0.5% eye drops (10ml)': '/medicines/refresh-tears-eye-drops.svg',
  'refresh tears 0.5% eye drops': '/medicines/refresh-tears-eye-drops.svg',
  'refresh tears eye drops': '/medicines/refresh-tears-eye-drops.svg',
  'refresh tears': '/medicines/refresh-tears-eye-drops.svg',

  // Zinconia Oral Solution
  'zinconia oral solution (20mg/5ml)': '/medicines/zinconia-oral-solution.svg',
  'zinconia oral solution': '/medicines/zinconia-oral-solution.svg',
  'zinconia syrup': '/medicines/zinconia-oral-solution.svg',
  'zinconia': '/medicines/zinconia-oral-solution.svg',

  // Candid 1% Cream
  'candid 1% cream (20g)': '/medicines/candid-1-cream.svg',
  'candid 1% cream': '/medicines/candid-1-cream.svg',
  'candid cream': '/medicines/candid-1-cream.svg',

  // Candid Dusting Powder
  'candid dusting powder (100g)': '/medicines/candid-dusting-powder.svg',
  'candid dusting powder': '/medicines/candid-dusting-powder.svg',
  'candid powder': '/medicines/candid-dusting-powder.svg',

  // Fucidin 2% Cream
  'fucidin 2% cream (10g)': '/medicines/fucidin-2-cream.svg',
  'fucidin 2% cream': '/medicines/fucidin-2-cream.svg',
  'fucidin cream': '/medicines/fucidin-2-cream.svg',
  'fucidin': '/medicines/fucidin-2-cream.svg',

  // Permite 5% Cream
  'permite 5% w/w cream (60g)': '/medicines/permite-5-cream.svg',
  'permite 5% cream': '/medicines/permite-5-cream.svg',
  'permite cream': '/medicines/permite-5-cream.svg',
  'permite': '/medicines/permite-5-cream.svg',

  // T-Bact 2% Ointment
  't-bact 2% ointment (5g)': '/medicines/t-bact-2-ointment.svg',
  't-bact 2% ointment': '/medicines/t-bact-2-ointment.svg',
  't-bact ointment': '/medicines/t-bact-2-ointment.svg',
  't-bact': '/medicines/t-bact-2-ointment.svg',

  // Burnol Antiseptic Burn Cream
  'burnol antiseptic burn cream (20g)': '/medicines/burnol-antiseptic-cream.svg',
  'burnol antiseptic burn cream': '/medicines/burnol-antiseptic-cream.svg',
  'burnol burn cream': '/medicines/burnol-antiseptic-cream.svg',
  'burnol cream': '/medicines/burnol-antiseptic-cream.svg',
  'burnol': '/medicines/burnol-antiseptic-cream.svg',

  // Caladryl Calamine Lotion
  'caladryl calamine lotion (120ml)': '/medicines/caladryl-calamine-lotion.svg',
  'caladryl calamine lotion': '/medicines/caladryl-calamine-lotion.svg',
  'caladryl lotion': '/medicines/caladryl-calamine-lotion.svg',
  'caladryl': '/medicines/caladryl-calamine-lotion.svg',

  // Betadine 5% Antiseptic Solution
  'betadine 5% antiseptic solution (100ml)': '/medicines/betadine-5-solution.svg',
  'betadine 5% antiseptic solution': '/medicines/betadine-5-solution.svg',
  'betadine 5% solution': '/medicines/betadine-5-solution.svg',
  'betadine 5%': '/medicines/betadine-5-solution.svg',
  'betadine solution': '/medicines/betadine-5-solution.svg',

  // Sucrafil-O Gel Suspension
  'sucrafil-o gel suspension (200ml)': '/medicines/sucrafil-o-gel.svg',
  'sucrafil-o gel suspension': '/medicines/sucrafil-o-gel.svg',
  'sucrafil-o gel': '/medicines/sucrafil-o-gel.svg',
  'sucrafil-o': '/medicines/sucrafil-o-gel.svg',
  'sucrafil': '/medicines/sucrafil-o-gel.svg',

  // Foracort 200 Inhaler
  'foracort 200 inhaler': '/medicines/foracort-200-inhaler.svg',
  'foracort 200': '/medicines/foracort-200-inhaler.svg',
  'foracort inhaler': '/medicines/foracort-200-inhaler.svg',
  'foracort': '/medicines/foracort-200-inhaler.svg',

  // Digene Chewable Tablet Mint
  'digene chewable tablet mint (strip of 15)': '/medicines/digene-chewable-tablet.svg',
  'digene chewable tablet mint': '/medicines/digene-chewable-tablet.svg',
  'digene chewable tablet': '/medicines/digene-chewable-tablet.svg',
  'digene chewable mint': '/medicines/digene-chewable-tablet.svg',
  'digene chewable': '/medicines/digene-chewable-tablet.svg',

  // Electral Ready-to-Drink ORS Apple
  'electral ready-to-drink ors apple (200ml)': '/medicines/electral-rtd-ors-apple.svg',
  'electral ready-to-drink ors apple': '/medicines/electral-rtd-ors-apple.svg',
  'electral rtd ors apple': '/medicines/electral-rtd-ors-apple.svg',
  'electral apple': '/medicines/electral-rtd-ors-apple.svg',

  // Enerzal Energy Drink Powder Orange
  'enerzal energy drink powder orange (100g)': '/medicines/enerzal-energy-drink.svg',
  'enerzal energy drink powder orange': '/medicines/enerzal-energy-drink.svg',
  'enerzal energy drink powder': '/medicines/enerzal-energy-drink.svg',
  'enerzal energy drink': '/medicines/enerzal-energy-drink.svg',
  'enerzal orange': '/medicines/enerzal-energy-drink.svg',
  'enerzal': '/medicines/enerzal-energy-drink.svg',

  // Eno Fruit Salt Regular
  'eno fruit salt regular (5g sachet)': '/medicines/eno-fruit-salt.svg',
  'eno fruit salt regular': '/medicines/eno-fruit-salt.svg',
  'eno fruit salt': '/medicines/eno-fruit-salt.svg',
  'eno regular': '/medicines/eno-fruit-salt.svg',
  'eno': '/medicines/eno-fruit-salt.svg',

  // Calcirol 60,000 IU Cholecalciferol Sachet
  'calcirol 60,000 iu cholecalciferol sachet': '/medicines/calcirol-60000-sachet.svg',
  'calcirol 60000 iu cholecalciferol sachet': '/medicines/calcirol-60000-sachet.svg',
  'calcirol 60,000 iu sachet': '/medicines/calcirol-60000-sachet.svg',
  'calcirol 60000 iu sachet': '/medicines/calcirol-60000-sachet.svg',
  'calcirol 60000': '/medicines/calcirol-60000-sachet.svg',
  'calcirol sachet': '/medicines/calcirol-60000-sachet.svg',
  'calcirol': '/medicines/calcirol-60000-sachet.svg',

  // Nua Cramp Comfort Heat Patches
  'nua cramp comfort heat patches (3 patches)': '/medicines/nua-cramp-comfort-patches.svg',
  'nua cramp comfort heat patches': '/medicines/nua-cramp-comfort-patches.svg',
  'nua cramp comfort 3 patches': '/medicines/nua-cramp-comfort-patches.svg',
  'nua cramp comfort': '/medicines/nua-cramp-comfort-patches.svg',
  'heat patch (nua cramp comfort 3 patches)': '/medicines/nua-cramp-comfort-patches.svg',
  'nua heat patch': '/medicines/nua-cramp-comfort-patches.svg',
  'nua': '/medicines/nua-cramp-comfort-patches.svg',

  // Whisper Choice Regular Sanitary Pads
  'whisper choice regular sanitary pads (6 pads)': '/medicines/whisper-choice-regular-pads-6.svg',
  'whisper choice regular sanitary pads': '/medicines/whisper-choice-regular-pads-6.svg',
  'whisper choice regular pads (6 pads)': '/medicines/whisper-choice-regular-pads-6.svg',
  'whisper choice regular pads 6': '/medicines/whisper-choice-regular-pads-6.svg',
  'whisper choice regular pads': '/medicines/whisper-choice-regular-pads-6.svg',
  'whisper choice regular': '/medicines/whisper-choice-regular-pads-6.svg',
  'whisper choice': '/medicines/whisper-choice-regular-pads-6.svg',
  'sanitary pads – regular (whisper choice)': '/medicines/whisper-choice-regular-pads-6.svg'
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

  // 2. Partial / Key Match (longest key first to avoid greedy prefix collisions)
  const sortedEntries = Object.entries(MEDICINE_IMAGE_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [key, imagePath] of sortedEntries) {
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
