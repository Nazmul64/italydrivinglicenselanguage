<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>mbanglapatenteb</title>
    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- External CSS Separated Asset -->
    <link rel="stylesheet" href="{{ asset('css/frontend/style.css') }}">
</head>
<body>

    <div class="app-container">
        <!-- 1. Background Pattern -->
        <div class="bg-pattern"></div>

        <!-- 2. App Header -->
        <header class="app-header">
            <div class="header-content-wrapper">
                <!-- Back Button (shown on sub-screens) -->
                <button class="back-btn" id="back-button" onclick="navigateBack()">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>

                <!-- Centered App Name -->
                <div class="app-title" id="app-header-title">mbanglapatenteb</div>

                <div style="display: flex; gap: 12px; align-items: center;">
                    <!-- Theme Switcher -->
                    <button class="theme-toggle-btn" id="theme-toggle" title="Toggle Theme">
                        <i class="fa-solid fa-moon"></i>
                    </button>

                    <!-- Right profile with notification -->
                    <div class="profile-wrapper" onclick="openScreen('profilo', 'প্রোফাইল')">
                        <div class="profile-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="notification-badge">1</div>
                    </div>
                </div>
            </div>
        </header>

        <!-- 3. Scrollable App Body containing Screens -->
        <div class="app-body">
            
            <!-- SCREEN: Home (Dashboard) -->
            <div id="screen-home" class="screen active">
                <!-- Image Slider -->
                <div class="slider-container">
                    <div class="slider-wrapper" id="slider-wrapper">
                        <div class="slide">
                            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop" alt="Driving school">
                            <div class="slide-overlay">
                                <span class="slide-title">সহজে ড্রাইভিং লাইসেন্স পাস করুন</span>
                                <span class="slide-subtitle">ইতালিয়ান ড্রাইভিং লাইসেন্স গাইড</span>
                            </div>
                        </div>
                        <div class="slide">
                            <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop" alt="Road signs">
                            <div class="slide-overlay">
                                <span class="slide-title">সব ট্রাফিক সাইন জানুন</span>
                                <span class="slide-subtitle">গুরুত্বপূর্ণ সংকেতসমূহের বিস্তারিত ব্যাখ্যা</span>
                            </div>
                        </div>
                        <div class="slide">
                            <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop" alt="Study room">
                            <div class="slide-overlay">
                                <span class="slide-title">অনলাইন লেকচার ও ক্লাস</span>
                                <span class="slide-subtitle">ভিডিও টিউটোরিয়ালের সাথে থিওরি শিখুন</span>
                            </div>
                        </div>
                        <div class="slide">
                            <img src="https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&auto=format&fit=crop" alt="Traffic light">
                            <div class="slide-overlay">
                                <span class="slide-title">পরীক্ষার সঠিক প্রস্তুতি নিন</span>
                                <span class="slide-subtitle">আনলিমিটেড এক্সাম সিমুলেশন কুইজ</span>
                            </div>
                        </div>
                    </div>
                    <div class="slider-indicators">
                        <span class="indicator active" onclick="goToSlide(0)"></span>
                        <span class="indicator" onclick="goToSlide(1)"></span>
                        <span class="indicator" onclick="goToSlide(2)"></span>
                        <span class="indicator" onclick="goToSlide(3)"></span>
                    </div>
                </div>

                <!-- Grid of Services: FontAwesome Vector Icons -->
                <section class="services-grid">
                    <div class="nav-card" onclick="openScreen('lezioni', 'Lezioni')">
                        <div class="illustration-box lezioni-box">
                            <i class="fa-solid fa-video"></i>
                        </div>
                        <h3 class="card-title">Lezioni</h3>
                        <p class="card-subtitle">Classes</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('test', 'Test Practice')">
                        <div class="illustration-box test-box">
                            <i class="fa-solid fa-laptop-code"></i>
                        </div>
                        <h3 class="card-title">Test</h3>
                        <p class="card-subtitle">Practice Test</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('argomenti', 'Argomenti')">
                        <div class="illustration-box argomenti-box">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h3 class="card-title">ARGOMENTI</h3>
                        <p class="card-subtitle">TOPICS</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('eclass', 'E-Class')">
                        <div class="illustration-box eclass-box">
                            <i class="fa-solid fa-chalkboard-user"></i>
                        </div>
                        <h3 class="card-title">E-Class</h3>
                        <p class="card-subtitle">E-Class</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('sfida', 'Sfida')">
                        <div class="illustration-box sfida-box">
                            <i class="fa-solid fa-trophy"></i>
                        </div>
                        <h3 class="card-title">Sfida</h3>
                        <p class="card-subtitle">Challenge</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('scheda-esame', 'Scheda Esame')">
                        <div class="illustration-box esame-box">
                            <i class="fa-solid fa-file-signature"></i>
                        </div>
                        <h3 class="card-title">Scheda Esame</h3>
                        <p class="card-subtitle">Exam Test</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('dizionario', 'Dizionario')">
                        <div class="illustration-box dizionario-box">
                            <i class="fa-solid fa-book-open"></i>
                        </div>
                        <h3 class="card-title">Dizionario</h3>
                        <p class="card-subtitle">Dictionary</p>
                    </div>

                    <div class="nav-card" onclick="openScreen('cartelli', 'Cartelli')">
                        <div class="illustration-box cartelli-box">
                            <i class="fa-solid fa-map-signs"></i>
                        </div>
                        <h3 class="card-title">Cartelli</h3>
                        <p class="card-subtitle">Traffic Signs</p>
                    </div>
                </section>
            </div>

            <!-- SCREEN: Lezioni (Classes) -->
            <div id="screen-lezioni" class="screen">
                <div class="section-header">
                    <span class="section-title">ভিডিও লেকচার</span>
                    <span class="section-subtitle">৩টি ক্লাস</span>
                </div>
                
                <div class="content-card lesson-item" onclick="playLesson('Capitolo 1: Definizione della strada', '১২ মিনিট')">
                    <div class="lesson-thumbnail">
                        <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=150" alt="lesson 1">
                        <i class="fa-solid fa-circle-play"></i>
                    </div>
                    <div class="lesson-info">
                        <div class="lesson-title">Capitolo 1: Definizione della strada</div>
                        <div class="lesson-duration"><i class="fa-regular fa-clock"></i> ১২ মিনিট • বাংলা ব্যাখ্যা</div>
                    </div>
                </div>

                <div class="content-card lesson-item" onclick="playLesson('Capitolo 2: I Segnali di Pericolo', '১৮ মিনিট')">
                    <div class="lesson-thumbnail">
                        <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=150" alt="lesson 2">
                        <i class="fa-solid fa-circle-play"></i>
                    </div>
                    <div class="lesson-info">
                        <div class="lesson-title">Capitolo 2: I Segnali di Pericolo</div>
                        <div class="lesson-duration"><i class="fa-regular fa-clock"></i> ১৮ মিনিট • বাংলা ব্যাখ্যা</div>
                    </div>
                </div>

                <div class="content-card lesson-item" onclick="playLesson('Capitolo 3: Segnali di Divieto', '১৫ মিনিট')">
                    <div class="lesson-thumbnail">
                        <img src="https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=150" alt="lesson 3">
                        <i class="fa-solid fa-circle-play"></i>
                    </div>
                    <div class="lesson-info">
                        <div class="lesson-title">Capitolo 3: Segnali di Divieto</div>
                        <div class="lesson-duration"><i class="fa-regular fa-clock"></i> ১৫ মিনিট • বাংলা ব্যাখ্যা</div>
                    </div>
                </div>
            </div>

            <!-- SCREEN: Test (Practice Quiz) -->
            <div id="screen-test" class="screen">
                <!-- 1. Question Pagination Bar -->
                <div class="test-pagination-container">
                    <div class="test-pagination-tabs">
                        <span class="test-tab-btn active" id="test-tab-btn-1" onclick="switchTestQuestionTab(1)">Domande da 1 a 10</span>
                        <span class="test-tab-btn" id="test-tab-btn-2" onclick="switchTestQuestionTab(2)">Domande da 11 a 20</span>
                        <span class="test-tab-btn" id="test-tab-btn-3" onclick="switchTestQuestionTab(3)">Domande da 21 a 30</span>
                    </div>
                    <div class="test-pagination-numbers" id="test-num-grid">
                        <!-- Questions 1-10 or 11-20 or 21-30 injected by JS -->
                    </div>
                </div>

                <!-- 2. Question Text Display -->
                <div class="test-question-box">
                    <div class="test-question-it" id="test-question-it">Caricamento delle domande...</div>
                    <div class="test-question-bn" id="test-question-bn" style="display: none;">প্রশ্ন লোড হচ্ছে...</div>
                </div>

                <!-- 3. Bottom Controls Row -->
                <div class="test-bottom-section">
                    
                    <!-- Horizontal Options Bar overlay (shown when Opzioni clicked) -->
                    <div class="test-options-bar" id="test-options-bar" style="display: none;">
                        <div class="opt-btn-item" onclick="showToast('টিউটর স্যারকে নক করা হয়েছে')">
                            <div class="opt-icon-wrapper" style="position: relative;">
                                <i class="fa-solid fa-user-tie"></i>
                                <span style="position: absolute; top: -2px; right: -2px; width: 6px; height: 6px; background-color: var(--accent-red); border-radius: 50%;"></span>
                            </div>
                        </div>
                        <div class="opt-btn-item" onclick="toggleTestTranslation()" title="Translate">
                            <div class="opt-icon-wrapper"><i class="fa-solid fa-language"></i></div>
                        </div>
                        <div class="opt-btn-item" onclick="showToast('বুকমার্ক করা হয়েছে')">
                            <div class="opt-icon-wrapper"><i class="fa-regular fa-bookmark"></i></div>
                        </div>
                        <div class="opt-btn-item" onclick="showToast('নোটপ্যাড ওপেন হয়েছে')">
                            <div class="opt-icon-wrapper"><i class="fa-regular fa-note-sticky"></i></div>
                        </div>
                        <div class="opt-btn-item" onclick="showToast('অধ্যায়ের তথ্য')">
                            <div class="opt-icon-wrapper"><i class="fa-solid fa-circle-info"></i></div>
                        </div>
                        <div class="opt-btn-item" onclick="showToast('পরীক্ষার সংক্ষিপ্ত বিবরণ')">
                            <div class="opt-icon-wrapper"><i class="fa-solid fa-list-check"></i></div>
                        </div>
                        <div class="opt-btn-item close" onclick="closeTestExam()" title="Chiudi Esame">
                            <div class="opt-icon-wrapper"><i class="fa-solid fa-circle-xmark"></i></div>
                            <span style="font-size: 8px; color: var(--text-secondary); margin-top: 2px;">Chiudi</span>
                        </div>
                    </div>

                    <!-- Main Bottom Controls Layout -->
                    <div class="test-controls-row">
                        <!-- Left Controls Column (Opzioni, Speaker, Play/Pause, Progress, Speed) -->
                        <div class="test-controls-left" style="position: relative; display: flex; align-items: center; gap: 10px; flex: 1.1;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <button class="test-ctrl-btn opt" onclick="toggleTestOptions()">
                                    <i class="fa-solid fa-table-cells-large" style="color: var(--accent-green);"></i>
                                </button>
                                <span class="test-ctrl-label" style="color: var(--text-primary);">Opzioni</span>
                            </div>
                            
                            <!-- Circular Blue Speaker -->
                            <button class="test-speaker-btn" onclick="readItalianQuestionOutLoud()">
                                <i class="fa-solid fa-volume-high"></i>
                                <span>Italiano</span>
                            </button>

                            <!-- Circular Pause/Play Toggle Button -->
                            <button class="test-ctrl-btn" id="test-audio-play-btn" onclick="togglePlayPauseSpeech()" style="background-color: var(--bg-card); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: none; cursor: pointer;">
                                <i class="fa-solid fa-play" style="color: var(--text-primary);"></i>
                            </button>

                            <!-- Progress Slider -->
                            <input type="range" class="test-slider" id="test-audio-slider" min="0" max="100" value="0" style="margin: 0 4px; flex: 1;" oninput="changeAudioProgress(this.value)">

                            <!-- Speed Trigger Button -->
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <button class="test-ctrl-btn" onclick="toggleSpeedDropdown()" style="background-color: var(--bg-card); width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: none; cursor: pointer;">
                                    <i class="fa-solid fa-gauge-high" style="color: var(--text-primary);"></i>
                                </button>
                                <span class="test-ctrl-label" style="color: var(--text-primary);">Speed</span>
                            </div>

                            <!-- Speed Dropdown Popover overlay -->
                            <div class="speed-popover" id="test-speed-popover" style="display: none;">
                                <!-- Speed items populated dynamically via JS -->
                            </div>
                        </div>

                        <!-- Right Controls Column (VERO, FALSO and Navigation) -->
                        <div class="test-controls-right">
                            <div class="vero-falso-grid">
                                <button class="vf-btn vero" id="test-vero-btn" onclick="selectTestAnswer(true)">
                                    <div class="vf-letter">V</div>
                                    <span class="vf-label">VERO</span>
                                </button>
                                <button class="vf-btn falso" id="test-falso-btn" onclick="selectTestAnswer(false)">
                                    <div class="vf-letter">F</div>
                                    <span class="vf-label">FALSO</span>
                                </button>
                            </div>
                            
                            <div class="nav-arrows-grid">
                                <button class="test-nav-arrow" onclick="prevTestQuestion()">
                                    <i class="fa-solid fa-chevron-left" style="color: var(--accent-green);"></i>
                                    <span>Indietro</span>
                                </button>
                                <button class="test-nav-arrow" onclick="nextTestQuestion()">
                                    <span>Avanti</span>
                                    <i class="fa-solid fa-chevron-right" style="color: var(--accent-green);"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Left Bottom Corner Timer Placement -->
                    <div style="margin-top: 14px; text-align: left; display: inline-block;">
                        <div class="test-timer-pill" id="test-timer">20:00</div>
                        <div class="test-timer-label">Tempo a Disposizione</div>
                    </div>
                </div>
            </div>

            <!-- SCREEN: Test Results Detailed Breakdown -->
            <div id="screen-test-results-detail" class="screen">
                <div class="result-details-header" style="text-align: center; padding: 20px 10px; background-color: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-card); margin-bottom: 16px; box-shadow: 0 4px 6px -1px var(--shadow-card);">
                    <div id="detail-outcome-emoji" style="font-size: 56px; margin-bottom: 10px;">🙄</div>
                    <h2 id="detail-outcome-title" style="font-size: 24px; font-weight: 800; color: var(--accent-red); margin-bottom: 4px;">Bocciato</h2>
                    <p id="detail-outcome-time" style="font-size: 13px; color: var(--text-secondary); font-weight: bold;">Tempo: 3 minuti 3 secondi</p>
                </div>

                <!-- Toggles grid matching screenshot -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 12px;">
                    <button class="detail-toggle-btn corrette" id="btn-toggle-corrette" onclick="filterDetailResults('correct')">
                        Corrette: <span id="detail-count-corrette">10</span> <i class="fa-regular fa-eye"></i>
                    </button>
                    <button class="detail-toggle-btn errori" id="btn-toggle-errori" onclick="filterDetailResults('incorrect')">
                        Errori: <span id="detail-count-errori">6</span> <i class="fa-regular fa-eye"></i>
                    </button>
                    <button class="detail-toggle-btn nondate" id="btn-toggle-nondate" onclick="filterDetailResults('unanswered')">
                        Non risposte: <span id="detail-count-nondate">14</span> <i class="fa-regular fa-eye"></i>
                    </button>
                </div>

                <!-- Show all option toggle -->
                <div style="text-align: center; margin-bottom: 16px;">
                    <button class="detail-toggle-btn show-all" id="btn-toggle-all" onclick="filterDetailResults('all')" style="border-color: var(--text-primary); color: var(--text-primary); padding: 6px 16px; border-radius: 30px;">
                        Mostra tutte <i class="fa-regular fa-eye-slash"></i>
                    </button>
                </div>

                <!-- Split ratio progress bar -->
                <div style="height: 12px; background-color: var(--border-card); border-radius: 6px; display: flex; overflow: hidden; margin-bottom: 24px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <div id="split-bar-giusto" style="background-color: #4CAF50; width: 33.3%;"></div>
                    <div id="split-bar-sbagliato" style="background-color: #ef4444; width: 20%;"></div>
                    <div id="split-bar-nondate" style="background-color: #f59e0b; width: 46.7%;"></div>
                </div>

                <!-- Detailed Card List Container -->
                <div id="detail-cards-list-container" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;">
                    <!-- Question detail card list injected dynamically via JS -->
                </div>
            </div>

            <!-- SCREEN: Argomenti (Scegli Categoria) -->
            <div id="screen-argomenti" class="screen">
                <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Categoria</h3>
                    <div style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">25 Capitoli</div>
                </div>

                <!-- Custom Pills bar matching screenshot -->
                <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-start;">
                    <button class="pill-btn" onclick="showToast('Unselected all categories')">Unselect All</button>
                    <button class="pill-btn active" onclick="showToast('Active selection')">Select</button>
                    <button class="pill-btn" onclick="showToast('Selected all categories')">Select All</button>
                </div>

                <div id="argomenti-list" style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 40px;">
                    <!-- Chapter category cards injected dynamically via JS -->
                </div>
            </div>

            <!-- SCREEN: Argomenti Schede (Scegli Scheda) -->
            <div id="screen-argomenti-schede" class="screen">
                <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Scegli Scheda</h3>
                </div>

                <!-- Dropdown Selector Wrapper -->
                <div style="position: relative; margin-bottom: 16px;">
                    <div class="chapter-selector-trigger" onclick="toggleChapterDropdownList()">
                        <span id="selected-chapter-display-label">Capitolo 1) DOVERI NELL'USO DELLA STRADA</span>
                        <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-secondary);"></i>
                    </div>
                    <!-- Dropdown Panel (Screenshot 4 list) -->
                    <div class="chapter-dropdown-list-panel" id="chapter-dropdown-list-panel" style="display: none;">
                        <!-- Dropdown list options injected via JS -->
                    </div>
                </div>

                <!-- Pills matching screenshot -->
                <div style="display: flex; gap: 8px; margin-bottom: 16px; justify-content: flex-start;">
                    <button class="pill-btn" onclick="showToast('Unselected all sheets')">Unselect All</button>
                    <button class="pill-btn active" onclick="showToast('Active selection')">Select</button>
                    <button class="pill-btn" onclick="showToast('Selected all sheets')">Select All</button>
                </div>

                <div id="argomenti-schede-list" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 40px;">
                    <!-- Sheet cards injected dynamically via JS -->
                </div>
            </div>

            <!-- SCREEN: E-Class -->
            <div id="screen-eclass" class="screen">
                <div class="section-header">
                    <span class="section-title">ই-ক্লাস লাইভ সেশন</span>
                    <span class="section-subtitle">সরাসরি শিক্ষকদের ক্লাস</span>
                </div>

                <div class="content-card" style="text-align: center; padding: 24px 16px;">
                    <i class="fa-solid fa-tower-broadcast" style="font-size: 40px; color: #FF5252; margin-bottom: 12px; animation: pulse 2s infinite;"></i>
                    <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">পরবর্তী লাইভ ক্লাস আজ রাত ৯:০০ টায়</h4>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">অধ্যায় ৪: অগ্রাধিকার নিয়ম (Precedenza)</p>
                    <button class="action-btn" style="background-color: #FF5252; color: white;" onclick="showToast('লাইভ ক্লাস শুরু হতে এখনো সময় বাকি আছে')">
                        <i class="fa-solid fa-door-open"></i> ক্লাসরুমে প্রবেশ করুন
                    </button>
                </div>

                <div class="section-header" style="margin-top: 10px;">
                    <span class="section-title">উপলব্ধ টিউটরগণ</span>
                </div>
                <div class="content-card" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                            MR
                        </div>
                        <div>
                            <div style="font-size: 13px; font-weight: bold;">M Rahman (Senior Instructor)</div>
                            <div style="font-size: 11px; color: #10B981;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> অনলাইনে আছেন</div>
                        </div>
                    </div>
                    <button class="action-btn" style="width: auto; margin: 0; padding: 6px 12px;" onclick="toggleGuestChat(true)">
                        চ্যাট
                    </button>
                </div>
            </div>

            <!-- SCREEN: Sfida (Challenge) -->
            <div id="screen-sfida" class="screen">
                <div class="section-header">
                    <span class="section-title">চ্যালেঞ্জ মোড</span>
                    <span class="section-subtitle">ভুল এড়ানোর প্রতিযোগিতা</span>
                </div>

                <div class="content-card" style="background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; text-align: center; padding: 24px 16px;">
                    <i class="fa-solid fa-trophy" style="font-size: 48px; color: #F59E0B; margin-bottom: 12px;"></i>
                    <h4 style="font-size: 18px; font-weight: 800; margin-bottom: 4px;">আপনার সর্বোচ্চ স্কোর: ২৫ পয়েন্ট</h4>
                    <p style="font-size: 12px; opacity: 0.9; margin-bottom: 16px;">ভুল করলেই খেলা শেষ! সর্বোচ্চ কয়টি সঠিক উত্তর দিতে পারেন দেখুন।</p>
                    <button class="action-btn" style="background-color: white; color: #6366F1;" onclick="showToast('চ্যালেঞ্জ মোড লোড হচ্ছে...')">
                        <i class="fa-solid fa-play"></i> চ্যালেঞ্জ শুরু করুন
                    </button>
                </div>
            </div>

            <!-- SCREEN: Scheda Esame (Exam Simulation) -->
            <div id="screen-scheda-esame" class="screen">
                <div class="exam-timer-box">
                    <span class="section-title">অফিসিয়াল পরীক্ষা ডেমো</span>
                    <span class="timer-badge" id="exam-timer">30:00</span>
                </div>

                <div class="exam-grid-dots" id="exam-dots-container">
                    <!-- Dots 1 to 30 will be generated via JavaScript -->
                </div>

                <div class="content-card quiz-box">
                    <div style="font-size: 13px; font-weight: bold; color: #3B82F6;" id="exam-question-number">প্রশ্ন ১</div>
                    <div class="question-text" id="exam-question-it">Il limite massimo di velocità sulle autostrade è di 130 km/h per le autovetture.</div>
                    <div class="question-bangla" id="exam-question-bn">মোটরগাড়ির জন্য হাইওয়েতে সর্বোচ্চ গতিসীমা ১৩০ কিমি/ঘণ্টা।</div>
                    
                    <div class="answer-buttons">
                        <button class="ans-btn btn-vero" id="exam-vero-btn" onclick="answerExamQuestion(true)">
                            VERO
                        </button>
                        <button class="ans-btn btn-falso" id="exam-falso-btn" onclick="answerExamQuestion(false)">
                            FALSO
                        </button>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 14px;">
                    <button class="action-btn" style="flex: 1; margin:0;" onclick="prevExamQuestion()">
                        <i class="fa-solid fa-arrow-left"></i> পূর্বের
                    </button>
                    <button class="action-btn" style="flex: 1; margin:0;" onclick="nextExamQuestion()">
                        পরবর্তী <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <button class="submit-exam-btn" onclick="submitExam()">
                    <i class="fa-solid fa-circle-check"></i> খাতা জমা দিন (Consegna)
                </button>
            </div>

            <!-- SCREEN: Dictionary -->
            <div id="screen-dizionario" class="screen">
                <div class="search-bar">
                    <i class="fa-solid fa-magnifying-glass" style="color: var(--text-secondary);"></i>
                    <input type="text" id="dictionary-search" placeholder="ইতালীয় বা বাংলা শব্দ দিয়ে খুঁজুন..." oninput="filterDictionary()">
                </div>

                <div id="dictionary-list">
                    <!-- Dictionary Items will be rendered here -->
                </div>
            </div>

            <!-- SCREEN: Cartelli (Traffic Signs) -->
            <div id="screen-cartelli" class="screen">
                <div class="signs-tabs">
                    <span class="sign-tab active" id="tab-pericolo" onclick="setSignCategory('pericolo')">Pericolo (বিপদ)</span>
                    <span class="sign-tab" id="tab-divieto" onclick="setSignCategory('divieto')">Divieto (নিষেধ)</span>
                    <span class="sign-tab" id="tab-obbligo" onclick="setSignCategory('obbligo')">Obbligo (বাধ্যতা)</span>
                </div>

                <div class="signs-grid" id="signs-grid-container">
                    <!-- Sign cards generated via JS -->
                </div>
            </div>

            <!-- SCREEN: Profile & Settings -->
            <div id="screen-profilo" class="screen">
                <div class="section-header">
                    <span class="section-title">ব্যবহারকারীর প্রোফাইল</span>
                </div>

                <!-- User Statistics -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="stats-exams">১২</div>
                        <div class="stat-label">সম্পূর্ণ পরীক্ষা</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="stats-errors">২.৫</div>
                        <div class="stat-label">গড় ভুল সংখ্যা</div>
                    </div>
                </div>

                <div class="section-header" style="margin-top: 10px;">
                    <span class="section-title">অ্যাপ্লিকেশন সেটিংস</span>
                </div>

                <div class="content-card">
                    <div class="settings-row">
                        <div class="settings-info">
                            <span class="settings-title">শব্দ সংকেত (Sound Effects)</span>
                            <span class="settings-desc">সঠিক/ভুল উত্তরে ভাইব্রেশন ও সাউন্ড</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="sound-switch" checked onchange="toggleSound(this.checked)">
                            <span class="slider-switch"></span>
                        </label>
                    </div>

                    <button class="action-btn danger" onclick="resetAppData()">
                        <i class="fa-solid fa-trash-can"></i> সমস্ত ডেটা রিসেট করুন
                    </button>
                </div>
            </div>

        </div>

        <!-- 4. Interactive Video Dialog Modal -->
        <div class="video-modal" id="video-player-modal">
                    <div class="video-close-btn" onclick="closeVideoPlayer()"><i class="fa-solid fa-xmark"></i></div>
            <div class="video-player-container">
                <i class="fa-solid fa-play video-control-play" onclick="simulateVideoPlaying()"></i>
            </div>
            <div style="color: white; text-align: center; padding: 20px;">
                <h4 id="video-player-title" style="font-size: 16px; font-weight: bold;">ভিডিও প্লেয়ার</h4>
                <p id="video-player-sub" style="font-size: 12px; opacity: 0.7; margin-top: 4px;">লোডিং হচ্ছে...</p>
            </div>
        </div>

        <!-- 5. Exam Results Popup Modal -->
        <div class="modal-overlay" id="exam-result-modal">
            <div class="modal-content">
                <h3 class="result-title" id="result-text-header">পরীক্ষার ফলাফল</h3>
                <div class="result-badge passed" id="result-badge-status">উত্তীর্ণ (IDONEO)</div>
                <div class="result-errors" id="result-errors-count">২</div>
                <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;" id="result-message">অভিনন্দন! আপনি পরীক্ষায় উত্তীর্ণ হয়েছেন।</p>
                <button class="action-btn" style="background-color: var(--accent-green); color: white;" onclick="closeResultModal()">
                    ঠিক আছে
                </button>
            </div>
        </div>

        <!-- 6. Floating Navigation Bar Centered -->
        <nav class="bottom-nav">
            <div class="nav-item active" id="nav-home" onclick="clickBottomNav('home')">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </div>
            <div class="nav-item" id="nav-quiz" onclick="clickBottomNav('scheda-esame')">
                <i class="fa-solid fa-paste"></i>
                <span>Quiz</span>
            </div>
            <div class="nav-item" id="nav-dictionary" onclick="clickBottomNav('dizionario')">
                <i class="fa-solid fa-book"></i>
                <span>Dizionario</span>
            </div>
            <div class="nav-item" id="nav-profile" onclick="clickBottomNav('profilo')">
                <i class="fa-solid fa-user-gear"></i>
                <span>Profilo</span>
            </div>
        </nav>

        <!-- 7. Floating Chat Widget Overlay -->
        <div class="chat-widget-container" id="guest-chat-widget">
            <div class="chat-widget-header">
                <span>M Rahman (Online Support)</span>
                <button class="chat-widget-close" onclick="toggleGuestChat(false)"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="chat-widget-messages" id="guest-chat-messages">
                <!-- Chat history loaded dynamically -->
            </div>
            <div class="chat-widget-input-area">
                <input type="text" id="guest-chat-input" placeholder="এখানে লিখুন..." onkeydown="if(event.key === 'Enter') sendGuestChatMessage()">
                <button class="chat-widget-send" onclick="sendGuestChatMessage()"><i class="fa-solid fa-paper-plane" style="font-size: 11px;"></i></button>
            </div>
        </div>

        <!-- Toast Notification Panel -->
        <div class="toast-container" id="toast-container">
            <i class="fa-solid fa-circle-info"></i>
            <span id="toast-text">বার্তা</span>
        </div>

    </div>

    <script>
        // --- 1. Clock display ---
        function updateClock() {
            const timeEl = document.getElementById('status-time');
            if (!timeEl) return;
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            timeEl.innerText = hours + ':' + minutes;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // --- 2. Dark/Light Mode Theme Toggle ---
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('i');

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.className = 'fa-solid fa-moon';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            if (isDark) {
                themeIcon.className = 'fa-solid fa-sun';
                localStorage.setItem('theme', 'dark');
                showToast('ডার্ক মোড সক্রিয় হয়েছে');
            } else {
                themeIcon.className = 'fa-solid fa-moon';
                localStorage.setItem('theme', 'light');
                showToast('লাইট মোড সক্রিয় হয়েছে');
            }
        });

        // --- 3. Auto-Sliding Image Banner Carousel ---
        let currentSlide = 0;
        const totalSlides = 4;
        const sliderWrapper = document.getElementById('slider-wrapper');
        const indicators = document.querySelectorAll('.indicator');
        let autoSlideTimer;

        function updateSlider() {
            if (!sliderWrapper) return;
            sliderWrapper.style.transform = `translateX(-${currentSlide * 25}%)`;
            indicators.forEach((ind, index) => {
                if (index === currentSlide) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlider();
            resetAutoSlide();
        }

        function startAutoSlide() {
            autoSlideTimer = setInterval(nextSlide, 4000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideTimer);
            startAutoSlide();
        }

        startAutoSlide();

        // --- 4. Chapters List Metadata & Dynamic Rendering ---
        const chaptersList = [
            { id: 1, name: "Definizioni stradali e doveri dell'uso della strada", bn: "রাস্তা ও ট্রাফিকের সাধারণ সংজ্ঞা এবং চালকের দায়িত্ব" },
            { id: 2, name: "Segnali di pericolo", bn: "বিপদজনক সংকেত" },
            { id: 3, name: "Segnali di divieto", bn: "নিষেধাজ্ঞা সংকেত" },
            { id: 4, name: "Segnali di obbligo", bn: "বাধ্যতামূলক সংকেত" },
            { id: 5, name: "Segnali orizzontali e segni sulla strada", bn: "রাস্তার অনুভূমিক দাগ এবং সংকেত" },
            { id: 6, name: "Segnalazioni semaforiche e degli agenti del traffico", bn: "ট্রাফিক লাইট এবং ট্রাফিক পুলিশের সংকেত" },
            { id: 7, name: "Pericolo e intralcio, limiti di velocità, distanza di sicurezza", bn: "বিপদ ও প্রতিবন্ধকতা, গতিসীমা, নিরাপদ দূরত্ব" },
            { id: 8, name: "Norme sulla circolazione dei veicoli (precedenze)", bn: "যানবাহন চলাচেলের নিয়ম (অগ্রাধিকার)" },
            { id: 9, name: "Esempi di precedenza (rappresentazioni grafiche)", bn: "অগ্রাধিকারের চিত্রভিত্তিক উদাহরণ" },
            { id: 10, name: "Norme sul sorpasso", bn: "ওভারটেকিংয়ের নিয়মাবলি" },
            { id: 11, name: "Fermata, sosta, partenza e ingombro della carreggiata", bn: "থামা, পার্কিং, যাত্রা শুরু এবং প্রতিবন্ধকতা সৃষ্টি" },
            { id: 12, name: "Norme sull'uso delle luci, dispositivi acustici, spie", bn: "লাইট, হর্ন এবং ইন্ডিকেটর ব্যবহারের নিয়ম" },
            { id: 13, name: "Cinture di sicurezza, sistemi di ritenuta, casco", bn: "সিটবেল্ট, হেলমেট এবং চাইল্ড সিট ব্যবহারের নিয়ম" },
            { id: 14, name: "Patenti di guida, documenti, punti patente", bn: "ড্রাইভিং লাইসেন্স, নথিপত্র এবং পেনাল্টি পয়েন্ট" },
            { id: 15, name: "Incidenti stradali e primo soccorso", bn: "সড়ক দুর্ঘটনা এবং প্রাথমিক চিকিৎসা" },
            { id: 16, name: "Guida in relazione alle condizioni ambientali", bn: "প্রাকৃতিক বৈরী পরিবেশে গাড়ি চালানো" },
            { id: 17, name: "Responsabilità civile, penale, amministrativa, assicurazione", bn: "আইনি ও ফৌজদারি দায়বদ্ধতা এবং ইনস্যুরেন্স" },
            { id: 18, name: "Limitazione dei consumi, inquinamento, elementi del veicolo", bn: "জ্বালানি সাশ্রয়, পরিবেশ দূষণ এবং গাড়ির পার্টস" },
            { id: 19, name: "Dispositivi di equipaggiamento e specchietti retrovisori", bn: "গাড়ির অভ্যন্তরীণ যন্ত্রপাতি ও লুকিং গ্লাস" },
            { id: 20, name: "Uso ed efficienza dei dispositivi del veicolo", bn: "গাড়ির গুরুত্বপূর্ণ পার্টসের ব্যবহার ও কার্যকারিতা" },
            { id: 21, name: "Comportamenti alla guida in autostrada e strade extraurbane", bn: "এক্সপ্রেসওয়ে এবং হাইওয়েতে গাড়ি চালানোর নিয়ম" },
            { id: 22, name: "Segnali di indicazione, pannelli integrativi, segnali turistici", bn: "নির্দেশনামূলক এবং পর্যটন সাইনবোর্ড" },
            { id: 23, name: "Uso corretto della strada e comportamenti precauzionali", bn: "রাস্তার সঠিক ব্যবহার এবং সতর্কতামূলক আচরণ" },
            { id: 24, name: "Segnali luminosi e indicazioni degli agenti di polizia", bn: "পুলিশের হাতের ইশারা এবং বিশেষ লাইট সংকেত" },
            { id: 25, name: "Definizioni generali e classificazione dei veicoli", bn: "যানবাহনের প্রকারভেদ এবং সাধারণ পরিচিতি" }
        ];

        const chapterTotals = {
            1: 227, 2: 276, 3: 289, 4: 264, 5: 302, 6: 289, 7: 290, 8: 276, 9: 268, 10: 267,
            11: 313, 12: 285, 13: 289, 14: 293, 15: 263, 16: 282, 17: 277, 18: 309, 19: 277,
            20: 307, 21: 283, 22: 270, 23: 273, 24: 240, 25: 291
        };

        function getChapterIllustrationSVG(chapterId) {
            if (chapterId === 1) {
                return `
                <div class="chapter-card-illustration">
                    <svg viewBox="0 0 400 130" style="background:#e2e8f0; width:100%; height:130px; display:block;">
                        <rect width="400" height="130" fill="#a3b8cc"/>
                        <rect y="100" width="400" height="30" fill="#7ba37b"/>
                        <rect y="0" width="400" height="30" fill="#7ba37b"/>
                        <rect y="85" width="400" height="15" fill="#c2c7cc"/>
                        <rect y="30" width="400" height="15" fill="#c2c7cc"/>
                        <rect y="45" width="400" height="40" fill="#4a4a4a"/>
                        <line x1="0" y1="65" x2="400" y2="65" stroke="white" stroke-width="3" stroke-dasharray="20,15"/>
                        <text x="200" y="70" fill="white" font-size="11" font-weight="800" text-anchor="middle">CARREGGIATA</text>
                        <text x="200" y="20" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">LA STRADA</text>
                    </svg>
                </div>`;
            } else if (chapterId === 2) {
                return `
                <div class="chapter-card-illustration">
                    <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                        <polygon points="100,20 60,90 140,90" fill="white" stroke="#e53e3e" stroke-width="8"/>
                        <polygon points="100,20 60,90 140,90" fill="none" stroke="black" stroke-width="1"/>
                        <path d="M90,80 Q100,60 110,80" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
                        
                        <polygon points="300,20 260,90 340,90" fill="white" stroke="#e53e3e" stroke-width="8"/>
                        <polygon points="300,20 260,90 340,90" fill="none" stroke="black" stroke-width="1"/>
                        <path d="M290,70 L310,70 M300,60 L300,80" fill="none" stroke="black" stroke-width="5" stroke-linecap="round"/>
                        <text x="200" y="115" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI DI PERICOLO</text>
                    </svg>
                </div>`;
            } else if (chapterId === 3) {
                return `
                <div class="chapter-card-illustration">
                    <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                        <circle cx="100" cy="55" r="30" fill="white" stroke="#e53e3e" stroke-width="8"/>
                        <line x1="78" y1="33" x2="122" y2="77" stroke="#e53e3e" stroke-width="8"/>
                        
                        <circle cx="300" cy="55" r="30" fill="white" stroke="#e53e3e" stroke-width="8"/>
                        <rect x="280" y="51" width="40" height="8" fill="#e53e3e"/>
                        <text x="200" y="110" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI DI DIVIETO</text>
                    </svg>
                </div>`;
            } else if (chapterId === 4) {
                return `
                <div class="chapter-card-illustration">
                    <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                        <circle cx="100" cy="55" r="30" fill="#3182ce"/>
                        <path d="M100,35 L100,75 M88,63 L100,75 L112,63" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                        
                        <circle cx="300" cy="55" r="30" fill="#3182ce"/>
                        <path d="M285,55 L315,55 M303,43 L315,55 L303,67" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                        <text x="200" y="110" fill="#2d3748" font-size="14" font-weight="900" text-anchor="middle">SEGNALI D’OBBLIGO</text>
                    </svg>
                </div>`;
            } else {
                return `
                <div class="chapter-card-illustration">
                    <svg viewBox="0 0 400 130" style="background:#f7fafc; width:100%; height:130px; display:block;">
                        <rect width="400" height="130" fill="#edf2f7"/>
                        <path d="M170,65 L230,65 L200,35 Z" fill="#3182ce" opacity="0.8"/>
                        <circle cx="200" cy="80" r="12" fill="#4a5568"/>
                        <text x="200" y="115" fill="#4a5568" font-size="13" font-weight="bold" text-anchor="middle">Capitolo ${chapterId}</text>
                    </svg>
                </div>`;
            }
        }

        function getSheetName(chapterId, sheetIndex) {
            const chapter1Sheets = [
                "Definizioni stradali: la strada",
                "Definizioni stradali: la carreggiata",
                "Definizioni stradali: parti della carreggiata",
                "Definizioni stradali: le corsie",
                "Definizioni stradali: marciapiede e banchina",
                "Definizioni stradali: isola di traffico",
                "Definizioni stradali: salvagente",
                "Definizioni stradali: passaggio a livello",
                "Definizioni stradali: pista ciclabile",
                "Definizioni stradali: area pedonale",
                "Definizioni stradali: zona a traffico limitato",
                "Definizioni stradali: isola pedonale",
                "Definizioni stradali: autostrada",
                "Definizioni stradali: carreggiata e corsia d'emergenza",
                "Definizioni stradali: strada extraurbana",
                "Definizioni stradali: curva e dosso",
                "Definizioni stradali: incrocio o intersezione",
                "Definizioni stradali: passaggio pedonale",
                "Definizioni stradali: passo carrabile",
                "Definizioni stradali: isola spartitraffico",
                "Definizioni stradali: banchina stradale",
                "Definizioni stradali: corsia di decelerazione",
                "Definizioni stradali: corsia di accelerazione"
            ];
            
            const chapter2Sheets = [
                "Segnali di pericolo: strada deformata",
                "Segnali di pericolo: dosso",
                "Segnali di pericolo: cunetta",
                "Segnali di pericolo: curva pericolosa a destra",
                "Segnali di pericolo: curva pericolosa a sinistra",
                "Segnali di pericolo: doppia curva",
                "Segnali di pericolo: passaggio a livello con barriere",
                "Segnali di pericolo: passaggio a livello senza barriere",
                "Segnali di pericolo: croce di S. Andrea",
                "Segnali di pericolo: pannelli distanziometrici",
                "Segnali di pericolo: incrocio con precedenza a destra",
                "Segnali di pericolo: discesa pericolosa",
                "Segnali di pericolo: salita ripida",
                "Segnali di pericolo: strettoia simmetrica",
                "Segnali di pericolo: strettoia asimmetrica",
                "Segnali di pericolo: ponte mobile",
                "Segnali di pericolo: banchina pericolosa",
                "Segnali di pericolo: strada sdrucciolevole",
                "Segnali di pericolo: bambini",
                "Segnali di pericolo: animali domestici",
                "Segnali di pericolo: animali selvatici",
                "Segnali di pericolo: doppio senso di marcia",
                "Segnali di pericolo: circolazione rotatoria",
                "Segnali di pericolo: sbocco su molo",
                "Segnali di pericolo: caduta massi",
                "Segnali di pericolo: semaforo",
                "Segnali di pericolo: aeromobili",
                "Segnali di pericolo: forte vento laterale"
            ];

            if (chapterId === 1 && chapter1Sheets[sheetIndex]) return chapter1Sheets[sheetIndex];
            if (chapterId === 2 && chapter2Sheets[sheetIndex]) return chapter2Sheets[sheetIndex];
            
            const chapters = chaptersList.find(c => c.id === chapterId);
            const prefix = chapters ? chapters.name.split("e")[0].split("(")[0].trim() : "Sezione";
            return `${prefix}: Parte ${sheetIndex + 1}`;
        }

        function saveQuestionAnswerStat(qId, chapterNum, state) {
            let stats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');
            stats[qId] = {
                chapter: parseInt(chapterNum),
                state: state // 'correct' | 'wrong'
            };
            localStorage.setItem('user_question_stats', JSON.stringify(stats));
        }

        function renderArgomentiList() {
            const container = document.getElementById('argomenti-list');
            if (!container) return;
            container.innerHTML = '';

            const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

            chaptersList.forEach(ch => {
                // Calculate correct, wrong, unanswered counts for this chapter from userStats
                let correct = 0;
                let wrong = 0;
                for (let key in userStats) {
                    let record = userStats[key];
                    let chNum = (typeof record === 'object') ? record.chapter : null;
                    let stState = (typeof record === 'object') ? record.state : record;
                    
                    if (chNum === ch.id) {
                        if (stState === 'correct') correct++;
                        else if (stState === 'wrong') wrong++;
                    }
                }
                const total = chapterTotals[ch.id] || 100;
                const unanswered = Math.max(0, total - correct - wrong);

                const card = document.createElement('div');
                card.className = 'content-card';
                card.style.cursor = 'pointer';
                card.style.padding = '18px';
                card.onclick = () => openChapterSheetsScreen(ch.id);

                card.innerHTML = `
                    ${getChapterIllustrationSVG(ch.id)}
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">
                            ${ch.id}) ${ch.name}
                        </h4>
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 6px; font-weight: bold;">
                            ${ch.bn}
                        </div>
                        
                        <!-- Statistics counters layout matching Screenshot 2 -->
                        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Corrette: <strong style="color: #4CAF50;">${correct}</strong></span>
                            <span>Errori: <strong style="color: #ef4444;">${wrong}</strong></span>
                            <span>Non risposte: <strong style="color: #f59e0b;">${unanswered}</strong></span>
                            <span>Totale: <strong>${total}</strong></span>
                        </div>

                        <!-- Progress Bar -->
                        <div style="height: 10px; background-color: var(--border-card); border-radius: 6px; display: flex; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="background-color: #4CAF50; width: ${(correct / total) * 100}%;"></div>
                            <div style="background-color: #ef4444; width: ${(wrong / total) * 100}%;"></div>
                            <div style="background-color: #f59e0b; width: ${(unanswered / total) * 100}%;"></div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // --- Scegli Scheda (Sheets Selection Screen) Operations ---
        let activeChapterId = null;
        let activeChapterQuestions = [];
        let activeSheetIndex = null;

        function openChapterSheetsScreen(chapterId) {
            activeChapterId = chapterId;
            const chMeta = chaptersList.find(c => c.id === chapterId);
            if (!chMeta) return;

            // Sync Dropdown display label
            document.getElementById('selected-chapter-display-label').innerText = `Capitolo ${chapterId}) ${chMeta.name}`;

            // Populate chapters list dropdown options
            populateChapterDropdownOptions();

            // Load sheets layout
            const container = document.getElementById('argomenti-schede-list');
            container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 45px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i><br>Caricamento schede...</div>`;
            
            // Navigate to Scegli Scheda screen
            openScreen('argomenti-schede', 'Scegli Scheda');

            // Fetch questions from API
            fetch(`/api/questions/chapter/${chapterId}`)
                .then(res => res.json())
                .then(questions => {
                    activeChapterQuestions = questions;
                    if (questions.length === 0) {
                        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 30px;">Nessuna domanda trovata per questo capitolo.</div>`;
                        return;
                    }
                    renderSheetsList();
                })
                .catch(err => {
                    console.error("Error loading chapter questions: ", err);
                    container.innerHTML = `<div style="text-align: center; color: var(--accent-red); padding: 30px;">Si è verificato un errore nel caricamento delle domande.</div>`;
                });
        }

        function renderSheetsList() {
            const container = document.getElementById('argomenti-schede-list');
            container.innerHTML = '';

            const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');
            const totalSheets = Math.ceil(activeChapterQuestions.length / 10);

            for (let i = 0; i < totalSheets; i++) {
                const sheetQuestions = activeChapterQuestions.slice(i * 10, (i + 1) * 10);
                
                // Calculate correct, wrong, unanswered stats for this 10-question sheet
                let correct = 0;
                let wrong = 0;
                sheetQuestions.forEach(q => {
                    let record = userStats[q.id];
                    let stState = (typeof record === 'object') ? record.state : record;
                    if (stState === 'correct') correct++;
                    else if (stState === 'wrong') wrong++;
                });
                
                const total = sheetQuestions.length;
                const unanswered = total - correct - wrong;

                const card = document.createElement('div');
                card.className = 'content-card';
                card.style.cursor = 'pointer';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '10px';
                card.style.padding = '16px';
                card.onclick = () => startSheetQuiz(i);

                card.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-book-open-reader" style="color: var(--accent-green);"></i>
                            ${i + 1}) ${getSheetName(activeChapterId, i)}
                        </span>
                        <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-secondary);"></i>
                    </div>

                    <!-- Statistics line matching Screenshot 3 -->
                    <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: var(--text-secondary);">
                        <span>Corrette: <strong style="color: #4CAF50;">${correct}</strong></span>
                        <span>Errori: <strong style="color: #ef4444;">${wrong}</strong></span>
                        <span>Non risposte: <strong style="color: #f59e0b;">${unanswered}</strong></span>
                        <span>Totale: <strong>${total}</strong></span>
                    </div>

                    <!-- Custom segment progress bar -->
                    <div style="height: 8px; background-color: var(--border-card); border-radius: 4px; display: flex; overflow: hidden;">
                        <div style="background-color: #4CAF50; width: ${(correct / total) * 100}%;"></div>
                        <div style="background-color: #ef4444; width: ${(wrong / total) * 100}%;"></div>
                        <div style="background-color: #f59e0b; width: ${(unanswered / total) * 100}%;"></div>
                    </div>
                `;
                container.appendChild(card);
            }
        }

        // Chapter selector dropdown panel operations
        function toggleChapterDropdownList() {
            const panel = document.getElementById('chapter-dropdown-list-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        function populateChapterDropdownOptions() {
            const panel = document.getElementById('chapter-dropdown-list-panel');
            panel.innerHTML = '';

            chaptersList.forEach(ch => {
                const item = document.createElement('div');
                item.className = `chapter-dropdown-item ${ch.id === activeChapterId ? 'active' : ''}`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    selectChapterFromDropdown(ch.id);
                };
                item.innerText = `Capitolo ${ch.id}) ${ch.name}`;
                panel.appendChild(item);
            });
        }

        function selectChapterFromDropdown(chapterId) {
            document.getElementById('chapter-dropdown-list-panel').style.display = 'none';
            openChapterSheetsScreen(chapterId);
        }

        // Click wrapper to close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.chapter-selector-trigger')) {
                const panel = document.getElementById('chapter-dropdown-list-panel');
                if (panel) panel.style.display = 'none';
            }
        });

        // Start Sheet MCQ Quiz Practice
        function startSheetQuiz(sheetIndex) {
            practiceMode = 'sheet';
            activeSheetIndex = sheetIndex;

            // Load 10 sheet questions
            testQuestions = activeChapterQuestions.slice(sheetIndex * 10, (sheetIndex + 1) * 10);
            currentTestIndex = 0;
            testAnswers = Array(testQuestions.length).fill(null);

            // Sync layout: replace timer with nice badge, hide tabs and numbers grid
            const timerPill = document.getElementById('test-timer');
            timerPill.innerText = `SCHEDA ${sheetIndex + 1}`;
            timerPill.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
            timerPill.style.borderColor = 'var(--accent-green)';
            timerPill.style.color = 'var(--accent-green)';
            document.querySelector('.test-timer-label').innerText = 'Modalità Esercitazione';

            // Show screen
            openScreen('test', 'Scheda Practice');
            
            // Render pagination numbers (1 to 10)
            switchTestQuestionTab(1);
            showTestQuestion();
        }

        // --- 5. Navigation Logic ---
        let screenHistory = ['home'];

        function openScreen(screenId, headerTitle) {
            const screens = document.querySelectorAll('.screen');
            screens.forEach(s => s.classList.remove('active'));

            const targetScreen = document.getElementById(`screen-${screenId}`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }

            const appHeaderTitle = document.getElementById('app-header-title');
            const backBtn = document.getElementById('back-button');

            if (screenId === 'home') {
                appHeaderTitle.innerText = 'mbanglapatenteb';
                backBtn.style.display = 'none';
                screenHistory = ['home'];
            } else {
                appHeaderTitle.innerText = headerTitle;
                backBtn.style.display = 'flex';
                if (screenHistory[screenHistory.length - 1] !== screenId) {
                    screenHistory.push(screenId);
                }
            }

            syncBottomNav(screenId);

            if (screenId === 'test') {
                if (typeof practiceMode === 'undefined' || practiceMode !== 'sheet') {
                    practiceMode = 'exam';
                    initRandomTestQuiz();
                }
            } else if (screenId === 'argomenti') {
                renderArgomentiList();
            } else if (screenId === 'dizionario') {
                initDictionary();
            } else if (screenId === 'cartelli') {
                setSignCategory('pericolo');
            }
        }

        function navigateBack() {
            if (screenHistory.length > 0) {
                const activeScreen = screenHistory[screenHistory.length - 1];
                if (activeScreen === 'test-results-detail') {
                    openScreen('home', 'mbanglapatenteb');
                    return;
                }
                if (activeScreen === 'test' && typeof practiceMode !== 'undefined' && practiceMode === 'sheet') {
                    if (confirm("আপনি কি প্র্যাকটিস বাতিল করে ফিরে যেতে চান?")) {
                        if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                        }
                        openScreen('argomenti-schede', 'Scegli Scheda');
                    }
                    return;
                }
                if (activeScreen === 'argomenti-schede') {
                    openScreen('argomenti', 'Argomenti');
                    return;
                }
            }
            if (screenHistory.length > 1) {
                screenHistory.pop();
                const prevScreen = screenHistory[screenHistory.length - 1];
                
                let title = 'mbanglapatenteb';
                if (prevScreen === 'lezioni') title = 'Lezioni';
                else if (prevScreen === 'test') title = 'Test Practice';
                else if (prevScreen === 'argomenti') title = 'Argomenti';
                else if (prevScreen === 'argomenti-schede') title = 'Scegli Scheda';
                else if (prevScreen === 'eclass') title = 'E-Class';
                else if (prevScreen === 'sfida') title = 'Sfida';
                else if (prevScreen === 'scheda-esame') title = 'Scheda Esame';
                else if (prevScreen === 'dizionario') title = 'Dizionario';
                else if (prevScreen === 'cartelli') title = 'Cartelli';
                else if (prevScreen === 'profilo') title = 'Profilo';

                openScreen(prevScreen, title);
            } else {
                openScreen('home', 'mbanglapatenteb');
            }
        }

        function clickBottomNav(screenId) {
            let title = 'mbanglapatenteb';
            if (screenId === 'scheda-esame') title = 'Scheda Esame';
            else if (screenId === 'dizionario') title = 'Dizionario';
            else if (screenId === 'profilo') title = 'Profilo';

            openScreen(screenId, title);
        }

        function syncBottomNav(screenId) {
            const navItems = document.querySelectorAll('.bottom-nav .nav-item');
            navItems.forEach(item => item.classList.remove('active'));

            if (screenId === 'home') {
                document.getElementById('nav-home').classList.add('active');
            } else if (screenId === 'scheda-esame') {
                document.getElementById('nav-quiz').classList.add('active');
            } else if (screenId === 'dizionario') {
                document.getElementById('nav-dictionary').classList.add('active');
            } else if (screenId === 'profilo') {
                document.getElementById('nav-profile').classList.add('active');
            }
        }

        // --- 6. Toast Notification System ---
        let toastTimeout;
        function showToast(message) {
            const toast = document.getElementById('toast-container');
            const toastText = document.getElementById('toast-text');
            
            toastText.innerText = message;
            toast.classList.add('show');
            
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // --- 7. Lezioni (Video Player) Logic ---
        function playLesson(title, duration) {
            const modal = document.getElementById('video-player-modal');
            const modalTitle = document.getElementById('video-player-title');
            const modalSub = document.getElementById('video-player-sub');

            modalTitle.innerText = title;
            modalSub.innerText = `${duration} • চাপুন প্লে করতে`;
            modal.style.display = 'flex';
        }

        function simulateVideoPlaying() {
            const playBtn = document.querySelector('.video-control-play');
            const modalSub = document.getElementById('video-player-sub');
            playBtn.className = 'fa-solid fa-spinner fa-spin video-control-play';
            modalSub.innerText = 'ভিডিও লোড হচ্ছে...';
            
            setTimeout(() => {
                playBtn.className = 'fa-solid fa-pause video-control-play';
                modalSub.innerText = 'ভিডিও প্লে হচ্ছে (সিমুলেশন)...';
                showToast('ভিডিও চলাকালীন সাউন্ড চেক করুন');
            }, 1500);
        }

        function closeVideoPlayer() {
            const modal = document.getElementById('video-player-modal');
            const playBtn = document.querySelector('.video-control-play');
            modal.style.display = 'none';
            playBtn.className = 'fa-solid fa-play video-control-play';
        }

        // --- 8. Dynamic Quiz Practice Logic (MCQ Module) ---
        let quizData = [];
        let currentQuizIndex = 0;
        let activeChapterId = null;

        function startChapterQuiz(chapterId, chapterName) {
            showToast('প্রশ্ন লোড হচ্ছে...');
            activeChapterId = chapterId;
            
            fetch(`/api/questions/chapter/${chapterId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        quizData = data;
                        currentQuizIndex = 0;
                        openScreen('test', `Practice: Ch ${chapterId}`);
                        renderQuizQuestion();
                    } else {
                        showToast('এই অধ্যায়ে কোনো প্রশ্ন পাওয়া যায়নি');
                    }
                })
                .catch(err => {
                    console.error(err);
                    showToast('প্রশ্ন লোড করতে ব্যর্থ হয়েছে');
                });
        }

        function renderQuizQuestion() {
            if (quizData.length === 0) return;
            const currentQ = quizData[currentQuizIndex];
            document.getElementById('quiz-progress-text').innerText = `প্রশ্ন: ${currentQuizIndex + 1}/${quizData.length}`;
            document.getElementById('quiz-question-it').innerText = currentQ.italian;
            document.getElementById('quiz-question-bn').innerText = currentQ.bangla;
            
            document.getElementById('quiz-feedback').style.display = 'none';
            document.getElementById('next-quiz-btn').style.display = 'none';
            
            const buttons = document.querySelectorAll('#screen-test .ans-btn');
            buttons.forEach(b => b.classList.remove('selected'));
        }

        function checkQuizAnswer(userSelection) {
            if (quizData.length === 0) return;
            const currentQ = quizData[currentQuizIndex];
            const feedback = document.getElementById('quiz-feedback');
            const nextBtn = document.getElementById('next-quiz-btn');

            const databaseIsVero = currentQ.is_vero === 1 || currentQ.is_vero === true || currentQ.is_vero === '1';
            const isCorrect = userSelection === databaseIsVero;
            
            if (isCorrect) {
                feedback.className = 'feedback-box correct';
                feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> সঠিক উত্তর!';
                playAppSound(true);

                updateChapterProgressLocally();
            } else {
                feedback.className = 'feedback-box incorrect';
                feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ভুল উত্তর! সঠিক উত্তর: ${databaseIsVero ? 'VERO' : 'FALSO'}`;
                playAppSound(false);
            }
            feedback.style.display = 'block';
            nextBtn.style.display = 'block';
        }

        function updateChapterProgressLocally() {
            if (!activeChapterId) return;
            const stats = JSON.parse(localStorage.getItem('chapter_progress') || '{}');
            let currentProg = stats[activeChapterId] || 0;
            if (currentProg < 100) {
                currentProg += Math.ceil(100 / quizData.length);
                if (currentProg > 100) currentProg = 100;
                stats[activeChapterId] = currentProg;
                localStorage.setItem('chapter_progress', JSON.stringify(stats));
            }
        }

        function nextQuizQuestion() {
            currentQuizIndex = (currentQuizIndex + 1) % quizData.length;
            renderQuizQuestion();
        }

        // --- 9. Dynamic Official Exam Simulation Logic (30 Questions, Max 4 Errors) ---
        let examQuestions = [];
        let userExamAnswers = [];
        let currentExamIndex = 0;
        let examTimerInterval;
        let examTimeRemaining = 30 * 60;

        function initExam() {
            showToast('পরীক্ষার প্রশ্ন লোড হচ্ছে...');
            examQuestions = [];
            userExamAnswers = Array(30).fill(null);
            currentExamIndex = 0;
            examTimeRemaining = 30 * 60;

            const container = document.getElementById('exam-dots-container');
            container.innerHTML = '';
            for (let i = 0; i < 30; i++) {
                const dot = document.createElement('div');
                dot.className = 'exam-dot';
                dot.innerText = i + 1;
                dot.id = `exam-dot-${i}`;
                dot.onclick = () => jumpToExamQuestion(i);
                container.appendChild(dot);
            }

            fetch('/api/questions/exam')
                .then(res => res.json())
                .then(data => {
                    examQuestions = data;
                    showExamQuestion();
                    
                    clearInterval(examTimerInterval);
                    examTimerInterval = setInterval(updateExamTimer, 1000);
                    updateExamTimer();
                })
                .catch(err => {
                    console.error(err);
                    showToast('পরীক্ষা শুরু করতে সমস্যা হয়েছে');
                });
        }

        function updateExamTimer() {
            if (examTimeRemaining <= 0) {
                clearInterval(examTimerInterval);
                submitExam();
                return;
            }
            examTimeRemaining--;
            const mins = Math.floor(examTimeRemaining / 60);
            const secs = examTimeRemaining % 60;
            document.getElementById('exam-timer').innerText = 
                `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
        }

        function showExamQuestion() {
            if (examQuestions.length === 0) return;
            const currentQ = examQuestions[currentExamIndex];
            document.getElementById('exam-question-number').innerText = `প্রশ্ন ${currentExamIndex + 1}/৩০`;
            document.getElementById('exam-question-it').innerText = currentQ.italian;
            document.getElementById('exam-question-bn').innerText = currentQ.bangla;

            const dots = document.querySelectorAll('.exam-dot');
            dots.forEach((dot, index) => {
                dot.classList.remove('active');
                if (index === currentExamIndex) {
                    dot.classList.add('active');
                }
            });

            const veroBtn = document.getElementById('exam-vero-btn');
            const falsoBtn = document.getElementById('exam-falso-btn');
            veroBtn.classList.remove('selected');
            falsoBtn.classList.remove('selected');

            if (userExamAnswers[currentExamIndex] === true) {
                veroBtn.classList.add('selected');
            } else if (userExamAnswers[currentExamIndex] === false) {
                falsoBtn.classList.add('selected');
            }
        }

        function answerExamQuestion(answer) {
            if (examQuestions.length === 0) return;
            userExamAnswers[currentExamIndex] = answer;
            
            const activeDot = document.getElementById(`exam-dot-${currentExamIndex}`);
            if (activeDot) {
                activeDot.classList.add('answered');
            }
            
            showExamQuestion();
        }

        function nextExamQuestion() {
            if (currentExamIndex < 29) {
                currentExamIndex++;
                showExamQuestion();
            }
        }

        function jumpToExamQuestion(index) {
            currentExamIndex = index;
            showExamQuestion();
        }

        function submitExam() {
            if (examQuestions.length === 0) return;
            clearInterval(examTimerInterval);
            
            let errors = 0;
            let unanswered = 0;

            for (let i = 0; i < 30; i++) {
                const databaseIsVero = examQuestions[i].is_vero === 1 || examQuestions[i].is_vero === true || examQuestions[i].is_vero === '1';
                if (userExamAnswers[i] === null) {
                    errors++;
                    unanswered++;
                } else if (userExamAnswers[i] !== databaseIsVero) {
                    errors++;
                }
            }

            const passed = errors <= 4;

            const modal = document.getElementById('exam-result-modal');
            const statusBadge = document.getElementById('result-badge-status');
            const errorsCount = document.getElementById('result-errors-count');
            const resultMsg = document.getElementById('result-message');

            errorsCount.innerText = `${errors} টি ভুল`;
            
            if (passed) {
                statusBadge.className = 'result-badge passed';
                statusBadge.innerText = 'উত্তীর্ণ (IDONEO)';
                resultMsg.innerHTML = `অভিনন্দন! আপনি ডেমো পরীক্ষায় উত্তীর্ণ হয়েছেন।<br><small>মোট প্রশ্ন ৩০টি • অনুত্তরিত: ${unanswered}টি</small>`;
                playAppSound(true);
            } else {
                statusBadge.className = 'result-badge failed';
                statusBadge.innerText = 'অকৃতকার্য (RESPINTO)';
                resultMsg.innerHTML = `দুঃখিত! আপনি পরীক্ষায় পাস করতে পারেননি। সর্বোচ্চ ৪টি ভুল গ্রহণযোগ্য ছিল।<br><small>মোট ভুল: ${errors}টি (অনুত্তরিত সহ)</small>`;
                playAppSound(false);
            }

            modal.style.display = 'flex';

            let completedExamsCount = parseInt(document.getElementById('stats-exams').innerText) || 0;
            document.getElementById('stats-exams').innerText = completedExamsCount + 1;
        }

        function closeResultModal() {
            document.getElementById('exam-result-modal').style.display = 'none';
            openScreen('home', 'mbanglapatenteb');
        }

        // --- 10. Dictionary Logic ---
        const dictionaryData = [
            { word: "Carreggiata", bn: "ক্যারিজওয়ে / মূল রাস্তা", desc: "La parte della strada destinata normalmente alla circolazione dei veicoli. (রাস্তার মূল অংশ যা সাধারণত যানবাহন চলাচলের জন্য ব্যবহৃত হয়।)" },
            { word: "Corsia", bn: "লেন", desc: "Suddivisione della carreggiata destinata alla circolazione di una sola fila di veicoli. (একটিমাত্র সারির যানবাহন চলাচলের উপযোগী রাস্তার বিভাজন।)" },
            { word: "Precedenza", bn: "অগ্রাধিকার", desc: "Regola che stabilisce quale veicolo ha il diritto di passare per primo in un incrocio. (মোড়ে কোন গাড়িটি আগে যাবে তা নির্ধারণের নিয়ম।)" },
            { word: "Sorpasso", bn: "ওভারটেকিং", desc: "Manovra con cui un veicolo supera un altro veicolo o ostacolo in movimento. (একটি গাড়ি যখন আরেকটি চলন্ত গাড়ির আগে চলে যায়।)" },
            { word: "Sosta", bn: "পার্কিং / দীর্ঘ বিরতি", desc: "La sospensione della marcia del veicolo prolungata nel tempo con spegnimento del motore. (ইঞ্জিন বন্ধ করে গাড়িকে দীর্ঘদিন এক স্থানে পার্ক করে রাখা।)" }
        ];

        function initDictionary() {
            const listContainer = document.getElementById('dictionary-list');
            listContainer.innerHTML = '';

            dictionaryData.forEach(item => {
                const card = document.createElement('div');
                card.className = 'content-card dictionary-item';
                card.innerHTML = `
                    <div class="dict-word">${item.word}</div>
                    <div class="dict-meaning">${item.bn}</div>
                    <div class="dict-desc">${item.desc}</div>
                `;
                listContainer.appendChild(card);
            });
        }

        function filterDictionary() {
            const query = document.getElementById('dictionary-search').value.toLowerCase();
            const listContainer = document.getElementById('dictionary-list');
            listContainer.innerHTML = '';

            const filtered = dictionaryData.filter(item => 
                item.word.toLowerCase().includes(query) || 
                item.bn.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-secondary);">কোনো ফলাফল পাওয়া যায়নি!</div>';
                return;
            }

            filtered.forEach(item => {
                const card = document.createElement('div');
                card.className = 'content-card dictionary-item';
                card.innerHTML = `
                    <div class="dict-word">${item.word}</div>
                    <div class="dict-meaning">${item.bn}</div>
                    <div class="dict-desc">${item.desc}</div>
                `;
                listContainer.appendChild(card);
            });
        }

        // --- 11. Traffic Signs Logic ---
        const signsData = {
            pericolo: [
                { name: "Strada Deformata", bn: "উঁচু নিচু রাস্তা", svg: `<svg viewBox="0 0 100 100"><polygon points="50,10 90,80 10,80" fill="#FFF" stroke="#FF1744" stroke-width="8"/><path d="M25,70 Q35,55 45,70 T65,70 T85,70" fill="none" stroke="#000" stroke-width="4"/></svg>` },
                { name: "Curva Pericolosa a Destra", bn: "ডান দিকে বিপদজনক মোড়", svg: `<svg viewBox="0 0 100 100"><polygon points="50,10 90,80 10,80" fill="#FFF" stroke="#FF1744" stroke-width="8"/><path d="M40,65 L40,55 Q40,45 50,45 L65,45" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round"/><polygon points="65,40 75,45 65,50" fill="#000"/></svg>` }
            ],
            divieto: [
                { name: "Divieto di Transito", bn: "যাতায়াত নিষেধ (উভয়মুখী)", svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#FFF" stroke="#FF1744" stroke-width="8"/></svg>` },
                { name: "Divieto di Sorpasso", bn: "ওভারটেকিং নিষেধ", svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#FFF" stroke="#FF1744" stroke-width="8"/><circle cx="40" cy="55" r="8" fill="#FF1744"/><circle cx="60" cy="55" r="8" fill="#000"/></svg>` }
            ],
            obbligo: [
                { name: "Direzione Obbligatoria Diritto", bn: "সামনে যাওয়া বাধ্যতামূলক", svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#3B82F6"/><path d="M50,70 L50,30" fill="none" stroke="#FFF" stroke-width="8" stroke-linecap="round"/><polygon points="42,35 50,22 58,35" fill="#FFF"/></svg>` },
                { name: "Passaggio Obbligatorio a Destra", bn: "ডান দিকে যাওয়া বাধ্যতামূলক", svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#3B82F6"/><path d="M35,35 L60,60" fill="none" stroke="#FFF" stroke-width="8" stroke-linecap="round"/><polygon points="48,60 68,68 60,48" fill="#FFF"/></svg>` }
            ]
        };

        function setSignCategory(category) {
            document.querySelectorAll('.sign-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(`tab-${category}`).classList.add('active');

            const container = document.getElementById('signs-grid-container');
            container.innerHTML = '';

            const items = signsData[category];
            items.forEach(sign => {
                const card = document.createElement('div');
                card.className = 'sign-card';
                card.innerHTML = `
                    <div class="sign-image">${sign.svg}</div>
                    <div class="sign-name">${sign.name}</div>
                    <div class="sign-bangla">${sign.bn}</div>
                `;
                container.appendChild(card);
            });
        }

        // --- 11. App Settings & Sound Systems ---
        let soundEnabled = true;

        function toggleSound(checked) {
            soundEnabled = checked;
            showToast(soundEnabled ? 'শব্দ সংকেত চালু হয়েছে' : 'শব্দ সংকেত বন্ধ করা হয়েছে');
        }

        function playAppSound(isCorrect) {
            if (!soundEnabled) return;
            try {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const osc = context.createOscillator();
                const gain = context.createGain();

                osc.connect(gain);
                gain.connect(context.destination);

                if (isCorrect) {
                    osc.frequency.setValueAtTime(523.25, context.currentTime);
                    osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.1, context.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
                    osc.start();
                    osc.stop(context.currentTime + 0.3);
                } else {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, context.currentTime);
                    osc.frequency.setValueAtTime(110, context.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.15, context.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
                    osc.start();
                    osc.stop(context.currentTime + 0.4);
                }
            } catch (e) {
                console.error("Audio error: ", e);
            }
        }

        function resetAppData() {
            if (confirm("আপনি কি নিশ্চিতভাবে সব ডেটা রিসেট করতে চান?")) {
                document.getElementById('stats-exams').innerText = '0';
                document.getElementById('stats-errors').innerText = '0.0';
                showToast('সব ডেটা সফলভাবে রিসেট করা হয়েছে');
            }
        }

        // --- 12. Guest Chat System AJAX Logic ---
        let chatInterval = null;
        
        function toggleGuestChat(show) {
            const widget = document.getElementById('guest-chat-widget');
            widget.style.display = show ? 'flex' : 'none';
            
            if (show) {
                fetchGuestChatMessages();
                // Poll for new messages every 3 seconds
                if (!chatInterval) {
                    chatInterval = setInterval(fetchGuestChatMessages, 3000);
                }
            } else {
                if (chatInterval) {
                    clearInterval(chatInterval);
                    chatInterval = null;
                }
            }
        }
        
        function fetchGuestChatMessages() {
            fetch('/api/chat/messages')
                .then(res => res.json())
                .then(messages => {
                    renderGuestChatMessages(messages);
                })
                .catch(err => console.error("Error fetching chat: ", err));
        }
        
        function renderGuestChatMessages(messages) {
            const container = document.getElementById('guest-chat-messages');
            const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;
            
            container.innerHTML = '';
            if (messages.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 11px; margin-top: 20px;">আপনার বার্তা লিখে চ্যাট শুরু করুন। রহমান স্যার খুব শীঘ্রই উত্তর দেবেন!</div>`;
                return;
            }
            
            messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${msg.sender === 'user' ? 'user' : 'admin'}`;
                bubble.innerText = msg.message;
                container.appendChild(bubble);
            });
            
            // Auto-scroll to bottom
            if (scrollAtBottom || container.scrollTop === 0) {
                container.scrollTop = container.scrollHeight;
            }
        }
        
        function sendGuestChatMessage() {
            const input = document.getElementById('guest-chat-input');
            const messageText = input.value.trim();
            if (!messageText) return;
            
            input.value = '';
            
            fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify({ message: messageText })
            })
            .then(res => res.json())
            .then(msg => {
                fetchGuestChatMessages();
            })
            .catch(err => console.error("Error sending message: ", err));
        }

        // --- 13. Mobile Exam Simulator (TEST) AJAX Logic ---
        let testQuestions = [];
        let currentTestIndex = 0;
        let testAnswers = Array(30).fill(null);
        let testTimerSeconds = 1200; // 20 minutes
        let testTimerInterval = null;
        let testTranslationActive = false;
        let currentTestTab = 1; // 1: 1-10, 2: 11-20, 3: 21-30
        let audioProgressInterval = null;

        function initRandomTestQuiz() {
            // Stop existing timer
            if (testTimerInterval) {
                clearInterval(testTimerInterval);
            }
            // Reset state variables
            testQuestions = [];
            currentTestIndex = 0;
            testAnswers = Array(30).fill(null);
            testTimerSeconds = 1200;
            testTranslationActive = false;
            currentTestTab = 1;
            
            document.getElementById('test-question-it').innerText = 'Caricamento delle domande...';
            document.getElementById('test-question-bn').innerText = 'প্রশ্ন লোড হচ্ছে...';
            document.getElementById('test-question-bn').style.display = 'none';
            document.getElementById('test-options-bar').style.display = 'none';

            // Fetch 30 random questions
            fetch('/api/questions/random-test')
                .then(res => res.json())
                .then(data => {
                    testQuestions = data;
                    if (testQuestions.length === 0) {
                        document.getElementById('test-question-it').innerText = 'Nessuna domanda trovata nel database.';
                        return;
                    }
                    
                    // Render UI
                    switchTestQuestionTab(1);
                    showTestQuestion();
                    
                    // Start timer
                    startTestTimer();
                })
                .catch(err => {
                    console.error("Error loading random test questions: ", err);
                    showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
                });
        }

        function startTestTimer() {
            updateTestTimerDisplay();
            testTimerInterval = setInterval(() => {
                testTimerSeconds--;
                updateTestTimerDisplay();
                if (testTimerSeconds <= 0) {
                    clearInterval(testTimerInterval);
                    showToast('সময় শেষ! পরীক্ষাটি জমা হচ্ছে।');
                    submitTestExam();
                }
            }, 1000);
        }

        function updateTestTimerDisplay() {
            const minutes = Math.floor(testTimerSeconds / 60);
            const seconds = testTimerSeconds % 60;
            document.getElementById('test-timer').innerText = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function switchTestQuestionTab(tab) {
            currentTestTab = tab;
            
            // Toggle tab header visibility based on mode
            const tabHeader = document.querySelector('.test-pagination-tabs');
            if (tabHeader) {
                tabHeader.style.display = (practiceMode === 'sheet') ? 'none' : 'flex';
            }

            // Render numbers grid based on tab
            let startNum = (tab - 1) * 10 + 1;
            let endNum = tab * 10;
            
            // Force 1-10 if in sheet mode
            if (practiceMode === 'sheet') {
                startNum = 1;
                endNum = 10;
            }

            const container = document.getElementById('test-num-grid');
            container.innerHTML = '';

            const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

            for (let i = startNum; i <= endNum; i++) {
                if (i - 1 >= testQuestions.length) break;

                const box = document.createElement('span');
                box.className = 'test-num-box';
                box.id = `test-num-${i - 1}`;
                box.innerText = i;
                box.onclick = () => jumpToTestQuestion(i - 1);
                
                // Set state styling (active or answered VERO/FALSO)
                if (i - 1 === currentTestIndex) {
                    box.classList.add('active');
                } else {
                    if (practiceMode === 'sheet') {
                        // Check exact correctness state from user stats
                        const qId = testQuestions[i - 1].id;
                        const record = userStats[qId];
                        const stState = (typeof record === 'object') ? record.state : record;
                        if (stState === 'correct') {
                            box.classList.add('answered-vero'); // Green
                        } else if (stState === 'wrong') {
                            box.classList.add('answered-falso'); // Red
                        }
                    } else {
                        const ans = testAnswers[i - 1];
                        if (ans === true) {
                            box.classList.add('answered-vero');
                        } else if (ans === false) {
                            box.classList.add('answered-falso');
                        }
                    }
                }
                container.appendChild(box);
            }
        }

        function jumpToTestQuestion(index) {
            if (index >= testQuestions.length) return;
            currentTestIndex = index;
            
            if (practiceMode === 'sheet') {
                switchTestQuestionTab(1);
            } else {
                // Sync active tab based on question index
                const expectedTab = Math.floor(index / 10) + 1;
                if (expectedTab !== currentTestTab) {
                    switchTestQuestionTab(expectedTab);
                } else {
                    switchTestQuestionTab(currentTestTab);
                }
            }
            showTestQuestion();
        }

        function showTestQuestion() {
            if (testQuestions.length === 0) return;
            
            // Cancel active speech to keep UI fresh
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            isSpeechSpeaking = false;
            document.getElementById('test-audio-play-btn').innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';

            // Remove highlight classes
            document.getElementById('test-vero-btn').classList.remove('correct-highlight', 'wrong-highlight', 'active');
            document.getElementById('test-falso-btn').classList.remove('correct-highlight', 'wrong-highlight', 'active');

            const q = testQuestions[currentTestIndex];
            
            document.getElementById('test-question-it').innerText = q.italian;
            document.getElementById('test-question-bn').innerText = q.bangla;
            
            // Sync translation view
            document.getElementById('test-question-bn').style.display = testTranslationActive ? 'block' : 'none';

            // Sync VERO/FALSO selected styling
            const currentAns = testAnswers[currentTestIndex];
            if (currentAns === true) {
                document.getElementById('test-vero-btn').classList.add('active');
            } else if (currentAns === false) {
                document.getElementById('test-falso-btn').classList.add('active');
            }
            
            // Reset slider progress
            document.getElementById('test-audio-slider').value = 0;
            if (audioProgressInterval) {
                clearInterval(audioProgressInterval);
            }
        }

        function selectTestAnswer(ans) {
            if (testQuestions.length === 0) return;
            testAnswers[currentTestIndex] = ans;
            
            const q = testQuestions[currentTestIndex];
            const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
            const isCorrect = (ans === databaseIsVero);

            if (practiceMode === 'sheet') {
                // Immediate validation feedback and save to localStorage
                saveQuestionAnswerStat(q.id, q.chapter, isCorrect ? 'correct' : 'wrong');
                playAppSound(isCorrect);

                // Highlight correct and wrong buttons
                if (ans === true) {
                    // Selected VERO
                    if (isCorrect) {
                        document.getElementById('test-vero-btn').classList.add('correct-highlight');
                    } else {
                        document.getElementById('test-vero-btn').classList.add('wrong-highlight');
                        document.getElementById('test-falso-btn').classList.add('correct-highlight');
                    }
                } else {
                    // Selected FALSO
                    if (isCorrect) {
                        document.getElementById('test-falso-btn').classList.add('correct-highlight');
                    } else {
                        document.getElementById('test-falso-btn').classList.add('wrong-highlight');
                        document.getElementById('test-vero-btn').classList.add('correct-highlight');
                    }
                }

                // Refresh pagination numbers showing color state immediately
                switchTestQuestionTab(1);

                // Delay auto-advance for feedback
                setTimeout(() => {
                    if (currentTestIndex < testQuestions.length - 1) {
                        jumpToTestQuestion(currentTestIndex + 1);
                    } else {
                        finishSheetPractice();
                    }
                }, 1000);

            } else {
                // Exam mode
                showTestQuestion();
                switchTestQuestionTab(currentTestTab);
                
                setTimeout(() => {
                    nextTestQuestion();
                }, 400);
            }
        }

        function prevTestQuestion() {
            if (currentTestIndex > 0) {
                jumpToTestQuestion(currentTestIndex - 1);
            }
        }

        function nextTestQuestion() {
            if (currentTestIndex < testQuestions.length - 1) {
                jumpToTestQuestion(currentTestIndex + 1);
            } else {
                if (practiceMode === 'sheet') {
                    if (confirm("আপনি কি প্র্যাকটিস শেষ করে সাবমিট করতে চান?")) {
                        finishSheetPractice();
                    }
                } else {
                    if (confirm("আপনি কি পরীক্ষা সমাপ্ত করে জমা দিতে চান?")) {
                        submitTestExam();
                    }
                }
            }
        }

        function finishSheetPractice() {
            let correctCount = 0;
            const userStats = JSON.parse(localStorage.getItem('user_question_stats') || '{}');

            testQuestions.forEach(q => {
                const record = userStats[q.id];
                const stState = (typeof record === 'object') ? record.state : record;
                if (stState === 'correct') {
                    correctCount++;
                }
            });

            alert(`প্র্যাকটিস সম্পন্ন হয়েছে!\nসঠিক উত্তর: ${correctCount}/১০\nভুল উত্তর: ${10 - correctCount}/১০`);
            
            // Go back and refresh sheets list progress
            openChapterSheetsScreen(activeChapterId);
        }

        function toggleTestOptions() {
            const bar = document.getElementById('test-options-bar');
            bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
        }

        function toggleTestTranslation() {
            testTranslationActive = !testTranslationActive;
            document.getElementById('test-question-bn').style.display = testTranslationActive ? 'block' : 'none';
            if (testTranslationActive) {
                readItalianQuestionOutLoud();
            }
        }

        // Speed Dropdown Populate & Select
        function populateSpeedOptions() {
            const container = document.getElementById('test-speed-popover');
            container.innerHTML = '';
            
            speedOptionsList.forEach(rate => {
                const item = document.createElement('div');
                item.className = `speed-option-item ${rate === testAudioSpeed ? 'selected' : ''}`;
                item.onclick = () => selectAudioSpeed(rate);
                item.innerHTML = `
                    <span>${rate}</span>
                    ${rate === testAudioSpeed ? '<i class="fa-solid fa-check" style="font-size:10px;"></i>' : ''}
                `;
                container.appendChild(item);
            });
        }

        function toggleSpeedDropdown() {
            const popover = document.getElementById('test-speed-popover');
            popover.style.display = popover.style.display === 'none' ? 'flex' : 'none';
        }

        function selectAudioSpeed(rate) {
            testAudioSpeed = rate;
            populateSpeedOptions();
            document.getElementById('test-speed-popover').style.display = 'none';
            showToast(`গতি নির্ধারণ করা হয়েছে: ${rate}x`);
            
            // If already speaking, restart with new speed
            if (isSpeechSpeaking) {
                readItalianQuestionOutLoud();
            }
        }

        function togglePlayPauseSpeech() {
            if (isSpeechSpeaking) {
                // Cancel/Pause speech
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                isSpeechSpeaking = false;
                document.getElementById('test-audio-play-btn').innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
                if (audioProgressInterval) {
                    clearInterval(audioProgressInterval);
                }
            } else {
                readItalianQuestionOutLoud();
            }
        }

        function readItalianQuestionOutLoud() {
            if (testQuestions.length === 0) return;
            const q = testQuestions[currentTestIndex];
            
            // Speak text using Web Speech Synthesis
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(q.italian);
                utterance.lang = 'it-IT';
                utterance.rate = testAudioSpeed;
                
                // Track state
                isSpeechSpeaking = true;
                document.getElementById('test-audio-play-btn').innerHTML = '<i class="fa-solid fa-pause" style="color: var(--text-primary);"></i>';
                
                // Animate progress bar slider smoothly
                let slider = document.getElementById('test-audio-slider');
                slider.value = 0;
                let stepCount = 0;
                // Speak speed duration approximation
                let durationSteps = Math.max(15, Math.floor((q.italian.length / 3) / testAudioSpeed));
                
                if (audioProgressInterval) {
                    clearInterval(audioProgressInterval);
                }
                
                audioProgressInterval = setInterval(() => {
                    stepCount++;
                    let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
                    slider.value = prg;
                    if (prg >= 100) {
                        clearInterval(audioProgressInterval);
                    }
                }, 200);

                utterance.onend = () => {
                    clearInterval(audioProgressInterval);
                    slider.value = 100;
                    isSpeechSpeaking = false;
                    document.getElementById('test-audio-play-btn').innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
                };

                utterance.onerror = () => {
                    clearInterval(audioProgressInterval);
                    isSpeechSpeaking = false;
                    document.getElementById('test-audio-play-btn').innerHTML = '<i class="fa-solid fa-play" style="color: var(--text-primary);"></i>';
                };

                window.speechSynthesis.speak(utterance);
            } else {
                showToast('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না');
            }
        }

        function changeAudioProgress(val) {
            // Mock manual slider change handler
        }

        function closeTestExam() {
            if (confirm("আপনি কি পরীক্ষা বাতিল করে হোম স্ক্রিনে ফিরে যেতে চান?")) {
                if (testTimerInterval) {
                    clearInterval(testTimerInterval);
                }
                if (audioProgressInterval) {
                    clearInterval(audioProgressInterval);
                }
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                openScreen('home', 'mbanglapatenteb');
            }
        }

        function submitTestExam() {
            if (testQuestions.length === 0) return;
            if (testTimerInterval) {
                clearInterval(testTimerInterval);
            }
            if (audioProgressInterval) {
                clearInterval(audioProgressInterval);
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            
            let correctAnswers = 0;
            let wrongAnswers = 0;
            let unansweredAnswers = 0;

            for (let i = 0; i < 30; i++) {
                const databaseIsVero = testQuestions[i].is_vero === 1 || testQuestions[i].is_vero === true || testQuestions[i].is_vero === '1';
                if (testAnswers[i] === null) {
                    unansweredAnswers++;
                } else if (testAnswers[i] === databaseIsVero) {
                    correctAnswers++;
                } else {
                    wrongAnswers++;
                }
            }

            const passed = wrongAnswers <= 4;

            // Configure statistics outcome in popup modal
            document.getElementById('txt-giusto').innerText = correctAnswers;
            document.getElementById('txt-sbagliato').innerText = wrongAnswers;
            document.getElementById('txt-nondate').innerText = unansweredAnswers;

            // Set progress bar ratios
            document.getElementById('bar-giusto').style.width = `${(correctAnswers / 30) * 100}%`;
            document.getElementById('bar-sbagliato').style.width = `${(wrongAnswers / 30) * 100}%`;
            document.getElementById('bar-nondate').style.width = `${(unansweredAnswers / 30) * 100}%`;

            // Emoji outcome
            document.getElementById('test-result-emoji').innerText = passed ? '😊' : '😢';

            // Show results popup
            const modal = document.getElementById('exam-result-modal');
            modal.style.display = 'flex';

            let completedExamsCount = parseInt(document.getElementById('stats-exams').innerText) || 0;
            document.getElementById('stats-exams').innerText = completedExamsCount + 1;
        }

        // --- 14. Detailed Results Card List Operations ---
        let currentDetailFilter = 'all'; // all, correct, incorrect, unanswered
        let playingDetailSpeechIndex = null;
        let detailSpeechInterval = null;

        function openTestDetailsView() {
            // Close popup modal
            document.getElementById('exam-result-modal').style.display = 'none';

            // Compute elapsed time
            let timeSpent = 1200 - testTimerSeconds;
            let mins = Math.floor(timeSpent / 60);
            let secs = timeSpent % 60;
            document.getElementById('detail-outcome-time').innerText = `Tempo: ${mins} minuti ${secs} secondi`;

            // Calculate metrics
            let correctAnswers = 0;
            let wrongAnswers = 0;
            let unansweredAnswers = 0;

            for (let i = 0; i < 30; i++) {
                const databaseIsVero = testQuestions[i].is_vero === 1 || testQuestions[i].is_vero === true || testQuestions[i].is_vero === '1';
                if (testAnswers[i] === null) {
                    unansweredAnswers++;
                } else if (testAnswers[i] === databaseIsVero) {
                    correctAnswers++;
                } else {
                    wrongAnswers++;
                }
            }

            const passed = wrongAnswers <= 4;

            // Setup Header Output View
            const emojiEl = document.getElementById('detail-outcome-emoji');
            const titleEl = document.getElementById('detail-outcome-title');
            
            if (passed) {
                emojiEl.innerText = '😊';
                titleEl.innerText = 'Idoneo';
                titleEl.style.color = '#4CAF50';
            } else {
                emojiEl.innerText = '🙄';
                titleEl.innerText = 'Bocciato';
                titleEl.style.color = '#ef4444';
            }

            // Sync counts
            document.getElementById('detail-count-corrette').innerText = correctAnswers;
            document.getElementById('detail-count-errori').innerText = wrongAnswers;
            document.getElementById('detail-count-nondate').innerText = unansweredAnswers;

            // Sync split progress bars
            document.getElementById('split-bar-giusto').style.width = `${(correctAnswers / 30) * 100}%`;
            document.getElementById('split-bar-sbagliato').style.width = `${(wrongAnswers / 30) * 100}%`;
            document.getElementById('split-bar-nondate').style.width = `${(unansweredAnswers / 30) * 100}%`;

            // Navigate to results screen
            openScreen('test-results-detail', 'Test Details');
            
            // Set default list filter to show all
            filterDetailResults('all');
        }

        function filterDetailResults(filterType) {
            currentDetailFilter = filterType;
            
            // Sync toggle button active states
            document.querySelectorAll('.detail-toggle-btn').forEach(btn => btn.classList.remove('active'));
            
            if (filterType === 'correct') {
                document.getElementById('btn-toggle-corrette').classList.add('active');
            } else if (filterType === 'incorrect') {
                document.getElementById('btn-toggle-errori').classList.add('active');
            } else if (filterType === 'unanswered') {
                document.getElementById('btn-toggle-nondate').classList.add('active');
            } else {
                document.getElementById('btn-toggle-all').classList.add('active');
            }

            renderDetailResultsList();
        }

        function renderDetailResultsList() {
            const container = document.getElementById('detail-cards-list-container');
            container.innerHTML = '';

            let shownCount = 0;

            for (let i = 0; i < 30; i++) {
                const q = testQuestions[i];
                const userAnswer = testAnswers[i];
                const databaseIsVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                
                const isCorrect = (userAnswer === databaseIsVero);

                // Filter logic
                if (currentDetailFilter === 'correct' && (!isCorrect || userAnswer === null)) continue;
                if (currentDetailFilter === 'incorrect' && (isCorrect || userAnswer === null)) continue;
                if (currentDetailFilter === 'unanswered' && userAnswer !== null) continue;

                shownCount++;

                const card = document.createElement('div');
                card.className = `detail-q-card ${userAnswer === null ? 'incorrect' : (isCorrect ? 'correct' : 'incorrect')}`;
                
                card.innerHTML = `
                    <div class="detail-q-num">Domanda #${i + 1}</div>
                    <div class="detail-q-text-it">${q.italian}</div>
                    
                    <!-- Bangla Translation Overlay inside card -->
                    <div class="detail-q-text-bn" id="detail-q-bn-${i}" style="display: none;">${q.bangla}</div>

                    <!-- Mini Options toolbar inside card -->
                    <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center;">
                        
                        <!-- Mini Speaker Play Button -->
                        <button class="test-speaker-btn" onclick="readDetailQuestionSpeech(${i})" style="width: 38px; height: 38px; min-width:38px; border-width: 2px;">
                            <i class="fa-solid fa-volume-high" style="font-size:11px;"></i>
                        </button>

                        <button class="test-ctrl-btn" id="detail-play-btn-${i}" onclick="readDetailQuestionSpeech(${i})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;">
                            <i class="fa-solid fa-play"></i>
                        </button>

                        <!-- Progress Bar slider -->
                        <input type="range" class="test-slider" id="detail-audio-slider-${i}" min="0" max="100" value="0" style="flex: 1;" readonly>

                        <!-- Translate A-Z icon button -->
                        <button class="test-ctrl-btn" onclick="toggleDetailTranslation(${i})" style="width: 34px; height: 34px; min-width:34px; font-size: 12px; background-color: var(--bg-page); border: 1px solid var(--border-card); border-radius: 50%; cursor: pointer;" title="Translate">
                            <i class="fa-solid fa-language" style="color: var(--accent-green);"></i>
                        </button>

                        <!-- Static placeholders matching Screenshot -->
                        <button class="test-ctrl-btn" style="width:34px; height:34px; min-width:34px; font-size:12px; opacity:0.6; pointer-events:none;"><i class="fa-regular fa-bookmark"></i></button>
                        <button class="test-ctrl-btn" style="width:34px; height:34px; min-width:34px; font-size:12px; opacity:0.6; pointer-events:none;"><i class="fa-regular fa-note-sticky"></i></button>
                    </div>

                    <!-- Output Answer Verdict section -->
                    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-card); font-size: 13px; font-weight: 700; display: flex; flex-direction: column; gap: 4px;">
                        <div style="color: var(--text-primary);">Risposta Corretta: <span style="color:#4CAF50;">${databaseIsVero ? 'V' : 'F'}</span></div>
                        <div style="color: ${userAnswer === null ? '#ef4444' : (isCorrect ? '#4CAF50' : '#ef4444')};">
                            (TU) Hai risposto: ${userAnswer === null ? 'Non hai risposto' : (userAnswer ? 'V' : 'F')}
                        </div>
                    </div>
                `;
                container.appendChild(card);
            }

            if (shownCount === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-size: 13px;">Nessuna domanda in questo filtro</div>`;
            }
        }

        function toggleDetailTranslation(index) {
            const bnBox = document.getElementById(`detail-q-bn-${index}`);
            const isVisible = bnBox.style.display === 'block';
            bnBox.style.display = isVisible ? 'none' : 'block';
            
            // Speak if opening translation
            if (!isVisible) {
                readDetailQuestionSpeech(index);
            }
        }

        function readDetailQuestionSpeech(index) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                
                // If it was already playing this specific index, clicking again stops it
                if (playingDetailSpeechIndex === index) {
                    playingDetailSpeechIndex = null;
                    if (detailSpeechInterval) clearInterval(detailSpeechInterval);
                    document.getElementById(`detail-play-btn-${index}`).innerHTML = '<i class="fa-solid fa-play"></i>';
                    document.getElementById(`detail-audio-slider-${index}`).value = 0;
                    return;
                }

                // Reset old playing card buttons
                if (playingDetailSpeechIndex !== null) {
                    const oldBtn = document.getElementById(`detail-play-btn-${playingDetailSpeechIndex}`);
                    const oldSlider = document.getElementById(`detail-audio-slider-${playingDetailSpeechIndex}`);
                    if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                    if (oldSlider) oldSlider.value = 0;
                }

                playingDetailSpeechIndex = index;
                if (detailSpeechInterval) clearInterval(detailSpeechInterval);

                const q = testQuestions[index];
                const utterance = new SpeechSynthesisUtterance(q.italian);
                utterance.lang = 'it-IT';
                utterance.rate = testAudioSpeed;

                document.getElementById(`detail-play-btn-${index}`).innerHTML = '<i class="fa-solid fa-pause" style="color:var(--accent-red);"></i>';

                let slider = document.getElementById(`detail-audio-slider-${index}`);
                slider.value = 0;
                let stepCount = 0;
                let durationSteps = Math.max(15, Math.floor((q.italian.length / 3) / testAudioSpeed));

                detailSpeechInterval = setInterval(() => {
                    stepCount++;
                    let prg = Math.min(100, Math.floor((stepCount / durationSteps) * 100));
                    slider.value = prg;
                    if (prg >= 100) {
                        clearInterval(detailSpeechInterval);
                    }
                }, 200);

                utterance.onend = () => {
                    if (detailSpeechInterval) clearInterval(detailSpeechInterval);
                    slider.value = 100;
                    document.getElementById(`detail-play-btn-${index}`).innerHTML = '<i class="fa-solid fa-play"></i>';
                    playingDetailSpeechIndex = null;
                };

                utterance.onerror = () => {
                    if (detailSpeechInterval) clearInterval(detailSpeechInterval);
                    slider.value = 0;
                    document.getElementById(`detail-play-btn-${index}`).innerHTML = '<i class="fa-solid fa-play"></i>';
                    playingDetailSpeechIndex = null;
                };

                window.speechSynthesis.speak(utterance);
            }
        }
    </script>
</body>
</html>
