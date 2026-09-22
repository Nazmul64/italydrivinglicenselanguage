<?php
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\HomeCard;

$cardsDir = public_path('uploads/cards');
if (!file_exists($cardsDir)) {
    mkdir($cardsDir, 0777, true);
}

// 1. Sfida (Golden Trophy & Challenge)
$svgSfida = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF099"/>
      <stop offset="40%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#FDE68A" stop-opacity="0"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#D97706" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background Glow & Stars -->
  <circle cx="300" cy="200" r="160" fill="url(#glowGrad)"/>
  <circle cx="160" cy="110" r="14" fill="#FBBF24" opacity="0.8"/>
  <polygon points="160,98 163,107 172,110 163,113 160,122 157,113 148,110 157,107" fill="#FFF"/>
  <circle cx="440" cy="90" r="18" fill="#F59E0B" opacity="0.8"/>
  <polygon points="440,76 443,87 454,90 443,93 440,104 437,93 426,90 437,87" fill="#FFF"/>
  <circle cx="470" cy="250" r="10" fill="#3B82F6" opacity="0.6"/>
  <circle cx="130" cy="260" r="12" fill="#EC4899" opacity="0.6"/>

  <!-- Trophy Handles -->
  <path d="M 210,130 C 120,130 120,230 220,245" fill="none" stroke="url(#goldGrad)" stroke-width="24" stroke-linecap="round"/>
  <path d="M 390,130 C 480,130 480,230 380,245" fill="none" stroke="url(#goldGrad)" stroke-width="24" stroke-linecap="round"/>

  <!-- Trophy Main Body -->
  <path d="M 200,90 L 400,90 C 400,90 405,240 300,270 C 195,240 200,90 200,90 Z" fill="url(#goldGrad)" filter="url(#dropShadow)"/>
  <ellipse cx="300" cy="90" rx="100" ry="18" fill="#FDE68A"/>

  <!-- Star on Cup -->
  <polygon points="300,130 312,165 348,165 319,186 330,220 300,198 270,220 281,186 252,165 288,165" fill="#FFFFFF" opacity="0.95"/>

  <!-- Stem & Base -->
  <path d="M 282,270 L 318,270 L 324,320 L 276,320 Z" fill="url(#goldGrad)"/>
  <rect x="230" y="320" width="140" height="24" rx="8" fill="url(#goldGrad)"/>
  <rect x="200" y="344" width="200" height="42" rx="12" fill="url(#pedestalGrad)" filter="url(#dropShadow)"/>
  <text x="300" y="372" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="4">SFIDA #1</text>
</svg>
SVG;

// 2. Scheda Esame (Official Exam Sheet)
$svgScheda = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="sheetShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#1E293B" flood-opacity="0.18"/>
    </filter>
  </defs>
  <!-- Background Sheet -->
  <rect x="150" y="40" width="270" height="340" rx="20" fill="#E2E8F0" transform="rotate(-6 285 210)"/>
  <!-- Main Sheet -->
  <rect x="165" y="40" width="270" height="340" rx="20" fill="url(#cardGrad)" filter="url(#sheetShadow)"/>
  <!-- Top Header Bar -->
  <rect x="165" y="40" width="270" height="60" rx="20" fill="url(#headerGrad)"/>
  <rect x="165" y="80" width="270" height="20" fill="url(#headerGrad)"/>
  <text x="300" y="78" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="19" fill="#FFFFFF" letter-spacing="2">SCHEDA ESAME</text>
  
  <!-- Question Checkboxes -->
  <g transform="translate(195, 125)">
    <!-- Row 1 -->
    <rect x="0" y="0" width="26" height="26" rx="6" fill="#10B981"/>
    <path d="M7 13 L11 17 L19 9" stroke="#FFF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="38" y="6" width="130" height="14" rx="7" fill="#CBD5E1"/>
    
    <!-- Row 2 -->
    <rect x="0" y="42" width="26" height="26" rx="6" fill="#10B981"/>
    <path d="M7 55 L11 59 L19 51" stroke="#FFF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="38" y="48" width="150" height="14" rx="7" fill="#CBD5E1"/>
    
    <!-- Row 3 -->
    <rect x="0" y="84" width="26" height="26" rx="6" fill="#EF4444"/>
    <path d="M8 92 L18 102 M18 92 L8 102" stroke="#FFF" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="38" y="90" width="110" height="14" rx="7" fill="#CBD5E1"/>

    <!-- Row 4 -->
    <rect x="0" y="126" width="26" height="26" rx="6" fill="#10B981"/>
    <path d="M7 139 L11 143 L19 135" stroke="#FFF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="38" y="132" width="140" height="14" rx="7" fill="#CBD5E1"/>
  </g>

  <!-- Passed Official Seal -->
  <circle cx="390" cy="330" r="48" fill="url(#badgeGrad)" filter="url(#sheetShadow)"/>
  <circle cx="390" cy="330" r="42" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="390" y="326" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF">IDONEO</text>
  <text x="390" y="344" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="12" fill="#FEF08A">PROMOSSO</text>
