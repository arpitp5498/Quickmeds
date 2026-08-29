const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../../client/public/medicines');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const vitaminProducts = {
  'limcee-500mg-chewable-tablet': {
    svg: `
      <!-- Studio Floor Shadow -->
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Limcee 500) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#f97316" stroke="#ea580c" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#c2410c" stroke="#9a3412" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <!-- Box Branding -->
      <rect x="190" y="140" width="240" height="42" fill="#ea580c"/>
      <text x="210" y="170" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="900">Limcee 500</text>
      <text x="350" y="168" fill="#ffedd5" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Abbott</text>
      
      <text x="210" y="210" fill="#ea580c" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Vitamin C Chewable Tablets IP 500mg</text>
      <text x="210" y="230" fill="#475569" font-family="Arial, sans-serif" font-size="10">Orange Flavour • Immunity Booster</text>
      <text x="210" y="250" fill="#64748b" font-family="Arial, sans-serif" font-size="9">15 Chewable Tablets</text>
      
      <!-- Orange Icon -->
      <circle cx="230" cy="300" r="22" fill="#f97316"/>
      <circle cx="230" cy="300" r="16" fill="#fb923c"/>
      <path d="M226,280 L230,274 L234,280 Z" fill="#15803d"/>
      
      <!-- Blister Strip with Orange Chewable Tabs -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#ea580c" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#ea580c"/>
        <text x="15" y="22" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">LIMCEE 500 • ABBOTT</text>
        
        <g fill="#fdba74" stroke="#ea580c" stroke-width="1.5">
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
  'shelcal-500-tablet': {
    svg: `
      <!-- Studio Floor Shadow -->
      <ellipse cx="300" cy="490" rx="190" ry="22" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="300" cy="485" rx="130" ry="15" fill="#0f172a" opacity="0.14" filter="url(#blurFloor)"/>
      
      <!-- 3D Shelcal Bottle -->
      <g transform="translate(195, 90)" filter="url(#dropShadowSoft)">
        <!-- Blue Screw Cap -->
        <rect x="70" y="25" width="70" height="42" rx="8" fill="#1d4ed8" stroke="#1e40af" stroke-width="2"/>
        
        <!-- White Cylindrical Bottle Body -->
        <rect x="25" y="67" width="160" height="290" rx="26" fill="url(#whiteBottleGrad)" stroke="#cbd5e1" stroke-width="2"/>
        
        <!-- Label -->
        <rect x="35" y="115" width="140" height="190" rx="12" fill="#ffffff"/>
        <rect x="35" y="115" width="140" height="40" rx="12" fill="#1d4ed8"/>
        <rect x="35" y="135" width="140" height="20" fill="#1d4ed8"/>
        <text x="48" y="145" fill="#ffffff" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">Shelcal 500</text>
        
        <text x="48" y="180" fill="#1e40af" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Calcium 500mg +</text>
        <text x="48" y="196" fill="#1e40af" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Vitamin D3 250 IU</text>
        <text x="48" y="220" fill="#475569" font-family="Arial, sans-serif" font-size="9">Bone &amp; Joint Health</text>
        <text x="48" y="240" fill="#64748b" font-family="Arial, sans-serif" font-size="9">15 Tablets • Torrent</text>
        
        <!-- Bone Icon Motif -->
        <path d="M70,270 Q80,265 90,270 Q100,275 110,270 Q120,265 130,270 Q130,280 120,280 Q110,275 100,280 Q90,285 80,280 Z" fill="#93c5fd"/>
      </g>
    `
  },
  'becosules-z-capsule': {
    svg: `
      <!-- Studio Floor Shadow -->
      <ellipse cx="300" cy="490" rx="220" ry="24" fill="#0f172a" opacity="0.08" filter="url(#blurFloor)"/>
      <ellipse cx="280" cy="485" rx="160" ry="16" fill="#0f172a" opacity="0.12" filter="url(#blurFloor)"/>
      
      <!-- 3D Box (Becosules Z) -->
      <polygon points="120,200 190,140 430,140 360,200" fill="#ca8a04" stroke="#a16207" stroke-width="1.5"/>
      <polygon points="120,200 120,440 190,380 190,140" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <polygon points="190,140 430,140 430,380 190,380" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <!-- Box Branding -->
      <rect x="190" y="140" width="240" height="40" fill="#0f172a"/>
      <text x="205" y="168" fill="#facc15" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="900">BECOSULES Z</text>
      
      <text x="205" y="205" fill="#ca8a04" font-family="Arial, sans-serif" font-size="11" font-weight="bold">B-Complex Forte with Zinc &amp; Vit C</text>
      <text x="205" y="225" fill="#475569" font-size="10">Energy, Vitality &amp; Immunity</text>
      <text x="205" y="245" fill="#64748b" font-size="9">20 Capsules • Pfizer</text>
      
      <!-- Blister Strip with Dual Color B-Complex Capsules -->
      <g transform="translate(240, 240) rotate(-10)" filter="url(#dropShadowSoft)">
        <rect x="0" y="0" width="220" height="190" rx="10" fill="url(#silverFoilGrad)" stroke="#ca8a04" stroke-width="1.5"/>
        <rect x="5" y="5" width="210" height="24" rx="4" fill="#0f172a"/>
        <text x="15" y="22" fill="#facc15" font-family="Arial, sans-serif" font-size="12" font-weight="bold">BECOSULES Z • PFIZER</text>
        
        <!-- Dual Color Black & Yellow Capsules -->
        <g stroke="#94a3b8" stroke-width="1">
          <g transform="translate(20, 45)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(85, 45)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(150, 45)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(20, 90)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(85, 90)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(150, 90)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(20, 135)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(85, 135)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
          <g transform="translate(150, 135)">
            <rect x="0" y="0" width="48" height="14" rx="7" fill="#0f172a"/>
            <rect x="0" y="12" width="48" height="14" rx="7" fill="#eab308"/>
          </g>
        </g>
      </g>
    `
  }
};

function renderFullSVG(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="studioLighting" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </radialGradient>
    <filter id="blurFloor" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <filter id="dropShadowSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="silverFoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#f1f5f9"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="75%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="whiteBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="30%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>

  <rect width="600" height="600" fill="url(#studioLighting)"/>
  ${item.svg}
</svg>`;
}

for (const [key, item] of Object.entries(vitaminProducts)) {
  const filePath = path.join(targetDir, `${key}.svg`);
  fs.writeFileSync(filePath, renderFullSVG(item), 'utf8');
  console.log(`Generated vitamin product visual: ${key}.svg`);
}
