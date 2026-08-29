const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../../client/public/medicines');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 21 Studio Product Photography Style Vector Visuals
// PURE PRODUCT PHOTOGRAPHY: Realistic 3D geometry, realistic studio shadows, authentic packaging branding, NO UI frames, NO category banners.
const studioProducts = {
  'dolo-650mg-tablet': {
    width: 600,
    height: 600,
    svg: `
      <!-- Studio Floor Shadow -->
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Medicine Box (Dolo 650) -->
      <!-- Left / Top perspective flaps -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#15803d" stroke="#166534" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#0d5a38" stroke="#166534" stroke-width="1.5"/>
      <!-- Front Box Face -->
      <polygon points="190,140 430,140 430,380 190,380" fill="url(#doloFrontGrad)" stroke="#166534" stroke-width="1.5"/>
      
      <!-- Box Branding -->
      <rect x="205" y="155" width="210" height="42" fill="#14532d" rx="4"/>
      <text x="215" y="185" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">Dolo-650</text>
      <text x="355" y="175" fill="#86efac" font-family="Arial, sans-serif" font-size="9" font-weight="bold">MICRO LABS</text>
      
      <text x="205" y="218" fill="#14532d" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Paracetamol Tablets IP 650 mg</text>
      <text x="205" y="238" fill="#334155" font-family="Arial, sans-serif" font-size="10">For fever and mild to moderate pain</text>
      <text x="205" y="258" fill="#64748b" font-family="Arial, sans-serif" font-size="9">15 Tablets / Strip</text>
      
      <!-- Red Rx Schedule H Banner -->
      <rect x="205" y="340" width="210" height="24" fill="#dc2626" rx="2"/>
      <text x="215" y="356" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" font-weight="bold">SCHEDULE H PRESCRIPTION DRUG</text>
      
      <!-- Blister Pack Standing In Front -->
      <g transform="translate(240, 240) rotate(-12)" filter="url(#dropShadowSoft)">
        <!-- Metallic Foil Base -->
        <rect x="0" y="0" width="220" height="210" rx="10" fill="url(#silverFoilGrad)" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="28" rx="4" fill="#15803d"/>
        <text x="15" y="24" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="900">Dolo-650</text>
        <text x="135" y="22" fill="#86efac" font-family="Arial, sans-serif" font-size="8" font-weight="bold">Micro Labs</text>
        
        <!-- 3D Tablet Cavities -->
        <g fill="url(#blisterPillGrad)" stroke="#64748b" stroke-width="1">
          <!-- Row 1 -->
          <rect x="15" y="45" width="55" height="26" rx="13"/>
          <rect x="82" y="45" width="55" height="26" rx="13"/>
          <rect x="150" y="45" width="55" height="26" rx="13"/>
          <!-- Row 2 -->
          <rect x="15" y="85" width="55" height="26" rx="13"/>
          <rect x="82" y="85" width="55" height="26" rx="13"/>
          <rect x="150" y="85" width="55" height="26" rx="13"/>
          <!-- Row 3 -->
          <rect x="15" y="125" width="55" height="26" rx="13"/>
          <rect x="82" y="125" width="55" height="26" rx="13"/>
          <rect x="150" y="125" width="55" height="26" rx="13"/>
          <!-- Row 4 -->
          <rect x="15" y="165" width="55" height="26" rx="13"/>
          <rect x="82" y="165" width="55" height="26" rx="13"/>
          <rect x="150" y="165" width="55" height="26" rx="13"/>
        </g>
        
        <!-- Tablet Deboss Stamp -->
        <text x="27" y="62" fill="#15803d" font-family="Arial, sans-serif" font-size="9" font-weight="bold">DOLO</text>
        <text x="94" y="62" fill="#15803d" font-family="Arial, sans-serif" font-size="9" font-weight="bold">DOLO</text>
        <text x="162" y="62" fill="#15803d" font-family="Arial, sans-serif" font-size="9" font-weight="bold">DOLO</text>
      </g>
    `
  },
  'augmentin-625-duo-tablet': {
    width: 600,
    height: 600,
    svg: `
      <!-- Studio Floor Shadow -->
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Augmentin 625 Duo) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <!-- Box Branding -->
      <rect x="190" y="140" width="240" height="15" fill="#ca8a04"/>
      <text x="210" y="195" fill="#0284c7" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="900">Augmentin</text>
      <text x="345" y="195" fill="#ca8a04" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">625 DUO</text>
      
      <text x="210" y="222" fill="#334155" font-family="Arial, sans-serif" font-size="11" font-weight="600">Amoxycillin &amp; Potassium Clavulanate</text>
      <text x="210" y="238" fill="#64748b" font-family="Arial, sans-serif" font-size="10">Tablets IP (500mg + 125mg)</text>
      <text x="210" y="265" fill="#ca8a04" font-family="Arial, sans-serif" font-size="13" font-weight="bold">GSK</text>
      
      <!-- Blister Pack -->
      <g transform="translate(250, 250) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="200" rx="10" fill="url(#silverFoilGrad)" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#ca8a04"/>
        <text x="15" y="21" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AUGMENTIN 625 DUO</text>
        
        <!-- 6 Large Antibiotic Caplets -->
        <g fill="url(#blisterPillGrad)" stroke="#94a3b8" stroke-width="1.5">
          <rect x="20" y="45" width="75" height="36" rx="18"/>
          <rect x="120" y="45" width="75" height="36" rx="18"/>
          <rect x="20" y="95" width="75" height="36" rx="18"/>
          <rect x="120" y="95" width="75" height="36" rx="18"/>
          <rect x="20" y="145" width="75" height="36" rx="18"/>
          <rect x="120" y="145" width="75" height="36" rx="18"/>
        </g>
        <line x1="57" y1="46" x2="57" y2="80" stroke="#ca8a04" stroke-width="1.5"/>
        <line x1="157" y1="46" x2="157" y2="80" stroke="#ca8a04" stroke-width="1.5"/>
      </g>
    `
  },
  'azithral-500mg-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Azithral 500) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#f43f5e" stroke="#be123c" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#9f1239" stroke="#881337" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="40" fill="#be123c"/>
      <text x="210" y="168" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900">Azithral 500</text>
      <text x="210" y="210" fill="#be123c" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Azithromycin Tablets IP</text>
      <text x="210" y="230" fill="#475569" font-size="11">3 Tablets • 3 Days Course</text>
      <text x="210" y="265" fill="#be123c" font-size="13" font-weight="bold">Alembic</text>
      
      <!-- 3-Tablet Blister Strip -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#be123c" stroke-width="2"/>
        <rect x="5" y="5" width="210" height="26" rx="4" fill="#be123c"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AZITHRAL 500 • 3 TABS</text>
        
        <!-- 3 Big Caplets -->
        <g fill="url(#blisterPillGrad)" stroke="#be123c" stroke-width="1.5">
          <rect x="25" y="45" width="170" height="38" rx="19"/>
          <rect x="25" y="95" width="170" height="38" rx="19"/>
          <rect x="25" y="145" width="170" height="38" rx="19"/>
        </g>
        <text x="85" y="70" fill="#be123c" font-family="Arial, sans-serif" font-size="11" font-weight="bold">DAY 1</text>
        <text x="85" y="120" fill="#be123c" font-family="Arial, sans-serif" font-size="11" font-weight="bold">DAY 2</text>
        <text x="85" y="170" fill="#be123c" font-family="Arial, sans-serif" font-size="11" font-weight="bold">DAY 3</text>
      </g>
    `
  },
  'ciplox-500mg-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Ciplox 500) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#14532d" stroke="#15803d" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="35" fill="#15803d"/>
      <text x="210" y="165" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">Ciplox 500</text>
      <text x="210" y="205" fill="#15803d" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Ciprofloxacin Tablets IP 500mg</text>
      <text x="210" y="225" fill="#475569" font-size="10">10 Tablets • Antibacterial</text>
      <text x="210" y="260" fill="#15803d" font-size="13" font-weight="bold">Cipla</text>
      
      <!-- Blister Strip -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="200" rx="10" fill="url(#silverFoilGrad)" stroke="#15803d" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#15803d"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">CIPLOX 500 • CIPLA</text>
        
        <g fill="url(#blisterPillGrad)" stroke="#15803d" stroke-width="1.5">
          <circle cx="45" cy="65" r="20"/>
          <circle cx="110" cy="65" r="20"/>
          <circle cx="175" cy="65" r="20"/>
          <circle cx="45" cy="120" r="20"/>
          <circle cx="110" cy="120" r="20"/>
          <circle cx="175" cy="120" r="20"/>
          <circle cx="45" cy="170" r="16"/>
          <circle cx="110" cy="170" r="16"/>
          <circle cx="175" cy="170" r="16"/>
        </g>
      </g>
    `
  },
  'taxim-o-200mg-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Taxim-O 200) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#155e75" stroke="#0891b2" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="35" fill="#0891b2"/>
      <text x="210" y="165" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">Taxim-O 200</text>
      <text x="210" y="205" fill="#0891b2" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Cefixime Tablets IP 200mg</text>
      <text x="210" y="225" fill="#475569" font-size="10">10 Film Coated Tablets</text>
      <text x="210" y="260" fill="#0891b2" font-size="13" font-weight="bold">Alkem</text>
      
      <!-- Blister Strip -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#0891b2" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#0891b2"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">TAXIM-O 200 • ALKEM</text>
        
        <g fill="url(#blisterPillGrad)" stroke="#0891b2" stroke-width="1.5">
          <rect x="20" y="45" width="48" height="28" rx="14"/>
          <rect x="85" y="45" width="48" height="28" rx="14"/>
          <rect x="150" y="45" width="48" height="28" rx="14"/>
          <rect x="20" y="90" width="48" height="28" rx="14"/>
          <rect x="85" y="90" width="48" height="28" rx="14"/>
          <rect x="150" y="90" width="48" height="28" rx="14"/>
          <rect x="20" y="135" width="48" height="28" rx="14"/>
          <rect x="85" y="135" width="48" height="28" rx="14"/>
          <rect x="150" y="135" width="48" height="28" rx="14"/>
        </g>
      </g>
    `
  },
  'meftal-spas-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Meftal Spas) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#1e3a8a" stroke="#1d4ed8" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="38" fill="#1d4ed8"/>
      <text x="210" y="167" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">MEFTAL-SPAS</text>
      <text x="210" y="205" fill="#1d4ed8" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Mefenamic Acid &amp; Dicyclomine</text>
      <text x="210" y="225" fill="#475569" font-size="10">10 Tablets • Antispasmodic</text>
      <text x="210" y="260" fill="#ca8a04" font-size="12" font-weight="bold">Blue Cross</text>
      
      <!-- Blister with Yellow Tabs -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#1d4ed8" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#1d4ed8"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">MEFTAL-SPAS</text>
        
        <g fill="#fef08a" stroke="#ca8a04" stroke-width="1.5">
          <circle cx="45" cy="65" r="20"/>
          <circle cx="110" cy="65" r="20"/>
          <circle cx="175" cy="65" r="20"/>
          <circle cx="45" cy="125" r="20"/>
          <circle cx="110" cy="125" r="20"/>
          <circle cx="175" cy="125" r="20"/>
        </g>
      </g>
    `
  },
  'saridon-headache-relief-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Saridon) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#ec4899" stroke="#db2777" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#9d174d" stroke="#db2777" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="38" fill="#db2777"/>
      <text x="210" y="167" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="900">Saridon</text>
      <text x="210" y="205" fill="#db2777" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Triple Action Headache Relief</text>
      <text x="210" y="225" fill="#475569" font-size="10">Paracetamol, Propyphenazone, Caffeine</text>
      <text x="210" y="260" fill="#db2777" font-size="12" font-weight="bold">Piramal</text>
      
      <!-- Blister Strip -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#db2777" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#db2777"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="13" font-weight="bold">SARIDON</text>
        
        <g fill="#ffffff" stroke="#db2777" stroke-width="1.5">
          <circle cx="45" cy="65" r="20"/>
          <circle cx="110" cy="65" r="20"/>
          <circle cx="175" cy="65" r="20"/>
          <circle cx="45" cy="125" r="20"/>
          <circle cx="110" cy="125" r="20"/>
          <circle cx="175" cy="125" r="20"/>
        </g>
        <circle cx="45" cy="65" r="8" fill="#f472b6"/>
        <circle cx="110" cy="65" r="8" fill="#f472b6"/>
        <circle cx="175" cy="65" r="8" fill="#f472b6"/>
      </g>
    `
  },
  'glycomet-gp-1-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Glycomet-GP 1) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#14b8a6" stroke="#0f766e" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#134e4a" stroke="#0f766e" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="38" fill="#0f766e"/>
      <text x="205" y="167" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900">Glycomet-GP 1</text>
      <text x="210" y="205" fill="#0f766e" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Glimepiride &amp; Metformin PR</text>
      <text x="210" y="225" fill="#475569" font-size="10">10 PR Tablets • Diabetes Care</text>
      <text x="210" y="260" fill="#0f766e" font-size="12" font-weight="bold">USV</text>
      
      <!-- Blister Strip -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#0f766e" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#0f766e"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">GLYCOMET-GP 1</text>
        
        <g fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5">
          <rect x="20" y="50" width="50" height="28" rx="14"/>
          <rect x="85" y="50" width="50" height="28" rx="14"/>
          <rect x="150" y="50" width="50" height="28" rx="14"/>
          <rect x="20" y="95" width="50" height="28" rx="14"/>
          <rect x="85" y="95" width="50" height="28" rx="14"/>
          <rect x="150" y="95" width="50" height="28" rx="14"/>
          <rect x="20" y="140" width="50" height="28" rx="14"/>
          <rect x="85" y="140" width="50" height="28" rx="14"/>
          <rect x="150" y="140" width="50" height="28" rx="14"/>
        </g>
      </g>
    `
  },
  'janumet-50mg-500mg-tablet': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Janumet) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#172554" stroke="#1e40af" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="40" fill="#1e40af"/>
      <text x="210" y="168" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">JANUMET</text>
      <text x="210" y="205" fill="#1e40af" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Sitagliptin &amp; Metformin HCl</text>
      <text x="210" y="225" fill="#475569" font-size="10">50mg / 500mg • 14 Tablets</text>
      <text x="210" y="260" fill="#ca8a04" font-size="12" font-weight="bold">MSD</text>
      
      <!-- Blister Strip -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#1e40af" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#1e40af"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">JANUMET 50/500 • MSD</text>
        
        <g fill="#fce7f3" stroke="#db2777" stroke-width="1.5">
          <rect x="20" y="50" width="50" height="28" rx="14"/>
          <rect x="85" y="50" width="50" height="28" rx="14"/>
          <rect x="150" y="50" width="50" height="28" rx="14"/>
          <rect x="20" y="95" width="50" height="28" rx="14"/>
          <rect x="85" y="95" width="50" height="28" rx="14"/>
          <rect x="150" y="95" width="50" height="28" rx="14"/>
        </g>
      </g>
    `
  },
  'human-mixtard-30-70-injection': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="180" ry="20" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="120" ry="14" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Glass Insulin Vial -->
      <g transform="translate(210, 100)" filter="url(#dropShadowSoft)">
        <!-- Rubber Stopper & Blue Cap -->
        <rect x="65" y="20" width="50" height="15" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
        <rect x="50" y="35" width="80" height="35" rx="6" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
        <rect x="60" y="70" width="60" height="20" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
        
        <!-- Glass Body -->
        <rect x="25" y="90" width="130" height="270" rx="20" fill="url(#glassGrad)" stroke="#64748b" stroke-width="2"/>
        <!-- Liquid Fill -->
        <rect x="30" y="160" width="120" height="195" rx="14" fill="#e0f2fe" opacity="0.6"/>
        
        <!-- Measurement Scale -->
        <line x1="35" y1="180" x2="55" y2="180" stroke="#0284c7" stroke-width="2"/>
        <line x1="35" y1="210" x2="65" y2="210" stroke="#0284c7" stroke-width="2"/>
        <line x1="35" y1="240" x2="55" y2="240" stroke="#0284c7" stroke-width="2"/>
        <line x1="35" y1="270" x2="65" y2="270" stroke="#0284c7" stroke-width="2"/>
        <line x1="35" y1="300" x2="55" y2="300" stroke="#0284c7" stroke-width="2"/>
        <text x="70" y="214" fill="#0369a1" font-size="10" font-weight="bold">100 IU/ml</text>
        <text x="70" y="274" fill="#0369a1" font-size="10" font-weight="bold">10 ml</text>
        
        <!-- Pharmaceutical Label -->
        <rect x="30" y="110" width="120" height="85" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="30" y="110" width="120" height="16" fill="#166534"/>
        <text x="35" y="122" fill="#ffffff" font-family="Arial, sans-serif" font-size="9" font-weight="bold">MIXTARD 30/70</text>
        <text x="35" y="142" fill="#166534" font-family="Arial, sans-serif" font-size="10" font-weight="900">Human Mixtard</text>
        <text x="35" y="156" fill="#334155" font-family="Arial, sans-serif" font-size="8">Biphasic Isophane Insulin</text>
        <text x="35" y="180" fill="#dc2626" font-family="Arial, sans-serif" font-size="8" font-weight="bold">Novo Nordisk</text>
      </g>
    `
  },
  'calpol-250mg-paediatric-suspension': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="180" ry="20" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="120" ry="14" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Pediatric Medicine Bottle -->
      <g transform="translate(200, 110)" filter="url(#dropShadowSoft)">
        <!-- Measuring Cup on top -->
        <path d="M70,30 L130,30 L125,75 L75,75 Z" fill="#e0f2fe" opacity="0.8" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="85" y1="50" x2="105" y2="50" stroke="#0284c7" stroke-width="1.5"/>
        <line x1="85" y1="62" x2="115" y2="62" stroke="#0284c7" stroke-width="1.5"/>
        
        <!-- White Screw Cap -->
        <rect x="75" y="75" width="50" height="35" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        
        <!-- Pink Bottle Body -->
        <rect x="25" y="110" width="150" height="260" rx="28" fill="url(#pinkBottleGrad)" stroke="#f472b6" stroke-width="2"/>
        
        <!-- Label -->
        <rect x="35" y="150" width="130" height="180" rx="12" fill="#ffffff"/>
        <rect x="35" y="150" width="130" height="35" rx="12" fill="#db2777"/>
        <rect x="35" y="170" width="130" height="15" fill="#db2777"/>
        <text x="45" y="174" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900">CALPOL</text>
        
        <text x="45" y="205" fill="#db2777" font-family="Arial, sans-serif" font-size="12" font-weight="900">250 Peadiatric</text>
        <text x="45" y="222" fill="#475569" font-family="Arial, sans-serif" font-size="9">Paracetamol Suspension</text>
        <text x="45" y="236" fill="#475569" font-family="Arial, sans-serif" font-size="9">Strawberry Flavour</text>
        
        <!-- Strawberry motif -->
        <circle cx="100" cy="270" r="18" fill="#ef4444"/>
        <path d="M94,255 L100,250 L106,255 Z" fill="#22c55e"/>
        <text x="45" y="315" fill="#db2777" font-family="Arial, sans-serif" font-size="11" font-weight="bold">60 ml • GSK</text>
      </g>
    `
  },
  'maxtra-oral-drops': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="180" ry="20" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="120" ry="14" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Amber Dropper Bottle -->
      <g transform="translate(220, 110)" filter="url(#dropShadowSoft)">
        <!-- Red Rubber Teat -->
        <path d="M60,65 C60,25 100,25 100,65 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
        <rect x="50" y="65" width="60" height="30" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        
        <!-- Amber Glass Body -->
        <rect x="25" y="95" width="110" height="260" rx="20" fill="url(#amberGlassGrad)" stroke="#451a03" stroke-width="2"/>
        
        <!-- Label -->
        <rect x="32" y="140" width="96" height="160" rx="8" fill="#ffffff"/>
        <text x="40" y="170" fill="#d97706" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="900">MAXTRA</text>
        <text x="40" y="190" fill="#dc2626" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Oral Drops</text>
        <text x="40" y="210" fill="#475569" font-family="Arial, sans-serif" font-size="8">Phenylephrine &amp;</text>
        <text x="40" y="222" fill="#475569" font-family="Arial, sans-serif" font-size="8">Chlorpheniramine</text>
        <text x="40" y="250" fill="#0284c7" font-family="Arial, sans-serif" font-size="11" font-weight="bold">15 ml</text>
        <text x="40" y="280" fill="#64748b" font-family="Arial, sans-serif" font-size="9" font-weight="bold">Zuventus</text>
      </g>
    `
  },
  'digene-acidity-relief-gel-mint': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="180" ry="20" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="120" ry="14" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Digene Bottle -->
      <g transform="translate(200, 90)" filter="url(#dropShadowSoft)">
        <!-- Green Flip Cap -->
        <rect x="65" y="30" width="70" height="40" rx="8" fill="#059669" stroke="#047857" stroke-width="2"/>
        
        <!-- Pink & Mint Body -->
        <rect x="25" y="70" width="150" height="300" rx="26" fill="url(#digenePinkGrad)" stroke="#db2777" stroke-width="2"/>
        
        <!-- Label -->
        <rect x="35" y="120" width="130" height="200" rx="10" fill="#ffffff"/>
        <text x="45" y="155" fill="#db2777" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="900">Digene</text>
        <text x="45" y="178" fill="#059669" font-family="Arial, sans-serif" font-size="12" font-weight="900">MINT GEL</text>
        
        <path d="M35,210 Q70,195 100,210 T165,210 L165,250 L35,250 Z" fill="#dcfce7"/>
        <text x="45" y="235" fill="#047857" font-family="Arial, sans-serif" font-size="9" font-weight="bold">Fast Acidity Relief</text>
        <text x="45" y="250" fill="#475569" font-family="Arial, sans-serif" font-size="8">Sugar Free • Antacid</text>
        <text x="45" y="295" fill="#db2777" font-family="Arial, sans-serif" font-size="12" font-weight="bold">200 ml • Abbott</text>
      </g>
    `
  },
  'electral-ors-powder': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Electral Sachet Packet -->
      <g transform="translate(170, 110) rotate(-4)" filter="url(#dropShadowSoft)">
        <polygon points="0,20 260,0 240,340 10,360" fill="#ffffff" stroke="#16a34a" stroke-width="2.5"/>
        <!-- Sealed Header -->
        <polygon points="0,20 260,0 256,50 4,70" fill="#15803d"/>
        <!-- Notch -->
        <line x1="-5" y1="45" x2="10" y2="45" stroke="#ea580c" stroke-width="4"/>
        <text x="25" y="55" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="900">Electral</text>
        
        <!-- WHO Badge -->
        <rect x="25" y="90" width="190" height="28" rx="4" fill="#ea580c"/>
        <text x="35" y="109" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">WHO RECOMMENDED FORMULA</text>
        
        <text x="25" y="150" fill="#166534" font-family="Arial, sans-serif" font-size="13" font-weight="bold">Oral Rehydration Salts IP</text>
        <text x="25" y="175" fill="#334155" font-family="Arial, sans-serif" font-size="11">Restores Body Fluids &amp; Electrolytes</text>
        <text x="25" y="195" fill="#64748b" font-family="Arial, sans-serif" font-size="10">21.80g Sachet for 1 Litre Water</text>
        
        <!-- Water drop motif -->
        <circle cx="130" cy="260" r="30" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
        <path d="M130,235 C120,250 140,250 130,235 Z" fill="#0284c7"/>
        <text x="25" y="325" fill="#15803d" font-family="Arial, sans-serif" font-size="14" font-weight="bold">FDC Limited</text>
      </g>
    `
  },
  'betadine-10-microbicidal-ointment': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="200" ry="22" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="140" ry="15" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Ointment Squeeze Tube -->
      <g transform="translate(190, 110) rotate(-8)" filter="url(#dropShadowSoft)">
        <!-- Cap -->
        <rect x="85" y="20" width="50" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        
        <!-- Tube Body -->
        <path d="M40,320 L75,60 L145,60 L180,320 C180,345 150,355 110,355 C70,355 40,345 40,320 Z" fill="url(#betadineTubeGrad)" stroke="#451a03" stroke-width="2"/>
        
        <!-- White Label Banner -->
        <rect x="55" y="110" width="110" height="60" fill="#ffffff"/>
        <text x="62" y="145" fill="#78350f" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="900">BETADINE</text>
        <text x="62" y="160" fill="#78350f" font-family="Arial, sans-serif" font-size="9" font-weight="bold">10% Ointment</text>
        
        <!-- Medical Cross -->
        <rect x="100" y="200" width="20" height="6" fill="#dc2626"/>
        <rect x="107" y="193" width="6" height="20" fill="#dc2626"/>
        
        <text x="65" y="250" fill="#fef3c7" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Povidone-Iodine 20g</text>
        <text x="75" y="290" fill="#fde68a" font-family="Arial, sans-serif" font-size="10">Win-Medicare</text>
      </g>
    `
  },
  'dettol-antiseptic-liquid': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="190" ry="22" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="130" ry="15" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Dettol Flask Bottle -->
      <g transform="translate(190, 100)" filter="url(#dropShadowSoft)">
        <!-- White Cap -->
        <rect x="75" y="20" width="70" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        
        <!-- Amber Liquid Flask Body -->
        <rect x="25" y="62" width="170" height="290" rx="30" fill="url(#dettolAmberGrad)" stroke="#b45309" stroke-width="2"/>
        
        <!-- Dettol Shield Label -->
        <rect x="40" y="110" width="140" height="180" rx="16" fill="#ffffff"/>
        
        <circle cx="110" cy="170" r="35" fill="#15803d"/>
        <!-- Dettol Sword -->
        <line x1="110" y1="145" x2="110" y2="195" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <line x1="95" y1="160" x2="125" y2="160" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <circle cx="110" cy="160" r="6" fill="#ffffff"/>
        
        <text x="70" y="235" fill="#15803d" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">Dettol</text>
        <text x="55" y="258" fill="#334155" font-family="Arial, sans-serif" font-size="10" font-weight="bold">ANTISEPTIC LIQUID</text>
        <text x="75" y="280" fill="#15803d" font-family="Arial, sans-serif" font-size="12" font-weight="bold">250 ml • Reckitt</text>
      </g>
    `
  },
  'hansaplast-regular-bandage-strips': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Hansaplast) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#1d4ed8" stroke="#1e40af" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#172554" stroke="#1e40af" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <rect x="190" y="140" width="240" height="40" fill="#1d4ed8"/>
      <text x="210" y="168" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">Hansaplast</text>
      <text x="360" y="168" fill="#ef4444" font-family="Arial, sans-serif" font-size="12" font-weight="bold">RED</text>
      
      <text x="210" y="205" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="12" font-weight="bold">REGULAR STRIPS (20s)</text>
      <text x="210" y="225" fill="#475569" font-size="10">Bacteria Shield • Breathable Plasters</text>
      
      <!-- Bandage Strip Preview In Front -->
      <g transform="translate(220, 260) rotate(-12)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="180" height="50" rx="10" fill="#fde047" stroke="#eab308" stroke-width="1.5"/>
        <rect x="65" y="0" width="50" height="50" fill="#ffffff" stroke="#eab308" stroke-width="1"/>
        <circle cx="90" cy="25" r="8" fill="#ef4444" opacity="0.8"/>
      </g>
      <text x="210" y="350" fill="#1d4ed8" font-size="12" font-weight="bold">Beiersdorf</text>
    `
  },
  'otrivin-oxy-fast-relief-nasal-spray': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="180" ry="20" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="120" ry="14" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Nasal Spray Bottle -->
      <g transform="translate(220, 80)" filter="url(#dropShadowSoft)">
        <!-- Protective Cap -->
        <rect x="65" y="20" width="30" height="60" rx="6" fill="#38bdf8" opacity="0.4" stroke="#0284c7" stroke-width="1"/>
        <!-- Nozzle -->
        <path d="M72,40 L88,40 L88,90 L72,90 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Pump Collar -->
        <path d="M55,90 L105,90 L125,120 L35,120 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
        
        <!-- White Cylindrical Bottle Body -->
        <rect x="35" y="120" width="90" height="240" rx="20" fill="url(#whiteBottleGrad)" stroke="#0284c7" stroke-width="2"/>
        
        <!-- Label -->
        <text x="45" y="180" fill="#0369a1" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="900">OTRIVIN</text>
        <text x="45" y="205" fill="#ea580c" font-family="Arial, sans-serif" font-size="12" font-weight="900">OXY 25 SEC</text>
        <text x="45" y="230" fill="#475569" font-family="Arial, sans-serif" font-size="9">Nasal Spray 10ml</text>
        <text x="45" y="245" fill="#475569" font-family="Arial, sans-serif" font-size="8">Oxymetazoline HCl</text>
        <text x="45" y="310" fill="#0284c7" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Haleon / GSK</text>
      </g>
    `
  },
  'volini-pain-relief-gel': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="200" ry="22" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="140" ry="15" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Volini Squeeze Tube -->
      <g transform="translate(190, 110) rotate(-8)" filter="url(#dropShadowSoft)">
        <rect x="85" y="20" width="50" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        
        <path d="M40,320 L75,60 L145,60 L180,320 C180,345 150,355 110,355 C70,355 40,345 40,320 Z" fill="url(#voliniTubeGrad)" stroke="#c2410c" stroke-width="2"/>
        
        <!-- Blue Banner -->
        <rect x="45" y="130" width="130" height="40" fill="#1d4ed8"/>
        <text x="60" y="160" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">VOLINI</text>
        
        <text x="55" y="200" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">MAX STRENGTH 50g</text>
        <text x="55" y="220" fill="#ffedd5" font-family="Arial, sans-serif" font-size="9">Joint, Neck &amp; Back Pain</text>
        <text x="55" y="300" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Sun Pharma</text>
      </g>
    `
  },
  'vwash-plus-intimate-hygiene-wash': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="180" ry="20" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="120" ry="14" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D VWash Bottle -->
      <g transform="translate(200, 90)" filter="url(#dropShadowSoft)">
        <!-- Pink Flip Cap -->
        <rect x="70" y="30" width="60" height="40" rx="8" fill="#ec4899" stroke="#db2777" stroke-width="2"/>
        
        <!-- Purple Ergonomic Contoured Body -->
        <path d="M45,70 Q25,200 45,330 C45,360 155,360 155,330 Q175,200 155,70 Z" fill="url(#vwashPurpleGrad)" stroke="#7e22ce" stroke-width="2"/>
        
        <!-- Label -->
        <rect x="50" y="130" width="100" height="150" rx="12" fill="#ffffff"/>
        <text x="60" y="165" fill="#9333ea" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">VWash</text>
        <text x="132" y="158" fill="#ec4899" font-family="Arial, sans-serif" font-size="16" font-weight="bold">+</text>
        <text x="60" y="190" fill="#475569" font-family="Arial, sans-serif" font-size="9">Intimate Hygiene</text>
        <text x="60" y="210" fill="#059669" font-family="Arial, sans-serif" font-size="10" font-weight="bold">pH 3.5 Balance</text>
        <text x="60" y="255" fill="#9333ea" font-family="Arial, sans-serif" font-size="11" font-weight="bold">200 ml • Glenmark</text>
      </g>
    `
  },
  'whisper-ultra-clean-sanitary-pads': {
    width: 600,
    height: 600,
    svg: `
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Whisper Packaging Pack -->
      <g transform="translate(170, 130)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="260" height="280" rx="20" fill="url(#whisperPackGrad)" stroke="#065f46" stroke-width="2"/>
        <rect x="0" y="0" width="260" height="60" rx="20" fill="#7c3aed"/>
        <rect x="0" y="40" width="260" height="20" fill="#7c3aed"/>
        
        <text x="25" y="45" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="900">whisper</text>
        <text x="175" y="45" fill="#e9d5ff" font-family="Arial, sans-serif" font-size="14" font-weight="bold">ULTRA</text>
        
        <ellipse cx="130" cy="140" rx="70" ry="30" fill="#ffffff" opacity="0.9"/>
        <ellipse cx="130" cy="140" rx="90" ry="15" fill="#ffffff" opacity="0.6"/>
        
        <text x="35" y="210" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">XL+ WINGS • 30 PADS</text>
        <text x="35" y="235" fill="#a7f3d0" font-family="Arial, sans-serif" font-size="11">100% Leak Lock Protection</text>
        <text x="35" y="260" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Procter &amp; Gamble</text>
      </g>
    `
  }
};

