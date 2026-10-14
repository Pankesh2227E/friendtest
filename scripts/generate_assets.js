const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'static', 'assets', 'img');
const ROOT_DIR = path.join(__dirname, '..');
fs.mkdirSync(ASSETS_DIR, { recursive: true });

// 1. Icon SVG (Square 512x512) - Interlocking dual friendship orbits with central core
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B61FF" />
      <stop offset="100%" stop-color="#5B3DF5" />
    </linearGradient>
    <linearGradient id="gradAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8A7A" />
      <stop offset="100%" stop-color="#FF6B57" />
    </linearGradient>
    <linearGradient id="gradHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE072" />
      <stop offset="100%" stop-color="#FFD84D" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded squircle for app icon -->
  <rect width="512" height="512" rx="112" fill="#14121F"/>

  <!-- Subtle orbital grid ring -->
  <circle cx="256" cy="256" r="184" fill="none" stroke="#2B2447" stroke-width="4" stroke-dasharray="8 8"/>

  <!-- Left Orbit Loop -->
  <path d="M 256 128 C 172 128 104 185 104 256 C 104 327 172 384 256 384 C 298 384 336 369 362 344"
        fill="none" stroke="url(#gradPrimary)" stroke-width="28" stroke-linecap="round"/>

  <!-- Right Orbit Loop -->
  <path d="M 256 384 C 340 384 408 327 408 256 C 408 185 340 128 256 128 C 214 128 176 143 150 168"
        fill="none" stroke="url(#gradAccent)" stroke-width="28" stroke-linecap="round"/>

  <!-- Orbit nodes -->
  <circle cx="120" cy="220" r="16" fill="url(#gradHighlight)"/>
  <circle cx="392" cy="292" r="14" fill="#7B61FF"/>
  <circle cx="320" cy="144" r="12" fill="#FF8A7A"/>

  <!-- Central friendship nexus core -->
  <circle cx="256" cy="256" r="44" fill="#14121F" stroke="#FFFFFF" stroke-width="6"/>
  <circle cx="256" cy="256" r="28" fill="url(#gradHighlight)" filter="url(#glow)"/>
</svg>`;

// 2. Full Horizontal Logo with Wordmark (480x120)
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="480" height="120">
  <defs>
    <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B61FF" />
      <stop offset="100%" stop-color="#5B3DF5" />
    </linearGradient>
    <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8A7A" />
      <stop offset="100%" stop-color="#FF6B57" />
    </linearGradient>
    <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE072" />
      <stop offset="100%" stop-color="#FFD84D" />
    </linearGradient>
  </defs>

  <!-- Left Icon Mark -->
  <g transform="translate(10, 10)">
    <circle cx="50" cy="50" r="46" fill="#F4F1FF"/>
    <!-- Orbit Loops -->
    <path d="M 50 22 C 32 22 18 34 18 50 C 18 66 32 78 50 78 C 60 78 69 74 76 68"
          fill="none" stroke="url(#logoPrimary)" stroke-width="7" stroke-linecap="round"/>
    <path d="M 50 78 C 68 78 82 66 82 50 C 82 34 68 22 50 22 C 40 22 31 26 24 32"
          fill="none" stroke="url(#logoAccent)" stroke-width="7" stroke-linecap="round"/>
    <!-- Central Node -->
    <circle cx="50" cy="50" r="9" fill="url(#logoGold)" stroke="#FFFFFF" stroke-width="2.5"/>
    <circle cx="24" cy="40" r="3.5" fill="#7B61FF"/>
    <circle cx="76" cy="60" r="3.5" fill="#FF8A7A"/>
  </g>

  <!-- Typography: OrbitBond -->
  <text x="125" y="74" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="44" fill="#14121F" letter-spacing="-1">Orbit<tspan fill="#5B3DF5">Bond</tspan></text>
  <text x="127" y="98" font-family="'Inter', -apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="#746F8C" letter-spacing="2">FRIENDSHIP RADAR</text>
</svg>`;

