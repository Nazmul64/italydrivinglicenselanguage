<!-- SCREEN: Dictionary (MCQ & General Vocabulary Search) -->
<div id="screen-dictionary" class="screen">
    <!-- Header Banner -->
    <div class="dictionary-header-banner" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 20px 16px 18px 16px; border-radius: 20px; margin-bottom: 16px; box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.35); position: relative; overflow: hidden;">
        <div style="position: absolute; right: -20px; bottom: -25px; opacity: 0.12; font-size: 130px; font-weight: 900; pointer-events: none;">
            <i class="fa-solid fa-book-bookmark"></i>
        </div>
        
        <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="background: rgba(255,255,255,0.22); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    <i class="fa-solid fa-spell-check" style="margin-right: 4px;"></i> MCQ Vocabulary Search
                </span>
            </div>
            
            <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.5px; color: #ffffff;">
                DIZIONARIO (অভিধান)
            </h2>
            <p style="font-size: 12.5px; margin: 0; opacity: 0.92; line-height: 1.4; color: #e0f2fe;">
                এমসিকিউ প্রশ্ন ও থিওরি অধ্যায়ের আন্ডারলাইন করা সকল শব্দের বাংলা অর্থ খুঁজুন
            </p>
        </div>
    </div>

    <!-- Search Box -->
    <div class="dictionary-search-container" style="margin-bottom: 14px; position: relative;">
        <div style="position: relative; display: flex; align-items: center;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; color: #0284c7; font-size: 16px; z-index: 2;"></i>
            <input type="text" 
                   id="mcq-dict-search-input" 
                   placeholder="ইতালীয় বা বাংলা শব্দ দিয়ে খুঁজুন (e.g. Carreggiata, রাস্তা)..." 
                   autocomplete="off"
                   style="width: 100%; height: 50px; padding: 0 44px 0 46px; border-radius: 14px; border: 2px solid var(--border-card, #e2e8f0); background: var(--bg-card, #ffffff); color: var(--text-primary, #1e293b); font-size: 14px; font-weight: 600; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <button id="mcq-dict-clear-btn" 
                    onclick="clearMcqDictSearch()" 
                    style="position: absolute; right: 12px; background: rgba(148, 163, 184, 0.2); border: none; width: 26px; height: 26px; border-radius: 50%; color: var(--text-secondary, #64748b); font-size: 12px; cursor: pointer; display: none; align-items: center; justify-content: center;"
                    title="Clear search">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    </div>

    <!-- A-Z Alphabet Filter Row -->
    <div class="dictionary-alphabet-row" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; scrollbar-width: none; -ms-overflow-style: none;">
        <button class="dict-alpha-btn" data-letter="" onclick="filterByAlphabet('')" style="flex-shrink: 0; padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; border: 1px solid var(--border-card, #e2e8f0); cursor: pointer; background: var(--bg-card, #ffffff); color: var(--text-primary, #1e293b); transition: all 0.15s ease;">
            রিসেট (Reset)
        </button>
        @foreach(range('A', 'Z') as $char)
            <button class="dict-alpha-btn" data-letter="{{ $char }}" onclick="filterByAlphabet('{{ $char }}')" style="flex-shrink: 0; width: 32px; height: 32px; border-radius: 10px; font-size: 12px; font-weight: 700; border: 1px solid var(--border-card, #e2e8f0); cursor: pointer; background: var(--bg-card, #ffffff); color: var(--text-primary, #1e293b); transition: all 0.15s ease;">
                {{ $char }}
            </button>
        @endforeach
    </div>

    <!-- Results Status Info -->
    <div id="dictionary-results-status" style="display: none; align-items: center; justify-content: space-between; margin-bottom: 12px; font-size: 12.5px; color: var(--text-secondary, #64748b); font-weight: 600; padding: 0 4px;">
        <span id="dictionary-results-count-text"></span>
        <span id="dictionary-filter-tag" style="background: rgba(2, 132, 199, 0.1); color: #0284c7; padding: 2px 8px; border-radius: 6px; font-size: 11px; display: none;"></span>
    </div>

    <!-- Initial Search Guide State -->
    <div id="dictionary-initial-state" style="text-align: center; padding: 45px 20px; background: var(--bg-card, #ffffff); border: 1px solid var(--border-card, #e2e8f0); border-radius: 20px; margin-top: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
        <div style="width: 65px; height: 65px; border-radius: 50%; background: rgba(2, 132, 199, 0.1); color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px auto;">
            <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary, #1e293b); margin: 0 0 6px 0;">
            শব্দার্থ অনুসন্ধান করুন
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary, #64748b); max-width: 320px; margin: 0 auto; line-height: 1.5;">
            উপরে সার্চ বক্সে যেকোনো শব্দ টাইপ করুন অথবা A-Z অক্ষরের বোতামে চাপ দিন।
        </p>
    </div>

    <!-- Loading Spinner -->
    <div id="dictionary-loading-spinner" style="text-align: center; padding: 40px 20px; display: none;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 32px; color: #0284c7; margin-bottom: 12px;"></i>
        <div style="font-size: 13px; color: var(--text-secondary, #64748b); font-weight: 600;">শব্দকোষ অনুসন্ধান করা হচ্ছে...</div>
    </div>

    <!-- Results List Container -->
    <div id="dictionary-results-list" style="display: flex; flex-direction: column; gap: 12px;">
        <!-- Dynamically Rendered Word Cards -->
    </div>

    <!-- Empty / Not Found State -->
    <div id="dictionary-not-found" style="display: none; text-align: center; padding: 45px 20px; background: var(--bg-card, #ffffff); border: 2px dashed var(--border-card, #e2e8f0); border-radius: 20px; margin-top: 10px;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 16px auto;">
            <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary, #1e293b); margin: 0 0 6px 0;">
            শব্দটি পাওয়া যায়নি (Not Found)
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary, #64748b); max-width: 320px; margin: 0 auto 16px auto; line-height: 1.5;">
            আপনার অনুসন্ধানকৃত শব্দটি প্রশ্নভান্ডারে নেই। সঠিক বানান চেক করুন অথবা অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।
        </p>
        <button onclick="clearMcqDictSearch()" style="background: #0284c7; color: #fff; border: none; padding: 8px 18px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-rotate-left" style="margin-right: 6px;"></i> রিসেট করুন
        </button>
    </div>
</div>

<!-- Dictionary Image Zoom Modal -->
<div id="dict-image-zoom-modal" style="display: none; position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px);">
    <div style="position: relative; max-width: 500px; width: 100%; background: var(--bg-card, #ffffff); border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border-card, #e2e8f0);">
            <div id="dict-zoom-word-title" style="font-size: 16px; font-weight: 800; color: var(--text-primary, #1e293b); text-transform: uppercase;"></div>
            <button onclick="closeDictImageZoom()" style="background: rgba(148, 163, 184, 0.2); border: none; width: 30px; height: 30px; border-radius: 50%; color: var(--text-secondary, #64748b); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div style="padding: 16px; text-align: center;">
            <img id="dict-zoom-img-el" src="" alt="Vocabulary illustration" style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 12px;">
        </div>
    </div>
</div>