function renderFullSVG(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <!-- Studio Lighting Background -->
    <radialGradient id="studioLighting" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    
    <!-- Realistic Floor Blur -->
    <filter id="blurFloor" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    
    <!-- Soft Product Drop Shadow -->
    <filter id="dropShadowSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
    
    <!-- Metallic Silver Foil Gradient -->
    <linearGradient id="silverFoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#f1f5f9"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="75%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    
    <!-- 3D Blister Pill Cavity Gradient -->
    <radialGradient id="blisterPillGrad" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#f8fafc"/>
      <stop offset="80%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>
    
    <!-- Dolo Green Box Gradient -->
    <linearGradient id="doloFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="50%" stop-color="#dcfce7"/>
      <stop offset="100%" stop-color="#bbf7d0"/>
    </linearGradient>
    
    <!-- Glass Bottle Gradient -->
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.8"/>
      <stop offset="20%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#f1f5f9" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.9"/>
    </linearGradient>
    
    <!-- Pink Pediatric Bottle Gradient -->
    <linearGradient id="pinkBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="30%" stop-color="#fbcfe8"/>
      <stop offset="70%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
    
    <!-- Amber Dropper Glass Gradient -->
    <linearGradient id="amberGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="30%" stop-color="#b45309"/>
      <stop offset="70%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    
    <!-- Digene Pink Gradient -->
    <linearGradient id="digenePinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="30%" stop-color="#fce7f3"/>
      <stop offset="70%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
    
    <!-- Betadine Tube Gradient -->
    <linearGradient id="betadineTubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="30%" stop-color="#92400e"/>
      <stop offset="70%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    
    <!-- Dettol Amber Gradient -->
    <linearGradient id="dettolAmberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    
    <!-- White Bottle Gradient -->
    <linearGradient id="whiteBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    
    <!-- Volini Tube Gradient -->
    <linearGradient id="voliniTubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="30%" stop-color="#fb923c"/>
      <stop offset="70%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    
    <!-- VWash Purple Gradient -->
    <linearGradient id="vwashPurpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7e22ce"/>
      <stop offset="30%" stop-color="#a855f7"/>
      <stop offset="70%" stop-color="#7e22ce"/>
      <stop offset="100%" stop-color="#581c87"/>
    </linearGradient>
    
    <!-- Whisper Pack Gradient -->
    <linearGradient id="whisperPackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>

  <!-- Clean Studio Photography White Backdrop -->
  <rect width="600" height="600" fill="url(#studioLighting)"/>

  <!-- Centered Physical Medicine Product Visual -->
  ${item.svg}
</svg>`;
}

let count = 0;
for (const [key, item] of Object.entries(studioProducts)) {
  const filePath = path.join(targetDir, `${key}.svg`);
  fs.writeFileSync(filePath, renderFullSVG(item), 'utf8');
  count++;
  console.log(`Generated photorealistic product visual: ${key}.svg`);
}

console.log(`\n🎉 Successfully generated all ${count} photorealistic 3D studio product visuals!`);
