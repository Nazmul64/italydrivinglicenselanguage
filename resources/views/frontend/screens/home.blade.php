<!-- SCREEN: Home (Dashboard) -->
<div id="screen-home" class="screen active">
    <!-- Image Slider -->
    @if(count($sliders) > 0)
    <div class="slider-container">
        <div class="slider-wrapper" id="slider-wrapper">
            @foreach($sliders as $slider)
                <div class="slide">
                    <img src="{{ $slider->image_url }}" alt="{{ $slider->title }}">
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
            @php 
                $sk = strtolower($card->screen_key); 
                $onClickAttr = "openScreen('" . addslashes($card->screen_key) . "', '" . addslashes($card->title) . "')";
                if ($sk == 'support') {
                    $onClickAttr = "toggleGuestChat(true)";
                } elseif ($sk == 'top-performers' || $sk == 'top_performers') {
                    $onClickAttr = "openScreen('sfida', 'Leaderboard')";
                } elseif ($sk == 'correct-mcqs' || $sk == 'correct_questions') {
                    $onClickAttr = "openScreen('correct-mcqs', 'Correct MCQs')";
                } elseif ($sk == 'wrong-mcqs' || $sk == 'wrong_questions') {
                    $onClickAttr = "openScreen('wrong-mcqs', 'Wrong MCQs')";
                } elseif ($sk == 'saved-mcqs' || $sk == 'saved_questions') {
                    $onClickAttr = "openScreen('saved-mcqs', 'Saved MCQs')";
                } elseif ($sk == 'patente-social' || $sk == 'patente_social' || $sk == 'social') {
                    $onClickAttr = "openScreen('social', 'Patente Social')";
                }
            @endphp
            <div class="nav-card {{ $sk == 'support' ? 'support-nav-card' : '' }}" onclick="{{ $onClickAttr }}">
                <div class="illustration-box">
                    @if($sk == 'lezioni' || $sk == 'tutorials')
                        {{-- Teacher / Video Class --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="10" y="20" width="80" height="52" rx="8" fill="#4A90D9"/>
                          <rect x="14" y="24" width="72" height="40" rx="5" fill="#fff"/>
                          <rect x="38" y="72" width="24" height="6" rx="2" fill="#4A90D9"/>
                          <rect x="26" y="78" width="48" height="5" rx="2.5" fill="#6ab0f5"/>
                          <circle cx="50" cy="44" r="12" fill="#FFD95A"/>
                          <polygon points="46,38 46,50 58,44" fill="#fff" class="play-anim"/>
                          <circle cx="30" cy="56" r="3" fill="#FFD95A"/>
                          <rect x="36" y="54" width="20" height="4" rx="2" fill="#e0eeff"/>
                          <circle cx="66" cy="56" r="3" fill="#ff6b6b"/>
                        </svg>

                    @elseif($sk == 'test' || $sk == 'tasbih')
                        {{-- Online Test / Checklist --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="20" y="12" width="60" height="76" rx="8" fill="#fff" stroke="#e0e9ff" stroke-width="2"/>
                          <rect x="28" y="20" width="44" height="6" rx="3" fill="#4A90D9"/>
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
                          <g class="pencil-anim" transform-origin="80 20">
                            <rect x="68" y="12" width="8" height="28" rx="2" fill="#FFD95A" transform="rotate(-30 72 26)"/>
                            <polygon points="71,37 73,37 72,42" fill="#ff9800" transform="rotate(-30 72 26)"/>
                          </g>
                        </svg>

                    @elseif($sk == 'argomenti' || $sk == 'quotes')
                        {{-- Topics / Graduation Cap + Books --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="18" y="58" width="64" height="14" rx="4" fill="#FF6B6B"/>
                          <rect x="22" y="46" width="56" height="14" rx="4" fill="#4A90D9"/>
                          <rect x="26" y="36" width="48" height="12" rx="4" fill="#FFD95A"/>
                          <line x1="24" y1="58" x2="24" y2="72" stroke="#fff" stroke-width="2" opacity="0.4"/>
                          <line x1="28" y1="46" x2="28" y2="60" stroke="#fff" stroke-width="2" opacity="0.4"/>
                          <line x1="32" y1="36" x2="32" y2="48" stroke="#fff" stroke-width="2" opacity="0.4"/>
                          <polygon points="50,12 78,22 50,32 22,22" fill="#2c3e7a"/>
                          <rect x="47" y="22" width="6" height="14" rx="2" fill="#2c3e7a"/>
                          <circle cx="50" cy="36" r="5" fill="#FFD95A"/>
                          <line x1="78" y1="22" x2="78" y2="34" stroke="#FFD95A" stroke-width="2.5"/>
                          <circle cx="78" cy="36" r="4" fill="#FFD95A" class="float-anim"/>
                        </svg>

                    @elseif($sk == 'eclass' || $sk == 'text_analyzer')
                        {{-- E-Learning / Devices --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="10" y="22" width="56" height="44" rx="6" fill="#4A90D9"/>
                          <rect x="14" y="26" width="48" height="36" rx="4" fill="#fff"/>
                          <circle cx="38" cy="68" r="3" fill="#6ab0f5"/>
                          <rect x="18" y="30" width="40" height="5" rx="2" fill="#4A90D9"/>
                          <text x="38" y="46" text-anchor="middle" fill="#2c3e7a" font-size="8" font-weight="bold">E-CLASS</text>
                          <rect x="18" y="50" width="28" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="18" y="55" width="20" height="3" rx="1.5" fill="#e8efff"/>
                          <rect x="70" y="38" width="20" height="32" rx="4" fill="#FF6B6B"/>
                          <rect x="73" y="42" width="14" height="22" rx="2" fill="#fff"/>
                          <circle cx="80" cy="67" r="2" fill="#ffb0b0"/>
                          <circle cx="80" cy="46" r="4" fill="#FFD95A" class="float-anim"/>
                          <line x1="80" y1="50" x2="80" y2="58" stroke="#FFD95A" stroke-width="2.5"/>
                        </svg>

                    @elseif($sk == 'sfida')
                        {{-- Challenge / Trophy --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <path d="M32,20 h36 v24 a18,18 0 0,1 -36,0 z" fill="#FFD95A"/>
                          <path d="M32,26 Q16,26 16,40 Q16,50 32,50" fill="none" stroke="#FFD95A" stroke-width="6" stroke-linecap="round"/>
                          <path d="M68,26 Q84,26 84,40 Q84,50 68,50" fill="none" stroke="#FFD95A" stroke-width="6" stroke-linecap="round"/>
                          <rect x="44" y="62" width="12" height="12" rx="2" fill="#FFD95A"/>
                          <rect x="32" y="74" width="36" height="8" rx="4" fill="#FF9800"/>
                          <text x="50" y="46" text-anchor="middle" fill="#fff" font-size="16" class="star-anim">★</text>
                          <circle cx="22" cy="24" r="3" fill="#FFD95A" class="sparkle-1"/>
                          <circle cx="78" cy="20" r="2" fill="#FF6B6B" class="sparkle-2"/>
                          <circle cx="82" cy="60" r="2.5" fill="#4A90D9" class="sparkle-1"/>
                        </svg>

                    @elseif($sk == 'scheda-esame' || $sk == 'scheda_esame' || $sk == 'quiz')
                        {{-- Exam Sheet / Certificate --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="18" y="10" width="64" height="80" rx="6" fill="#fff" stroke="#e0e9ff" stroke-width="2"/>
                          <rect x="18" y="10" width="64" height="18" rx="6" fill="#4A90D9"/>
                          <rect x="18" y="22" width="64" height="6" fill="#4A90D9"/>
                          <text x="50" y="22" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">ESAME</text>
                          <rect x="26" y="36" width="48" height="4" rx="2" fill="#e0e9ff"/>
                          <rect x="26" y="44" width="40" height="4" rx="2" fill="#e0e9ff"/>
                          <rect x="26" y="52" width="44" height="4" rx="2" fill="#e0e9ff"/>
                          <rect x="26" y="60" width="36" height="4" rx="2" fill="#e0e9ff"/>
                          <circle cx="72" cy="76" r="12" fill="#FFD95A" class="float-anim"/>
                          <circle cx="72" cy="76" r="9" fill="none" stroke="#FF9800" stroke-width="2" stroke-dasharray="4,2"/>
                          <text x="72" y="80" text-anchor="middle" fill="#FF9800" font-size="9" font-weight="bold">✓</text>
                        </svg>

                    @elseif($sk == 'dizionario' || $sk == 'dictionary')
                        {{-- Dictionary / Open Book --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <path d="M50,20 Q35,16 16,20 L16,82 Q35,78 50,82 Q65,78 84,82 L84,20 Q65,16 50,20z" fill="#fff" stroke="#e0e9ff" stroke-width="1.5"/>
                          <line x1="50" y1="20" x2="50" y2="82" stroke="#4A90D9" stroke-width="3"/>
                          <rect x="20" y="30" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="20" y="37" width="20" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="20" y="44" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="20" y="51" width="16" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="20" y="58" width="22" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="56" y="30" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="56" y="37" width="18" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="56" y="44" width="24" height="3" rx="1.5" fill="#d0ddf5"/>
                          <rect x="56" y="51" width="20" height="3" rx="1.5" fill="#e0e9ff"/>
                          <rect x="56" y="58" width="16" height="3" rx="1.5" fill="#d0ddf5"/>
                          <path d="M16,20 Q35,14 50,20" fill="#4A90D9" opacity="0.8"/>
                          <path d="M84,20 Q65,14 50,20" fill="#4A90D9" opacity="0.8"/>
                          <circle cx="75" cy="72" r="10" fill="none" stroke="#FFD95A" stroke-width="4" class="float-anim"/>
                          <line x1="82" y1="79" x2="88" y2="85" stroke="#FFD95A" stroke-width="4" stroke-linecap="round"/>
                          <line x1="72" y1="69" x2="78" y2="75" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
                        </svg>

                    @elseif($sk == 'cartelli')
                        {{-- Road Signs --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="47" y="30" width="6" height="62" rx="3" fill="#90a0b7"/>
                          <polygon points="37,10 63,10 73,20 73,36 63,46 37,46 27,36 27,20" fill="#FF3D3D"/>
                          <polygon points="39,13 61,13 70,22 70,34 61,43 39,43 30,34 30,22" fill="none" stroke="#fff" stroke-width="2"/>
                          <text x="50" y="32" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">STOP</text>
                          <rect x="54" y="50" width="28" height="18" rx="3" fill="#4CAF50"/>
                          <text x="68" y="62" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">GO</text>
                          <polygon points="18,82 30,60 42,82" fill="#FFD95A"/>
                          <polygon points="21,80 30,63 39,80" fill="none" stroke="#FF9800" stroke-width="1.5"/>
                          <text x="30" y="78" text-anchor="middle" fill="#FF9800" font-size="10" font-weight="bold">!</text>
                        </svg>

                    @elseif($sk == 'saved-mcqs' || $sk == 'saved_questions')
                        {{-- Saved MCQs / Bookmarks --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <path d="M22,12 L62,12 L62,78 L42,64 L22,78 Z" fill="#4A90D9"/>
                          <path d="M26,16 L58,16 L58,70 L42,58 L26,70 Z" fill="#6ab0f5" opacity="0.4"/>
                          <text x="42" y="42" text-anchor="middle" fill="#FFD95A" font-size="20" class="star-anim">★</text>
                          <path d="M56,16 L78,16 L78,68 L67,56 L56,68 Z" fill="#FF6B6B" opacity="0.85"/>
                          <polyline points="30,24 33,28 40,20" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                          <polyline points="30,34 33,38 40,30" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </svg>

                    @elseif($sk == 'correct-mcqs' || $sk == 'correct_questions')
                        {{-- Correct MCQs --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <circle cx="50" cy="50" r="38" fill="#E8F9F0"/>
                          <circle cx="50" cy="50" r="30" fill="#4CAF50" class="pulse-anim"/>
                          <polyline points="34,50 45,62 66,38" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="20" cy="28" r="4" fill="#FFD95A" class="sparkle-1"/>
                          <circle cx="80" cy="22" r="3" fill="#4CAF50" class="sparkle-2"/>
                          <circle cx="78" cy="76" r="3.5" fill="#FFD95A" class="sparkle-1"/>
                        </svg>

                    @elseif($sk == 'wrong-mcqs' || $sk == 'wrong_questions')
                        {{-- Wrong MCQs --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <circle cx="50" cy="50" r="38" fill="#FFF0F0"/>
                          <circle cx="50" cy="50" r="30" fill="#FF6B6B" class="pulse-anim"/>
                          <line x1="36" y1="36" x2="64" y2="64" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
                          <line x1="64" y1="36" x2="36" y2="64" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
                          <circle cx="22" cy="32" r="4" fill="#FF6B6B" class="sparkle-2"/>
                          <circle cx="78" cy="24" r="3" fill="#FFD95A" class="sparkle-1"/>
                          <circle cx="76" cy="74" r="3.5" fill="#FF9800" class="sparkle-2"/>
                        </svg>

                    @elseif($sk == 'support')
                        {{-- Support --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <circle cx="50" cy="38" r="22" fill="none" stroke="#4A90D9" stroke-width="5"/>
                          <rect x="22" y="36" width="10" height="18" rx="5" fill="#4A90D9"/>
                          <rect x="68" y="36" width="10" height="18" rx="5" fill="#4A90D9"/>
                          <path d="M50,60 Q50,72 40,76" fill="none" stroke="#4A90D9" stroke-width="4" stroke-linecap="round"/>
                          <circle cx="38" cy="78" r="5" fill="#FF6B6B" class="pulse-anim"/>
                          <rect x="54" y="58" width="32" height="22" rx="8" fill="#FFD95A"/>
                          <polygon points="56,78 48,86 62,80" fill="#FFD95A"/>
                          <circle cx="63" cy="69" r="2.5" fill="#fff"/>
                          <circle cx="70" cy="69" r="2.5" fill="#fff"/>
                          <circle cx="77" cy="69" r="2.5" fill="#fff" class="blink-anim"/>
                        </svg>

                    @elseif($sk == 'top-performers' || $sk == 'top_performers' || $sk == 'leaderboard')
                        {{-- Top Performers --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="36" y="74" width="28" height="10" rx="3" fill="#6366F1"/>
                          <path d="M42,62 L58,62 L54,74 L46,74 Z" fill="#818CF8"/>
                          <path d="M26,24 L74,24 L66,54 C66,60 58,64 50,64 C42,64 34,60 34,54 Z" fill="#F59E0B" class="pulse-anim"/>
                          <path d="M26,30 C16,30 16,46 28,48" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
                          <path d="M74,30 C84,30 84,46 72,48" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
                          <polygon points="50,30 54,40 64,40 56,46 59,56 50,50 41,56 44,46 36,40 46,40" fill="#FFF" class="star-anim"/>
                          <circle cx="20" cy="20" r="3.5" fill="#F59E0B" class="sparkle-1"/>
                          <circle cx="80" cy="18" r="3" fill="#6366F1" class="sparkle-2"/>
                        </svg>

                    @elseif($sk == 'manuale')
                        {{-- Manuale --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="22" y="16" width="56" height="68" rx="7" fill="#2563EB"/>
                          <rect x="22" y="16" width="12" height="68" rx="3" fill="#1D4ED8"/>
                          <rect x="38" y="24" width="34" height="52" rx="4" fill="#FFF"/>
                          <rect x="42" y="32" width="26" height="10" rx="3" fill="#F59E0B"/>
                          <text x="55" y="39" text-anchor="middle" fill="#FFF" font-size="6" font-weight="900">GUIDE</text>
                          <circle cx="46" cy="50" r="5" fill="#10B981"/>
                          <polyline points="44,50 45.5,52 48,48.5" stroke="#fff" stroke-width="1.5" fill="none"/>
                          <circle cx="64" cy="50" r="5" fill="#EF4444"/>
                          <line x1="61.5" y1="47.5" x2="66.5" y2="52.5" stroke="#fff" stroke-width="1.5"/>
                          <line x1="66.5" y1="47.5" x2="61.5" y2="52.5" stroke="#fff" stroke-width="1.5"/>
                          <rect x="42" y="60" width="26" height="3" rx="1.5" fill="#93C5FD"/>
                          <rect x="42" y="66" width="18" height="3" rx="1.5" fill="#CBD5E1"/>
                          <polygon points="30,84 30,70 38,70 38,84 34,80" fill="#EF4444"/>
                        </svg>

                    @elseif($sk == 'patente-social' || $sk == 'patente_social' || $sk == 'social')
                        {{-- Social --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <rect x="20" y="16" width="60" height="68" rx="10" fill="#6366F1"/>
                          <rect x="24" y="20" width="52" height="60" rx="7" fill="#FFF"/>
                          <circle cx="38" cy="36" r="7" fill="#EC4899"/>
                          <rect x="48" y="32" width="22" height="8" rx="4" fill="#818CF8"/>
                          <circle cx="62" cy="52" r="7" fill="#10B981"/>
                          <rect x="30" y="48" width="24" height="8" rx="4" fill="#F59E0B"/>
                          <circle cx="50" cy="68" r="7" fill="#EF4444"/>
                          <path d="M46.5 66.5 C46.5 64.5 48.5 63.5 50 65 C51.5 63.5 53.5 64.5 53.5 66.5 C53.5 69 50 71 50 71 C50 71 46.5 69 46.5 66.5 Z" fill="#FFF"/>
                        </svg>

                    @elseif($sk == 'translation')
                        {{-- Translation --}}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" class="card-svg">
                          <defs>
                            <linearGradient id="transGrad_{{ $card->id }}" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stop-color="#EC4899" />
                              <stop offset="50%" stop-color="#8B5CF6" />
                              <stop offset="100%" stop-color="#3B82F6" />
                            </linearGradient>
                          </defs>
                          <circle cx="50" cy="50" r="36" fill="url(#transGrad_{{ $card->id }})"/>
                          <ellipse cx="50" cy="50" rx="30" ry="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                          <line x1="50" y1="14" x2="50" y2="86" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                          <rect x="26" y="32" width="18" height="18" rx="4" fill="#FFF"/>
                          <text x="35" y="45" text-anchor="middle" font-size="12" font-weight="900" fill="#8B5CF6">A</text>
                          <rect x="56" y="50" width="18" height="18" rx="4" fill="#FFF"/>
                          <text x="65" y="63" text-anchor="middle" font-size="11" font-weight="900" fill="#EC4899">文</text>
                        </svg>

                    @else
                        {{-- Fallback icon --}}
                        <div class="fallback-icon-box" style="background-color: {{ $card->icon_color }}1a; color: {{ $card->icon_color }}; width: 84px; height: 84px; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 36px;">
                            <i class="{{ $card->icon_class }}"></i>
                        </div>
                    @endif
                </div>
                <h3 class="card-title" style="font-weight: 800; font-size: 16px; margin: 10px 0 2px 0; color: var(--text-primary, #1e293b); text-align: center;">{{ $card->title }}</h3>
                @php $subText = $card->subtitle ?: $card->description; @endphp
                @if($subText)
                    <p class="card-subtitle" style="font-size: 13px; font-weight: 500; color: var(--text-secondary, #64748b); opacity: 0.9; margin: 0; text-align: center;">{{ $subText }}</p>
                @endif
            </div>
        @endforeach
    </section>
</div>
