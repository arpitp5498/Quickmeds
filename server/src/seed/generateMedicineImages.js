const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../../client/public/medicines');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 33 Specific visual design generators
const medicineGenerators = {
  'telma-40mg-tablet': {
    name: 'Telma 40mg',
    generic: 'Telmisartan (40mg)',
    category: 'CARDIAC • TABLET',
    brand: 'Glenmark',
    bgGradient: ['#f0f9ff', '#e0f2fe'],
    primaryColor: '#0369a1',
    accentColor: '#f97316',
    svgArt: `
      <!-- Blister Pack 10 Tabs -->
      <rect x="90" y="110" width="220" height="180" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="90" y="110" width="220" height="42" rx="14" fill="#0284c7"/>
      <rect x="90" y="138" width="220" height="14" fill="#0284c7"/>
      <text x="105" y="136" fill="#ffffff" font-size="14" font-weight="bold" font-family="sans-serif">TELMA 40</text>
      <text x="235" y="136" fill="#fed7aa" font-size="10" font-weight="600" font-family="sans-serif">Glenmark</text>
      
      <!-- Blister Cavities -->
      <g fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5">
        <ellipse cx="130" cy="180" rx="20" ry="14"/>
        <ellipse cx="200" cy="180" rx="20" ry="14"/>
        <ellipse cx="270" cy="180" rx="20" ry="14"/>
        <ellipse cx="130" cy="235" rx="20" ry="14"/>
        <ellipse cx="200" cy="235" rx="20" ry="14"/>
        <ellipse cx="270" cy="235" rx="20" ry="14"/>
      </g>
      <!-- Tablet inside cavity -->
      <ellipse cx="130" cy="180" rx="15" ry="10" fill="#f97316"/>
      <ellipse cx="200" cy="180" rx="15" ry="10" fill="#f97316"/>
      <ellipse cx="270" cy="180" rx="15" ry="10" fill="#f97316"/>
      <ellipse cx="130" cy="235" rx="15" ry="10" fill="#f97316"/>
      <ellipse cx="200" cy="235" rx="15" ry="10" fill="#f97316"/>
      <ellipse cx="270" cy="235" rx="15" ry="10" fill="#f97316"/>
    `
  },
  'ecosprin-75mg-tablet': {
    name: 'Ecosprin 75mg',
    generic: 'Aspirin (75mg)',
    category: 'CARDIAC • TABLET',
    brand: 'USV Pvt Ltd',
    bgGradient: ['#fefce8', '#fef08a'],
    primaryColor: '#ca8a04',
    accentColor: '#eab308',
    svgArt: `
      <!-- Foil Strip -->
      <rect x="85" y="100" width="230" height="200" rx="12" fill="#fef9c3" stroke="#eab308" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="100" width="230" height="40" rx="12" fill="#ca8a04"/>
      <rect x="85" y="128" width="230" height="12" fill="#ca8a04"/>
      <text x="100" y="126" fill="#ffffff" font-size="14" font-weight="bold" font-family="sans-serif">ECOSPRIN 75</text>
      <text x="250" y="126" fill="#fef08a" font-size="10" font-weight="bold" font-family="sans-serif">USV</text>
      
      <!-- 14 Mini gastro-resistant tablets -->
      <g fill="#fef08a" stroke="#ca8a04" stroke-width="1.5">
        <circle cx="120" cy="170" r="14"/>
        <circle cx="165" cy="170" r="14"/>
        <circle cx="210" cy="170" r="14"/>
        <circle cx="255" cy="170" r="14"/>
        <circle cx="120" cy="215" r="14"/>
        <circle cx="165" cy="215" r="14"/>
        <circle cx="210" cy="215" r="14"/>
        <circle cx="255" cy="215" r="14"/>
        <circle cx="140" cy="260" r="14"/>
        <circle cx="190" cy="260" r="14"/>
        <circle cx="240" cy="260" r="14"/>
      </g>
      <!-- Tablet sheen -->
      <g fill="#ffffff" opacity="0.6">
        <circle cx="116" cy="166" r="4"/>
        <circle cx="161" cy="166" r="4"/>
        <circle cx="206" cy="166" r="4"/>
        <circle cx="251" cy="166" r="4"/>
      </g>
    `
  },
  'sorbitrate-5mg-sublingual-tablet': {
    name: 'Sorbitrate 5mg',
    generic: 'Isosorbide Dinitrate',
    category: 'CARDIAC • SUBLINGUAL',
    brand: 'Abbott',
    bgGradient: ['#fff1f2', '#ffe4e6'],
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    svgArt: `
      <!-- Amber Glass Medicine Bottle -->
      <rect x="140" y="140" width="120" height="150" rx="20" fill="#78350f" stroke="#451a03" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="160" y="105" width="80" height="35" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Bottle Cap Ribs -->
      <line x1="175" y1="105" x2="175" y2="140" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="190" y1="105" x2="190" y2="140" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="205" y1="105" x2="205" y2="140" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="220" y1="105" x2="220" y2="140" stroke="#cbd5e1" stroke-width="2"/>
      
      <!-- Label -->
      <rect x="145" y="165" width="110" height="95" rx="8" fill="#ffffff"/>
      <rect x="145" y="165" width="110" height="24" rx="8" fill="#e11d48"/>
      <rect x="145" y="180" width="110" height="9" fill="#e11d48"/>
      <text x="155" y="181" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">SORBITRATE</text>
      <text x="160" y="206" fill="#e11d48" font-size="14" font-weight="900" font-family="sans-serif">5 mg</text>
      <text x="155" y="222" fill="#64748b" font-size="8" font-family="sans-serif">Sublingual Tab</text>
      <text x="155" y="244" fill="#0284c7" font-size="8" font-weight="bold" font-family="sans-serif">Abbott</text>
      <!-- Sublingual tablet sample -->
      <circle cx="285" cy="250" r="16" fill="#f8fafc" stroke="#e11d48" stroke-width="2" filter="url(#dropShadow)"/>
      <text x="277" y="254" fill="#e11d48" font-size="9" font-weight="bold" font-family="sans-serif">5</text>
    `
  },
  'atorva-20mg-tablet': {
    name: 'Atorva 20mg',
    generic: 'Atorvastatin (20mg)',
    category: 'CARDIAC • STATIN',
    brand: 'Zydus Healthcare',
    bgGradient: ['#faf5ff', '#f3e8ff'],
    primaryColor: '#7e22ce',
    accentColor: '#a855f7',
    svgArt: `
      <!-- Purple Statin Blister Pack -->
      <rect x="90" y="110" width="220" height="180" rx="14" fill="#ffffff" stroke="#d8b4fe" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="90" y="110" width="220" height="44" rx="14" fill="#7e22ce"/>
      <rect x="90" y="140" width="220" height="14" fill="#7e22ce"/>
      <text x="105" y="136" fill="#ffffff" font-size="14" font-weight="bold" font-family="sans-serif">ATORVA 20</text>
      <text x="245" y="136" fill="#e9d5ff" font-size="10" font-weight="bold" font-family="sans-serif">Zydus</text>
      
      <!-- Oval Tablets -->
      <g fill="#f3e8ff" stroke="#7e22ce" stroke-width="1.5">
        <rect x="110" y="170" width="40" height="22" rx="11"/>
        <rect x="180" y="170" width="40" height="22" rx="11"/>
        <rect x="250" y="170" width="40" height="22" rx="11"/>
        <rect x="110" y="225" width="40" height="22" rx="11"/>
        <rect x="180" y="225" width="40" height="22" rx="11"/>
        <rect x="250" y="225" width="40" height="22" rx="11"/>
      </g>
      <line x1="130" y1="172" x2="130" y2="190" stroke="#7e22ce" stroke-width="1.2"/>
      <line x1="200" y1="172" x2="200" y2="190" stroke="#7e22ce" stroke-width="1.2"/>
      <line x1="270" y1="172" x2="270" y2="190" stroke="#7e22ce" stroke-width="1.2"/>
    `
  },
  'asthalin-100mcg-inhaler': {
    name: 'Asthalin 100mcg',
    generic: 'Salbutamol Inhaler',
    category: 'RESPIRATORY • INHALER',
    brand: 'Cipla Ltd',
    bgGradient: ['#f0fdfa', '#ccfbf1'],
    primaryColor: '#0d9488',
    accentColor: '#06b6d4',
    svgArt: `
      <!-- Sky Blue Asthma Inhaler Body -->
      <path d="M150,90 L210,90 L210,210 L270,210 L270,265 L190,265 C165,265 150,250 150,225 Z" fill="#0284c7" stroke="#0369a1" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Metallic Canister Top -->
      <rect x="155" y="65" width="50" height="35" rx="6" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <rect x="160" y="60" width="40" height="8" rx="3" fill="#94a3b8"/>
      <!-- Dark Blue Mouthpiece Cap -->
      <rect x="235" y="200" width="45" height="70" rx="8" fill="#1e3a8a" stroke="#172554" stroke-width="1.5"/>
      <!-- Label -->
      <text x="160" y="150" fill="#ffffff" font-size="11" font-weight="900" font-family="sans-serif" transform="rotate(-90 160 150)">ASTHALIN</text>
      <text x="180" y="150" fill="#bae6fd" font-size="8" font-family="sans-serif" transform="rotate(-90 180 150)">100 mcg • Cipla</text>
      <!-- Vapor puff -->
      <circle cx="295" cy="235" r="10" fill="#e0f2fe" opacity="0.8"/>
      <circle cx="315" cy="230" r="14" fill="#bae6fd" opacity="0.6"/>
      <circle cx="335" cy="225" r="18" fill="#7dd3fc" opacity="0.4"/>
    `
  },
  'budecort-200mcg-inhaler': {
    name: 'Budecort 200mcg',
    generic: 'Budesonide Inhaler',
    category: 'RESPIRATORY • INHALER',
    brand: 'Cipla Ltd',
    bgGradient: ['#fff7ed', '#ffedd5'],
    primaryColor: '#c2410c',
    accentColor: '#ea580c',
    svgArt: `
      <!-- Terracotta / Brown Steroid Inhaler Body -->
      <path d="M150,90 L210,90 L210,210 L270,210 L270,265 L190,265 C165,265 150,250 150,225 Z" fill="#c2410c" stroke="#9a3412" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Metallic Canister Top -->
      <rect x="155" y="65" width="50" height="35" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="160" y="60" width="40" height="8" rx="3" fill="#cbd5e1"/>
      <!-- Grey Mouthpiece Cap -->
      <rect x="235" y="200" width="45" height="70" rx="8" fill="#475569" stroke="#334155" stroke-width="1.5"/>
      <!-- Label -->
      <text x="160" y="150" fill="#ffffff" font-size="11" font-weight="900" font-family="sans-serif" transform="rotate(-90 160 150)">BUDECORT</text>
      <text x="180" y="150" fill="#fed7aa" font-size="8" font-family="sans-serif" transform="rotate(-90 180 150)">200 mcg • Cipla</text>
      <!-- Gentle puff -->
      <circle cx="295" cy="235" r="10" fill="#fed7aa" opacity="0.8"/>
      <circle cx="315" cy="230" r="14" fill="#ffedd5" opacity="0.6"/>
    `
  },
  'ascoril-d-plus-syrup': {
    name: 'Ascoril D Plus',
    generic: 'Cough Syrup (100ml)',
    category: 'RESPIRATORY • SYRUP',
    brand: 'Glenmark',
    bgGradient: ['#fffbeb', '#fef3c7'],
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    svgArt: `
      <!-- Amber Cough Syrup Bottle -->
      <rect x="135" y="110" width="130" height="190" rx="24" fill="#92400e" stroke="#78350f" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="170" y="70" width="60" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Measurement Cup on top -->
      <path d="M165,65 L235,65 L230,95 L170,95 Z" fill="#e0f2fe" opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="180" y1="80" x2="195" y2="80" stroke="#0284c7" stroke-width="1.5"/>
      <line x1="180" y1="88" x2="200" y2="88" stroke="#0284c7" stroke-width="1.5"/>
      
      <!-- Label -->
      <rect x="145" y="140" width="110" height="135" rx="8" fill="#ffffff"/>
      <rect x="145" y="140" width="110" height="28" rx="8" fill="#d97706"/>
      <rect x="145" y="158" width="110" height="10" fill="#d97706"/>
      <text x="155" y="158" fill="#ffffff" font-size="11" font-weight="900" font-family="sans-serif">ASCORIL D+</text>
      <text x="155" y="185" fill="#d97706" font-size="9" font-weight="bold" font-family="sans-serif">Sugar Free</text>
      <text x="155" y="202" fill="#475569" font-size="8" font-family="sans-serif">Dextromethorphan</text>
      <text x="155" y="215" fill="#475569" font-size="8" font-family="sans-serif">Cough Formula</text>
      <text x="155" y="245" fill="#0284c7" font-size="9" font-weight="bold" font-family="sans-serif">100 ml</text>
    `
  },
  'benadryl-cough-formula-syrup': {
    name: 'Benadryl Syrup',
    generic: 'Diphenhydramine (150ml)',
    category: 'RESPIRATORY • SYRUP',
    brand: 'Johnson & Johnson',
    bgGradient: ['#fef2f2', '#fee2e2'],
    primaryColor: '#dc2626',
    accentColor: '#ef4444',
    svgArt: `
      <!-- Classic Crimson Red Benadryl Bottle -->
      <rect x="130" y="105" width="140" height="195" rx="20" fill="#991b1b" stroke="#7f1d1d" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="165" y="65" width="70" height="45" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      
      <!-- Label with Red banner -->
      <rect x="140" y="135" width="120" height="140" rx="8" fill="#ffffff"/>
      <rect x="140" y="135" width="120" height="34" rx="8" fill="#dc2626"/>
      <rect x="140" y="155" width="120" height="14" fill="#dc2626"/>
      <text x="150" y="157" fill="#ffffff" font-size="13" font-weight="900" font-family="sans-serif">Benadryl</text>
      <text x="150" y="186" fill="#dc2626" font-size="9" font-weight="bold" font-family="sans-serif">COUGH FORMULA</text>
      <text x="150" y="202" fill="#475569" font-size="8" font-family="sans-serif">Relieves Cough &</text>
      <text x="150" y="214" fill="#475569" font-size="8" font-family="sans-serif">Sore Throat</text>
      <text x="150" y="245" fill="#dc2626" font-size="10" font-weight="bold" font-family="sans-serif">150 ml</text>
      <text x="215" y="260" fill="#64748b" font-size="7" font-family="sans-serif">J&J</text>
    `
  },
  'otrivin-oxy-fast-relief-nasal-spray': {
    name: 'Otrivin Oxy Spray',
    generic: 'Oxymetazoline (0.05%)',
    category: 'RESPIRATORY • NASAL SPRAY',
    brand: 'Otrivin / Haleon',
    bgGradient: ['#f0f9ff', '#e0f2fe'],
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    svgArt: `
      <!-- Nasal Spray Pump Bottle -->
      <rect x="150" y="150" width="100" height="140" rx="16" fill="#f8fafc" stroke="#0284c7" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Ergonomic Flange Pump -->
      <path d="M170,150 L170,120 L135,115 L135,105 L265,105 L265,115 L230,120 L230,150 Z" fill="#0284c7"/>
      <!-- Nozzle Tip -->
      <path d="M185,105 L185,65 L215,65 L215,105 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Protective Cap -->
      <rect x="180" y="55" width="40" height="50" rx="6" fill="#38bdf8" opacity="0.4" stroke="#0284c7" stroke-width="1"/>
      
      <!-- Label -->
      <text x="160" y="195" fill="#0369a1" font-size="14" font-weight="900" font-family="sans-serif">OTRIVIN</text>
      <text x="160" y="215" fill="#ea580c" font-size="10" font-weight="bold" font-family="sans-serif">OXY 25 SEC</text>
      <text x="160" y="235" fill="#64748b" font-size="8" font-family="sans-serif">Fast Relief 10ml</text>
      <!-- Spray mist -->
      <circle cx="200" cy="40" r="3" fill="#38bdf8"/>
      <circle cx="190" cy="30" r="4" fill="#38bdf8" opacity="0.6"/>
      <circle cx="210" cy="28" r="4" fill="#38bdf8" opacity="0.6"/>
    `
  },
  'augmentin-625-duo-tablet': {
    name: 'Augmentin 625',
    generic: 'Amoxyclav (625mg)',
    category: 'ANTIBIOTIC • TABLET',
    brand: 'GSK',
    bgGradient: ['#fefce8', '#fef9c3'],
    primaryColor: '#ca8a04',
    accentColor: '#eab308',
    svgArt: `
      <!-- Duo Blister Strip -->
      <rect x="80" y="100" width="240" height="200" rx="14" fill="#ffffff" stroke="#eab308" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="80" y="100" width="240" height="42" rx="14" fill="#ca8a04"/>
      <rect x="80" y="128" width="240" height="14" fill="#ca8a04"/>
      <text x="95" y="128" fill="#ffffff" font-size="13" font-weight="900" font-family="sans-serif">AUGMENTIN 625 DUO</text>
      <text x="270" y="128" fill="#fef08a" font-size="10" font-weight="bold" font-family="sans-serif">GSK</text>
      
      <!-- 6 Large antibiotic caplets -->
      <g fill="#fef08a" stroke="#ca8a04" stroke-width="2">
        <rect x="110" y="160" width="75" height="32" rx="16"/>
        <rect x="215" y="160" width="75" height="32" rx="16"/>
        <rect x="110" y="210" width="75" height="32" rx="16"/>
        <rect x="215" y="210" width="75" height="32" rx="16"/>
        <rect x="110" y="255" width="75" height="32" rx="16"/>
        <rect x="215" y="255" width="75" height="32" rx="16"/>
      </g>
      <!-- Score lines -->
      <line x1="147" y1="160" x2="147" y2="192" stroke="#ca8a04" stroke-width="1.5"/>
      <line x1="252" y1="160" x2="252" y2="192" stroke="#ca8a04" stroke-width="1.5"/>
    `
  },
  'azithral-500mg-tablet': {
    name: 'Azithral 500mg',
    generic: 'Azithromycin (500mg)',
    category: 'ANTIBIOTIC • TABLET',
    brand: 'Alembic',
    bgGradient: ['#fff1f2', '#ffe4e6'],
    primaryColor: '#be123c',
    accentColor: '#f43f5e',
    svgArt: `
      <!-- Red 3-Tab Acute Blister Strip -->
      <rect x="95" y="100" width="210" height="200" rx="14" fill="#ffffff" stroke="#f43f5e" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="95" y="100" width="210" height="42" rx="14" fill="#be123c"/>
      <rect x="95" y="128" width="210" height="14" fill="#be123c"/>
      <text x="110" y="128" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">AZITHRAL 500</text>
      <text x="240" y="128" fill="#fecdd3" font-size="10" font-weight="bold" font-family="sans-serif">Alembic</text>
      
      <!-- 3 Distinct Large Caplets (3 Day Course) -->
      <g fill="#ffe4e6" stroke="#be123c" stroke-width="2">
        <rect x="120" y="160" width="160" height="34" rx="17"/>
        <rect x="120" y="205" width="160" height="34" rx="17"/>
        <rect x="120" y="250" width="160" height="34" rx="17"/>
      </g>
      <text x="175" y="182" fill="#9f1239" font-size="11" font-weight="bold" font-family="sans-serif">DAY 1</text>
      <text x="175" y="227" fill="#9f1239" font-size="11" font-weight="bold" font-family="sans-serif">DAY 2</text>
      <text x="175" y="272" fill="#9f1239" font-size="11" font-weight="bold" font-family="sans-serif">DAY 3</text>
    `
  },
  'ciplox-500mg-tablet': {
    name: 'Ciplox 500mg',
    generic: 'Ciprofloxacin (500mg)',
    category: 'ANTIBIOTIC • TABLET',
    brand: 'Cipla Ltd',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    primaryColor: '#15803d',
    accentColor: '#22c55e',
    svgArt: `
      <!-- Green/White Antibiotic Strip -->
      <rect x="90" y="105" width="220" height="190" rx="14" fill="#ffffff" stroke="#22c55e" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="90" y="105" width="220" height="40" rx="14" fill="#15803d"/>
      <rect x="90" y="132" width="220" height="13" fill="#15803d"/>
      <text x="105" y="132" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">CIPLOX 500</text>
      <text x="245" y="132" fill="#bbf7d0" font-size="10" font-weight="bold" font-family="sans-serif">Cipla</text>
      
      <!-- 10 Round Tablets -->
      <g fill="#dcfce7" stroke="#15803d" stroke-width="1.8">
        <circle cx="130" cy="175" r="18"/>
        <circle cx="200" cy="175" r="18"/>
        <circle cx="270" cy="175" r="18"/>
        <circle cx="130" cy="225" r="18"/>
        <circle cx="200" cy="225" r="18"/>
        <circle cx="270" cy="225" r="18"/>
        <circle cx="130" cy="270" r="14"/>
        <circle cx="200" cy="270" r="14"/>
        <circle cx="270" cy="270" r="14"/>
      </g>
    `
  },
  'taxim-o-200mg-tablet': {
    name: 'Taxim-O 200mg',
    generic: 'Cefixime (200mg)',
    category: 'ANTIBIOTIC • TABLET',
    brand: 'Alkem',
    bgGradient: ['#ecfeff', '#cffafe'],
    primaryColor: '#0e7490',
    accentColor: '#06b6d4',
    svgArt: `
      <!-- Teal Foil Strip -->
      <rect x="90" y="110" width="220" height="180" rx="14" fill="#ffffff" stroke="#06b6d4" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="90" y="110" width="220" height="42" rx="14" fill="#0e7490"/>
      <rect x="90" y="138" width="220" height="14" fill="#0e7490"/>
      <text x="105" y="136" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">TAXIM-O 200</text>
      <text x="245" y="136" fill="#cffafe" font-size="10" font-weight="bold" font-family="sans-serif">Alkem</text>
      
      <!-- Film coated tablets -->
      <g fill="#cffafe" stroke="#0e7490" stroke-width="1.5">
        <rect x="110" y="170" width="42" height="24" rx="12"/>
        <rect x="180" y="170" width="42" height="24" rx="12"/>
        <rect x="250" y="170" width="42" height="24" rx="12"/>
        <rect x="110" y="225" width="42" height="24" rx="12"/>
        <rect x="180" y="225" width="42" height="24" rx="12"/>
        <rect x="250" y="225" width="42" height="24" rx="12"/>
      </g>
    `
  },
  'dolo-650mg-tablet': {
    name: 'Dolo 650mg',
    generic: 'Paracetamol (650mg)',
    category: 'FEVER & PAIN • TABLET',
    brand: 'Micro Labs',
    bgGradient: ['#f0fdf4', '#bbf7d0'],
    primaryColor: '#16a34a',
    accentColor: '#22c55e',
    svgArt: `
      <!-- Iconic Green Dolo 650 Blister Pack -->
      <rect x="80" y="95" width="240" height="210" rx="14" fill="#15803d" stroke="#166534" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="100" width="230" height="42" rx="10" fill="#166534"/>
      <text x="100" y="128" fill="#ffffff" font-size="18" font-weight="900" font-family="sans-serif">Dolo 650</text>
      <text x="235" y="128" fill="#86efac" font-size="10" font-weight="bold" font-family="sans-serif">MICRO LABS</text>
      
      <!-- 15 Oval Paracetamol Tablets with Silver Cavity -->
      <g fill="#ffffff" stroke="#14532d" stroke-width="1.5">
        <rect x="100" y="155" width="55" height="24" rx="12"/>
        <rect x="172" y="155" width="55" height="24" rx="12"/>
        <rect x="245" y="155" width="55" height="24" rx="12"/>
        <rect x="100" y="195" width="55" height="24" rx="12"/>
        <rect x="172" y="195" width="55" height="24" rx="12"/>
        <rect x="245" y="195" width="55" height="24" rx="12"/>
        <rect x="100" y="235" width="55" height="24" rx="12"/>
        <rect x="172" y="235" width="55" height="24" rx="12"/>
        <rect x="245" y="235" width="55" height="24" rx="12"/>
        <rect x="100" y="270" width="55" height="24" rx="12"/>
        <rect x="172" y="270" width="55" height="24" rx="12"/>
        <rect x="245" y="270" width="55" height="24" rx="12"/>
      </g>
      <!-- Tablet DOLO debossing -->
      <text x="114" y="171" fill="#16a34a" font-size="8" font-weight="bold" font-family="sans-serif">DOLO</text>
      <text x="186" y="171" fill="#16a34a" font-size="8" font-weight="bold" font-family="sans-serif">DOLO</text>
      <text x="259" y="171" fill="#16a34a" font-size="8" font-weight="bold" font-family="sans-serif">DOLO</text>
    `
  },
  'crocin-500-advance-tablet': {
    name: 'Crocin 500 Advance',
    generic: 'Paracetamol Optizorb',
    category: 'FEVER & PAIN • TABLET',
    brand: 'Crocin / Haleon',
    bgGradient: ['#fff1f2', '#ffe4e6'],
    primaryColor: '#e11d48',
    accentColor: '#fb7185',
    svgArt: `
      <!-- Red/White Crocin Advance Blister -->
      <rect x="85" y="105" width="230" height="190" rx="14" fill="#ffffff" stroke="#e11d48" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="105" width="230" height="44" rx="14" fill="#e11d48"/>
      <rect x="85" y="135" width="230" height="14" fill="#e11d48"/>
      <text x="100" y="133" fill="#ffffff" font-size="15" font-weight="900" font-family="sans-serif">CROCIN</text>
      <text x="175" y="133" fill="#fecdd3" font-size="10" font-weight="bold" font-family="sans-serif">ADVANCE 500</text>
      
      <!-- Round Optizorb Tablets -->
      <g fill="#ffffff" stroke="#e11d48" stroke-width="2">
        <circle cx="125" cy="180" r="18"/>
        <circle cx="200" cy="180" r="18"/>
        <circle cx="275" cy="180" r="18"/>
        <circle cx="125" cy="240" r="18"/>
        <circle cx="200" cy="240" r="18"/>
        <circle cx="275" cy="240" r="18"/>
      </g>
      <!-- Optizorb cross design -->
      <line x1="125" y1="168" x2="125" y2="192" stroke="#fb7185" stroke-width="1.5"/>
      <line x1="200" y1="168" x2="200" y2="192" stroke="#fb7185" stroke-width="1.5"/>
      <line x1="275" y1="168" x2="275" y2="192" stroke="#fb7185" stroke-width="1.5"/>
    `
  },
  'combiflam-tablet': {
    name: 'Combiflam',
    generic: 'Ibuprofen + Paracetamol',
    category: 'PAIN RELIEF • TABLET',
    brand: 'Sanofi India',
    bgGradient: ['#fff7ed', '#ffedd5'],
    primaryColor: '#ea580c',
    accentColor: '#f97316',
    svgArt: `
      <!-- Orange/Red Combiflam Strip -->
      <rect x="80" y="100" width="240" height="200" rx="14" fill="#ffffff" stroke="#f97316" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="80" y="100" width="240" height="44" rx="14" fill="#ea580c"/>
      <rect x="80" y="130" width="240" height="14" fill="#ea580c"/>
      <text x="95" y="130" fill="#ffffff" font-size="15" font-weight="900" font-family="sans-serif">COMBIFLAM</text>
      <text x="245" y="130" fill="#ffedd5" font-size="10" font-weight="bold" font-family="sans-serif">Sanofi</text>
      
      <!-- 20 Tablet Dual Formula Grid -->
      <g fill="#ffedd5" stroke="#ea580c" stroke-width="1.5">
        <circle cx="115" cy="170" r="14"/>
        <circle cx="160" cy="170" r="14"/>
        <circle cx="205" cy="170" r="14"/>
        <circle cx="250" cy="170" r="14"/>
        <circle cx="115" cy="215" r="14"/>
        <circle cx="160" cy="215" r="14"/>
        <circle cx="205" cy="215" r="14"/>
        <circle cx="250" cy="215" r="14"/>
        <circle cx="115" cy="260" r="14"/>
        <circle cx="160" cy="260" r="14"/>
        <circle cx="205" cy="260" r="14"/>
        <circle cx="250" cy="260" r="14"/>
      </g>
    `
  },
  'meftal-spas-tablet': {
    name: 'Meftal Spas',
    generic: 'Mefenamic + Dicyclomine',
    category: 'PAIN RELIEF • SPASMODIC',
    brand: 'Blue Cross',
    bgGradient: ['#eff6ff', '#dbeafe'],
    primaryColor: '#1d4ed8',
    accentColor: '#eab308',
    svgArt: `
      <!-- Yellow & Blue Meftal Spas Strip -->
      <rect x="85" y="105" width="230" height="190" rx="14" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="105" width="230" height="42" rx="14" fill="#1d4ed8"/>
      <rect x="85" y="133" width="230" height="14" fill="#1d4ed8"/>
      <text x="100" y="133" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">MEFTAL-SPAS</text>
      <text x="235" y="133" fill="#fde047" font-size="10" font-weight="bold" font-family="sans-serif">Blue Cross</text>
      
      <!-- Yellow Round Tablets -->
      <g fill="#fef08a" stroke="#ca8a04" stroke-width="1.8">
        <circle cx="125" cy="175" r="18"/>
        <circle cx="200" cy="175" r="18"/>
        <circle cx="275" cy="175" r="18"/>
        <circle cx="125" cy="235" r="18"/>
        <circle cx="200" cy="235" r="18"/>
        <circle cx="275" cy="235" r="18"/>
      </g>
      <line x1="113" y1="175" x2="137" y2="175" stroke="#ca8a04" stroke-width="1.5"/>
      <line x1="188" y1="175" x2="212" y2="175" stroke="#ca8a04" stroke-width="1.5"/>
      <line x1="263" y1="175" x2="287" y2="175" stroke="#ca8a04" stroke-width="1.5"/>
    `
  },
  'saridon-headache-relief-tablet': {
    name: 'Saridon',
    generic: 'Triple Action Headache',
    category: 'PAIN RELIEF • HEADACHE',
    brand: 'Piramal',
    bgGradient: ['#fdf2f8', '#fce7f3'],
    primaryColor: '#db2777',
    accentColor: '#f472b6',
    svgArt: `
      <!-- Pink / White Saridon Strip -->
      <rect x="85" y="105" width="230" height="190" rx="14" fill="#ffffff" stroke="#db2777" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="105" width="230" height="42" rx="14" fill="#db2777"/>
      <rect x="85" y="133" width="230" height="14" fill="#db2777"/>
      <text x="100" y="133" fill="#ffffff" font-size="16" font-weight="900" font-family="sans-serif">Saridon</text>
      <text x="240" y="133" fill="#fbcfe8" font-size="10" font-weight="bold" font-family="sans-serif">Piramal</text>
      
      <!-- 10 Tablets with pink center stamp -->
      <g fill="#fce7f3" stroke="#db2777" stroke-width="1.8">
        <circle cx="125" cy="175" r="18"/>
        <circle cx="200" cy="175" r="18"/>
        <circle cx="275" cy="175" r="18"/>
        <circle cx="125" cy="235" r="18"/>
        <circle cx="200" cy="235" r="18"/>
        <circle cx="275" cy="235" r="18"/>
      </g>
      <circle cx="125" cy="175" r="7" fill="#db2777"/>
      <circle cx="200" cy="175" r="7" fill="#db2777"/>
      <circle cx="275" cy="175" r="7" fill="#db2777"/>
    `
  },
  'volini-pain-relief-gel': {
    name: 'Volini Gel (50g)',
    generic: 'Diclofenac Pain Gel',
    category: 'PAIN RELIEF • TOPICAL GEL',
    brand: 'Sun Pharma',
    bgGradient: ['#fff7ed', '#ffedd5'],
    primaryColor: '#ea580c',
    accentColor: '#3b82f6',
    svgArt: `
      <!-- Volini Orange Squeeze Tube -->
      <path d="M120,250 L140,110 L260,110 L280,250 C280,265 265,275 250,275 L150,275 C135,275 120,265 120,250 Z" fill="#f97316" stroke="#c2410c" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Blue Band -->
      <rect x="135" y="140" width="130" height="35" fill="#1d4ed8"/>
      <text x="145" y="165" fill="#ffffff" font-size="16" font-weight="900" font-family="sans-serif">VOLINI</text>
      <!-- Tube Ribbed Cap -->
      <rect x="170" y="75" width="60" height="35" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      <line x1="185" y1="75" x2="185" y2="110" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="200" y1="75" x2="200" y2="110" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="215" y1="75" x2="215" y2="110" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Details -->
      <text x="150" y="200" fill="#ffffff" font-size="9" font-weight="bold" font-family="sans-serif">MAX STRENGTH 50g</text>
      <text x="150" y="218" fill="#ffedd5" font-size="8" font-family="sans-serif">Fast Relief Joint & Neck</text>
    `
  },
  'glycomet-gp-1-tablet': {
    name: 'Glycomet-GP 1',
    generic: 'Glimepiride + Metformin',
    category: 'DIABETES • TABLET',
    brand: 'USV Pvt Ltd',
    bgGradient: ['#f0fdfa', '#ccfbf1'],
    primaryColor: '#0f766e',
    accentColor: '#14b8a6',
    svgArt: `
      <!-- Turquoise Diabetes Blister -->
      <rect x="85" y="105" width="230" height="190" rx="14" fill="#ffffff" stroke="#14b8a6" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="105" width="230" height="42" rx="14" fill="#0f766e"/>
      <rect x="85" y="133" width="230" height="14" fill="#0f766e"/>
      <text x="100" y="133" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">GLYCOMET-GP 1</text>
      <text x="245" y="133" fill="#99f6e4" font-size="10" font-weight="bold" font-family="sans-serif">USV</text>
      
      <!-- Bi-layer Oval Tablets -->
      <g stroke="#0f766e" stroke-width="1.5">
        <rect x="110" y="170" width="45" height="24" rx="12" fill="#ccfbf1"/>
        <rect x="178" y="170" width="45" height="24" rx="12" fill="#ccfbf1"/>
        <rect x="245" y="170" width="45" height="24" rx="12" fill="#ccfbf1"/>
        <rect x="110" y="225" width="45" height="24" rx="12" fill="#ccfbf1"/>
        <rect x="178" y="225" width="45" height="24" rx="12" fill="#ccfbf1"/>
        <rect x="245" y="225" width="45" height="24" rx="12" fill="#ccfbf1"/>
      </g>
    `
  },
  'janumet-50mg-500mg-tablet': {
    name: 'Janumet 50/500',
    generic: 'Sitagliptin + Metformin',
    category: 'DIABETES • TABLET',
    brand: 'MSD',
    bgGradient: ['#eff6ff', '#dbeafe'],
    primaryColor: '#1e40af',
    accentColor: '#3b82f6',
    svgArt: `
      <!-- Navy Blue Premium Diabetes Pack -->
      <rect x="85" y="105" width="230" height="190" rx="14" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="105" width="230" height="42" rx="14" fill="#1e40af"/>
      <rect x="85" y="133" width="230" height="14" fill="#1e40af"/>
      <text x="100" y="133" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">JANUMET 50/500</text>
      <text x="245" y="133" fill="#bfdbfe" font-size="10" font-weight="bold" font-family="sans-serif">MSD</text>
      
      <!-- Pinkish Film Tablets -->
      <g fill="#fce7f3" stroke="#db2777" stroke-width="1.5">
        <rect x="110" y="170" width="45" height="24" rx="12"/>
        <rect x="178" y="170" width="45" height="24" rx="12"/>
        <rect x="245" y="170" width="45" height="24" rx="12"/>
        <rect x="110" y="225" width="45" height="24" rx="12"/>
        <rect x="178" y="225" width="45" height="24" rx="12"/>
        <rect x="245" y="225" width="45" height="24" rx="12"/>
      </g>
    `
  },
  'human-mixtard-30-70-injection': {
    name: 'Human Mixtard',
    generic: 'Insulin 100IU/ml Vial',
    category: 'DIABETES • INJECTION',
    brand: 'Novo Nordisk',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    primaryColor: '#166534',
    accentColor: '#22c55e',
    svgArt: `
      <!-- Amber Glass Insulin Vial with Blue Cap -->
      <rect x="140" y="130" width="120" height="160" rx="16" fill="#f8fafc" stroke="#64748b" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="170" y="90" width="60" height="40" rx="4" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <rect x="180" y="80" width="40" height="12" rx="3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      
      <!-- Vial Liquid Fill & Measurement Lines -->
      <rect x="145" y="200" width="110" height="85" rx="10" fill="#e0f2fe" opacity="0.6"/>
      <line x1="150" y1="220" x2="165" y2="220" stroke="#0284c7" stroke-width="2"/>
      <line x1="150" y1="240" x2="170" y2="240" stroke="#0284c7" stroke-width="2"/>
      <line x1="150" y1="260" x2="165" y2="260" stroke="#0284c7" stroke-width="2"/>
      
      <!-- Label -->
      <rect x="145" y="145" width="110" height="60" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <text x="152" y="165" fill="#1e3a8a" font-size="10" font-weight="900" font-family="sans-serif">MIXTARD 30/70</text>
      <text x="152" y="180" fill="#dc2626" font-size="9" font-weight="bold" font-family="sans-serif">100 IU/ml • 10ml</text>
      <text x="152" y="195" fill="#64748b" font-size="7" font-family="sans-serif">Novo Nordisk</text>
    `
  },
  'calpol-250mg-paediatric-suspension': {
    name: 'Calpol 250 Peadiatric',
    generic: 'Paracetamol (250mg/5ml)',
    category: 'PEDIATRIC • SUSPENSION',
    brand: 'GSK',
    bgGradient: ['#fdf2f8', '#fce7f3'],
    primaryColor: '#db2777',
    accentColor: '#f472b6',
    svgArt: `
      <!-- Pink Strawberry Pediatric Bottle -->
      <rect x="135" y="110" width="130" height="185" rx="22" fill="#ffffff" stroke="#f472b6" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="170" y="70" width="60" height="42" rx="8" fill="#f472b6"/>
      
      <!-- Label with Teddy Bear / Kid Friendly Motif -->
      <rect x="145" y="135" width="110" height="135" rx="8" fill="#fdf2f8"/>
      <rect x="145" y="135" width="110" height="30" rx="8" fill="#db2777"/>
      <rect x="145" y="155" width="110" height="10" fill="#db2777"/>
      <text x="158" y="156" fill="#ffffff" font-size="13" font-weight="900" font-family="sans-serif">CALPOL</text>
      <text x="155" y="184" fill="#db2777" font-size="10" font-weight="bold" font-family="sans-serif">250 Peadiatric</text>
      <text x="155" y="200" fill="#64748b" font-size="8" font-family="sans-serif">Strawberry Flavor</text>
      <!-- Strawberry icon -->
      <circle cx="200" cy="225" r="14" fill="#ef4444"/>
      <path d="M195,213 L200,210 L205,213 Z" fill="#22c55e"/>
      <text x="155" y="255" fill="#db2777" font-size="10" font-weight="bold" font-family="sans-serif">60 ml • GSK</text>
    `
  },
  'maxtra-oral-drops': {
    name: 'Maxtra Drops',
    generic: 'Cold & Congestion Drops',
    category: 'PEDIATRIC • DROPS',
    brand: 'Zuventus',
    bgGradient: ['#fef3c7', '#fde68a'],
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    svgArt: `
      <!-- Pediatric Dropper Bottle with Rubber Teat -->
      <rect x="145" y="145" width="110" height="145" rx="16" fill="#78350f" stroke="#451a03" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="175" y="105" width="50" height="40" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Rubber Pipette Teat -->
      <path d="M185,105 C185,75 215,75 215,105 Z" fill="#dc2626"/>
      
      <!-- Label -->
      <rect x="152" y="165" width="96" height="100" rx="6" fill="#ffffff"/>
      <text x="160" y="190" fill="#d97706" font-size="12" font-weight="900" font-family="sans-serif">MAXTRA</text>
      <text x="160" y="208" fill="#dc2626" font-size="9" font-weight="bold" font-family="sans-serif">Oral Drops</text>
      <text x="160" y="225" fill="#475569" font-size="8" font-family="sans-serif">Cold & Allergy</text>
      <text x="160" y="250" fill="#0284c7" font-size="9" font-weight="bold" font-family="sans-serif">15 ml</text>
      <!-- Drop falling -->
      <path d="M200,60 C195,68 205,68 200,60 Z" fill="#38bdf8"/>
    `
  },
  'ondem-syrup': {
    name: 'Ondem Syrup (30ml)',
    generic: 'Ondansetron (2mg/5ml)',
    category: 'PEDIATRIC • ANTI-EMETIC',
    brand: 'Alkem',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    primaryColor: '#16a34a',
    accentColor: '#4ade80',
    svgArt: `
      <!-- Small 30ml Pediatric Bottle -->
      <rect x="145" y="125" width="110" height="165" rx="18" fill="#ffffff" stroke="#16a34a" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="175" y="85" width="50" height="40" rx="6" fill="#16a34a"/>
      
      <!-- Label -->
      <rect x="152" y="150" width="96" height="115" rx="6" fill="#f0fdf4"/>
      <text x="160" y="175" fill="#15803d" font-size="14" font-weight="900" font-family="sans-serif">ONDEM</text>
      <text x="160" y="192" fill="#15803d" font-size="9" font-weight="bold" font-family="sans-serif">Syrup 30ml</text>
      <text x="160" y="210" fill="#475569" font-size="8" font-family="sans-serif">Anti-Vomiting</text>
      <text x="160" y="245" fill="#0284c7" font-size="9" font-weight="bold" font-family="sans-serif">Alkem</text>
    `
  },
  'pan-d-capsule': {
    name: 'Pan-D Capsule',
    generic: 'Pantoprazole + Domperidone',
    category: 'DIGESTIVE • CAPSULE',
    brand: 'Alkem',
    bgGradient: ['#fef2f2', '#fee2e2'],
    primaryColor: '#dc2626',
    accentColor: '#eab308',
    svgArt: `
      <!-- Dual Color Capsules Strip -->
      <rect x="85" y="105" width="230" height="190" rx="14" fill="#ffffff" stroke="#eab308" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="85" y="105" width="230" height="42" rx="14" fill="#dc2626"/>
      <rect x="85" y="133" width="230" height="14" fill="#dc2626"/>
      <text x="100" y="133" fill="#ffffff" font-size="16" font-weight="900" font-family="sans-serif">PAN-D</text>
      <text x="245" y="133" fill="#fef08a" font-size="10" font-weight="bold" font-family="sans-serif">Alkem</text>
      
      <!-- 6 Dual-Colored Red & Yellow Capsules -->
      <g filter="url(#dropShadow)">
        <!-- Capsule 1 -->
        <rect x="110" y="165" width="25" height="30" rx="12" fill="#dc2626"/>
        <rect x="110" y="180" width="25" height="30" rx="12" fill="#eab308"/>
        <!-- Capsule 2 -->
        <rect x="185" y="165" width="25" height="30" rx="12" fill="#dc2626"/>
        <rect x="185" y="180" width="25" height="30" rx="12" fill="#eab308"/>
        <!-- Capsule 3 -->
        <rect x="260" y="165" width="25" height="30" rx="12" fill="#dc2626"/>
        <rect x="260" y="180" width="25" height="30" rx="12" fill="#eab308"/>
        <!-- Capsule 4 -->
        <rect x="110" y="225" width="25" height="30" rx="12" fill="#dc2626"/>
        <rect x="110" y="240" width="25" height="30" rx="12" fill="#eab308"/>
        <!-- Capsule 5 -->
        <rect x="185" y="225" width="25" height="30" rx="12" fill="#dc2626"/>
        <rect x="185" y="240" width="25" height="30" rx="12" fill="#eab308"/>
        <!-- Capsule 6 -->
        <rect x="260" y="225" width="25" height="30" rx="12" fill="#dc2626"/>
        <rect x="260" y="240" width="25" height="30" rx="12" fill="#eab308"/>
      </g>
    `
  },
  'digene-acidity-relief-gel-mint': {
    name: 'Digene Gel (200ml)',
    generic: 'Antacid Gel (Mint)',
    category: 'DIGESTIVE • GEL',
    brand: 'Abbott',
    bgGradient: ['#fdf2f8', '#fce7f3'],
    primaryColor: '#ec4899',
    accentColor: '#10b981',
    svgArt: `
      <!-- Digene Pink & Mint Antacid Bottle -->
      <rect x="135" y="105" width="130" height="195" rx="20" fill="#fdf2f8" stroke="#ec4899" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="170" y="65" width="60" height="42" rx="8" fill="#10b981" stroke="#059669" stroke-width="2"/>
      
      <!-- Label with Wave Design -->
      <rect x="145" y="135" width="110" height="145" rx="8" fill="#ffffff"/>
      <text x="155" y="165" fill="#db2777" font-size="18" font-weight="900" font-family="sans-serif">Digene</text>
      <text x="155" y="185" fill="#059669" font-size="10" font-weight="bold" font-family="sans-serif">MINT GEL</text>
      <path d="M145,210 Q175,195 200,210 T255,210 L255,250 L145,250 Z" fill="#fce7f3"/>
      <text x="155" y="235" fill="#9d174d" font-size="8" font-family="sans-serif">Fast Acidity Relief</text>
      <text x="155" y="265" fill="#0284c7" font-size="9" font-weight="bold" font-family="sans-serif">200 ml • Abbott</text>
    `
  },
  'electral-ors-powder': {
    name: 'Electral ORS',
    generic: 'WHO Formula (21.8g)',
    category: 'DIGESTIVE • ORS POWDER',
    brand: 'FDC Ltd',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    primaryColor: '#16a34a',
    accentColor: '#f97316',
    svgArt: `
      <!-- Electral Sachet Packet -->
      <path d="M100,100 L300,100 L285,280 L115,280 Z" fill="#ffffff" stroke="#16a34a" stroke-width="2.5" filter="url(#dropShadow)"/>
      <!-- Sachet Header with Tear Notch -->
      <path d="M100,100 L300,100 L297,140 L103,140 Z" fill="#15803d"/>
      <line x1="95" y1="120" x2="105" y2="120" stroke="#f97316" stroke-width="3"/>
      <text x="135" y="128" fill="#ffffff" font-size="18" font-weight="900" font-family="sans-serif">Electral</text>
      <!-- Orange WHO badge -->
      <rect x="130" y="155" width="140" height="24" rx="4" fill="#f97316"/>
      <text x="138" y="171" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif">WHO RECOMMENDED</text>
      <!-- Body Text -->
      <text x="130" y="205" fill="#166534" font-size="11" font-weight="bold" font-family="sans-serif">Oral Rehydration Salts</text>
      <text x="130" y="225" fill="#475569" font-size="9" font-family="sans-serif">Restores Body Fluids</text>
      <text x="130" y="260" fill="#15803d" font-size="12" font-weight="bold" font-family="sans-serif">21.8g Sachet • FDC</text>
    `
  },
  'betadine-10-microbicidal-ointment': {
    name: 'Betadine 10%',
    generic: 'Povidone Iodine (20g)',
    category: 'FIRST AID • OINTMENT',
    brand: 'Win-Medicare',
    bgGradient: ['#fffbeb', '#fef3c7'],
    primaryColor: '#78350f',
    accentColor: '#dc2626',
    svgArt: `
      <!-- Dark Brown Betadine Ointment Tube -->
      <path d="M115,250 L140,110 L260,110 L285,250 C285,265 270,275 255,275 L145,275 C130,275 115,265 115,250 Z" fill="#78350f" stroke="#451a03" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="140" y="140" width="120" height="40" fill="#ffffff"/>
      <text x="148" y="165" fill="#78350f" font-size="14" font-weight="900" font-family="sans-serif">BETADINE</text>
      
      <!-- Tube Cap -->
      <rect x="175" y="75" width="50" height="35" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Red antiseptic Cross -->
      <rect x="190" y="200" width="20" height="6" fill="#dc2626"/>
      <rect x="197" y="193" width="6" height="20" fill="#dc2626"/>
      <text x="150" y="235" fill="#fef3c7" font-size="9" font-weight="bold" font-family="sans-serif">Microbicidal 10% (20g)</text>
    `
  },
  'dettol-antiseptic-liquid': {
    name: 'Dettol Liquid (250ml)',
    generic: 'Chloroxylenol (4.8%)',
    category: 'FIRST AID • ANTISEPTIC',
    brand: 'Reckitt',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    primaryColor: '#15803d',
    accentColor: '#16a34a',
    svgArt: `
      <!-- Dettol Flask Bottle with Iconic Amber Liquid -->
      <rect x="125" y="115" width="150" height="175" rx="24" fill="#d97706" stroke="#b45309" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- White Iconic Cap -->
      <rect x="165" y="75" width="70" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      
      <!-- White & Green Dettol Shield Label -->
      <rect x="140" y="145" width="120" height="120" rx="12" fill="#ffffff"/>
      <circle cx="200" cy="190" r="28" fill="#15803d"/>
      <!-- White Dettol Sword / Cross -->
      <line x1="200" y1="172" x2="200" y2="208" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <line x1="188" y1="184" x2="212" y2="184" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="200" cy="184" r="5" fill="#ffffff"/>
      
      <text x="165" y="235" fill="#15803d" font-size="14" font-weight="900" font-family="sans-serif">Dettol</text>
      <text x="165" y="252" fill="#64748b" font-size="8" font-family="sans-serif">250 ml • Antiseptic</text>
    `
  },
  'hansaplast-regular-bandage-strips': {
    name: 'Hansaplast Strips',
    generic: 'Medicated Plasters (20s)',
    category: 'FIRST AID • BANDAGES',
    brand: 'Hansaplast',
    bgGradient: ['#eff6ff', '#dbeafe'],
    primaryColor: '#1d4ed8',
    accentColor: '#dc2626',
    svgArt: `
      <!-- Hansaplast Bandage Box -->
      <rect x="110" y="95" width="180" height="210" rx="12" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="110" y="95" width="180" height="42" rx="12" fill="#1d4ed8"/>
      <rect x="110" y="125" width="180" height="12" fill="#1d4ed8"/>
      <text x="125" y="124" fill="#ffffff" font-size="13" font-weight="900" font-family="sans-serif">Hansaplast</text>
      <text x="245" y="124" fill="#ef4444" font-size="10" font-weight="bold" font-family="sans-serif">RED</text>
      
      <!-- Bandage Strip Preview -->
      <rect x="130" y="165" width="140" height="40" rx="8" fill="#fde047" stroke="#eab308" stroke-width="1.5"/>
      <rect x="180" y="165" width="40" height="40" fill="#ffffff" stroke="#eab308" stroke-width="1"/>
      <rect x="195" y="178" width="10" height="14" fill="#ef4444" opacity="0.7"/>
      
      <!-- Details -->
      <text x="130" y="235" fill="#1e3a8a" font-size="10" font-weight="bold" font-family="sans-serif">REGULAR STRIPS</text>
      <text x="130" y="255" fill="#64748b" font-size="8" font-family="sans-serif">Bacteria Shield • Pack of 20</text>
    `
  },
  'whisper-ultra-clean-sanitary-pads': {
    name: 'Whisper Ultra Clean',
    generic: 'Sanitary Pads XL (30s)',
    category: 'WOMEN CARE • HYGIENE',
    brand: 'Whisper / P&G',
    bgGradient: ['#f0fdf4', '#dcfce7'],
    primaryColor: '#059669',
    accentColor: '#7c3aed',
    svgArt: `
      <!-- Whisper Green/Purple Pack -->
      <rect x="100" y="100" width="200" height="200" rx="16" fill="#047857" stroke="#065f46" stroke-width="2" filter="url(#dropShadow)"/>
      <rect x="100" y="100" width="200" height="50" rx="16" fill="#7c3aed"/>
      <rect x="100" y="135" width="200" height="15" fill="#7c3aed"/>
      <text x="120" y="133" fill="#ffffff" font-size="16" font-weight="900" font-family="sans-serif">whisper</text>
      <text x="235" y="133" fill="#e9d5ff" font-size="10" font-weight="bold" font-family="sans-serif">ULTRA</text>
      
      <!-- Wings Graphic -->
      <ellipse cx="200" cy="205" rx="55" ry="24" fill="#ffffff" opacity="0.9"/>
      <ellipse cx="200" cy="205" rx="75" ry="12" fill="#ffffff" opacity="0.6"/>
      <text x="150" y="255" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif">XL+ WINGS • 30 PADS</text>
    `
  },
  'vwash-plus-intimate-hygiene-wash': {
    name: 'VWash Plus (200ml)',
    generic: 'Lactic Acid & Tea Tree',
    category: 'WOMEN CARE • HYGIENE',
    brand: 'Glenmark',
    bgGradient: ['#faf5ff', '#f3e8ff'],
    primaryColor: '#9333ea',
    accentColor: '#ec4899',
    svgArt: `
      <!-- VWash Purple Ergonomic Bottle -->
      <path d="M140,120 Q130,200 140,270 C140,285 260,285 260,270 Q270,200 260,120 Z" fill="#9333ea" stroke="#7e22ce" stroke-width="2" filter="url(#dropShadow)"/>
      <!-- Pink Flip Top Cap -->
      <rect x="175" y="80" width="50" height="42" rx="8" fill="#ec4899" stroke="#db2777" stroke-width="2"/>
      
      <!-- Label -->
      <rect x="150" y="150" width="100" height="100" rx="8" fill="#ffffff"/>
      <text x="160" y="178" fill="#9333ea" font-size="16" font-weight="900" font-family="sans-serif">VWash</text>
      <text x="218" y="172" fill="#ec4899" font-size="12" font-weight="bold" font-family="sans-serif">+</text>
      <text x="160" y="196" fill="#64748b" font-size="7" font-family="sans-serif">Intimate Hygiene</text>
      <text x="160" y="210" fill="#059669" font-size="8" font-weight="bold" font-family="sans-serif">pH 3.5 Balance</text>
      <text x="160" y="235" fill="#9333ea" font-size="9" font-weight="bold" font-family="sans-serif">200 ml</text>
    `
  }
};