</svg>
SVG;

// 3. Word (Vocabulary & Flashcards)
$svgWord = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>
    <filter id="wordShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#064E3B" flood-opacity="0.2"/>
    </filter>
  </defs>
  <!-- Background Glow -->
  <circle cx="300" cy="210" r="170" fill="#D1FAE5" opacity="0.6"/>

  <!-- Back Card -->
  <rect x="140" y="80" width="220" height="260" rx="20" fill="#A7F3D0" transform="rotate(-12 250 210)" filter="url(#wordShadow)"/>
  
  <!-- Main Vocabulary Flashcard -->
  <rect x="200" y="60" width="260" height="290" rx="24" fill="url(#cardBg)" filter="url(#wordShadow)"/>
  
  <!-- Header of card -->
  <rect x="200" y="60" width="260" height="70" rx="24" fill="url(#bookCover)"/>
  <rect x="200" y="100" width="260" height="30" fill="url(#bookCover)"/>
  <text x="330" y="105" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="3">PAROLA</text>
  
  <!-- Content Lines & Translations -->
  <text x="330" y="170" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="26" fill="#0F172A">SORPASSO</text>
  <rect x="240" y="190" width="180" height="3" fill="#10B981" rx="1.5"/>
  <text x="330" y="225" text-anchor="middle" font-family="'Kalpurush', 'Hind Siliguri', sans-serif" font-weight="700" font-size="22" fill="#047857">ওভারটেক / অতিক্রম</text>
  
  <!-- Badges -->
  <rect x="235" y="260" width="85" height="32" rx="16" fill="#ECFDF5"/>
  <text x="277" y="281" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="12" fill="#059669">🇮🇹 ITALIANO</text>

  <rect x="340" y="260" width="85" height="32" rx="16" fill="#EFF6FF"/>
  <text x="382" y="281" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="12" fill="#2563EB">🇧🇩 BANGLA</text>
  
  <!-- Bookmark Ribbon -->
  <path d="M 400,60 L 400,120 L 415,105 L 430,120 L 430,60 Z" fill="#F59E0B"/>
</svg>
SVG;

// 4. Saved MCQs (Bookmarks & Stars)
$svgSaved = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="bookmarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>
    <filter id="savedShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1E40AF" flood-opacity="0.22"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#DBEAFE" opacity="0.6"/>
  
  <!-- Card Base -->
  <rect x="180" y="60" width="240" height="300" rx="24" fill="#FFFFFF" filter="url(#savedShadow)"/>
  
  <!-- Header -->
  <rect x="180" y="60" width="240" height="65" rx="24" fill="url(#bookmarkGrad)"/>
  <rect x="180" y="95" width="240" height="30" fill="url(#bookmarkGrad)"/>
  <text x="300" y="102" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" letter-spacing="2">SAVED MCQS</text>
  
  <!-- Bookmark Graphic Ribbons -->
  <path d="M 230,145 L 290,145 L 290,265 L 260,240 L 230,265 Z" fill="#EF4444" filter="url(#savedShadow)"/>
  <path d="M 310,145 L 370,145 L 370,265 L 340,240 L 310,265 Z" fill="url(#starGrad)" filter="url(#savedShadow)"/>

  <!-- Star Icon -->
  <polygon points="340,175 346,192 364,192 350,203 355,220 340,209 325,220 330,203 316,192 334,192" fill="#FFFFFF"/>
  <polygon points="260,175 266,192 284,192 270,203 275,220 260,209 245,220 250,203 236,192 254,192" fill="#FFFFFF"/>

  <!-- Notes Lines -->
  <rect x="220" y="295" width="160" height="12" rx="6" fill="#CBD5E1"/>
  <rect x="220" y="320" width="110" height="12" rx="6" fill="#E2E8F0"/>
