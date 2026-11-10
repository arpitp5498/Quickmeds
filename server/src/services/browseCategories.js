const groups = {
  'Pain & fever': ['Pain & Fever', 'Fever & Pain', 'Pain Relief'],
  'Digestion': ['Digestive', 'Digestive Care', 'Gastrointestinal Care', 'Acidity & Reflux', 'Constipation & Diarrhoea', 'Oral Rehydration & Electrolytes'],
  'First aid & skin care': ['First Aid', 'First Aid & Surgical', 'Wound Care & Antiseptics', 'Dermatological & Skin Care', 'Skin & Personal Care', 'Skin Care'],
  'Cold, allergy & breathing': ['Cold & Cough', 'Respiratory', 'Respiratory & Asthma', 'Allergy & Antihistamines'],
  'Heart & diabetes': ['Cardiac', 'Diabetes', 'Cardiac & Diabetes', 'Diabetes Care', 'Cardiovascular Care'],
  'Vitamins & nutrition': ['Vitamins', 'Vitamins & Supplements', 'Vitamins & Mineral Supplements', 'Bone & Nutritional Support'],
  'Period care & hygiene': ['Women Care', 'Women Care & Hygiene', 'Women Health & Hygiene', 'Menstrual Care', 'Comfort & Relief', 'Hygiene Essentials'],
  'Eye, ear & nasal care': ['Eye, Ear & Nasal Care', 'Eye & Ear Drops'],
  "Children's health": ['Pediatric', 'Pediatric Care']
};

function browseCategories(counts) {
  const remaining = new Set(Object.keys(counts));
  const labels = [];
  for (const [label, categories] of Object.entries(groups)) {
    if (categories.some(name => remaining.has(name))) labels.push(label);
    for (const name of categories) remaining.delete(name);
  }
  return [...labels, ...Array.from(remaining).sort()];
}

module.exports = { groups, browseCategories };
