@extends('admin.layouts.app')

@section('content')
    <!-- PANEL 1: Default Dashboard -->
    <div id="panel-dashboard" class="crud-panel active">
        <div class="welcome-header">
            <h2 class="welcome-title">Welcome Alex 👋</h2>
            <p class="welcome-subtitle">Here's what's happening with your store today.</p>
        </div>

        <!-- Statistics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <!-- Chapters -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Chapters</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-chapters">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(255, 152, 0, 0.12); display: flex; align-items: center; justify-content: center; color: var(--accent-orange);">
                    <i class="fa-solid fa-book" style="font-size: 22px;"></i>
                </div>
            </div>
            <!-- Pages -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Pages</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-pages">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(76, 175, 80, 0.12); display: flex; align-items: center; justify-content: center; color: var(--accent-green);">
                    <i class="fa-solid fa-file-lines" style="font-size: 22px;"></i>
                </div>
            </div>
            <!-- Questions -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Questions</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-questions">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(33, 150, 243, 0.12); display: flex; align-items: center; justify-content: center; color: var(--accent-blue);">
                    <i class="fa-solid fa-circle-question" style="font-size: 22px;"></i>
                </div>
            </div>
            <!-- Videos -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Videos</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-videos">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(233, 30, 99, 0.12); display: flex; align-items: center; justify-content: center; color: #E91E63;">
                    <i class="fa-solid fa-video" style="font-size: 22px;"></i>
                </div>
            </div>
            <!-- Live Sessions -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Live Sessions</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-live-sessions">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(156, 39, 176, 0.12); display: flex; align-items: center; justify-content: center; color: #9C27B0;">
                    <i class="fa-solid fa-tower-broadcast" style="font-size: 22px;"></i>
                </div>
            </div>
            <!-- Sliders -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Sliders</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-sliders">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(0, 150, 136, 0.12); display: flex; align-items: center; justify-content: center; color: #009688;">
                    <i class="fa-solid fa-images" style="font-size: 22px;"></i>
                </div>
            </div>
            <!-- Users -->
            <div class="card" style="padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Users</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-users">0</div>
                </div>
                <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(0, 188, 212, 0.12); display: flex; align-items: center; justify-content: center; color: #00BCD4;">
                    <i class="fa-solid fa-users" style="font-size: 22px;"></i>
                </div>
            </div>
        </div>

    </div>

    <!-- PANEL 2: MCQ Questions Management CRUD -->
    <div id="panel-mcq-questions" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">MCQ Database Manager</h2>
            <p class="welcome-subtitle">Search, edit, delete and add questions in the Patente B database pool.</p>
        </div>

        <div class="crud-top-bar">
            <div class="crud-filters" style="display: flex; gap: 10px;">
                <select class="form-select" id="filter-chapter" onchange="onFilterChapterChange(this.value)">
                    <option value="">সকল অধ্যায় (All Chapters)</option>
                </select>
                <select class="form-select" id="filter-page" onchange="fetchQuestions()" style="display: none; min-width: 180px;">
                    <option value="">সকল পেজ (All Pages)</option>
                </select>
                <input type="text" class="form-input" id="search-question" placeholder="ইতালীয় বা বাংলা প্রশ্ন দিয়ে খুঁজুন..." oninput="fetchQuestions()">
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-danger" id="btn-bulk-delete-questions" onclick="bulkDeleteItems('questions')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                    <i class="fa-solid fa-trash-can"></i> Delete Selected
                </button>
                <button class="btn btn-primary" onclick="openAddQuestionModal()">
                    <i class="fa-solid fa-plus"></i> Add Question
                </button>
            </div>
        </div>

        <div id="bulk-select-all-banner-questions" style="display: none; background: var(--bg-content); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
            All <span id="bulk-select-page-count-questions" style="font-weight: bold; color: var(--accent-orange);">0</span> questions on this page are selected. 
            <a href="#" onclick="selectAllAcrossPages('questions'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Select all <span id="bulk-select-total-count-questions">0</span> questions in MCQ Database Manager</a>
        </div>
        <div id="bulk-select-all-banner-active-questions" style="display: none; background: var(--bg-content); border: 1px solid var(--accent-orange); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
            All <span id="bulk-select-total-active-count-questions" style="font-weight: bold; color: var(--accent-orange);">0</span> questions in MCQ Database Manager are selected. 
            <a href="#" onclick="clearAllSelection('questions'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Clear selection</a>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-questions" onchange="toggleSelectAll('questions', this.checked)"></th>
                        <th style="width: 70px; text-align: center;">Serial</th>
                        <th style="width: 70px; text-align: center;">Chapter</th>
                        <th style="width: 120px;">Page / Subchapter</th>
                        <th>Italian Statement</th>
                        <th>Bangla Meaning</th>
                        <th style="width: 90px; text-align: center;">Answer</th>
                        <th style="width: 110px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody id="questions-table-body">
                </tbody>
            </table>
        </div>

        <div class="pagination-container">
            <span class="pagination-info" id="pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-prev-page" onclick="prevPage()"><i class="fa-solid fa-chevron-left"></i> Previous</button>
                <button class="btn btn-secondary btn-sm" id="btn-next-page" onclick="nextPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 3: MCQ Chapters Management CRUD -->
    <div id="panel-mcq-chapters" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">Chapters & Pages Settings</h2>
            <p class="welcome-subtitle">Manage chapter names, uploaded thumbnails, chapter pages, voiceovers and question mappings.</p>
        </div>

        <!-- Tab switches for Chapters and Pages -->
        <div class="admin-tabs" style="display: flex; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <button class="btn" id="tab-btn-chapters" onclick="switchAdminSubTab('chapters')" style="background-color: var(--accent-orange); color: white; font-weight: 800; border-radius: 8px; font-size: 13px;">Chapters</button>
            <button class="btn btn-secondary" id="tab-btn-pages" onclick="switchAdminSubTab('pages')" style="font-weight: bold; border-radius: 8px; font-size: 13px;">Pages</button>
        </div>

         <!-- Sub Panel 1: Chapters -->
        <div id="admin-sub-panel-chapters">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="text" class="form-control" id="chapter-search" placeholder="Search chapter..." oninput="fetchChaptersAdmin()" style="width: 200px; height: 38px;">
                    <select class="form-control" id="chapter-per-page" onchange="fetchChaptersAdmin()" style="width: 80px; height: 38px;">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-chapters" onclick="bulkDeleteItems('chapters')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddChapterModal()">
                        <i class="fa-solid fa-plus"></i> Add New Chapter
                    </button>
                </div>
            </div>

            <!-- Bulk Selection Across Pages Banners -->
            <div id="bulk-select-all-banner-chapters" style="display: none; background: var(--bg-content); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
                All <span id="bulk-select-page-count-chapters" style="font-weight: bold; color: var(--accent-orange);">0</span> chapters on this page are selected. 
                <a href="#" onclick="selectAllAcrossPages('chapters'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Select all <span id="bulk-select-total-count-chapters">0</span> chapters matching this search</a>
            </div>
            <div id="bulk-select-all-banner-active-chapters" style="display: none; background: var(--bg-content); border: 1px solid var(--accent-orange); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
                All <span id="bulk-select-total-active-count-chapters" style="font-weight: bold; color: var(--accent-orange);">0</span> chapters matching this search are selected. 
                <a href="#" onclick="clearAllSelection('chapters'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Clear selection</a>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-chapters" onchange="toggleSelectAll('chapters', this.checked)"></th>
                            <th style="width: 80px;">ID</th>
                            <th style="width: 140px; text-align: center;">CHAPTER NUMBER</th>
                            <th style="width: 100px; text-align: center;">Thumbnail</th>
                            <th>Chapter Name (Italian)</th>
                            <th>Chapter Name (Bangla)</th>
                            <th style="width: 120px; text-align: center;">Total MCQ</th>
                            <th style="width: 100px; text-align: center;">Status</th>
                            <th style="width: 220px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-chapters-table-body">
                        <!-- Chapter rows injected dynamically -->
                    </tbody>
                </table>
            </div>

            <!-- Chapter Pagination -->
            <div class="pagination-container" id="chapter-pagination-row">
                <span class="pagination-info" id="chapter-pagination-status">Showing 0 of 0 entries</span>
                <div class="pagination-buttons">
                    <button class="btn btn-secondary btn-sm" id="btn-chapter-prev" onclick="prevChapterPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                    <button class="btn btn-secondary btn-sm" id="btn-chapter-next" onclick="nextChapterPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        </div>

         <!-- Sub Panel 2: Pages -->
        <div id="admin-sub-panel-pages" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <label style="font-weight: bold; font-size: 13px; color: var(--text-primary);">Chapter:</label>
                    <select class="form-control" id="admin-page-chapter-select" onchange="loadAdminPagesForSelectedChapter(this.value)" style="width: 220px; background-color: var(--bg-card); color: var(--text-primary); border-color: var(--border-color);">
                        <!-- Chapters list dynamically populated -->
                    </select>
                    <input type="text" class="form-control" id="page-search" placeholder="Search page..." oninput="loadAdminPagesForSelectedChapter(document.getElementById('admin-page-chapter-select').value)" style="width: 180px; height: 38px;">
                    <select class="form-control" id="page-per-page" onchange="loadAdminPagesForSelectedChapter(document.getElementById('admin-page-chapter-select').value)" style="width: 70px; height: 38px;">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-pages" onclick="bulkDeleteItems('pages')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddPageModal()">
                        <i class="fa-solid fa-plus"></i> Add New Page
                    </button>
                </div>
            </div>

            <!-- Bulk Selection Across Pages Banners -->
            <div id="bulk-select-all-banner-pages" style="display: none; background: var(--bg-content); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
                All <span id="bulk-select-page-count-pages" style="font-weight: bold; color: var(--accent-orange);">0</span> pages on this page are selected. 
                <a href="#" onclick="selectAllAcrossPages('pages'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Select all <span id="bulk-select-total-count-pages">0</span> pages in this chapter</a>
            </div>
            <div id="bulk-select-all-banner-active-pages" style="display: none; background: var(--bg-content); border: 1px solid var(--accent-orange); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
                All <span id="bulk-select-total-active-count-pages" style="font-weight: bold; color: var(--accent-orange);">0</span> pages in this chapter are selected. 
                <a href="#" onclick="clearAllSelection('pages'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Clear selection</a>
            </div>

            <!-- List of pages -->
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-pages" onchange="toggleSelectAll('pages', this.checked)"></th>
                            <th style="width: 60px;">ID</th>
                            <th style="width: 110px; text-align: center;">PAGE NUMBER</th>
                            <th>Page Title (Italian)</th>
                            <th>Page Title (Bangla)</th>
                            <th style="width: 100px; text-align: center;">Media</th>
                            <th style="width: 100px; text-align: center;">Voiceover</th>
                            <th style="width: 100px; text-align: center;">PDF</th>
                            <th style="width: 100px; text-align: center;">Questions</th>
                            <th style="width: 100px; text-align: center;">Status</th>
                            <th style="width: 180px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-pages-table-body">
                        <!-- Pages dynamically injected -->
                    </tbody>
                </table>
            </div>

            <!-- Page Pagination -->
            <div class="pagination-container" id="page-pagination-row">
                <span class="pagination-info" id="page-pagination-status">Showing 0 of 0 entries</span>
                <div class="pagination-buttons">
                    <button class="btn btn-secondary btn-sm" id="btn-page-prev" onclick="prevPageTab()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                    <button class="btn btn-secondary btn-sm" id="btn-page-next" onclick="nextPageTab()">Next <i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    </div>

    <!-- PANEL 4: Admin Chat Room Panel -->
    <div id="panel-chat-room" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Live Chat Room</h2>
                    <p class="welcome-subtitle">Chat with online customers and help them learn driving theory.</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button type="button" class="btn btn-secondary" onclick="openAdminChatSettings()" title="License Key & Response Presets">
                        <i class="fa-solid fa-gear"></i> Settings / Presets
                    </button>
                    <button type="button" class="btn btn-primary" onclick="openChatPresetManagerModal()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fa-solid fa-sliders"></i> Manage Response Buttons (বাটন ম্যানেজার)
                    </button>
                </div>
            </div>
        </div>

        
        <div class="chat-room-container">
            <!-- Sidebar list of conversations -->
            <div class="chat-sidebar">
                <div class="chat-sidebar-header">Conversations</div>
                <div class="chat-conversation-list" id="admin-chat-list">
                    <!-- Injected dynamically via JS -->
                </div>
            </div>
            
            <!-- Main messaging viewport -->
            <div class="chat-main-area" id="admin-chat-main-area" style="display: none;">
                <div class="chat-main-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="conversation-avatar" id="active-chat-avatar">GU</div>
                        <div style="font-weight: bold; font-size: 13px;" id="active-chat-name">Guest User</div>
                    </div>
                    <button type="button" onclick="openAdminChatSettings()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-gear"></i></button>
                </div>
                
                <div class="chat-messages-container" id="admin-chat-messages">
                    <!-- Dynamic messages history list -->
                </div>
                
                <div class="chat-input-container">
                    <input type="file" id="admin-chat-image-input" accept="image/*" style="display: none;" onchange="handleAdminImageSelected(this)">
                    <button type="button" onclick="document.getElementById('admin-chat-image-input').click()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 0 8px;" title="Attach Image">
                        <i class="fa-solid fa-paperclip"></i>
                    </button>
                    <input type="text" id="admin-chat-input" placeholder="আপনার উত্তর লিখুন..." onkeydown="if(event.key === 'Enter') sendAdminChatMessage()">
                    <button class="chat-send-btn" onclick="sendAdminChatMessage()">Send <i class="fa-solid fa-paper-plane" style="margin-left: 6px;"></i></button>
                </div>

            </div>
            
            <!-- Fallback placeholder if no chat selected -->
            <div class="chat-main-area" id="admin-chat-fallback" style="flex: 1; align-items: center; justify-content: center; color: var(--text-secondary); gap: 10px;">
                <i class="fa-regular fa-comments" style="font-size: 48px; color: var(--border-color);"></i>
                <span style="font-size: 13px;">বামদিকের তালিকা থেকে চ্যাট নির্বাচন করুন</span>
            </div>
        </div>
    </div>

    <!-- Chat settings modal (macros) -->
    <div class="modal-overlay" id="admin-chat-settings-modal" style="display: none; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99999;">
        <div class="modal-content" style="padding: 24px; border-radius: 20px; width: 90%; max-width: 380px; background: var(--bg-card); border: 1px solid var(--border-color); max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <h4 style="font-size: 14px; font-weight: 800; margin: 0; color: var(--text-primary);">Utente: IMPOSTAZIONI</h4>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button type="button" class="btn btn-sm btn-primary" onclick="openChatPresetManagerModal()" style="font-size: 11px; padding: 3px 8px; font-weight: bold;"><i class="fa-solid fa-gear"></i> Manage</button>
                    <button onclick="closeAdminChatSettings()" style="background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-secondary);"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;" id="admin-macro-buttons-container">
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('tutti_messaggi')" style="text-align: left; padding: 10px 16px;">Tutti i messaggi</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('progresso')" style="text-align: left; padding: 10px 16px;">Progresso</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('invia_licenza')" style="text-align: left; padding: 10px 16px;">Invia licenza</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('ottieni_licenze')" style="text-align: left; padding: 10px 16px;">Ottieni licenze</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('invia_licenza_trail')" style="text-align: left; padding: 10px 16px;">Invia licenza Trail</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('send_31')" style="text-align: left; padding: 10px 16px; background-color: #f59e0b; color: white; border: none;">Send 31 days</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('send_92')" style="text-align: left; padding: 10px 16px;">Send 92 days</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('send_184')" style="text-align: left; padding: 10px 16px;">Send 184 days</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('send_365')" style="text-align: left; padding: 10px 16px; background-color: #10b981; color: white; border: none;">Send 365 days</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('valuta_nostra_app')" style="text-align: left; padding: 10px 16px;">Valuta nostra app</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('whatsapp')" style="text-align: left; padding: 10px 16px;">Whatsapp</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('audio')" style="text-align: left; padding: 10px 16px;">Audio</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('user_passed')" style="text-align: left; padding: 10px 16px;">User Passed</button>
                <button class="btn btn-secondary btn-block text-start" onclick="executeChatMacro('lezioni_video')" style="text-align: left; padding: 10px 16px;">Lezioni Video</button>
            </div>
        </div>
    </div>

    <!-- PANEL 5: Admin Categories CRUD -->
    <div id="panel-categories" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Categories Settings</h2>
                    <p class="welcome-subtitle">Manage driving categories, descriptions, and details.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-categories" onclick="bulkDeleteItems('categories')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddCategoryModal()">
                        <i class="fa-solid fa-plus"></i> Add Category
                    </button>
                </div>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-categories" onchange="toggleSelectAll('categories', this.checked)"></th>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 250px;">Category Name</th>
                        <th>Description</th>
                        <th style="width: 150px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="categories-table-body">
                    <!-- Categories injected dynamically -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- PANEL 5.5: Admin Dictionary CRUD (Dizionario) -->
    <div id="panel-dizionario" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Manage Dictionary (Dizionario)</h2>
                    <p class="welcome-subtitle">Create and configure dictionary terms with translation, definition, and audio/video files.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-dizionario" onclick="bulkDeleteDizionarioWords()" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddDizionarioModal()">
                        <i class="fa-solid fa-plus"></i> Add Dictionary Word
                    </button>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="form-control" id="dizionario-search-input" placeholder="Search dictionary terms..." oninput="fetchDizionario()" style="width: 250px; height: 38px;">
                <select class="form-control" id="dizionario-per-page" onchange="fetchDizionario()" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-dizionario" onchange="toggleSelectAll('dizionario', this.checked)"></th>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 150px;">Word (IT)</th>
                        <th style="width: 180px;">Translation (BN)</th>
                        <th>Definition / Description</th>
                        <th style="width: 150px; text-align: center;">Media</th>
                        <th style="width: 180px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="dizionario-table-body">
                    <tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">Loading dictionary...</td></tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="dizionario-pagination-row">
            <span class="pagination-info" id="dizionario-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-dizionario-prev" onclick="prevDizionarioPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-dizionario-next" onclick="nextDizionarioPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 5.6: Admin Manuale CRUD (Theory Guidebook) -->
    <div id="panel-manuale" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Manage Manuale (ম্যানুয়াল থিওরি)</h2>
                    <p class="welcome-subtitle">Create and configure theory guidebook topics with text, images, and underlined terms.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="openAddManualeModal()">
                        <i class="fa-solid fa-plus"></i> Add Theory Topic
                    </button>
                </div>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 120px;">Chapter #</th>
                        <th style="width: 250px;">Title</th>
                        <th>Content / Theory</th>
                        <th style="width: 120px; text-align: center;">Image</th>
                        <th style="width: 100px; text-align: center;">Status</th>
                        <th style="width: 160px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="manuale-table-body">
                    <tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">Loading theory topics...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- PANEL 6: Admin Exam Sheets CRUD (Scheduler) -->
    <div id="panel-mcq-exams" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Scheda Esame Scheduler</h2>
                    <p class="welcome-subtitle">Schedule exams for candidates, reset or delete existing ones.</p>
                </div>
                <button class="btn btn-primary" onclick="openAddExamModal()">
                    <i class="fa-solid fa-plus"></i> Add Scheduled Exam
                </button>
            </div>
        </div>

        <!-- Search Scheduled Exams -->
        <div style="margin-bottom: 20px; max-width: 350px; position: relative;">
            <input type="text" class="form-control" id="admin-exam-search-input" oninput="loadAdminExamsList()" placeholder="Search candidates or center..." style="padding-left: 36px;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 13px;"></i>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Student / Candidate Name</th>
                        <th>Motorizzazione Center</th>
                        <th style="width: 150px;">Exam Date</th>
                        <th style="width: 120px; text-align: center;">Status</th>
                        <th style="width: 160px; text-align: center;">Scores (C/W/U)</th>
                        <th style="width: 120px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="admin-exams-table-body">
                    <!-- Scheduled exams injected dynamically -->
                </tbody>
            </table>
        </div>
    </div>
    <!-- PANEL 7: Admin Sliders CRUD -->
    <!-- PANEL 7: Banner Sliders CRUD -->
    <div id="panel-sliders" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Banner Sliders Settings</h2>
                    <p class="welcome-subtitle">Manage homepage image carousel slides.</p>
                </div>
                <button class="btn btn-primary" onclick="openAddSliderModal()">
                    <i class="fa-solid fa-plus"></i> Add Slider
                </button>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="form-control" id="sliders-search" placeholder="Search slider..." oninput="fetchSliders()" style="width: 200px; height: 38px;">
                <select class="form-control" id="sliders-per-page" onchange="fetchSliders()" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 120px; text-align: center;">IMAGE</th>
                        <th>LINK URL</th>
                        <th style="width: 180px; text-align: right;">ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="sliders-table-body">
                    <!-- Sliders injected dynamically -->
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="sliders-pagination-row">
            <span class="pagination-info" id="sliders-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-sliders-prev" onclick="prevSlidersPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-sliders-next" onclick="nextSlidersPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 7.5: Admin Popup Promo Settings CRUD -->
    <div id="panel-popup-promo" class="crud-panel">
        <div class="welcome-header">
            <div>
                <h2 class="welcome-title">Popup Promo Settings</h2>
                <p class="welcome-subtitle">Configure the promotional advertisement popup that users see when opening the app/website.</p>
            </div>
        </div>

        <div class="card" style="padding: 24px; max-width: 600px; margin-top: 20px;">
            <form id="popup-promo-form" enctype="multipart/form-data">
                <div style="margin-bottom: 20px;">
                    <label class="form-label" style="display: block; font-weight: bold; margin-bottom: 8px;">Popup Status</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="popup-promo-active" name="is_active" style="width: 20px; height: 20px; cursor: pointer;">
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Enable Promotional Popup</span>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label class="form-label" for="popup-promo-image" style="display: block; font-weight: bold; margin-bottom: 8px;">Promotional Image (Banner)</label>
                    <input type="file" class="form-control" id="popup-promo-image" name="image" accept="image/*" style="padding: 8px;">
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">Recommended size: 800x1200 or vertical aspect ratio. Supported formats: JPG, PNG, WEBP.</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <label class="form-label" for="popup-promo-link" style="display: block; font-weight: bold; margin-bottom: 8px;">Action Redirect Link (Check this URL)</label>
                    <input type="text" class="form-control" id="popup-promo-link" name="link_url" placeholder="https://example.com/packages" style="padding: 10px;">
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">The destination URL when the user clicks the "Check this" button on the popup.</p>
                </div>

                <div style="margin-bottom: 20px; display: none;" id="popup-promo-preview-container">
                    <label class="form-label" style="display: block; font-weight: bold; margin-bottom: 8px;">Current Active Image</label>
                    <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; max-width: 250px; background-color: var(--bg-page);">
                        <img id="popup-promo-preview-img" src="" alt="Popup Promo Banner" style="width: 100%; height: auto; display: block;">
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <i class="fa-solid fa-save"></i> Save Settings
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- PANEL 8: Admin Home Cards CRUD -->
    <div id="panel-home-cards" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Home Navigation Cards</h2>
                    <p class="welcome-subtitle">Manage homepage service card icons, titles, screen mappings and colors.</p>
                </div>
                <button class="btn btn-primary" onclick="openAddHomeCardModal()">
                    <i class="fa-solid fa-plus"></i> Add Home Card
                </button>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="form-control" id="home-cards-search" placeholder="Search cards..." oninput="fetchHomeCards()" style="width: 200px; height: 38px;">
                <select class="form-control" id="home-cards-per-page" onchange="fetchHomeCards()" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 80px; text-align: center;">Order</th>
                        <th style="width: 100px; text-align: center;">Icon</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Target/Link</th>
                        <th style="width: 90px; text-align: center;">Color</th>
                        <th style="width: 100px; text-align: center;">Status</th>
                        <th style="width: 180px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="home-cards-table-body">
                    <!-- Home Cards injected dynamically -->
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="home-cards-pagination-row">
            <span class="pagination-info" id="home-cards-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-home-cards-prev" onclick="prevHomeCardsPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-home-cards-next" onclick="nextHomeCardsPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- ======================================================== -->
    <!-- 1. CARTELLI CATEGORIES PANEL                             -->
    <!-- ======================================================== -->
    <div id="panel-cartelli-categories" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title"><i class="fa-solid fa-list-ul" style="color: #fbbf24;"></i> অধ্যায় (Category)</h2>
                    <p class="welcome-subtitle">রোড সাইন অধ্যায় (Category) সমূহ পরিচালনা করুন।</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-cartello-categories" onclick="bulkDeleteItems('cartello-categories')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddCartelloCatModal()">
                        <i class="fa-solid fa-plus"></i> নতুন ক্যাটাগরি তৈরি করুন
                    </button>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="form-control" id="cartello-cat-search" placeholder="ক্যাটাগরি খুঁজুন..." oninput="fetchCartelloCategories()" style="width: 250px; height: 38px;">
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-cartello-categories" onchange="toggleSelectAll('cartello-categories', this.checked)"></th>
                        <th style="width: 80px;">ID</th>
                        <th>ক্যাটাগরি নাম (Italian & বাংলা)</th>
                        <th style="width: 150px;">মোট চ্যাপ্টার</th>
                        <th style="width: 150px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="cartello-cats-tbody">
                    <tr><td colspan="4" style="text-align:center;color:var(--text-secondary);">লোড হচ্ছে...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. CARTELLI CHAPTERS & PAGES PANEL                       -->
    <!-- ======================================================== -->
    <div id="panel-cartelli-chapters" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">Chapters & Pages Settings (Cartelli)</h2>
            <p class="welcome-subtitle">Manage Cartelli chapter names, uploaded thumbnails, chapter pages, voiceovers and question mappings.</p>
        </div>

        <!-- Tab switches for Chapters and Pages -->
        <div class="admin-tabs" style="display: flex; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <button class="btn" id="cartello-tab-btn-chapters" onclick="switchCartelloAdminSubTab('chapters')" style="background-color: var(--accent-orange); color: white; font-weight: 800; border-radius: 8px; font-size: 13px;">Chapters</button>
            <button class="btn btn-secondary" id="cartello-tab-btn-pages" onclick="switchCartelloAdminSubTab('pages')" style="font-weight: bold; border-radius: 8px; font-size: 13px;">Pages</button>
        </div>

        <!-- Sub Panel 1: Chapters -->
        <div id="cartello-sub-panel-chapters">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <input type="text" class="form-control" id="cartello-chapter-search" placeholder="Search chapter..." oninput="fetchCartelloChapters()" style="width: 280px; height: 38px;">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-cartello-chapters" onclick="bulkDeleteItems('cartello-chapters')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddCartelloChapterModal()">
                        <i class="fa-solid fa-plus"></i> Add New Chapter
                    </button>
                </div>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-cartello-chapters" onchange="toggleSelectAll('cartello-chapters', this.checked)"></th>
                            <th style="width: 80px;">ID</th>
                            <th style="width: 140px;">CHAPTER NUMBER</th>
                            <th>CHAPTER NAME (ITALIAN)</th>
                            <th>CHAPTER NAME (BANGLA)</th>
                            <th style="width: 150px; text-align: right;">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody id="cartello-chapters-tbody">
                        <tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">লোড হচ্ছে...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Sub Panel 2: Pages -->
        <div id="cartello-sub-panel-pages" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <select class="form-control" id="filter-page-chapter-id" onchange="fetchCartelloPages()" style="width: 220px; height: 38px;">
                        <option value="">সব চ্যাপ্টার</option>
                    </select>
                    <input type="text" class="form-control" id="cartello-page-search" placeholder="Search page..." oninput="fetchCartelloPages()" style="width: 220px; height: 38px;">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-cartello-pages" onclick="bulkDeleteItems('cartello-pages')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddCartelloPageModal()">
                        <i class="fa-solid fa-plus"></i> Add New Page
                    </button>
                </div>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-cartello-pages" onchange="toggleSelectAll('cartello-pages', this.checked)"></th>
                            <th style="width: 80px;">ID</th>
                            <th style="width: 120px;">PAGE NUMBER</th>
                            <th>PAGE TITLE (ITALIAN)</th>
                            <th>PAGE TITLE (BANGLA)</th>
                            <th style="width: 100px; text-align: center;">MEDIA</th>
                            <th style="width: 150px; text-align: right;">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody id="cartello-pages-tbody">
                        <tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">লোড হচ্ছে...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 4. CARTELLI MCQS PANEL -->
    <div id="panel-cartelli-mcqs" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title"><i class="fa-solid fa-circle-question" style="color: #f472b6;"></i> Cartelli MCQs (বহুনির্বাচনী প্রশ্ন)</h2>
                    <p class="welcome-subtitle">অধ্যায়, চ্যাপ্টার এবং পেজ নির্ধারণ করে Cartelli MCQ প্রশ্ন ও উত্তরসমূহ পরিচালনা করুন।</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-danger" id="btn-bulk-delete-cartello-mcqs" onclick="bulkDeleteItems('cartello-mcqs')" style="display: none; background-color: var(--accent-red); color: white; border: none; font-weight: bold; border-radius: 8px; font-size: 13px; padding: 0 16px;">
                        <i class="fa-solid fa-trash-can"></i> Delete Selected
                    </button>
                    <button class="btn btn-primary" onclick="openAddCartelloMcqModal()">
                        <i class="fa-solid fa-plus"></i> নতুন Cartelli MCQ তৈরি করুন
                    </button>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
            <select class="form-control" id="filter-mcq-category-id" onchange="handleCategoryChange('filter-mcq-category-id', 'filter-mcq-chapter-id'); fetchCartelloMcqs(1);" style="width: 180px; height: 38px;">
                <option value="">সব ক্যাটাগরি</option>
            </select>
            <select class="form-control" id="filter-mcq-chapter-id" onchange="handleChapterChange('filter-mcq-chapter-id', 'filter-mcq-page-id'); fetchCartelloMcqs(1);" style="width: 180px; height: 38px;">
                <option value="">সব চ্যাপ্টার</option>
            </select>
            <select class="form-control" id="filter-mcq-page-id" onchange="fetchCartelloMcqs(1)" style="width: 180px; height: 38px;">
                <option value="">সব পেজ</option>
            </select>
            <input type="text" class="form-control" id="cartello-mcq-search" placeholder="প্রশ্ন খুঁজুন..." oninput="fetchCartelloMcqs(1)" style="width: 200px; height: 38px;">
        </div>

        <div id="bulk-select-all-banner-cartello-mcqs" style="display: none; background: var(--bg-content); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
            All <span id="bulk-select-page-count-cartello-mcqs" style="font-weight: bold; color: var(--accent-orange);">0</span> MCQs on this page are selected. 
            <a href="#" onclick="selectAllAcrossPages('cartello-mcqs'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Select all <span id="bulk-select-total-count-cartello-mcqs">0</span> MCQs matching this filter</a>
        </div>
        <div id="bulk-select-all-banner-active-cartello-mcqs" style="display: none; background: var(--bg-content); border: 1px solid var(--accent-orange); padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-primary);">
            All <span id="bulk-select-total-active-count-cartello-mcqs" style="font-weight: bold; color: var(--accent-orange);">0</span> MCQs matching this filter are selected. 
            <a href="#" onclick="clearAllSelection('cartello-mcqs'); return false;" style="color: var(--accent-blue); font-weight: bold; text-decoration: underline; margin-left: 8px;">Clear selection</a>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;"><input type="checkbox" id="bulk-select-cartello-mcqs" onchange="toggleSelectAll('cartello-mcqs', this.checked)"></th>
                        <th style="width: 140px;">MCQ সিরিয়াল নাম্বার</th>
                        <th style="width: 180px;">ক্যাটাগরি / চ্যাপ্টার (পেজ নং)</th>
                        <th>প্রশ্ন (Italian & বাংলা অর্থ)</th>
                        <th style="width: 100px; text-align: center;">সঠিক উত্তর</th>
                        <th style="width: 100px;">স্ট্যাটাস</th>
                        <th style="width: 110px;">তৈরি হয়েছে</th>
                        <th style="width: 150px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="cartello-mcqs-tbody">
                    <tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">লোড হচ্ছে...</td></tr>
                </tbody>
            </table>
        </div>
        <div id="cartello-mcq-pagination" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:20px;"></div>
    </div>

    <!-- PANEL 9: Admin Lecture Videos CRUD -->
    <div id="panel-classes" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Lecture Videos Settings</h2>
                    <p class="welcome-subtitle">Manage homepage video lectures.</p>
                </div>
                <button class="btn btn-primary" onclick="openAddClassModal()">
                    <i class="fa-solid fa-plus"></i> Add Video
                </button>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="form-control" id="classes-search" placeholder="Search videos..." oninput="fetchLectureClasses()" style="width: 200px; height: 38px;">
                <select class="form-control" id="classes-per-page" onchange="fetchLectureClasses()" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>YouTube Video Stream URL</th>
                        <th style="width: 180px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="classes-table-body">
                    <!-- Lecture classes injected dynamically -->
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="classes-pagination-row">
            <span class="pagination-info" id="classes-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-classes-prev" onclick="prevClassesPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-classes-next" onclick="nextClassesPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 10: Admin Live Sessions CRUD -->
    <div id="panel-live-classes" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Live Sessions Settings</h2>
                    <p class="welcome-subtitle">Schedule, update, and manage E-Class live lectures and meeting rooms.</p>
                </div>
                <button class="btn btn-primary" onclick="openAddLiveClassModal()">
                    <i class="fa-solid fa-plus"></i> Add Live Session
                </button>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" class="form-control" id="live-classes-search" placeholder="Search sessions..." oninput="fetchLiveClasses()" style="width: 200px; height: 38px;">
                <select class="form-control" id="live-classes-per-page" onchange="fetchLiveClasses()" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Live Title</th>
                        <th>Speaker</th>
                        <th style="width: 180px;">Scheduled Date/Time</th>
                        <th>Meeting Rooms</th>
                        <th style="width: 100px; text-align: center;">Status</th>
                        <th style="width: 180px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="live-classes-table-body">
                    <!-- Live classes injected dynamically -->
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="live-classes-pagination-row">
            <span class="pagination-info" id="live-classes-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-live-classes-prev" onclick="prevLiveClassesPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-live-classes-next" onclick="nextLiveClassesPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 11: Admin File Manager CRUD -->
    <div id="panel-file-manager" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">File Manager & Media Library</h2>
            <p class="welcome-subtitle">Upload, optimize and manage media assets (images, PDFs, audio voiceovers, MP4 videos).</p>
        </div>

        <!-- Drag & Drop Upload Zone -->
        <div id="media-dropzone" class="card" style="border: 2px dashed var(--border-color); text-align: center; padding: 40px 20px; margin-bottom: 24px; cursor: pointer; background: var(--bg-card); transition: border-color 0.2s;" ondragover="event.preventDefault(); this.style.borderColor='var(--accent-teal)';" ondragleave="this.style.borderColor='var(--border-color)';" ondrop="handleMediaDrop(event)">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 40px; color: var(--text-secondary); opacity: 0.6; margin-bottom: 12px;"></i>
            <h4 style="font-size: 15px; font-weight: bold; margin-bottom: 4px;">Drag & Drop files here to upload</h4>
            <p style="font-size: 12px; color: var(--text-secondary);">or click to browse from your computer (Max: 50MB)</p>
            <input type="file" id="media-browse-input" style="display: none;" onchange="handleMediaBrowse(event)" multiple>
            
            <!-- Progress Bar -->
            <div id="upload-progress-container" style="display: none; width: 100%; max-width: 400px; margin: 20px auto 0 auto;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                    <span id="upload-filename" style="color: var(--text-primary); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">Uploading...</span>
                    <span id="upload-percentage" style="color: var(--accent-teal); font-weight: bold;">0%</span>
                </div>
                <div style="width: 100%; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden;">
                    <div id="upload-progress-bar" style="width: 0%; height: 100%; background-color: var(--accent-teal); transition: width 0.1s;"></div>
                </div>
            </div>
        </div>

        <!-- Control Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <input type="text" class="form-control" id="media-search" placeholder="Search files..." oninput="fetchMediaFiles()" style="width: 200px; height: 38px;">
                <select class="form-control" id="media-filter-type" onchange="fetchMediaFiles()" style="width: 120px; height: 38px;">
                    <option value="">All Types</option>
                    <option value="image">Images</option>
                    <option value="pdf">PDFs</option>
                    <option value="audio">Audios</option>
                    <option value="video">Videos</option>
                </select>
                <select class="form-control" id="media-per-page" onchange="fetchMediaFiles()" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <button class="btn btn-secondary" onclick="document.getElementById('media-browse-input').click()"><i class="fa-solid fa-upload"></i> Browse Upload</button>
        </div>

        <!-- File Table -->
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 100px; text-align: center;">Preview</th>
                        <th>Filename</th>
                        <th style="width: 100px; text-align: center;">Type</th>
                        <th style="width: 120px;">Size</th>
                        <th style="width: 180px;">Uploaded At</th>
                        <th style="width: 200px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="media-table-body">
                    <!-- Files injected dynamically -->
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" id="media-pagination-row">
            <span class="pagination-info" id="media-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-media-prev" onclick="prevMediaPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-media-next" onclick="nextMediaPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 12: Admin System Error Logs -->
    <div id="panel-sys-errors" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">System Error Logs</h2>
                    <p class="welcome-subtitle">Audit database exception logs, sql errors, and browser user agents.</p>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <input type="text" class="form-control" id="sys-errors-search" placeholder="Search reference, file, message..." oninput="fetchSystemErrors(1)" style="width: 250px; height: 38px;">
                <select class="form-control" id="sys-errors-per-page" onchange="fetchSystemErrors(1)" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 160px;">Reference ID</th>
                        <th>Exception & Message</th>
                        <th>File (Line)</th>
                        <th style="width: 80px; text-align: center;">HTTP</th>
                        <th style="width: 150px;">Logged At</th>
                        <th style="width: 160px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="sys-errors-table-body">
                    <!-- Logs injected dynamically -->
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="sys-errors-pagination-row">
            <span class="pagination-info" id="sys-errors-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-sys-errors-prev" onclick="prevSysErrorsPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-sys-errors-next" onclick="nextSysErrorsPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 13: System Health Monitor Dashboard -->
    <div id="panel-sys-health" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">System Health & Audits</h2>
                    <p class="welcome-subtitle">Run automated audits, clear application cache storage, and test SMTP connections.</p>
                </div>
                <button class="btn btn-primary" onclick="runDiagnosticsAudit()">
                    <i class="fa-solid fa-square-poll-vertical"></i> Run System Diagnostics
                </button>
            </div>
        </div>

        <!-- Audit checklist alerts grid -->
        <div class="dashboard-grid" style="margin-bottom: 24px;">
            <div class="card" style="padding: 20px;">
                <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-database" style="color: var(--accent-teal);"></i> Database Health</h3>
                <div id="db-health-check-card" style="font-size: 13px;">
                    Loading status...
                </div>
            </div>
            
            <div class="card" style="padding: 20px;">
                <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-microchip" style="color: var(--accent-orange);"></i> Server & Processes</h3>
                <div style="font-size: 13px; line-height: 1.8;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Queue connection:</span>
                        <code id="sys-health-queue-connection" style="font-weight: bold;">Loading...</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Pending queue jobs:</span>
                        <span id="sys-health-queue-pending" class="badge" style="background-color: var(--accent-orange); color: white;">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Scheduler Status:</span>
                        <span class="badge" style="background-color: var(--accent-teal); color: white;">Active</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Scheduler timezone:</span>
                        <span style="font-weight: 500;" id="sys-health-scheduler-tz">UTC</span>
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="fetchQueueStatus()" style="padding: 4px 8px; font-size: 11px;">Refresh Queue</button>
                        <button class="btn btn-primary btn-sm" onclick="retryFailedQueueJobs()" style="padding: 4px 8px; font-size: 11px;">Retry Failed</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="dashboard-grid" style="margin-bottom: 24px;">
            <!-- Cache Management Console -->
            <div class="card" style="padding: 20px;">
                <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-broom" style="color: var(--accent-blue);"></i> Cache Manager</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                    <button class="btn btn-secondary btn-sm" onclick="clearSystemCache('config')" style="padding: 10px; font-size: 11px; text-align: center;">Config Clear</button>
                    <button class="btn btn-secondary btn-sm" onclick="clearSystemCache('route')" style="padding: 10px; font-size: 11px; text-align: center;">Route Clear</button>
                    <button class="btn btn-secondary btn-sm" onclick="clearSystemCache('view')" style="padding: 10px; font-size: 11px; text-align: center;">View Clear</button>
                    <button class="btn btn-secondary btn-sm" onclick="clearSystemCache('app')" style="padding: 10px; font-size: 11px; text-align: center;">App Cache Clear</button>
                    <button class="btn btn-primary btn-sm" onclick="clearSystemCache('optimize')" style="grid-column: span 2; padding: 10px; font-size: 11px; text-align: center;">Optimize Clear</button>
                </div>
            </div>

            <!-- Mail Configuration Tester -->
            <div class="card" style="padding: 20px;">
                <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-envelope" style="color: var(--accent-orange);"></i> SMTP Connection Monitor</h3>
                <div style="font-size: 13px;">
                    <p style="margin: 0 0 12px 0; color: var(--text-secondary);">Test outbound mail connection settings instantly by entering a recipient address.</p>
                    <div style="display: flex; gap: 8px;">
                        <input type="email" id="test-smtp-email" class="form-control" placeholder="recipient@example.com" style="height: 38px; font-size: 13px;">
                        <button class="btn btn-primary" onclick="sendTestSMTPMail()" style="height: 38px;"><i class="fa-solid fa-paper-plane"></i> Send Test</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Audit Checker results -->
        <div id="diagnostics-audit-results-card" class="card" style="padding: 20px; display: none; margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-list-check" style="color: var(--accent-teal);"></i> System Audit Checklist</h3>
            <div id="diagnostics-audit-checklist-body" style="font-size: 13px;"></div>
        </div>
    </div>

    <!-- PANEL 14: API Monitor & Performance Logs -->
    <div id="panel-sys-api" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">API Monitor & Request Logs</h2>
            <p class="welcome-subtitle">Track outbound response times, status code parameters, and REST API performance.</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <input type="text" class="form-control" id="sys-api-search" placeholder="Search API url or status..." oninput="fetchApiLogs(1)" style="width: 250px; height: 38px;">
                <select class="form-control" id="sys-api-per-page" onchange="fetchApiLogs(1)" style="width: 80px; height: 38px;">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 80px;">Method</th>
                        <th>API URL Path</th>
                        <th style="width: 100px; text-align: center;">Status Code</th>
                        <th style="width: 150px;">Latency (Time)</th>
                        <th style="width: 180px;">Request Date</th>
                        <th style="width: 120px; text-align: right;">Payloads</th>
                    </tr>
                </thead>
                <tbody id="sys-api-table-body">
                    <!-- API logs injected dynamically -->
                </tbody>
            </table>
        </div>

        <div class="pagination-container" id="sys-api-pagination-row">
            <span class="pagination-info" id="sys-api-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-sys-api-prev" onclick="prevSysApiPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-sys-api-next" onclick="nextSysApiPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 15: storage/logs/laravel.log File Viewer -->
    <div id="panel-sys-logs" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Log File Viewer</h2>
                    <p class="welcome-subtitle">Examine raw log file entries from <code>storage/logs/laravel.log</code> directly in real-time.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <a href="/admin/api/system/logs/download" class="btn btn-secondary" target="_blank">
                        <i class="fa-solid fa-download"></i> Download log file
                    </a>
                    <button class="btn btn-danger" onclick="deleteLaravelLogs()">
                        <i class="fa-solid fa-trash-can"></i> Delete Old Logs
                    </button>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <input type="text" class="form-control" id="sys-logs-search" placeholder="Search log text..." oninput="fetchLaravelLogEntries(1)" style="width: 250px; height: 38px;">
                <select class="form-control" id="sys-logs-filter-level" onchange="fetchLaravelLogEntries(1)" style="width: 140px; height: 38px;">
                    <option value="">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="NOTICE">NOTICE</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                    <option value="CRITICAL">CRITICAL</option>
                </select>
                <select class="form-control" id="sys-logs-per-page" onchange="fetchLaravelLogEntries(1)" style="width: 80px; height: 38px;">
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </select>
            </div>
        </div>

        <!-- Raw Log Content Output Console -->
        <div class="card" style="padding: 0; background-color: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #334155; height: 500px; display: flex; flex-direction: column;">
            <div style="background-color: #1e293b; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; font-family: monospace; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">
                <span>storage/logs/laravel.log</span>
                <span id="sys-logs-count-info">0 records loaded</span>
            </div>
            <div id="sys-logs-console-body" style="padding: 15px; font-family: monospace; font-size: 12px; line-height: 1.6; color: #e2e8f0; overflow-y: auto; flex-grow: 1; white-space: pre-wrap;">
                <!-- Logs rendered here -->
            </div>
        </div>

        <div class="pagination-container" id="sys-logs-pagination-row" style="margin-top: 15px;">
            <span class="pagination-info" id="sys-logs-pagination-status">Showing 0 of 0 entries</span>
            <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-sys-logs-prev" onclick="prevSysLogsPage()"><i class="fa-solid fa-chevron-left"></i> Prev</button>
                <button class="btn btn-secondary btn-sm" id="btn-sys-logs-next" onclick="nextSysLogsPage()">Next <i class="fa-solid fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- PANEL 16: Environment Checker & Security scanning -->
    <div id="panel-sys-env" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">Environment & Security Parameters</h2>
            <p class="welcome-subtitle">Examine secure variables, PHP ini upload parameters, and public symlinks.</p>
        </div>

        <div class="dashboard-grid" style="margin-bottom: 24px;">
            <!-- Env check list -->
            <div class="card" style="padding: 20px;">
                <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-sliders" style="color: var(--accent-orange);"></i> Environment Variables</h3>
                <div style="font-size: 13px; line-height: 2;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                        <span>APP_ENV:</span>
                        <code style="font-weight: bold;">{{ config('app.env') }}</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                        <span>APP_DEBUG:</span>
                        <span class="badge" style="background-color: {{ config('app.debug') ? 'var(--accent-red)' : 'var(--accent-teal)' }}; color: white;">
                            {{ config('app.debug') ? 'TRUE (Warning)' : 'FALSE (Secure)' }}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                        <span>APP_URL:</span>
                        <code>{{ config('app.url') }}</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                        <span>CACHE_STORE:</span>
                        <code>{{ config('cache.default') }}</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
                        <span>SESSION_DRIVER:</span>
                        <code>{{ config('session.driver') }}</code>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>FILESYSTEM_DISK:</span>
                        <code>{{ config('filesystems.default') }}</code>
                    </div>
                </div>
            </div>

            <!-- Server & PHP parameters -->
            <div class="card" style="padding: 20px;">
                <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-gears" style="color: var(--accent-teal);"></i> Server Information</h3>
                <div id="sys-env-server-info-body" style="font-size: 13px; line-height: 2;">
                    <!-- Injected dynamically -->
                    Loading server stats...
                </div>
            </div>
        </div>

        <!-- Security Checker Panel -->
        <div class="card" style="padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-shield-halved" style="color: var(--accent-teal);"></i> Security Checklist</h3>
            <div id="sys-env-security-checklist-body" style="font-size: 13px;">
                Loading security checks...
            </div>
        </div>
    </div>

    <!-- PANEL 17: Backup & Diagnostics Manager -->
    <div id="panel-sys-backups" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Backups & Diagnostics Archive</h2>
                    <p class="welcome-subtitle">Generate system SQL database backups, bundle media uploads, or download diagnostics package.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <a href="/admin/api/system/diagnostics/download" class="btn btn-primary" target="_blank">
                        <i class="fa-solid fa-file-zipper"></i> Generate Diagnostics Package (.zip)
                    </a>
                </div>
            </div>
        </div>

        <!-- Actions card -->
        <div class="card" style="padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-screwdriver-wrench" style="color: var(--accent-orange);"></i> Backup Control Center</h3>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="createBackupArchive('db')">
                    <i class="fa-solid fa-database"></i> Create Database SQL Backup
                </button>
                <button class="btn btn-secondary" onclick="createBackupArchive('files')">
                    <i class="fa-solid fa-folder-open"></i> Create Uploaded Files ZIP Backup
                </button>
                <button class="btn btn-primary" onclick="fetchBackupArchives()">
                    <i class="fa-solid fa-arrow-rotate-right"></i> Refresh List
                </button>
            </div>
        </div>

        <!-- Backups list -->
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th style="width: 150px; text-align: center;">Backup Type</th>
                        <th style="width: 120px;">Archive Size</th>
                        <th style="width: 180px;">Created Date</th>
                        <th style="width: 250px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="sys-backups-table-body">
                    <!-- Backups list injected dynamically -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- PANEL 14: General Settings Manager -->
    <div id="panel-general-settings" class="crud-panel">
        <div class="welcome-header">
            <div>
                <h2 class="welcome-title">General Settings Manager</h2>
                <p class="welcome-subtitle">Configure application title, brand logo, and favicon.</p>
            </div>
        </div>

        <div class="card" style="padding: 24px; width: 100%;">
            <form id="general-settings-form" onsubmit="saveGeneralSettingsForm(event)">
                @csrf
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">Application Name</label>
                    <input type="text" id="settings-app-name" name="app_name" class="form-control" style="width: 100%;" required>
                    <span style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">This title is used as the browser tab title and default application brand name.</span>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);"><i class="fa-solid fa-clock" style="color: var(--accent-blue); margin-right: 6px;"></i> MCQ / Exam Time (in Minutes / সময় মিনিটে)</label>
                    <input type="number" id="settings-exam-time" name="exam_time_minutes" class="form-control" style="width: 100%;" min="1" max="300" placeholder="20" required>
                    <span style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">পরীক্ষার জন্য সময় (মিনিটে) নির্ধারণ করুন। MCQ ও Exam Simulation স্ক্রিনে এই টাইমার গণনা করা হবে। (ডিফল্ট: 20 মিনিট)</span>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);"><i class="fa-solid fa-key" style="color: var(--accent-green); margin-right: 6px;"></i> License Key Auto-Message (লাইসেন্স মেসেজ)</label>
                    <textarea id="settings-license-message" name="license_message" class="form-control" style="width: 100%; min-height: 90px; resize: vertical;" placeholder="লাইসেন্স পাঠানোর সময় যে মেসেজ যাবে সেটি এখানে লিখুন..."></textarea>
                    <span style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">লাইসেন্স কি পাঠানোর পর ইউজারকে automatically এই মেসেজটি পাঠানো হবে। ফাঁকা রাখলে ডিফল্ট মেসেজ যাবে।</span>
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">Application Logo</label>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div id="settings-logo-preview-container" style="width: 80px; height: 80px; border-radius: 12px; border: 1.5px solid var(--border-card); display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
                            <img id="settings-logo-preview" src="" style="max-width: 100%; max-height: 100%; object-fit: contain; display: none;">
                            <span id="settings-logo-placeholder" style="font-size: 12px; color: var(--text-secondary);">No Logo</span>
                        </div>
                        <div style="flex: 1;">
                            <input type="file" id="settings-app-logo" name="app_logo" accept="image/*" class="form-control" style="width: 100%;">
                            <span style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">Select a brand logo image file (JPEG, PNG, SVG, WebP).</span>
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 24px;">
                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">Browser Favicon</label>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div id="settings-favicon-preview-container" style="width: 48px; height: 48px; border-radius: 8px; border: 1.5px solid var(--border-card); display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
                            <img id="settings-favicon-preview" src="" style="width: 32px; height: 32px; object-fit: contain; display: none;">
                            <span id="settings-favicon-placeholder" style="font-size: 10px; color: var(--text-secondary);">No Icon</span>
                        </div>
                        <div style="flex: 1;">
                            <input type="file" id="settings-favicon" name="favicon" accept="image/*" class="form-control" style="width: 100%;">
                            <span style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">Select a favicon image file (ICO, PNG, WebP, etc.).</span>
                        </div>
                    </div>
                </div>

                <hr style="margin: 24px 0; border-color: var(--border-color);">

                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-table-cells-large" style="color: var(--accent-teal);"></i>
                    <span>Dynamic Frontend Layout & Cards Configuration (ডাইনামিক গ্রিড লেআউট)</span>
                </h4>

                <!-- Row 1: Home Screen Grid Columns (Desktop, Tablet, Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Desktop Columns (এক সারিতে কয়টি)
                        </label>
                        <select id="settings-home-desktop-columns" name="home_desktop_columns" class="form-control">
                            <option value="2">2 Columns (২ কলাম)</option>
                            <option value="3">3 Columns (৩ কলাম)</option>
                            <option value="4" selected>4 Columns (৪ কলাম)</option>
                            <option value="5">5 Columns (৫ কলাম)</option>
                            <option value="6">6 Columns (৬ কলাম)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Tablet Columns (ট্যাবলেট)
                        </label>
                        <select id="settings-home-tablet-columns" name="home_tablet_columns" class="form-control">
                            <option value="2">2 Columns (২ কলাম)</option>
                            <option value="3" selected>3 Columns (৩ কলাম)</option>
                            <option value="4">4 Columns (৪ কলাম)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Mobile Columns (মোবাইল)
                        </label>
                        <select id="settings-home-mobile-columns" name="home_mobile_columns" class="form-control">
                            <option value="1">1 Column (১ কলাম)</option>
                            <option value="2" selected>2 Columns (২ কলাম)</option>
                        </select>
                    </div>
                </div>

                <!-- Row 2: Card Dimensions & Gap -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Card Width (উইডথ e.g. 100% or 280px)
                        </label>
                        <input type="text" id="settings-home-card-width" name="home_card_width" class="form-control" placeholder="e.g. 100% or 280px" value="100%">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Card Height (হাইট e.g. auto or 350px)
                        </label>
                        <input type="text" id="settings-home-card-height" name="home_card_height" class="form-control" placeholder="e.g. auto or 350px" value="auto">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Card Gap (গ্যাপ px)
                        </label>
                        <input type="number" id="settings-home-card-gap" name="home_card_gap" class="form-control" min="0" max="100" placeholder="24" value="24">
                    </div>
                </div>

                <!-- Row 3: Schede / Chapter Grid Columns -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Scegli Scheda Desktop Columns
                        </label>
                        <select id="settings-schede-desktop-columns" name="schede_desktop_columns" class="form-control">
                            <option value="1">1 Column (১ কলাম)</option>
                            <option value="2" selected>2 Columns (২ কলাম)</option>
                            <option value="3">3 Columns (৩ কলাম)</option>
                            <option value="4">4 Columns (৪ কলাম)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Scegli Scheda Mobile Columns
                        </label>
                        <select id="settings-schede-mobile-columns" name="schede_mobile_columns" class="form-control">
                            <option value="1" selected>1 Column (১ কলাম)</option>
                            <option value="2">2 Columns (২ কলাম)</option>
                        </select>
                    </div>
                </div>

                <hr style="margin: 24px 0; border-color: var(--border-color);">

                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-icons" style="color: #0284c7;"></i>
                    <span>Icon & Text Size Customization (আইকন ও টেক্সট সাইজ)</span>
                </h4>

                <!-- Icon Sizes (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Desktop Icon Box Size (ডেসকটপ আইকন সাইজ px)
                        </label>
                        <input type="number" id="settings-icon-size-desktop" name="icon_size_desktop" class="form-control" min="30" max="250" placeholder="90" value="90">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Mobile Icon Box Size (মোবাইল আইকন সাইজ px)
                        </label>
                        <input type="number" id="settings-icon-size-mobile" name="icon_size_mobile" class="form-control" min="20" max="200" placeholder="60" value="60">
                    </div>
                </div>

                <!-- Font Sizes (Desktop Title vs Mobile Title) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Desktop Title Font Size (ডেসকটপ টাইটেল ফন্ট px)
                        </label>
                        <input type="number" id="settings-title-font-size-desktop" name="title_font_size_desktop" class="form-control" min="10" max="40" placeholder="16" value="16">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Mobile Title Font Size (মোবাইল টাইটেল ফন্ট px)
                        </label>
                        <input type="number" id="settings-title-font-size-mobile" name="title_font_size_mobile" class="form-control" min="8" max="30" placeholder="14" value="14">
                    </div>
                </div>

                <!-- Subtitle Font Sizes (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Desktop Subtitle Font Size (ডেসকটপ সাবটাইটেল px)
                        </label>
                        <input type="number" id="settings-subtitle-font-size-desktop" name="subtitle_font_size_desktop" class="form-control" min="8" max="30" placeholder="12" value="12">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Mobile Subtitle Font Size (মোবাইল সাবটাইটেল px)
                        </label>
                        <input type="number" id="settings-subtitle-font-size-mobile" name="subtitle_font_size_mobile" class="form-control" min="6" max="25" placeholder="11" value="11">
                    </div>
                </div>

                <hr style="margin: 24px 0; border-color: var(--border-color);">

                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-map-location-dot" style="color: var(--accent-orange);"></i>
                    <span>Cartelli & Scegli Scheda Module Settings (কার্তেল্লি ও চ্যাপ্টার/পেজ মডিউল সেটিং)</span>
                </h4>

                <!-- Chapter Title Font Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Title Font Size Desktop (চ্যাপ্টার ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-cartelli-chapter-title-font-desktop" name="cartelli_chapter_title_font_desktop" class="form-control" min="10" max="40" placeholder="16" value="16">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Title Font Size Mobile (চ্যাপ্টার মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-cartelli-chapter-title-font-mobile" name="cartelli_chapter_title_font_mobile" class="form-control" min="8" max="30" placeholder="14" value="14">
                    </div>
                </div>

                <!-- Chapter Image Height & Width (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Height Desktop (চ্যাপ্টার ইমেজ ডেসকটপ হাইট px)
                        </label>
                        <input type="number" id="settings-cartelli-chapter-image-size-desktop" name="cartelli_chapter_image_size_desktop" class="form-control" min="40" max="300" placeholder="120" value="120">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Height Mobile (চ্যাপ্টার ইমেজ মোবাইল হাইট px)
                        </label>
                        <input type="number" id="settings-cartelli-chapter-image-size-mobile" name="cartelli_chapter_image_size_mobile" class="form-control" min="30" max="200" placeholder="80" value="80">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Width Desktop (চ্যাপ্টার ইমেজ ডেসকটপ উইডথ px / %)
                        </label>
                        <input type="text" id="settings-cartelli-chapter-image-width-desktop" name="cartelli_chapter_image_width_desktop" class="form-control" placeholder="e.g. 100% or 150" value="">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Width Mobile (চ্যাপ্টার ইমেজ মোবাইল উইডথ px / %)
                        </label>
                        <input type="text" id="settings-cartelli-chapter-image-width-mobile" name="cartelli_chapter_image_width_mobile" class="form-control" placeholder="e.g. 90% or 100" value="">
                    </div>
                </div>

                <!-- Page Title Font Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Title Font Size Desktop (পেজ ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-cartelli-page-title-font-desktop" name="cartelli_page_title_font_desktop" class="form-control" min="10" max="40" placeholder="15" value="15">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Title Font Size Mobile (পেজ মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-cartelli-page-title-font-mobile" name="cartelli_page_title_font_mobile" class="form-control" min="8" max="30" placeholder="13" value="13">
                    </div>
                </div>

                <!-- Page Card Image Height & Width (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Height Desktop (পেজ ইমেজ ডেসকটপ হাইট px)
                        </label>
                        <input type="number" id="settings-cartelli-page-image-size-desktop" name="cartelli_page_image_size_desktop" class="form-control" min="40" max="300" placeholder="120" value="120">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Height Mobile (পেজ ইমেজ মোবাইল হাইট px)
                        </label>
                        <input type="number" id="settings-cartelli-page-image-size-mobile" name="cartelli_page_image_size_mobile" class="form-control" min="30" max="200" placeholder="80" value="80">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Width Desktop (পেজ ইমেজ ডেসকটপ উইডথ px / %)
                        </label>
                        <input type="text" id="settings-cartelli-page-image-width-desktop" name="cartelli_page_image_width_desktop" class="form-control" placeholder="e.g. 100% or 160" value="">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Width Mobile (পেজ ইমেজ মোবাইল উইডথ px / %)
                        </label>
                        <input type="text" id="settings-cartelli-page-image-width-mobile" name="cartelli_page_image_width_mobile" class="form-control" placeholder="e.g. 90% or 110" value="">
                    </div>
                </div>

                <hr style="margin: 24px 0; border-color: var(--border-color);">

                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-layer-group" style="color: var(--accent-blue);"></i>
                    <span>Argomenti Module Settings (আর্গোমেন্তি মডিউল সেটিং)</span>
                </h4>

                <!-- Argomenti Chapter Title Font Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Title Font Size Desktop (চ্যাপ্টার ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-chapter-title-font-desktop" name="argomenti_chapter_title_font_desktop" class="form-control" min="10" max="40" placeholder="16" value="16">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Title Font Size Mobile (চ্যাপ্টার মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-chapter-title-font-mobile" name="argomenti_chapter_title_font_mobile" class="form-control" min="8" max="30" placeholder="14" value="14">
                    </div>
                </div>

                <!-- Argomenti Chapter Title Font Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Title Font Size Desktop (চ্যাপ্টার ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-chapter-title-font-desktop" name="argomenti_chapter_title_font_desktop" class="form-control" min="10" max="50" placeholder="16" value="16">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Title Font Size Mobile (চ্যাপ্টার মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-chapter-title-font-mobile" name="argomenti_chapter_title_font_mobile" class="form-control" min="8" max="40" placeholder="14" value="14">
                    </div>
                </div>

                <!-- Cartelli Chapter Title Font Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Cartelli Chapter Title Font Size Desktop (চ্যাপ্টার ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-cartelli-chapter-title-font-desktop" name="cartelli_chapter_title_font_desktop" class="form-control" min="10" max="50" placeholder="16" value="16">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Cartelli Chapter Title Font Size Mobile (চ্যাপ্টার মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-cartelli-chapter-title-font-mobile" name="cartelli_chapter_title_font_mobile" class="form-control" min="8" max="40" placeholder="14" value="14">
                    </div>
                </div>

                <!-- Cartelli Chapter Image Height & Width (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Height Desktop (চ্যাপ্টার ইমেজ ডেসকটপ হাইট px)
                        </label>
                        <input type="number" id="settings-argomenti-chapter-image-size-desktop" name="argomenti_chapter_image_size_desktop" class="form-control" min="40" max="300" placeholder="120" value="120">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Height Mobile (চ্যাপ্টার ইমেজ মোবাইল হাইট px)
                        </label>
                        <input type="number" id="settings-argomenti-chapter-image-size-mobile" name="argomenti_chapter_image_size_mobile" class="form-control" min="30" max="200" placeholder="80" value="80">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Width Desktop (চ্যাপ্টার ইমেজ ডেসকটপ উইডথ px / %)
                        </label>
                        <input type="text" id="settings-argomenti-chapter-image-width-desktop" name="argomenti_chapter_image_width_desktop" class="form-control" placeholder="e.g. 100% or 150" value="">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Chapter Card Image Width Mobile (চ্যাপ্টার ইমেজ মোবাইল উইডথ px / %)
                        </label>
                        <input type="text" id="settings-argomenti-chapter-image-width-mobile" name="argomenti_chapter_image_width_mobile" class="form-control" placeholder="e.g. 90% or 100" value="">
                    </div>
                </div>

                <!-- Argomenti Page Title Font Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Title Font Size Desktop (পেজ ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-page-title-font-desktop" name="argomenti_page_title_font_desktop" class="form-control" min="10" max="40" placeholder="15" value="15">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Title Font Size Mobile (পেজ মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-page-title-font-mobile" name="argomenti_page_title_font_mobile" class="form-control" min="8" max="30" placeholder="13" value="13">
                    </div>
                </div>

                <!-- Argomenti Page Image Height & Width (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Height Desktop (পেজ ইমেজ ডেসকটপ হাইট px)
                        </label>
                        <input type="number" id="settings-argomenti-page-image-size-desktop" name="argomenti_page_image_size_desktop" class="form-control" min="40" max="300" placeholder="120" value="120">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Height Mobile (পেজ ইমেজ মোবাইল হাইট px)
                        </label>
                        <input type="number" id="settings-argomenti-page-image-size-mobile" name="argomenti_page_image_size_mobile" class="form-control" min="30" max="200" placeholder="80" value="80">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Width Desktop (পেজ ইমেজ ডেসকটপ উইডথ px / %)
                        </label>
                        <input type="text" id="settings-argomenti-page-image-width-desktop" name="argomenti_page_image_width_desktop" class="form-control" placeholder="e.g. 100% or 160" value="">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Page Card Image Width Mobile (পেজ ইমেজ মোবাইল উইডথ px / %)
                        </label>
                        <input type="text" id="settings-argomenti-page-image-width-mobile" name="argomenti_page_image_width_mobile" class="form-control" placeholder="e.g. 90% or 110" value="">
                    </div>
                </div>

                <!-- Argomenti Question Text Font Size & Image Size (Desktop vs Mobile) -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-font" style="color: var(--accent-green);"></i> Question Text Font Size Desktop (প্রশ্ন ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-question-text-font-desktop" name="argomenti_question_text_font_desktop" class="form-control" min="10" max="50" placeholder="18" value="18">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-font" style="color: var(--accent-green);"></i> Question Text Font Size Mobile (প্রশ্ন মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-argomenti-question-text-font-mobile" name="argomenti_question_text_font_mobile" class="form-control" min="8" max="40" placeholder="16" value="16">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-image" style="color: var(--accent-blue);"></i> Question Left Image Size Desktop (প্রশ্ন ডেসকটপ ইমেজ সাইজ px)
                        </label>
                        <input type="number" id="settings-argomenti-question-image-size-desktop" name="argomenti_question_image_size_desktop" class="form-control" min="30" max="300" placeholder="110" value="110">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-image" style="color: var(--accent-blue);"></i> Question Left Image Size Mobile (প্রশ্ন মোবাইল ইমেজ সাইজ px)
                        </label>
                        <input type="number" id="settings-argomenti-question-image-size-mobile" name="argomenti_question_image_size_mobile" class="form-control" min="20" max="200" placeholder="85" value="85">
                    </div>
                </div>

                <!-- MCQ Number & Schede Stats Font Sizes -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-list-ol" style="color: var(--accent-blue);"></i> MCQ Serial Number Font Desktop (এমসিকিউ নম্বর ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-mcq-number-font-desktop" name="mcq_number_font_desktop" class="form-control" min="10" max="40" placeholder="16" value="16">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-list-ol" style="color: var(--accent-blue);"></i> MCQ Serial Number Font Mobile (এমসিকিউ নম্বর মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-mcq-number-font-mobile" name="mcq_number_font_mobile" class="form-control" min="8" max="30" placeholder="14" value="14">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-chart-simple" style="color: var(--accent-green);"></i> Schede Stats Font Size Desktop (কার্ডের স্ট্যাটাস টেক্সট ডেসকটপ ফন্ট px)
                        </label>
                        <input type="number" id="settings-schede-stat-font-desktop" name="schede_stat_font_desktop" class="form-control" min="8" max="30" placeholder="13" value="13">
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            <i class="fa-solid fa-chart-simple" style="color: var(--accent-green);"></i> Schede Stats Font Size Mobile (কার্ডের স্ট্যাটাস টেক্সট মোবাইল ফন্ট px)
                        </label>
                        <input type="number" id="settings-schede-stat-font-mobile" name="schede_stat_font_mobile" class="form-control" min="6" max="25" placeholder="11" value="11">
                    </div>
                </div>

                <hr style="margin: 24px 0; border-color: var(--border-color);">

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                    <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-palette" style="color: #9333ea;"></i>
                        <span>Theme & Neumorphism Color Customization (থিম কালার কাস্টমাইজেশন)</span>
                    </h4>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="resetDefaultThemeColors()" style="background-color: var(--bg-body); border: 1px solid var(--border-color); font-weight: bold;">
                        <i class="fa-solid fa-rotate-left" style="color: var(--accent-orange);"></i> Reset to Default (আগের কালারে ফিরিয়ে আনুন)
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Card Background Color (কার্ডের ব্যাকগ্রাউন্ড কালার)
                        </label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="color" id="settings-primary-color-picker" value="#F4F7FA" onchange="document.getElementById('settings-primary-color').value = this.value" style="width: 42px; height: 38px; border: none; border-radius: 8px; cursor: pointer; padding: 2px;">
                            <input type="text" id="settings-primary-color" name="primary_color" class="form-control" value="#F4F7FA" placeholder="#F4F7FA" onchange="document.getElementById('settings-primary-color-picker').value = this.value">
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Accent Brand Color (অ্যাক্সেন্ট কালার)
                        </label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="color" id="settings-accent-color-picker" value="#4CAF50" onchange="document.getElementById('settings-accent-color').value = this.value" style="width: 42px; height: 38px; border: none; border-radius: 8px; cursor: pointer; padding: 2px;">
                            <input type="text" id="settings-accent-color" name="accent_color" class="form-control" value="#4CAF50" placeholder="#4CAF50" onchange="document.getElementById('settings-accent-color-picker').value = this.value">
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-size: 13px;">
                            Card Text Color (কার্ডের টেক্সট কালার)
                        </label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="color" id="settings-text-color-picker" value="#1e293b" onchange="document.getElementById('settings-text-color').value = this.value" style="width: 42px; height: 38px; border: none; border-radius: 8px; cursor: pointer; padding: 2px;">
                            <input type="text" id="settings-text-color" name="text_color" class="form-control" value="#1e293b" placeholder="#1e293b" onchange="document.getElementById('settings-text-color-picker').value = this.value">
                        </div>
                    </div>
                </div>

                <hr style="margin: 30px 0; border-color: var(--border-color);">

                <h4 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-magnifying-glass-chart" style="color: #2563eb;"></i>
                    <span>Enterprise SEO, Schema & Organization Details (এসইও এবং প্রতিষ্ঠান সংক্রান্ত তথ্য)</span>
                </h4>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Company / Business Name (প্রতিষ্ঠান / কোম্পানির নাম)</label>
                        <input type="text" id="settings-company-name" name="company_name" class="form-control" placeholder="Italy Bangla Patente B">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Company Phone (ফোন নম্বর)</label>
                        <input type="text" id="settings-company-phone" name="company_phone" class="form-control" placeholder="+8801700000000 / +39000000000">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Company Email (ইমেইল এড্রেস)</label>
                        <input type="email" id="settings-company-email" name="company_email" class="form-control" placeholder="info@italybanglapatente.com">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Street Address (ঠিকানা)</label>
                        <input type="text" id="settings-company-address" name="company_address" class="form-control" placeholder="Dhaka, Bangladesh / Rome, Italy">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Geo Latitude</label>
                        <input type="text" id="settings-geo-latitude" name="geo_latitude" class="form-control" placeholder="23.8103">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Geo Longitude</label>
                        <input type="text" id="settings-geo-longitude" name="geo_longitude" class="form-control" placeholder="90.4125">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Opening Hours</label>
                        <input type="text" id="settings-opening-hours" name="opening_hours" class="form-control" placeholder="Mo-Sa 09:00-20:00">
                    </div>
                </div>

                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-chart-line" style="color: #10b981;"></i>
                    <span>Analytics & Search Console Integrations (গুগল এনালাইটিক্স ও ট্যাগ ট্র্যাকিং)</span>
                </h4>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">GA4 Measurement ID (Google Analytics 4)</label>
                        <input type="text" id="settings-ga4-id" name="ga4_measurement_id" class="form-control" placeholder="G-XXXXXXXXXX">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Google Search Console Verification Tag</label>
                        <input type="text" id="settings-search-console-id" name="search_console_verification" class="form-control" placeholder="meta verification code">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">GTM Container ID</label>
                        <input type="text" id="settings-gtm-id" name="gtm_container_id" class="form-control" placeholder="GTM-XXXXXXX">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Facebook Pixel ID</label>
                        <input type="text" id="settings-fb-pixel-id" name="fb_pixel_id" class="form-control" placeholder="1234567890">
                    </div>
                    <div class="form-group">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Microsoft Clarity Project ID</label>
                        <input type="text" id="settings-clarity-id" name="clarity_project_id" class="form-control" placeholder="xxxxxxxxxx">
                </div>

                <hr style="margin: 24px 0; border-color: var(--border-color);">

                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-qrcode" style="color: #10b981;"></i>
                    <span>Web QR Code Protection & Security Gate (ওয়েবসাইট কিউআর কোড সিকিউরিটি সেটিং)</span>
                </h4>

                <div style="background: rgba(16, 185, 129, 0.05); border: 1.5px solid rgba(16, 185, 129, 0.2); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label style="display: flex; align-items: center; gap: 10px; font-weight: 700; color: var(--text-primary); cursor: pointer;">
                            <input type="checkbox" id="settings-qr-protection-enabled" name="qr_protection_enabled" value="1" style="width: 18px; height: 18px; accent-color: #10b981;">
                            <span>Enable Web QR Code Security Gate (ওয়েবসাইটে প্রবেশের সময় কিউআর কোড লকার অন করুন)</span>
                        </label>
                        <span style="font-size: 11px; color: var(--text-secondary); margin-top: 6px; display: block; margin-left: 28px;">
                            অন করা থাকলে ওয়েবসাইটে প্রবেশের সময় স্ক্রিনশটের মতো ফুল-স্ক্রিন কিউআর কোড শো করবে। মোবাইল অ্যাপের কিউআর স্ক্যানার দিয়ে স্ক্যান করা ছাড়া ওয়েবসাইটে ঢুকতে পারবে না।
                        </span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                        <div class="form-group">
                            <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">QR Target Mode (মোড নির্ধারণ করুন)</label>
                            <select id="settings-qr-target-mode" name="qr_target_mode" class="form-control">
                                <option value="live">Live Website (http://mbanglapatenteb.com)</option>
                                <option value="local">Local Website (http://127.0.0.1:8000)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Live Website URL</label>
                            <input type="text" id="settings-qr-live-url" name="qr_live_url" class="form-control" placeholder="http://mbanglapatenteb.com" value="http://mbanglapatenteb.com">
                        </div>
                        <div class="form-group">
                            <label style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; display: block;">Local Website URL</label>
                            <input type="text" id="settings-qr-local-url" name="qr_local_url" class="form-control" placeholder="http://127.0.0.1:8000" value="http://127.0.0.1:8000">
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" id="save-settings-btn">
                    <i class="fa-solid fa-save"></i> Save Settings
                </button>
            </form>
        </div>
    </div>

    <!-- PANEL: Server Mode Configuration -->
    <div id="panel-server-mode" class="crud-panel">
        <div class="welcome-header" style="margin-bottom: 24px;">
            <h2 class="welcome-title" style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-server" style="color: #3b82f6;"></i>
                Server Mode Configuration
            </h2>
            <p class="welcome-subtitle">
                Switch between Local Development Server and Live Production Server easily from Admin Panel.
            </p>
        </div>

        <div style="max-width: 900px; display: flex; flex-direction: column; gap: 24px;">
            
            <!-- CURRENT ACTIVE SERVER MODE CARD -->
            <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #64748b;">
                        CURRENT ACTIVE SERVER MODE
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="quickSwitchServerMode('local')" class="btn" style="background: #eab308; color: #000000; font-weight: 800; border-radius: 8px; padding: 8px 14px; font-size: 13px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-mobile-screen"></i> Switch to Local Server
                        </button>
                        <button type="button" onclick="quickSwitchServerMode('live')" class="btn" style="background: #ffffff; color: #16a34a; font-weight: 800; border-radius: 8px; padding: 8px 14px; font-size: 13px; border: 1.5px solid #22c55e; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-globe"></i> Switch to Live Server
                        </button>
                    </div>
                </div>

                <!-- ACTIVE MODE DISPLAY BANNER -->
                <div id="active-server-mode-banner" style="background: #fef08a; border: 2px solid #eab308; border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                    <i class="fa-solid fa-server" id="active-server-icon" style="font-size: 28px; color: #000000;"></i>
                    <span id="active-server-mode-text" style="font-size: 22px; font-weight: 900; color: #000000; letter-spacing: 0.5px;">
                        LOCAL SERVER MODE
                    </span>
                </div>

                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary, #1e293b);">
                    Active Base URL: <code id="active-base-url-display" style="background: rgba(59, 130, 246, 0.1); color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 14px; font-weight: 700;">http://10.0.2.2:8000</code>
                </div>
            </div>

            <!-- SERVER URL SETTINGS CARD -->
            <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary, #1e293b); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-sliders" style="color: #64748b;"></i> Server URL Settings
                </h3>

                <form id="server-mode-config-form" onsubmit="saveServerModeSettingsForm(event)">
                    <div style="margin-bottom: 20px;">
                        <label style="font-weight: 700; font-size: 13px; color: var(--text-secondary, #64748b); margin-bottom: 12px; display: block;">
                            Select Active Server Mode:
                        </label>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
                            
                            <!-- LOCAL SERVER OPTION CARD -->
                            <div id="card-option-local" onclick="selectServerModeRadio('local')" style="border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.03); border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.2s ease;">
                                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                                    <input type="radio" id="server-mode-radio-local" name="qr_target_mode" value="local" style="width: 20px; height: 20px; accent-color: #3b82f6; margin-top: 2px;">
                                    <div>
                                        <div style="font-weight: 800; font-size: 15px; color: var(--text-primary, #1e293b); display: flex; align-items: center; gap: 8px;">
                                            <i class="fa-solid fa-beer-mug-empty" style="color: #f59e0b;"></i> Local Server Mode
                                        </div>
                                        <div style="font-size: 12px; color: var(--text-secondary, #64748b); margin-top: 4px;">
                                            Use for local development and testing on Emulator or Wi-Fi network.
                                        </div>
                                    </div>
                                </div>
                                <div style="margin-top: 14px;">
                                    <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary, #64748b); display: block; margin-bottom: 4px;">
                                        Local Server URL:
                                    </label>
                                    <input type="text" id="server-config-local-url" name="qr_local_url" class="form-control" value="http://10.0.2.2:8000" placeholder="http://10.0.2.2:8000" style="background: var(--bg-main, #f8fafc); border: 1px solid var(--border-color, #cbd5e1); font-family: monospace;">
                                    <span style="font-size: 11px; color: #ef4444; margin-top: 4px; display: block;">
                                        Example: <code style="color: #ef4444;">http://10.0.2.2:8000</code> (Android Emulator) or <code style="color: #ef4444;">http://192.168.1.100:8000</code>
                                    </span>
                                </div>
                            </div>

                            <!-- LIVE SERVER OPTION CARD -->
                            <div id="card-option-live" onclick="selectServerModeRadio('live')" style="border: 2px solid var(--border-color, #cbd5e1); background: var(--bg-card, #ffffff); border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.2s ease;">
                                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                                    <input type="radio" id="server-mode-radio-live" name="qr_target_mode" value="live" style="width: 20px; height: 20px; accent-color: #22c55e; margin-top: 2px;">
                                    <div>
                                        <div style="font-weight: 800; font-size: 15px; color: var(--text-primary, #1e293b); display: flex; align-items: center; gap: 8px;">
                                            <i class="fa-solid fa-globe" style="color: #22c55e;"></i> Live Production Server Mode
                                        </div>
                                        <div style="font-size: 12px; color: var(--text-secondary, #64748b); margin-top: 4px;">
                                            Use for public users connecting to production site domain.
                                        </div>
                                    </div>
                                </div>
                                <div style="margin-top: 14px;">
                                    <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary, #64748b); display: block; margin-bottom: 4px;">
                                        Live Production Server URL:
                                    </label>
                                    <input type="text" id="server-config-live-url" name="qr_live_url" class="form-control" value="http://mbanglapatenteb.com" placeholder="http://mbanglapatenteb.com" style="background: var(--bg-main, #f8fafc); border: 1px solid var(--border-color, #cbd5e1); font-family: monospace;">
                                    <span style="font-size: 11px; color: #ef4444; margin-top: 4px; display: block;">
                                        Example: <code style="color: #ef4444;">http://mbanglapatenteb.com</code>
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" id="save-server-config-btn" style="background: #2563eb; color: #ffffff; font-weight: 800; border-radius: 8px; padding: 10px 24px; font-size: 14px; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                            <i class="fa-solid fa-box-archive"></i> Save Server Settings
                        </button>
                    </div>
                </form>
            </div>

        </div>
    </div>

    <!-- PANEL: Admin Profile & Password Settings -->
    <div id="panel-admin-profile" class="crud-panel">
        <div class="welcome-header">
            <h2 class="welcome-title">Admin Profile & Password Settings</h2>
            <p class="welcome-subtitle">Update your admin account name, email, password, and profile picture avatar.</p>
        </div>

        <div style="max-width: 600px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <form onsubmit="saveAdminProfileSettingsFromPanel(event)" enctype="multipart/form-data">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label" style="font-weight: bold; margin-bottom: 6px; display: block;">Admin Name (এডমিনের নাম)</label>
                    <input type="text" class="form-control" id="panel-admin-profile-name" required placeholder="e.g. M Rahman">
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label" style="font-weight: bold; margin-bottom: 6px; display: block;">Admin Email (ইমেইল)</label>
                    <input type="email" class="form-control" id="panel-admin-profile-email" required placeholder="admin@gmail.com">
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label" style="font-weight: bold; margin-bottom: 6px; display: block;">New Password (নতুন পাসওয়ার্ড - অপরিবর্তিত রাখতে চাইলে খালি রাখুন)</label>
                    <input type="password" class="form-control" id="panel-admin-profile-password" placeholder="Enter new password to change...">
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" style="font-weight: bold; margin-bottom: 6px; display: block;">Profile Picture Avatar (প্রোফাইল ছবি)</label>
                    <input type="file" class="form-control" id="panel-admin-profile-avatar" accept="image/*">
                    <div id="panel-admin-avatar-preview" style="margin-top: 10px;"></div>
                </div>

                <button type="submit" class="btn btn-primary" style="background-color: #10b981; border: none; font-weight: bold; padding: 10px 24px;">
                    <i class="fa-solid fa-save"></i> Save Profile & Password
                </button>
            </form>
        </div>
    </div>

    <!-- PANEL: Manage Customers (App Clients) -->
    <div id="panel-customers" class="crud-panel">
        <div class="welcome-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 class="welcome-title">Manage App Customers (কাস্টমার তালিকা)</h2>
                    <p class="welcome-subtitle">View all registered customers, grant licenses, block/unblock users, and manage account statuses.</p>
                </div>
            </div>
        </div>

        <!-- Customer Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold;">Total Customers</div>
                    <div style="font-size: 24px; font-weight: 800; margin-top: 4px; color: var(--text-primary);" id="stat-cust-total">0</div>
                </div>
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); display: flex; align-items: center; justify-content: center; color: #3b82f6;">
                    <i class="fa-solid fa-users" style="font-size: 20px;"></i>
                </div>
            </div>

            <div class="card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold;">Active Licenses</div>
                    <div style="font-size: 24px; font-weight: 800; margin-top: 4px; color: #10b981;" id="stat-cust-active">0</div>
                </div>
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); display: flex; align-items: center; justify-content: center; color: #10b981;">
                    <i class="fa-solid fa-circle-check" style="font-size: 20px;"></i>
                </div>
            </div>

            <div class="card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold;">Pending Activation</div>
                    <div style="font-size: 24px; font-weight: 800; margin-top: 4px; color: #f59e0b;" id="stat-cust-pending">0</div>
                </div>
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center; color: #f59e0b;">
                    <i class="fa-solid fa-hourglass-half" style="font-size: 20px;"></i>
                </div>
            </div>

            <div class="card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold;">Blocked Users</div>
                    <div style="font-size: 24px; font-weight: 800; margin-top: 4px; color: #ef4444;" id="stat-cust-blocked">0</div>
                </div>
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); display: flex; align-items: center; justify-content: center; color: #ef4444;">
                    <i class="fa-solid fa-user-slash" style="font-size: 20px;"></i>
                </div>
            </div>
        </div>

        <!-- Search Bar -->
        <div style="margin-bottom: 16px; display: flex; gap: 12px;">
            <input type="text" class="form-control" id="search-customer-input" placeholder="Search customer by name, phone or session..." oninput="debounceFetchCustomers()" style="max-width: 380px;">
        </div>

        <!-- Customer Data Table -->
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 60px; text-align: center;">Avatar</th>
                        <th>Customer Name</th>
                        <th>Phone Number</th>
                        <th style="width: 140px; text-align: center;">License Status</th>
                        <th style="width: 120px; text-align: center;">Block Status</th>
                        <th style="width: 140px;">Registered Date</th>
                        <th style="width: 240px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="customers-table-body">
                    <!-- Customers dynamically injected -->
                </tbody>
            </table>
        </div>
    </div>
@endsection
