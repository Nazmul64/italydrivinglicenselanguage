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
                <div class="section-header">
                    <span class="section-title">কুইজ প্র্যাকটিস</span>
                    <span class="section-subtitle" id="quiz-progress-text">প্রশ্ন: ১/৩</span>
                </div>
                
                <div class="content-card quiz-box">
                    <div class="question-text" id="quiz-question-it">La carreggiata può essere a senso unico di circolazione.</div>
                    <div class="question-bangla" id="quiz-question-bn">ক্যারিজওয়ে (মূল রাস্তা) একমুখী চলাচলের জন্য হতে পারে।</div>
                    
                    <div class="answer-buttons">
                        <button class="ans-btn btn-vero" onclick="checkQuizAnswer(true)">
                            <i class="fa-solid fa-check"></i> VERO
                        </button>
                        <button class="ans-btn btn-falso" onclick="checkQuizAnswer(false)">
                            <i class="fa-solid fa-xmark"></i> FALSO
                        </button>
                    </div>

                    <div class="feedback-box" id="quiz-feedback">
                        সঠিক উত্তর!
                    </div>
                </div>

                <button class="action-btn" id="next-quiz-btn" style="display: none; background-color: var(--accent-green); color: white;" onclick="nextQuizQuestion()">
                    পরবর্তী প্রশ্ন <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <!-- SCREEN: Argomenti (Topics) -->
            <div id="screen-argomenti" class="screen">
                <div class="section-header">
                    <span class="section-title">অধ্যায়ভিত্তিক প্রস্তুতি</span>
                    <span class="section-subtitle">২৫টি অধ্যায়</span>
                </div>

                <div id="argomenti-list" style="display: flex; flex-direction: column; gap: 14px;">
                    <!-- Chapters rendered dynamically via JavaScript -->
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

        function renderArgomentiList() {
            const container = document.getElementById('argomenti-list');
            if (!container) return;
            container.innerHTML = '';

            const stats = JSON.parse(localStorage.getItem('chapter_progress') || '{}');

            chaptersList.forEach(ch => {
                const progress = stats[ch.id] || 0;
                const card = document.createElement('div');
                card.className = 'content-card';
                card.style.cursor = 'pointer';
                card.onclick = () => startChapterQuiz(ch.id, ch.name);
                
                let colorClass = '#3B82F6';
                if (ch.id % 3 === 0) colorClass = 'var(--accent-green)';
                else if (ch.id % 3 === 1) colorClass = 'var(--accent-red)';

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800;">
                            <span>${ch.id}. ${ch.name}</span>
                            <span style="color: ${colorClass};">${progress}% সম্পন্ন</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">${ch.bn}</div>
                        <div style="height: 6px; background-color: var(--border-card); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${progress}%; height: 100%; background-color: ${colorClass}; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
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

            if (screenId === 'argomenti') {
                renderArgomentiList();
            } else if (screenId === 'dizionario') {
                initDictionary();
            } else if (screenId === 'cartelli') {
                setSignCategory('pericolo');
            }
        }

        function navigateBack() {
            if (screenHistory.length > 1) {
                screenHistory.pop();
                const prevScreen = screenHistory[screenHistory.length - 1];
                
                let title = 'mbanglapatenteb';
                if (prevScreen === 'lezioni') title = 'Lezioni';
                else if (prevScreen === 'test') title = 'Test Practice';
                else if (prevScreen === 'argomenti') title = 'Argomenti';
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
    </script>
</body>
</html>