function generateSVG(key, config) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad_${key.replace(/[^a-zA-Z0-9]/g, '_')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${config.bgGradient[0]}"/>
      <stop offset="100%" stop-color="${config.bgGradient[1]}"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Studio Background -->
  <rect width="400" height="400" rx="24" fill="url(#bgGrad_${key.replace(/[^a-zA-Z0-9]/g, '_')})"/>
  <rect x="8" y="8" width="384" height="384" rx="18" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/>

  <!-- Category Tag Header -->
  <rect x="24" y="24" width="auto" height="24" rx="12" fill="#ffffff" opacity="0.9"/>
  <text x="32" y="40" fill="${config.primaryColor}" font-size="10" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letter-spacing="0.5">${config.category}</text>

  <!-- Main Product Vector Art -->
  <g>
    ${config.svgArt}
  </g>

  <!-- Medicine Label Footer -->
  <rect x="24" y="325" width="352" height="52" rx="14" fill="#ffffff" opacity="0.95" filter="url(#dropShadow)"/>
  <text x="38" y="348" fill="#0f172a" font-size="14" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${config.name}</text>
  <text x="38" y="365" fill="#64748b" font-size="11" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${config.generic} • ${config.brand}</text>
</svg>`;
}

let count = 0;
for (const [key, config] of Object.entries(medicineGenerators)) {
  const filePath = path.join(targetDir, `${key}.svg`);
  fs.writeFileSync(filePath, generateSVG(key, config), 'utf8');
  count++;
  console.log(`Generated: ${key}.svg`);
}

console.log(`\n🎉 Successfully generated all ${count} unique medicine SVG illustrations in client/public/medicines/!`);