// 3. Abstract Motif SVG (400x300) - For hero, empty states, results
const motifSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="mGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5B3DF5" />
      <stop offset="100%" stop-color="#8E78FF" />
    </linearGradient>
    <linearGradient id="mGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B57" />
      <stop offset="100%" stop-color="#FFA08A" />
    </linearGradient>
  </defs>

  <!-- Central Orbital Radar Rings -->
  <circle cx="200" cy="150" r="120" fill="none" stroke="#E6E0FF" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="200" cy="150" r="80" fill="none" stroke="#D3C7FF" stroke-width="3"/>
  <circle cx="200" cy="150" r="40" fill="#F4F1FF" stroke="#5B3DF5" stroke-width="4"/>

  <!-- Central Star / Score Node -->
  <circle cx="200" cy="150" r="18" fill="#FFD84D"/>
  <text x="200" y="156" font-family="sans-serif" font-size="16" font-weight="900" fill="#14121F" text-anchor="middle">★</text>

  <!-- Orbiting Friend Nodes -->
  <!-- Top Right Real One -->
  <g transform="translate(265, 85)">
    <circle cx="0" cy="0" r="24" fill="url(#mGrad1)"/>
    <text x="0" y="5" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">10</text>
    <rect x="-35" y="-34" width="70" height="18" rx="9" fill="#14121F"/>
    <text x="0" y="-22" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFD84D" text-anchor="middle">Real One</text>
  </g>

  <!-- Left Close Orbit -->
  <g transform="translate(125, 175)">
    <circle cx="0" cy="0" r="20" fill="url(#mGrad2)"/>
    <text x="0" y="5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">7</text>
    <rect x="-32" y="24" width="64" height="16" rx="8" fill="#14121F"/>
    <text x="0" y="35" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Close</text>
  </g>

  <!-- Outer Orbit -->
  <g transform="translate(300, 220)">
    <circle cx="0" cy="0" r="16" fill="#958EAA"/>
    <text x="0" y="4" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">3</text>
  </g>

  <!-- Decorative Orbit Nodes -->
  <circle cx="90" cy="90" r="6" fill="#FFD84D"/>
  <circle cx="160" cy="50" r="4" fill="#5B3DF5"/>
  <circle cx="340" cy="130" r="5" fill="#FF6B57"/>
</svg>`;

// 4. OpenGraph Share Card SVG (1200x630)
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14121F" />
      <stop offset="60%" stop-color="#1D1738" />
      <stop offset="100%" stop-color="#0E0C17" />
    </linearGradient>
    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B61FF" />
      <stop offset="100%" stop-color="#5B3DF5" />
    </linearGradient>
    <linearGradient id="coralGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8A7A" />
      <stop offset="100%" stop-color="#FF6B57" />
    </linearGradient>
    <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE072" />
      <stop offset="100%" stop-color="#FFD84D" />
    </linearGradient>
    <filter id="ogShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Ambient glowing rings -->
  <circle cx="950" cy="315" r="280" fill="none" stroke="#2B2252" stroke-width="2" stroke-dasharray="8 8"/>
  <circle cx="950" cy="315" r="210" fill="none" stroke="#3A2E70" stroke-width="3"/>
  <circle cx="950" cy="315" r="140" fill="none" stroke="#5B3DF5" stroke-width="4" stroke-opacity="0.6"/>

  <!-- Left Content Area -->
  <g transform="translate(100, 110)">
    <!-- Pill Badge -->
    <rect x="0" y="0" width="230" height="42" rx="21" fill="#241E3B" stroke="#5B3DF5" stroke-width="2"/>
    <circle cx="22" cy="21" r="7" fill="#FFD84D"/>
    <text x="38" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#E2DEFA" letter-spacing="1.5">ORBITBOND QUIZ</text>

    <!-- Main Title -->
    <text x="0" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-size="58" font-weight="900" fill="#FFFFFF" letter-spacing="-1.5">
      Fake Friend Test:
    </text>
    <text x="0" y="175" font-family="'Plus Jakarta Sans', sans-serif" font-size="52" font-weight="900" fill="url(#goldGlow)" letter-spacing="-1">
      Who Really Knows You?
    </text>

    <!-- Subtitle -->
    <text x="0" y="240" font-family="'Inter', sans-serif" font-size="22" font-weight="500" fill="#B4AECC" line-height="34">
      Answer 10 questions. Share your link with friends.
    </text>
    <text x="0" y="274" font-family="'Inter', sans-serif" font-size="22" font-weight="500" fill="#B4AECC">
      See who is in your Inner Circle on the live leaderboard.
    </text>

    <!-- Call to action button banner -->
    <g transform="translate(0, 320)">
      <rect width="240" height="58" rx="29" fill="url(#purpleGlow)"/>
      <text x="120" y="36" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">
        Start Free Quiz →
      </text>
    </g>
  </g>

  <!-- Right Orbit Radar Graphic -->
  <g transform="translate(950, 315)" filter="url(#ogShadow)">
    <!-- Central Node -->
    <circle cx="0" cy="0" r="54" fill="#14121F" stroke="#FFFFFF" stroke-width="5"/>
    <circle cx="0" cy="0" r="38" fill="url(#goldGlow)"/>
    <text x="0" y="9" font-family="'Plus Jakarta Sans', sans-serif" font-size="26" font-weight="900" fill="#14121F" text-anchor="middle">YOU</text>

    <!-- Score Node 1 (Real One: 10/10) -->
    <g transform="translate(130, -90)">
      <circle cx="0" cy="0" r="38" fill="url(#purpleGlow)" stroke="#FFFFFF" stroke-width="4"/>
      <text x="0" y="7" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">10/10</text>
      <rect x="-50" y="-48" width="100" height="26" rx="13" fill="#FFD84D"/>
      <text x="0" y="-31" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="900" fill="#14121F" text-anchor="middle">REAL ONE ★</text>
    </g>

    <!-- Score Node 2 (Close Orbit: 8/10) -->
    <g transform="translate(-140, 60)">
      <circle cx="0" cy="0" r="34" fill="url(#coralGlow)" stroke="#FFFFFF" stroke-width="4"/>
      <text x="0" y="6" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="900" fill="#FFFFFF" text-anchor="middle">8/10</text>
    </g>

    <!-- Score Node 3 (Outer Orbit: 4/10) -->
    <g transform="translate(60, 160)">
      <circle cx="0" cy="0" r="28" fill="#2B2447" stroke="#746F8C" stroke-width="3"/>
      <text x="0" y="6" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">4/10</text>
    </g>
  </g>
</svg>`;