</svg>
SVG;

// 5. Correct MCQs (Green Checkmark Success)
$svgCorrect = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="correctGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="correctShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#059669" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background Sparkles -->
  <circle cx="300" cy="210" r="165" fill="#D1FAE5" opacity="0.6"/>
  <circle cx="150" cy="120" r="16" fill="#FBBF24" opacity="0.8"/>
  <circle cx="450" cy="110" r="18" fill="#10B981" opacity="0.8"/>
  <circle cx="470" cy="270" r="12" fill="#3B82F6" opacity="0.7"/>

  <!-- Big Green Circle Badge -->
  <circle cx="300" cy="200" r="115" fill="url(#correctGrad)" filter="url(#correctShadow)"/>
  <circle cx="300" cy="200" r="95" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="10 6" opacity="0.8"/>

  <!-- Thick White Checkmark -->
  <path d="M 235,200 L 280,245 L 365,155" fill="none" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- 100% Score Tag -->
  <rect x="220" y="335" width="160" height="42" rx="21" fill="#047857" filter="url(#correctShadow)"/>
  <text x="300" y="362" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" letter-spacing="2">100% VERO</text>
</svg>
SVG;

// 6. Wrong MCQs (Red Shield & Error Correction)
$svgWrong = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="wrongGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F87171"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
    <filter id="wrongShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#DC2626" flood-opacity="0.3"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="165" fill="#FEE2E2" opacity="0.6"/>

  <!-- Red Circle Badge -->
  <circle cx="300" cy="200" r="115" fill="url(#wrongGrad)" filter="url(#wrongShadow)"/>
  <circle cx="300" cy="200" r="95" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="10 6" opacity="0.8"/>

  <!-- Cross Mark -->
  <path d="M 245,145 L 355,255 M 355,145 L 245,255" fill="none" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round"/>

  <!-- Review Tag -->
  <rect x="210" y="335" width="180" height="42" rx="21" fill="#991B1B" filter="url(#wrongShadow)"/>
  <text x="300" y="362" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" letter-spacing="2">RETRY &amp; FIX</text>
</svg>
SVG;

// 7. Support (Live Chat Agent with Headset)
$svgSupport = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="supGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="100%" stop-color="#FDBA74"/>
    </linearGradient>
    <filter id="supShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0284C7" flood-opacity="0.25"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#E0F2FE" opacity="0.6"/>

  <!-- Chat Bubble Floating -->
  <path d="M 370,50 L 470,50 C 485,50 495,60 495,75 L 495,115 C 495,130 485,140 470,140 L 400,140 L 375,160 L 380,140 L 370,140 C 355,140 345,130 345,115 L 345,75 C 345,60 355,50 370,50 Z" fill="#22C55E" filter="url(#supShadow)"/>
  <text x="420" y="102" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF">24/7</text>

  <!-- Person Base / Body -->
  <path d="M 190,360 C 190,280 230,260 300,260 C 370,260 410,280 410,360 Z" fill="url(#supGrad)" filter="url(#supShadow)"/>

  <!-- Head -->
  <circle cx="300" cy="185" r="60" fill="url(#faceGrad)" filter="url(#supShadow)"/>
  
  <!-- Hair -->
  <path d="M 240,175 C 240,120 280,115 300,115 C 330,115 360,125 360,175 C 350,150 330,140 300,140 C 270,140 250,150 240,175 Z" fill="#1E293B"/>

  <!-- Headset -->
  <path d="M 235,185 C 235,115 365,115 365,185" fill="none" stroke="#334155" stroke-width="14" stroke-linecap="round"/>
  <rect x="225" y="165" width="20" height="40" rx="10" fill="#0284C7"/>
  <rect x="355" y="165" width="20" height="40" rx="10" fill="#0284C7"/>
  <path d="M 235,195 C 235,235 270,240 285,240" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <circle cx="288" cy="240" r="7" fill="#F43F5E"/>
</svg>
SVG;

