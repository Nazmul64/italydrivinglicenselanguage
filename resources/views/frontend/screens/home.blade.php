<!-- SCREEN: Home (Dashboard) -->
<div id="screen-home" class="screen active">
    <!-- Image Slider -->
    @if(count($sliders) > 0)
    <div class="slider-container">
        <div class="slider-wrapper" id="slider-wrapper">
            @foreach($sliders as $slider)
                <div class="slide">
                    <img src="{{ $slider->image_url }}" alt="{{ $slider->title }}">
                    <div class="slide-overlay">
                        <span class="slide-title">{{ $slider->title }}</span>
                        @if($slider->subtitle)
                            <span class="slide-subtitle">{{ $slider->subtitle }}</span>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
        <div class="slider-indicators">
            @foreach($sliders as $index => $slider)
                <span class="indicator {{ $index === 0 ? 'active' : '' }}" onclick="goToSlide({{ $index }})"></span>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Grid of Services: Dynamic Cards -->
    <section class="services-grid">
        @foreach($homeCards as $card)
            <div class="nav-card" onclick="openScreen('{{ $card->screen_key }}', '{{ $card->title }}')">
                <div class="illustration-box">
                    @php $sk = strtolower($card->screen_key); @endphp

                    @if($sk == 'lezioni')
                        {{-- Teacher / Video Class --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="10" y="20" width="80" height="52" rx="8" fill="#4A90D9"/>
                          <rect x="14" y="24" width="72" height="40" rx="5" fill="#fff"/>
                          <rect x="38" y="72" width="24" height="6" rx="2" fill="#4A90D9"/>
                          <rect x="26" y="78" width="48" height="5" rx="2.5" fill="#6ab0f5"/>
                          <!-- Screen content -->
                          <circle cx="50" cy="44" r="12" fill="#FFD95A"/>
                          <polygon points="46,38 46,50 58,44" fill="#fff" class="play-anim"/>
                          <!-- small dots -->
                          <circle cx="30" cy="56" r="3" fill="#FFD95A"/>
                          <rect x="36" y="54" width="20" height="4" rx="2" fill="#e0eeff"/>
                          <circle cx="66" cy="56" r="3" fill="#ff6b6b"/>
                        </svg>

                    @elseif($sk == 'test')
                        {{-- Online Test / Checklist --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="20" y="12" width="60" height="76" rx="8" fill="#fff" stroke="#e0e9ff" stroke-width="2"/>
                          <rect x="28" y="20" width="44" height="6" rx="3" fill="#4A90D9"/>
                          <!-- Checkboxes -->
                          <rect x="28" y="34" width="10" height="10" rx="2" fill="#4CAF50"/>
                          <polyline points="30,39 33,42 37,36" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
                          <rect x="42" y="35" width="26" height="4" rx="2" fill="#d0ddf5"/>
                          <rect x="42" y="41" width="18" height="3" rx="1.5" fill="#e8efff"/>

                          <rect x="28" y="50" width="10" height="10" rx="2" fill="#4CAF50"/>
                          <polyline points="30,55 33,58 37,52" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
                          <rect x="42" y="51" width="22" height="4" rx="2" fill="#d0ddf5"/>
                          <rect x="42" y="57" width="14" height="3" rx="1.5" fill="#e8efff"/>

                          <rect x="28" y="66" width="10" height="10" rx="2" fill="#FFD95A" class="blink-anim"/>
                          <rect x="42" y="67" width="26" height="4" rx="2" fill="#d0ddf5"/>
                          <rect x="42" y="73" width="20" height="3" rx="1.5" fill="#e8efff"/>
                          <!-- Pencil -->
                          <g class="pencil-anim" transform-origin="80 20">
                            <rect x="68" y="12" width="8" height="28" rx="2" fill="#FFD95A" transform="rotate(-30 72 26)"/>
                            <polygon points="71,37 73,37 72,42" fill="#ff9800" transform="rotate(-30 72 26)"/>
                          </g>
                        </svg>

                    @elseif($sk == 'argomenti')
                        {{-- Topics / Graduation Cap + Books --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Books stack -->
                          <rect x="18" y="58" width="64" height="14" rx="4" fill="#FF6B6B"/>
                          <rect x="22" y="46" width="56" height="14" rx="4" fill="#4A90D9"/>
                          <rect x="26" y="36" width="48" height="12" rx="4" fill="#FFD95A"/>
                          <!-- Spine lines -->
                          <line x1="24" y1="58" x2="24" y2="72" stroke="#fff" stroke-width="2" opacity="0.4"/>
                          <line x1="28" y1="46" x2="28" y2="60" stroke="#fff" stroke-width="2" opacity="0.4"/>
                          <line x1="32" y1="36" x2="32" y2="48" stroke="#fff" stroke-width="2" opacity="0.4"/>
                          <!-- Graduation cap -->
                          <polygon points="50,12 78,22 50,32 22,22" fill="#2c3e7a"/>
                          <rect x="47" y="22" width="6" height="14" rx="2" fill="#2c3e7a"/>
                          <circle cx="50" cy="36" r="5" fill="#FFD95A"/>
                          <!-- Tassel -->
                          <line x1="78" y1="22" x2="78" y2="34" stroke="#FFD95A" stroke-width="2.5"/>
                          <circle cx="78" cy="36" r="4" fill="#FFD95A" class="float-anim"/>
                        </svg>

                    @elseif($sk == 'eclass')
                        {{-- E-Learning / Devices --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Tablet -->
                          <rect x="10" y="22" width="56" height="44" rx="6" fill="#4A90D9"/>
                          <rect x="14" y="26" width="48" height="36" rx="4" fill="#fff"/>
                          <circle cx="38" cy="68" r="3" fill="#6ab0f5"/>
                          <!-- Screen: E-LEARNING text -->
                          <rect x="18" y="30" width="40" height="5" rx="2" fill="#4A90D9"/>
                          <text x="38" y="46" text-anchor="middle" fill="#2c3e7a" font-size="8" font-weight="bold">E-CLASS</text>
                          <rect x="18" y="50" width="28" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="18" y="55" width="20" height="3" rx="1.5" fill="#e8efff"/>
                          <!-- Phone beside -->
                          <rect x="70" y="38" width="20" height="32" rx="4" fill="#FF6B6B"/>
                          <rect x="73" y="42" width="14" height="22" rx="2" fill="#fff"/>
                          <circle cx="80" cy="67" r="2" fill="#ffb0b0"/>
                          <!-- small person -->
                          <circle cx="80" cy="46" r="4" fill="#FFD95A" class="float-anim"/>
                          <line x1="80" y1="50" x2="80" y2="58" stroke="#FFD95A" stroke-width="2.5"/>
                        </svg>

                    @elseif($sk == 'sfida')
                        {{-- Challenge / Trophy --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Trophy cup -->
                          <path d="M32,20 h36 v24 a18,18 0 0,1 -36,0 z" fill="#FFD95A"/>
                          <!-- Handles -->
                          <path d="M32,26 Q16,26 16,40 Q16,50 32,50" fill="none" stroke="#FFD95A" stroke-width="6" stroke-linecap="round"/>
                          <path d="M68,26 Q84,26 84,40 Q84,50 68,50" fill="none" stroke="#FFD95A" stroke-width="6" stroke-linecap="round"/>
                          <!-- Stem -->
                          <rect x="44" y="62" width="12" height="12" rx="2" fill="#FFD95A"/>
                          <!-- Base -->
                          <rect x="32" y="74" width="36" height="8" rx="4" fill="#FF9800"/>
                          <!-- Stars -->
                          <text x="50" y="46" text-anchor="middle" fill="#fff" font-size="16" class="star-anim">★</text>
                          <!-- Sparkles -->
                          <circle cx="22" cy="24" r="3" fill="#FFD95A" class="sparkle-1"/>
                          <circle cx="78" cy="20" r="2" fill="#FF6B6B" class="sparkle-2"/>
                          <circle cx="82" cy="60" r="2.5" fill="#4A90D9" class="sparkle-1"/>
                        </svg>

                    @elseif($sk == 'scheda-esame')
                        {{-- Exam Sheet / Certificate --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Paper -->
                          <rect x="18" y="10" width="64" height="80" rx="6" fill="#fff" stroke="#e0e9ff" stroke-width="2"/>
                          <!-- Header -->
                          <rect x="18" y="10" width="64" height="18" rx="6" fill="#4A90D9"/>
                          <rect x="18" y="22" width="64" height="6" fill="#4A90D9"/>
                          <text x="50" y="22" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">ESAME</text>
                          <!-- Lines -->
                          <rect x="26" y="36" width="48" height="4" rx="2" fill="#e0e9ff"/>
                          <rect x="26" y="44" width="40" height="4" rx="2" fill="#e0e9ff"/>
                          <rect x="26" y="52" width="44" height="4" rx="2" fill="#e0e9ff"/>
                          <rect x="26" y="60" width="36" height="4" rx="2" fill="#e0e9ff"/>
                          <!-- Gold stamp/seal -->
                          <circle cx="72" cy="76" r="12" fill="#FFD95A" class="float-anim"/>
                          <circle cx="72" cy="76" r="9" fill="none" stroke="#FF9800" stroke-width="2" stroke-dasharray="4,2"/>
                          <text x="72" y="80" text-anchor="middle" fill="#FF9800" font-size="9" font-weight="bold">✓</text>
                        </svg>

                    @elseif($sk == 'dizionario')
                        {{-- Dictionary / Open Book --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Open book -->
                          <path d="M50,20 Q35,16 16,20 L16,82 Q35,78 50,82 Q65,78 84,82 L84,20 Q65,16 50,20z" fill="#fff" stroke="#e0e9ff" stroke-width="1.5"/>
                          <!-- Spine -->
                          <line x1="50" y1="20" x2="50" y2="82" stroke="#4A90D9" stroke-width="3"/>
                          <!-- Left page lines -->
                          <rect x="20" y="30" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="20" y="37" width="20" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="20" y="44" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="20" y="51" width="16" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="20" y="58" width="22" height="3" rx="1.5" fill="#d0ddf5"/>
                          <!-- Right page lines -->
                          <rect x="56" y="30" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="56" y="37" width="18" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="56" y="44" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="56" y="51" width="20" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="56" y="58" width="16" height="3" rx="1.5" fill="#d0ddf5"/>
                          <!-- Book cover top -->
                          <path d="M16,20 Q35,14 50,20" fill="#4A90D9" opacity="0.8"/>
                          <path d="M84,20 Q65,14 50,20" fill="#4A90D9" opacity="0.8"/>
                          <!-- Magnifier -->
                          <circle cx="75" cy="72" r="10" fill="none" stroke="#FFD95A" stroke-width="4" class="float-anim"/>
                          <line x1="82" y1="79" x2="88" y2="85" stroke="#FFD95A" stroke-width="4" stroke-linecap="round"/>
                          <line x1="72" y1="69" x2="78" y2="75" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
                        </svg>

                    @elseif($sk == 'cartelli')
                        {{-- Road Signs --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Pole -->
                          <rect x="47" y="30" width="6" height="62" rx="3" fill="#90a0b7"/>
                          <!-- Stop sign (octagon) -->
                          <polygon points="37,10 63,10 73,20 73,36 63,46 37,46 27,36 27,20" fill="#FF3D3D"/>
                          <polygon points="39,13 61,13 70,22 70,34 61,43 39,43 30,34 30,22" fill="none" stroke="#fff" stroke-width="2"/>
                          <text x="50" y="32" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">STOP</text>
                          <!-- Small green sign -->
                          <rect x="54" y="50" width="28" height="18" rx="3" fill="#4CAF50"/>
                          <text x="68" y="62" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">GO</text>
                          <!-- Warning sign -->
                          <polygon points="18,82 30,60 42,82" fill="#FFD95A"/>
                          <polygon points="21,80 30,63 39,80" fill="none" stroke="#FF9800" stroke-width="1.5"/>
                          <text x="30" y="78" text-anchor="middle" fill="#FF9800" font-size="10" font-weight="bold">!</text>
                        </svg>

                    @elseif($sk == 'saved-mcqs')
                        {{-- Saved MCQs / Bookmarks --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <!-- Main bookmark -->
                          <path d="M22,12 L62,12 L62,78 L42,64 L22,78 Z" fill="#4A90D9"/>
                          <path d="M26,16 L58,16 L58,70 L42,58 L26,70 Z" fill="#6ab0f5" opacity="0.4"/>
                          <!-- Star on bookmark -->
                          <text x="42" y="42" text-anchor="middle" fill="#FFD95A" font-size="20" class="star-anim">★</text>
                          <!-- Secondary bookmark -->
                          <path d="M56,16 L78,16 L78,68 L67,56 L56,68 Z" fill="#FF6B6B" opacity="0.85"/>
                          <!-- Check marks -->
                          <polyline points="30,24 33,28 40,20" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                          <polyline points="30,34 33,38 40,30" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </svg>

                    @else
                        {{-- Fallback icon --}}
                        <div class="fallback-icon-box" style="background-color: {{ $card->icon_color }}1a; color: {{ $card->icon_color }}; width: 84px; height: 84px; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 36px;">
                            <i class="{{ $card->icon_class }}"></i>
                        </div>
                    @endif
                </div>
                <h3 class="card-title">{{ $card->title }}</h3>
                @if($card->subtitle)
                    <p class="card-subtitle">{{ $card->subtitle }}</p>
                @endif
            </div>
        @endforeach

        <!-- Correct MCQs Card -->
        <div class="nav-card" onclick="openScreen('correct-mcqs', 'Correct MCQs')">
            <div class="illustration-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                  <!-- Circle background -->
                  <circle cx="50" cy="50" r="38" fill="#E8F9F0"/>
                  <circle cx="50" cy="50" r="30" fill="#4CAF50" class="pulse-anim"/>
                  <!-- Big checkmark -->
                  <polyline points="34,50 45,62 66,38" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Sparkles -->
                  <circle cx="20" cy="28" r="4" fill="#FFD95A" class="sparkle-1"/>
                  <circle cx="80" cy="22" r="3" fill="#4CAF50" class="sparkle-2"/>
                  <circle cx="78" cy="76" r="3.5" fill="#FFD95A" class="sparkle-1"/>
                </svg>
            </div>
            <h3 class="card-title">CORRECT MCQS</h3>
            <p class="card-subtitle">সঠিক এমসিকিউ</p>
        </div>

        <!-- Wrong MCQs Card -->
        <div class="nav-card" onclick="openScreen('wrong-mcqs', 'Wrong MCQs')">
            <div class="illustration-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                  <!-- Circle background -->
                  <circle cx="50" cy="50" r="38" fill="#FFF0F0"/>
                  <circle cx="50" cy="50" r="30" fill="#FF6B6B" class="pulse-anim"/>
                  <!-- X mark -->
                  <line x1="36" y1="36" x2="64" y2="64" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
                  <line x1="64" y1="36" x2="36" y2="64" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
                  <!-- Sparkles -->
                  <circle cx="22" cy="32" r="4" fill="#FF6B6B" class="sparkle-2"/>
                  <circle cx="78" cy="24" r="3" fill="#FFD95A" class="sparkle-1"/>
                  <circle cx="76" cy="74" r="3.5" fill="#FF9800" class="sparkle-2"/>
                </svg>
            </div>
            <h3 class="card-title">WRONG MCQS</h3>
            <p class="card-subtitle">ভুল এমসিকিউ</p>
        </div>

        <!-- Support Card -->
        <div class="nav-card support-nav-card" onclick="toggleGuestChat(true)">
            <div class="illustration-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                  <!-- Headset -->
                  <circle cx="50" cy="38" r="22" fill="none" stroke="#4A90D9" stroke-width="5"/>
                  <!-- Headset ear cups -->
                  <rect x="22" y="36" width="10" height="18" rx="5" fill="#4A90D9"/>
                  <rect x="68" y="36" width="10" height="18" rx="5" fill="#4A90D9"/>
                  <!-- Mic arm -->
                  <path d="M50,60 Q50,72 40,76" fill="none" stroke="#4A90D9" stroke-width="4" stroke-linecap="round"/>
                  <circle cx="38" cy="78" r="5" fill="#FF6B6B" class="pulse-anim"/>
                  <!-- Chat bubble -->
                  <rect x="54" y="58" width="32" height="22" rx="8" fill="#FFD95A"/>
                  <polygon points="56,78 48,86 62,80" fill="#FFD95A"/>
                  <!-- Chat dots -->
                  <circle cx="63" cy="69" r="2.5" fill="#fff"/>
                  <circle cx="70" cy="69" r="2.5" fill="#fff"/>
                  <circle cx="77" cy="69" r="2.5" fill="#fff" class="blink-anim"/>
                </svg>
            </div>
            <h3 class="card-title">SUPPORT</h3>
            <p class="card-subtitle">Live Chat</p>
        </div>
    </section>
</div>