async function run() {
  console.log('[Assets] Generating original vector & raster brand assets...');

  // Save SVGs
  fs.writeFileSync(path.join(ROOT_DIR, 'logo.svg'), logoSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'logo.svg'), logoSvg);

  fs.writeFileSync(path.join(ROOT_DIR, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'orbit-motif.svg'), motifSvg);

  // Render raster images using sharp
  // 1. logo-512.png (512x512 with app squircle)
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(ROOT_DIR, 'logo-512.png'));
  fs.copyFileSync(path.join(ROOT_DIR, 'logo-512.png'), path.join(ASSETS_DIR, 'logo-512.png'));

  // 2. favicon-512.png
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(ROOT_DIR, 'favicon-512.png'));
  fs.copyFileSync(path.join(ROOT_DIR, 'favicon-512.png'), path.join(ASSETS_DIR, 'favicon-512.png'));

  // 3. favicon-192.png
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(ROOT_DIR, 'favicon-192.png'));
  fs.copyFileSync(path.join(ROOT_DIR, 'favicon-192.png'), path.join(ASSETS_DIR, 'favicon-192.png'));

  // 4. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(ROOT_DIR, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(ROOT_DIR, 'apple-touch-icon.png'), path.join(ASSETS_DIR, 'apple-touch-icon.png'));

  // 5. favicon-32.png
  await sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(ROOT_DIR, 'favicon-32.png'));
  fs.copyFileSync(path.join(ROOT_DIR, 'favicon-32.png'), path.join(ASSETS_DIR, 'favicon-32.png'));

  // 6. favicon.ico (Sharp PNG -> ICO or 32x32 PNG as ico)
  const ico32Buffer = await sharp(Buffer.from(iconSvg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(ROOT_DIR, 'favicon.ico'), ico32Buffer);
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.ico'), ico32Buffer);

  // 7. og-home-1200x630.jpg (1200x630, high quality, under 300KB)
  const ogJpgPath = path.join(ASSETS_DIR, 'og-home-1200x630.jpg');
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(ogJpgPath);

  const ogStat = fs.statSync(ogJpgPath);
  console.log(`[Assets] Created og-home-1200x630.jpg: ${(ogStat.size / 1024).toFixed(1)} KB (Target: under 300 KB)`);

  console.log('[Assets] All original brand assets generated successfully!');
}

run().catch(err => {
  console.error('[Assets] Error:', err);
  process.exit(1);
});