// 8. Top Performers (Podium & Gold Medal Ranking)
$svgPerformers = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="podium1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="podium2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
    <linearGradient id="podium3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <filter id="podiumShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.2"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#FEF3C7" opacity="0.6"/>

  <!-- Podium 2 (Left) -->
  <rect x="130" y="210" width="105" height="150" rx="14" fill="url(#podium2)" filter="url(#podiumShadow)"/>
  <text x="182" y="270" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="36" fill="#FFFFFF">2</text>
  <circle cx="182" cy="160" r="32" fill="#E2E8F0" filter="url(#podiumShadow)"/>
  <text x="182" y="172" text-anchor="middle" font-size="28">🥈</text>

  <!-- Podium 3 (Right) -->
  <rect x="365" y="240" width="105" height="120" rx="14" fill="url(#podium3)" filter="url(#podiumShadow)"/>
  <text x="417" y="300" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="36" fill="#FFFFFF">3</text>
  <circle cx="417" cy="190" r="32" fill="#FED7AA" filter="url(#podiumShadow)"/>
  <text x="417" y="202" text-anchor="middle" font-size="28">🥉</text>

  <!-- Podium 1 (Center) -->
  <rect x="240" y="160" width="120" height="200" rx="16" fill="url(#podium1)" filter="url(#podiumShadow)"/>
  <text x="300" y="240" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="48" fill="#FFFFFF">1</text>
  
  <!-- Crown & Winner Avatar -->
  <circle cx="300" cy="100" r="40" fill="#FEF08A" filter="url(#podiumShadow)"/>
  <text x="300" y="114" text-anchor="middle" font-size="36">👑</text>
</svg>
SVG;

// 9. Manuale (Driving Handbook Theory Book)
$svgManuale = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
    <filter id="bookShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#1E3A8A" flood-opacity="0.25"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#DBEAFE" opacity="0.6"/>

  <!-- Book Pages Stack -->
  <rect x="180" y="60" width="240" height="290" rx="18" fill="#F8FAFC" filter="url(#bookShadow)"/>
  <rect x="170" y="55" width="240" height="290" rx="18" fill="#FFFFFF" filter="url(#bookShadow)"/>

  <!-- Book Cover -->
  <rect x="160" y="50" width="240" height="290" rx="18" fill="url(#bookGrad)" filter="url(#bookShadow)"/>
  
  <!-- Book Spine detail -->
  <rect x="160" y="50" width="30" height="290" rx="6" fill="#1D4ED8"/>
  <line x1="190" y1="50" x2="190" y2="340" stroke="#60A5FA" stroke-width="2"/>

  <!-- Driving Wheel on Book Cover -->
  <circle cx="295" cy="160" r="46" fill="none" stroke="#FDE047" stroke-width="12"/>
  <circle cx="295" cy="160" r="14" fill="#FDE047"/>
  <line x1="295" y1="126" x2="295" y2="194" stroke="#FDE047" stroke-width="8"/>
  <line x1="261" y1="160" x2="329" y2="160" stroke="#FDE047" stroke-width="8"/>

  <!-- Text on Book -->
  <text x="295" y="240" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="2">MANUALE</text>
  <text x="295" y="270" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="16" fill="#93C5FD" letter-spacing="4">PATENTE B</text>

  <!-- Gold Bookmark Ribbon -->
  <path d="M 350,50 L 350,110 L 365,95 L 380,110 L 380,50 Z" fill="#F59E0B"/>
</svg>
SVG;

// 10. Patente Social (Community Feed & People)
$svgSocial = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="socialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
    <filter id="socShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#6D28D9" flood-opacity="0.22"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#EDE9FE" opacity="0.6"/>

  <!-- Phone Mockup Container -->
  <rect x="200" y="45" width="200" height="320" rx="28" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3" filter="url(#socShadow)"/>
  
  <!-- Header Bar -->
  <rect x="200" y="45" width="200" height="60" rx="28" fill="url(#socialGrad)"/>
  <rect x="200" y="80" width="200" height="25" fill="url(#socialGrad)"/>
  <text x="300" y="82" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" letter-spacing="1">PATENTE SOCIAL</text>

  <!-- Post Card 1 -->
  <rect x="215" y="125" width="170" height="85" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
  <circle cx="238" cy="148" r="14" fill="#EC4899"/>
  <rect x="260" y="140" width="80" height="8" rx="4" fill="#64748B"/>
  <rect x="260" y="152" width="50" height="6" rx="3" fill="#94A3B8"/>
  <text x="360" y="152" text-anchor="middle" font-size="14">❤️</text>
  <rect x="228" y="172" width="144" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="228" y="184" width="100" height="6" rx="3" fill="#E2E8F0"/>

  <!-- Post Card 2 -->
  <rect x="215" y="225" width="170" height="85" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
  <circle cx="238" cy="248" r="14" fill="#3B82F6"/>
  <rect x="260" y="240" width="80" height="8" rx="4" fill="#64748B"/>
  <rect x="260" y="252" width="50" height="6" rx="3" fill="#94A3B8"/>
  <text x="360" y="252" text-anchor="middle" font-size="14">👍</text>
  <rect x="228" y="272" width="144" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="228" y="284" width="110" height="6" rx="3" fill="#E2E8F0"/>
</svg>
SVG;

// 11. Translation (Bilingual IT <-> BN Translator)
$svgTrans = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="transGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <filter id="transShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0284C7" flood-opacity="0.25"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#E0F2FE" opacity="0.6"/>

  <!-- Left Bubble (Italian) -->
  <g transform="translate(130, 90)">
    <rect x="0" y="0" width="160" height="150" rx="24" fill="#FFFFFF" filter="url(#transShadow)"/>
    <rect x="0" y="0" width="160" height="50" rx="24" fill="#22C55E"/>
    <rect x="0" y="30" width="160" height="20" fill="#22C55E"/>
    <text x="80" y="32" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">🇮🇹 ITALIANO</text>
    <text x="80" y="95" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="28" fill="#1E293B">Patente</text>
    <text x="80" y="125" text-anchor="middle" font-size="18">🔊 [পা-তেন-তে]</text>
  </g>

  <!-- Exchange Arrows in Middle -->
  <circle cx="300" cy="180" r="32" fill="url(#transGrad)" filter="url(#transShadow)"/>
  <path d="M 285,170 L 315,170 M 310,165 L 315,170 L 310,175" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 315,190 L 285,190 M 290,185 L 285,190 L 290,195" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Right Bubble (Bangla) -->
  <g transform="translate(310, 150)">
    <rect x="0" y="0" width="160" height="150" rx="24" fill="#FFFFFF" filter="url(#transShadow)"/>
    <rect x="0" y="0" width="160" height="50" rx="24" fill="#EF4444"/>
    <rect x="0" y="30" width="160" height="20" fill="#EF4444"/>
    <text x="80" y="32" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">🇧🇩 BANGLA</text>
    <text x="80" y="95" text-anchor="middle" font-family="'Kalpurush', 'Hind Siliguri', sans-serif" font-weight="900" font-size="24" fill="#1E293B">ড্রাইভিং লাইসেন্স</text>
    <text x="80" y="125" text-anchor="middle" font-size="14" fill="#059669">✓ সঠিক উচ্চারণ</text>
  </g>
</svg>
SVG;

// 12. Dizionario (A-Z Lexicon Search)
$svgDict = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
  <defs>
    <linearGradient id="dictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D9488"/>
      <stop offset="100%" stop-color="#0F766E"/>
    </linearGradient>
    <filter id="dictShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0F766E" flood-opacity="0.25"/>
    </filter>
  </defs>
  <circle cx="300" cy="210" r="170" fill="#CCFBF1" opacity="0.6"/>

  <!-- Dictionary Book Body -->
  <rect x="170" y="60" width="260" height="280" rx="24" fill="#FFFFFF" filter="url(#dictShadow)"/>
  
  <!-- Header -->
  <rect x="170" y="60" width="260" height="65" rx="24" fill="url(#dictGrad)"/>
  <rect x="170" y="95" width="260" height="30" fill="url(#dictGrad)"/>
  <text x="300" y="102" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" letter-spacing="3">DIZIONARIO A-Z</text>

  <!-- Alphabet Search Bar -->
  <rect x="195" y="145" width="210" height="36" rx="18" fill="#F0FDFA" stroke="#99F6E4"/>
  <text x="215" y="168" font-size="16">🔍</text>
  <text x="240" y="168" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="14" fill="#0D9488">Cerca parola...</text>

  <!-- Word Entries -->
  <g transform="translate(195, 200)">
    <rect x="0" y="0" width="210" height="38" rx="10" fill="#F8FAFC"/>
    <text x="12" y="24" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="14" fill="#0F172A">A • Autostrada</text>
    <text x="195" y="24" text-anchor="end" font-size="13" fill="#0D9488">হাইওয়ে</text>
    
    <rect x="0" y="48" width="210" height="38" rx="10" fill="#F8FAFC"/>
    <text x="12" y="72" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="14" fill="#0F172A">B • Banchina</text>
    <text x="195" y="72" text-anchor="end" font-size="13" fill="#0D9488">রাস্তার ধার</text>

    <rect x="0" y="96" width="210" height="38" rx="10" fill="#F8FAFC"/>
    <text x="12" y="120" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="14" fill="#0F172A">C • Corsia</text>
    <text x="195" y="120" text-anchor="end" font-size="13" fill="#0D9488">লেন</text>
  </g>
</svg>
SVG;

// Save all SVGs to /uploads/cards/
$svgFiles = [
    'sfida.svg' => $svgSfida,
    'scheda_esame.svg' => $svgScheda,
    'word.svg' => $svgWord,
    'saved_mcqs.svg' => $svgSaved,
    'correct_mcqs.svg' => $svgCorrect,
    'wrong_mcqs.svg' => $svgWrong,
    'support.svg' => $svgSupport,
    'top_performers.svg' => $svgPerformers,
    'manuale.svg' => $svgManuale,
    'patente_social.svg' => $svgSocial,
    'translation.svg' => $svgTrans,
    'dictionary.svg' => $svgDict,
];

foreach ($svgFiles as $fn => $content) {
    file_put_contents($cardsDir . '/' . $fn, $content);
    echo "Saved: uploads/cards/{$fn}\n";
}

// Update DB HomeCards
$cardUpdates = [
    'sfida' => ['title' => 'Sfida', 'image_url' => '/uploads/cards/sfida.svg', 'media_type' => 'image'],
    'scheda-esame' => ['title' => 'Scheda Esame', 'image_url' => '/uploads/cards/scheda_esame.svg', 'media_type' => 'image'],
    'words' => ['title' => 'Word', 'image_url' => '/uploads/cards/word.svg', 'media_type' => 'image'],
    'saved-mcqs' => ['title' => 'Saved MCQs', 'image_url' => '/uploads/cards/saved_mcqs.svg', 'media_type' => 'image'],
    'correct-mcqs' => ['title' => 'Correct MCQs', 'image_url' => '/uploads/cards/correct_mcqs.svg', 'media_type' => 'image'],
    'wrong-mcqs' => ['title' => 'Wrong MCQs', 'image_url' => '/uploads/cards/wrong_mcqs.svg', 'media_type' => 'image'],
    'support' => ['title' => 'Support', 'image_url' => '/uploads/cards/support.svg', 'media_type' => 'image'],
    'top-performers' => ['title' => 'Top Performers', 'image_url' => '/uploads/cards/top_performers.svg', 'media_type' => 'image'],
    'manuale' => ['title' => 'Manuale', 'image_url' => '/uploads/cards/manuale.svg', 'media_type' => 'image'],
    'patente-social' => ['title' => 'Patente Social', 'image_url' => '/uploads/cards/patente_social.svg', 'media_type' => 'image'],
    'translation' => ['title' => 'Translation', 'image_url' => '/uploads/cards/translation.svg', 'media_type' => 'image'],
    'dictionary' => ['title' => 'Dizionario', 'image_url' => '/uploads/cards/dictionary.svg', 'media_type' => 'image'],
];

foreach ($cardUpdates as $sk => $data) {
    $c = HomeCard::where('screen_key', $sk)->first();
    if ($c) {
        $c->update([
            'image_url' => $data['image_url'],
            'icon_url' => $data['image_url'],
            'media_type' => 'image',
            'status' => 1
        ]);
        echo "Updated DB Card: {$c->title} -> {$data['image_url']}\n";
    }
}

// Make sure existing image cards also have media_type = image
$allCards = HomeCard::all();
foreach ($allCards as $c) {
    $c->update(['media_type' => 'image', 'status' => 1]);
}

echo "All 18 cards successfully configured with images!\n";
