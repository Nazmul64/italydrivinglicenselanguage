<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>mbanglapatenteb Admin Dashboard</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- FontAwesome Vector Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- External CSS Separated Asset -->
    <link rel="stylesheet" href="{{ asset('css/admin/style.css') }}">
</head>
<body>

    <!-- 1. Sidebar -->
    <div class="sidebar">
        <div class="sidebar-brand">
            <span class="brand-logo"><i class="fa-solid fa-graduation-cap"></i> mbanglapatenteb</span>
            <i class="fa-solid fa-bars-staggered action-icon" style="color: white; font-size: 16px;"></i>
        </div>

        <div class="sidebar-menu">
            <div class="menu-header">General</div>
            
            <div class="menu-item active" onclick="switchPanel('dashboard')" id="menu-dashboard">
                <span class="menu-link-group">
                    <i class="fa-solid fa-house"></i>
                    <span>Dashboards</span>
                </span>
                <i class="fa-solid fa-angle-right" style="font-size: 10px; display: none;"></i>
            </div>
            
            <div class="menu-submenu open" id="dashboard-submenu">
                <a href="#" class="submenu-item active" style="color: #fbbf24; font-weight: bold;"><i class="fa-solid fa-circle" style="font-size: 5px; margin-right: 8px;"></i> Default</a>
                <a href="#" class="submenu-item" onclick="showToast('ই-কমার্স প্যানেল ডেমো মোড')"><i class="fa-solid fa-circle" style="font-size: 5px; margin-right: 8px;"></i> Ecommerce</a>
                <a href="#" class="submenu-item" onclick="showToast('প্রজেক্ট ম্যানেজমেন্ট ডেমো মোড')"><i class="fa-solid fa-circle" style="font-size: 5px; margin-right: 8px;"></i> Project</a>
            </div>

            <div class="menu-item" onclick="showToast('উইজেট মডিউল ডেমো মোড')">
                <span class="menu-link-group">
                    <i class="fa-solid fa-shapes"></i>
                    <span>Widgets</span>
                </span>
                <i class="fa-solid fa-angle-right" style="font-size: 11px;"></i>
            </div>

            <div class="menu-item" onclick="showToast('লেআউট কন্ট্রোলার ডেমো মোড')">
                <span class="menu-link-group">
                    <i class="fa-solid fa-window-maximize"></i>
                    <span>Page Layout</span>
                </span>
                <i class="fa-solid fa-angle-right" style="font-size: 11px;"></i>
            </div>

            <div class="menu-header">Applications</div>

            <!-- MCQ CRUD Active Manager Menu Tab -->
            <div class="menu-item" onclick="switchPanel('mcq-questions')" id="menu-questions">
                <span class="menu-link-group">
                    <i class="fa-solid fa-database" style="color: #fbbf24;"></i>
                    <span style="font-weight: bold; color: white;">MCQ Manager</span>
                </span>
                <span class="badge" style="background-color: var(--accent-orange); color: white; padding: 2px 6px; font-size: 10px;">Active</span>
            </div>

            <div class="menu-item" onclick="switchPanel('mcq-chapters')" id="menu-chapters">
                <span class="menu-link-group">
                    <i class="fa-solid fa-book-open"></i>
                    <span>Manage Chapters</span>
                </span>
            </div>

            <div class="menu-item" onclick="showToast('ফাইল ম্যানেজার ডেমো মোড')">
                <span class="menu-link-group">
                    <i class="fa-solid fa-folder-open"></i>
                    <span>File Manager</span>
                </span>
            </div>

            <div class="menu-item" onclick="showToast('কানবান বোর্ড ডেমো মোড')">
                <span class="menu-link-group">
                    <i class="fa-solid fa-circle-nodes"></i>
                    <span>Kanban Board</span>
                </span>
            </div>

            <div class="menu-item" onclick="switchPanel('chat-room')" id="menu-chat-room">
                <span class="menu-link-group">
                    <i class="fa-solid fa-comments"></i>
                    <span>Chat Room</span>
                </span>
            </div>

            <div class="menu-item" onclick="switchPanel('categories')" id="menu-categories">
                <span class="menu-link-group">
                    <i class="fa-solid fa-list"></i>
                    <span>Categories</span>
                </span>
            </div>

            <div class="menu-item" onclick="showToast('ব্যবহারকারী সেটিংস ডেমো মোড')">
                <span class="menu-link-group">
                    <i class="fa-solid fa-users"></i>
                    <span>Users & Groups</span>
                </span>
                <i class="fa-solid fa-angle-right" style="font-size: 11px;"></i>
            </div>
        </div>
    </div>

    <!-- 2. Main Wrapper -->
    <div class="main-wrapper">
        
        <!-- 3. Top Navbar -->
        <div class="top-navbar">
            <div class="nav-search">
                <i class="fa-solid fa-magnifying-glass" style="color: var(--text-secondary); font-size: 13px;"></i>
                <input type="text" placeholder="Search tables, questions..." oninput="triggerGlobalSearch(this.value)">
            </div>

            <div class="nav-actions">
                <i class="fa-solid fa-sun action-icon" id="theme-toggle" onclick="toggleDarkMode()"></i>
                
                <div class="action-icon" onclick="showToast('নতুন ৪টি নোটিফিকেশন আছে')">
                    <i class="fa-solid fa-bell"></i>
                    <span class="badge-dot"></span>
                </div>
                
                <i class="fa-solid fa-globe action-icon" onclick="showToast('ভাষা পরিবর্তন ডেমো মোড')"></i>

                <!-- User Info Profile Dropdown with Logout -->
                <div class="nav-user" style="position: relative;" onclick="toggleUserDropdown(event)">
                    <div class="user-avatar">AM</div>
                    <div class="user-info">
                        <span class="user-name" style="display: flex; align-items: center; gap: 4px;">Alex Mora <i class="fa-solid fa-angle-down" style="font-size: 10px;"></i></span>
                        <span class="user-role">Admin</span>
                    </div>
                    
                    <!-- Dropdown Menu -->
                    <div id="user-dropdown-menu" style="display: none; position: absolute; top: 52px; right: 0; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 6px; width: 140px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 200;">
                        <a href="#" onclick="showToast('প্রোফাইল সেটিংস')" style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 13px; color: var(--text-primary); text-decoration: none; border-radius: 8px; font-weight: 500; transition: background 0.2s;"><i class="fa-regular fa-user"></i> Profile</a>
                        <form id="logout-form" action="/admin/logout" method="POST" style="display: block; margin: 0;">
                            @csrf
                            <button type="submit" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 13px; color: var(--accent-red); background: none; border: none; cursor: pointer; text-align: left; border-radius: 8px; font-family: inherit; font-weight: 600; transition: background 0.2s;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. Content Body -->
        <div class="content-body">
            
            <!-- PANEL 1: Default Dashboard -->
            <div id="panel-dashboard" class="crud-panel active">
                <div class="welcome-header">
                    <h2 class="welcome-title">Welcome Alex 👋</h2>
                    <p class="welcome-subtitle">Here's what's happening with your store today.</p>
                </div>

                <!-- Grid Layout Matching Screenshot -->
                <div class="dashboard-grid">
                    <!-- Revenue Growth SVG Chart -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Revenue Growth</span>
                            <span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); font-size: 12px; font-weight: bold; border: 1px solid var(--border-color);">This Year <i class="fa-solid fa-chevron-down" style="font-size: 9px; margin-left: 6px;"></i></span>
                        </div>
                        
                        <div class="revenue-chart-container">
                            <!-- Premium Handcrafted Responsive Line Chart SVG -->
                            <svg viewBox="0 0 500 150" width="100%" height="100%">
                                <!-- Grids -->
                                <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-color)" stroke-dasharray="3" stroke-width="0.7"></line>
                                <line x1="0" y1="60" x2="500" y2="60" stroke="var(--border-color)" stroke-dasharray="3" stroke-width="0.7"></line>
                                <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" stroke-dasharray="3" stroke-width="0.7"></line>
                                <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border-color)" stroke-dasharray="3" stroke-width="0.7"></line>
                                
                                <!-- Online Sale Line (Greenish Teal) -->
                                <path d="M 0 100 Q 50 110 100 80 T 200 70 T 300 45 T 400 65 T 500 35" fill="none" stroke="var(--accent-teal)" stroke-width="3" stroke-linecap="round"></path>
                                <path d="M 0 100 Q 50 110 100 80 T 200 70 T 300 45 T 400 65 T 500 35 L 500 150 L 0 150 Z" fill="url(#tealGradient)" opacity="0.08"></path>
                                
                                <!-- Marketing Sale Line (Orange/Yellow) -->
                                <path d="M 0 125 Q 50 135 100 110 T 200 105 T 300 90 T 400 100 T 500 80" fill="none" stroke="var(--accent-orange)" stroke-width="3" stroke-linecap="round"></path>
                                
                                <!-- Gradients definitions -->
                                <defs>
                                    <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="var(--accent-teal)"></stop>
                                        <stop offset="100%" stop-color="var(--accent-teal)" stop-opacity="0"></stop>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div class="chart-stats-row">
                            <div class="chart-stat-item">
                                <div class="chart-stat-label">Total Sales</div>
                                <div class="chart-stat-value" id="dash-total-sales">7000 questions</div>
                                <div class="chart-stat-sub" style="color: var(--accent-green);"><i class="fa-solid fa-arrow-up"></i> +40.15% than last year</div>
                            </div>
                            <div class="chart-stat-item">
                                <div class="chart-stat-label">Total Purchase</div>
                                <div class="chart-stat-value">$42,256.26</div>
                                <div class="chart-stat-sub" style="color: var(--accent-red);"><i class="fa-solid fa-arrow-down"></i> -20.25% than last year</div>
                            </div>
                            <div class="chart-stat-item" style="border-right: none;">
                                <div class="chart-stat-label">Total Returns</div>
                                <div class="chart-stat-value">$5,215.62</div>
                                <div class="chart-stat-sub" style="color: var(--accent-green);"><i class="fa-solid fa-arrow-up"></i> +18.15% than last year</div>
                            </div>
                        </div>
                    </div>

                    <!-- Boost Your Sale Promo Card -->
                    <div class="card promo-card">
                        <div class="promo-content">
                            <h3>Boost up your sale</h3>
                            <p>by upgrading your account you can increase your sale by 30% more.</p>
                        </div>
                        <button class="promo-btn" onclick="switchPanel('mcq-questions')">Upgrade Now</button>
                    </div>

                    <!-- Deliveries Progress Widget -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Deliveries</span>
                            <i class="fa-solid fa-ellipsis-vertical action-icon"></i>
                        </div>
                        
                        <div class="delivery-item">
                            <div class="delivery-meta">
                                <span>On Time Delivery</span>
                                <span style="color: var(--accent-teal);">80%</span>
                            </div>
                            <div class="delivery-progress">
                                <div class="progress-fill" style="width: 80%; background-color: var(--accent-teal);"></div>
                            </div>
                        </div>

                        <div class="delivery-item" style="margin-top: 24px;">
                            <div class="delivery-meta">
                                <span>Delayed Delivery</span>
                                <span style="color: var(--accent-orange);">15%</span>
                            </div>
                            <div class="delivery-progress">
                                <div class="progress-fill" style="width: 15%; background-color: var(--accent-orange);"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Row Grids -->
                <div class="dashboard-bottom-grid">
                    <!-- Top Product Card -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Top Product</span>
                            <span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); cursor: pointer;" onclick="showToast('সব প্রোডাক্টের তালিকা')">View All</span>
                        </div>
                        
                        <div class="product-list">
                            <div class="product-item">
                                <div class="product-info">
                                    <div class="product-img"><i class="fa-solid fa-clock"></i></div>
                                    <div>
                                        <div class="product-name">Huawei Smart Watch</div>
                                        <div class="product-sku">SKU90400</div>
                                    </div>
                                </div>
                                <div class="product-stats">
                                    <div class="product-qty">QTY: 12</div>
                                    <div class="product-revenue">Profit: $15</div>
                                </div>
                            </div>

                            <div class="product-item">
                                <div class="product-info">
                                    <div class="product-img"><i class="fa-solid fa-headphones"></i></div>
                                    <div>
                                        <div class="product-name">Noise - Wireless Headphone</div>
                                        <div class="product-sku">SKU78589</div>
                                    </div>
                                </div>
                                <div class="product-stats">
                                    <div class="product-qty">QTY: 19</div>
                                    <div class="product-revenue">Profit: $9</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- New Users Card -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">New User</span>
                            <span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); cursor: pointer;" onclick="showToast('সব ইউজারের তালিকা')">View All</span>
                        </div>

                        <div class="user-list">
                            <div class="user-item">
                                <div class="user-profile-meta">
                                    <div class="user-avatar-circle">SJ</div>
                                    <div>
                                        <div class="user-title">Smith John</div>
                                        <div class="user-country">India</div>
                                    </div>
                                </div>
                                <i class="fa-solid fa-ellipsis-vertical action-icon" onclick="showToast('Smith John এর সেটিংস')"></i>
                            </div>

                            <div class="user-item">
                                <div class="user-profile-meta">
                                    <div class="user-avatar-circle" style="background-color: #fef3c7; color: #d97706;">RF</div>
                                    <div>
                                        <div class="user-title">Robert Fox</div>
                                        <div class="user-country">Afghanistan</div>
                                    </div>
                                </div>
                                <i class="fa-solid fa-ellipsis-vertical action-icon" onclick="showToast('Robert Fox এর সেটিংস')"></i>
                            </div>

                            <div class="user-item">
                                <div class="user-profile-meta">
                                    <div class="user-avatar-circle" style="background-color: #fee2e2; color: #dc2626;">DR</div>
                                    <div>
                                        <div class="user-title">Darlene Robtson</div>
                                        <div class="user-country">Georgia</div>
                                    </div>
                                </div>
                                <i class="fa-solid fa-ellipsis-vertical action-icon" onclick="showToast('Darlene Robtson এর সেটিংস')"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Team Activity Card -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Team Activity</span>
                            <span class="badge" style="background-color: var(--bg-content); color: var(--text-secondary); cursor: pointer;" onclick="showToast('সব অ্যাক্টিভিটি লগ')">View All</span>
                        </div>

                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <div class="activity-content">
                                    <span class="activity-user">Floyd Miles</span> has moved to the warehouse.
                                    <div class="activity-time">5 min ago</div>
                                </div>
                            </div>

                            <div class="activity-item">
                                <div class="activity-dot" style="background-color: var(--accent-orange);"></div>
                                <div class="activity-content">
                                    <span class="activity-user">Ralph Edwards</span> solved Mr. Williams' project questions.
                                    <div class="activity-time">6 min ago</div>
                                </div>
                            </div>

                            <div class="activity-item">
                                <div class="activity-dot" style="background-color: var(--accent-blue);"></div>
                                <div class="activity-content">
                                    <span class="activity-user">Esther Howard</span> updated lesson videos.
                                    <div class="activity-time">10 min ago</div>
                                </div>
                            </div>
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
                    <div class="crud-filters">
                        <select class="form-select" id="filter-chapter" onchange="fetchQuestions()">
                            <option value="">সকল অধ্যায় (All Chapters)</option>
                            <!-- Chapters injected here -->
                        </select>
                        <input type="text" class="form-input" id="search-question" placeholder="ইতালীয় বা বাংলা প্রশ্ন দিয়ে খুঁজুন..." oninput="fetchQuestions()">
                    </div>
                    <button class="btn btn-primary" onclick="openAddQuestionModal()">
                        <i class="fa-solid fa-plus"></i> Add Question
                    </button>
                </div>

                <!-- Data Table for Questions -->
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 70px;">Ch</th>
                                <th>Italian Statement</th>
                                <th>Bangla Meaning</th>
                                <th style="width: 90px;">Answer</th>
                                <th style="width: 110px; text-align: center;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="questions-table-body">
                            <!-- Injected by AJAX -->
                        </tbody>
                    </table>
                </div>

                <!-- Table Pagination -->
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
                    <h2 class="welcome-title">Chapters Settings</h2>
                    <p class="welcome-subtitle">Manage chapter names and view question density per topic.</p>
                </div>

                <div class="chapters-grid" id="chapters-grid-container">
                    <!-- Chapter cards injected dynamically -->
                </div>
            </div>

            <!-- PANEL 4: Admin Chat Room Panel -->
            <div id="panel-chat-room" class="crud-panel">
                <div class="welcome-header">
                    <h2 class="welcome-title">Live Chat Room</h2>
                    <p class="welcome-subtitle">Chat with online customers and help them learn driving theory.</p>
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
                        <div class="chat-main-header">
                            <div class="conversation-avatar" id="active-chat-avatar">GU</div>
                            <div style="font-weight: bold; font-size: 13px;" id="active-chat-name">Guest User</div>
                        </div>
                        
                        <div class="chat-messages-container" id="admin-chat-messages">
                            <!-- Dynamic messages history list -->
                        </div>
                        
                        <div class="chat-input-container">
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

            <!-- PANEL 5: Admin Categories CRUD -->
            <div id="panel-categories" class="crud-panel">
                <div class="welcome-header">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <h2 class="welcome-title">Categories Settings</h2>
                            <p class="welcome-subtitle">Manage driving categories, descriptions, and details.</p>
                        </div>
                        <button class="btn btn-primary" onclick="openAddCategoryModal()">
                            <i class="fa-solid fa-plus"></i> Add Category
                        </button>
                    </div>
                </div>

                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
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

        </div>
    </div>

    <!-- Modals Layout -->
    <!-- 1. Add/Edit Question Modal -->
    <div class="modal-overlay" id="question-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="question-modal-title">Add New Question</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeQuestionModal()"></i>
            </div>
            
            <form id="question-form" onsubmit="saveQuestion(event)">
                <input type="hidden" id="form-question-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-chapter">Chapter Number</label>
                    <select class="form-control" id="form-chapter" required onchange="syncChapterName(this.value)">
                        <!-- Injected dynamically -->
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-name">Chapter Name</label>
                    <input type="text" class="form-control" id="form-chapter-name" readonly required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-italian">Italian Statement (Vero/Falso text)</label>
                    <textarea class="form-control" id="form-italian" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-bangla">Bangla Meaning</label>
                    <textarea class="form-control" id="form-bangla" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-is-vero">Correct Answer</label>
                    <select class="form-control" id="form-is-vero" required>
                        <option value="1">VERO (সঠিক)</option>
                        <option value="0">FALSO (ভুল)</option>
                    </select>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeQuestionModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Question</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 2. Edit Chapter Modal -->
    <div class="modal-overlay" id="chapter-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title">Edit Chapter Title</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeChapterModal()"></i>
            </div>
            
            <form id="chapter-form" onsubmit="saveChapter(event)">
                <input type="hidden" id="form-chapter-id-val">
                
                <div class="form-group">
                    <label class="form-label">Chapter ID</label>
                    <input type="text" class="form-control" id="form-chapter-num-display" readonly>
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-chapter-title-val">Chapter Name (Italian)</label>
                    <input type="text" class="form-control" id="form-chapter-title-val" required>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeChapterModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Chapter</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. Add/Edit Category Modal -->
    <div class="modal-overlay" id="category-modal">
        <div class="modal-card">
            <div class="modal-header-row">
                <h3 class="modal-title" id="category-modal-title">Add New Category</h3>
                <i class="fa-solid fa-xmark modal-close-btn" onclick="closeCategoryModal()"></i>
            </div>
            
            <form id="category-form" onsubmit="saveCategoryData(event)">
                <input type="hidden" id="form-category-id">
                
                <div class="form-group">
                    <label class="form-label" for="form-category-name">Category Name</label>
                    <input type="text" class="form-control" id="form-category-name" required placeholder="e.g. Patente B">
                </div>

                <div class="form-group">
                    <label class="form-label" for="form-category-desc">Description</label>
                    <textarea class="form-control" id="form-category-desc" rows="4" placeholder="Optional description..."></textarea>
                </div>

                <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeCategoryModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Category</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Toast notification Panel -->
    <div class="toast" id="toast-message">
        <i class="fa-solid fa-circle-info" style="color: var(--accent-teal);"></i>
        <span id="toast-text-content">মেসেজ</span>
    </div>

    <script>
        // Set CSRF Token header for AJAX requests
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Sidebar drop-down logic
        let currentPanel = 'dashboard';
        let currentPage = 1;

        // Toggle Dark/Light Mode Theme
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            const themeIcon = document.getElementById('theme-toggle');
            if (isDark) {
                themeIcon.className = 'fa-solid fa-sun action-icon';
                localStorage.setItem('admin-theme', 'dark');
                showToast('ডার্ক মোড সক্রিয় হয়েছে');
            } else {
                themeIcon.className = 'fa-solid fa-moon action-icon';
                localStorage.setItem('admin-theme', 'light');
                showToast('লাইট মোড সক্রিয় হয়েছে');
            }
        }

        // Initialize Theme from Storage
        if (localStorage.getItem('admin-theme') === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').className = 'fa-solid fa-sun action-icon';
        }

        // Display panels switching
        function switchPanel(panelId) {
            stopAdminChatPolling();
            currentPanel = panelId;
            document.querySelectorAll('.crud-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

            const targetPanel = document.getElementById(`panel-${panelId}`);
            if (targetPanel) targetPanel.classList.add('active');

            if (panelId === 'dashboard') {
                document.getElementById('menu-dashboard').classList.add('active');
                document.getElementById('dashboard-submenu').classList.add('open');
                fetchStats();
            } else if (panelId === 'mcq-questions') {
                document.getElementById('menu-questions').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                fetchQuestions();
            } else if (panelId === 'mcq-chapters') {
                document.getElementById('menu-chapters').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                fetchChapters();
            } else if (panelId === 'chat-room') {
                document.getElementById('menu-chat-room').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                startAdminChatPolling();
            } else if (panelId === 'categories') {
                document.getElementById('menu-categories').classList.add('active');
                document.getElementById('dashboard-submenu').classList.remove('open');
                fetchCategories();
            }
        }

        // Toast Messages
        let toastTimer;
        function showToast(message) {
            const toast = document.getElementById('toast-message');
            const toastText = document.getElementById('toast-text-content');
            toastText.innerText = message;
            toast.classList.add('show');

            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Trigger search globally
        function triggerGlobalSearch(value) {
            if (currentPanel === 'mcq-questions') {
                document.getElementById('search-question').value = value;
                fetchQuestions();
            }
        }

        // Fetch Dashboard overall stats
        function fetchStats() {
            fetch('/admin/api/stats')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('dash-total-sales').innerText = data.total_questions + ' questions';
                })
                .catch(err => console.error(err));
        }
        fetchStats();

        // 25 Chapters local metadata dictionary to sync option lists
        const chaptersDict = {
            1: "Definizioni stradali e doveri dell'uso della strada",
            2: "Segnali di pericolo",
            3: "Segnali di divieto",
            4: "Segnali di obbligo",
            5: "Segnali orizzontali e segni sulla strada",
            6: "Segnalazioni semaforiche e degli agenti del traffico",
            7: "Pericolo e intralcio, limiti di velocità, distanza di sicurezza",
            8: "Norme sulla circolazione dei veicoli (precedenze)",
            9: "Esempi di precedenza (rappresentazioni grafiche)",
            10: "Norme sul sorpasso",
            11: "Fermata, sosta, partenza e ingombro della carreggiata",
            12: "Norme sull'uso delle luci, dispositivi acustici, spie",
            13: "Cinture di sicurezza, sistemi di ritenuta, casco",
            14: "Patenti di guida, documenti, punti patente",
            15: "Incidenti stradali e primo soccorso",
            16: "Guida in relazione alle condizioni ambientali",
            17: "Responsabilità civile, penale, amministrativa, assicurazione",
            18: "Limitazione dei consumi, inquinamento, elementi del veicolo",
            19: "Dispositivi di equipaggiamento e specchietti retrovisori",
            20: "Uso ed efficienza dei dispositivi del veicolo",
            21: "Comportamenti alla guida in autostrada e strade extraurbane",
            22: "Segnali di indicazione, pannelli integrativi, segnali turistici",
            23: "Uso corretto della strada e comportamenti precauzionali",
            24: "Segnali luminosi e indicazioni degli agenti di polizia",
            25: "Definizioni generali e classificazione dei veicoli"
        };

        // Populate Chapter dropdown selection lists
        function populateChaptersSelectors() {
            const filterCh = document.getElementById('filter-chapter');
            const formCh = document.getElementById('form-chapter');
            
            filterCh.innerHTML = '<option value="">সকল অধ্যায় (All Chapters)</option>';
            formCh.innerHTML = '';

            for (let id in chaptersDict) {
                filterCh.innerHTML += `<option value="${id}">${id}. ${chaptersDict[id]}</option>`;
                formCh.innerHTML += `<option value="${id}">${id}. ${chaptersDict[id]}</option>`;
            }
        }
        populateChaptersSelectors();

        function syncChapterName(val) {
            document.getElementById('form-chapter-name').value = chaptersDict[val] || '';
        }
        syncChapterName(1);

        // Fetch Questions paginated list via AJAX
        function fetchQuestions() {
            const chapter = document.getElementById('filter-chapter').value;
            const search = document.getElementById('search-question').value;
            
            let url = `/admin/api/questions?page=${currentPage}`;
            if (chapter) url += `&chapter=${chapter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    renderQuestionsTable(data.data);
                    updatePaginationControls(data);
                })
                .catch(err => {
                    console.error(err);
                    showToast('প্রশ্ন লোড করতে সমস্যা হয়েছে');
                });
        }

        // Render table records
        function renderQuestionsTable(questions) {
            const tbody = document.getElementById('questions-table-body');
            tbody.innerHTML = '';

            if (!questions || questions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো প্রশ্ন পাওয়া যায়নি</td></tr>';
                return;
            }

            questions.forEach(q => {
                const tr = document.createElement('tr');
                const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
                tr.innerHTML = `
                    <td style="font-weight: 700; color: var(--accent-teal);">${q.chapter}</td>
                    <td style="font-weight: 500;">${q.italian}</td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${q.bangla}</td>
                    <td>
                        <span class="badge ${isVero ? 'badge-vero' : 'badge-falso'}">
                            ${isVero ? 'VERO' : 'FALSO'}
                        </span>
                    </td>
                    <td style="text-align: center;">
                        <div class="table-actions" style="justify-content: center;">
                            <button class="action-btn edit" onclick="openEditQuestionModal(${JSON.stringify(q).replace(/"/g, '&quot;')})" title="Edit question"><i class="fa-solid fa-pencil"></i></button>
                            <button class="action-btn delete" onclick="deleteQuestion(${q.id})" title="Delete question"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Update pagination numbers
        function updatePaginationControls(data) {
            document.getElementById('pagination-status').innerText = `Showing ${data.from || 0} to ${data.to || 0} of ${data.total || 0} entries`;
            
            document.getElementById('btn-prev-page').disabled = !data.prev_page_url;
            document.getElementById('btn-next-page').disabled = !data.next_page_url;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                fetchQuestions();
            }
        }

        function nextPage() {
            currentPage++;
            fetchQuestions();
        }

        // Add / Edit Question Modals logic
        function openAddQuestionModal() {
            document.getElementById('question-modal-title').innerText = 'Add New Question';
            document.getElementById('form-question-id').value = '';
            document.getElementById('form-italian').value = '';
            document.getElementById('form-bangla').value = '';
            document.getElementById('form-is-vero').value = '1';
            
            const firstChapter = Object.keys(chaptersDict)[0];
            document.getElementById('form-chapter').value = firstChapter;
            syncChapterName(firstChapter);

            document.getElementById('question-modal').style.display = 'flex';
        }

        function openEditQuestionModal(q) {
            document.getElementById('question-modal-title').innerText = 'Edit Question';
            document.getElementById('form-question-id').value = q.id;
            document.getElementById('form-chapter').value = q.chapter;
            document.getElementById('form-chapter-name').value = q.chapter_name || '';
            document.getElementById('form-italian').value = q.italian;
            document.getElementById('form-bangla').value = q.bangla;
            
            const isVero = q.is_vero === 1 || q.is_vero === true || q.is_vero === '1';
            document.getElementById('form-is-vero').value = isVero ? '1' : '0';

            document.getElementById('question-modal').style.display = 'flex';
        }

        function closeQuestionModal() {
            document.getElementById('question-modal').style.display = 'none';
        }

        // AJAX Save Question (Create or Update)
        function saveQuestion(e) {
            e.preventDefault();
            const id = document.getElementById('form-question-id').value;
            const chapter = document.getElementById('form-chapter').value;
            const chapter_name = document.getElementById('form-chapter-name').value;
            const italian = document.getElementById('form-italian').value;
            const bangla = document.getElementById('form-bangla').value;
            const is_vero = document.getElementById('form-is-vero').value === '1';

            const payload = { chapter, chapter_name, italian, bangla, is_vero };
            const url = id ? `/admin/api/questions/update/${id}` : '/admin/api/questions/store';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                closeQuestionModal();
                showToast(id ? 'প্রশ্নটি সফলভাবে আপডেট করা হয়েছে' : 'নতুন প্রশ্নটি সফলভাবে যোগ করা হয়েছে');
                fetchQuestions();
            })
            .catch(err => {
                console.error(err);
                showToast('প্রশ্নটি সংরক্ষণ করতে ব্যর্থ হয়েছে');
            });
        }

        // Delete Question
        function deleteQuestion(id) {
            if (confirm('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি ডিলিট করতে চান?')) {
                fetch(`/admin/api/questions/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                .then(res => res.json())
                .then(data => {
                    showToast('প্রশ্নটি ডিলিট করা হয়েছে');
                    fetchQuestions();
                })
                .catch(err => {
                    console.error(err);
                    showToast('প্রশ্নটি ডিলিট করতে সমস্যা হয়েছে');
                });
            }
        }

        // Chapters Management Panel AJAX Operations
        function fetchChapters() {
            fetch('/admin/api/chapters')
                .then(res => res.json())
                .then(data => {
                    renderChaptersGrid(data);
                })
                .catch(err => {
                    console.error(err);
                    showToast('অধ্যায় তালিকা লোড করতে ব্যর্থ হয়েছে');
                });
        }

        function renderChaptersGrid(chapters) {
            const container = document.getElementById('chapters-grid-container');
            container.innerHTML = '';

            chapters.forEach(ch => {
                const card = document.createElement('div');
                card.className = 'chapter-card';
                card.innerHTML = `
                    <div class="chapter-header">
                        <div>
                            <span class="chapter-num">Chapter ${ch.chapter}</span>
                            <h4 class="chapter-title">${ch.chapter_name}</h4>
                        </div>
                        <button class="action-btn edit" onclick="openEditChapterModal(${ch.chapter}, '${ch.chapter_name.replace(/'/g, "\\'")}')" title="Edit chapter title"><i class="fa-solid fa-pencil"></i></button>
                    </div>
                    <div class="chapter-count">
                        <i class="fa-solid fa-layer-group" style="margin-right: 6px; color: var(--text-secondary);"></i>
                        ${ch.question_count} Patente questions
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function openEditChapterModal(id, name) {
            document.getElementById('form-chapter-id-val').value = id;
            document.getElementById('form-chapter-num-display').value = id;
            document.getElementById('form-chapter-title-val').value = name;
            document.getElementById('chapter-modal').style.display = 'flex';
        }

        function closeChapterModal() {
            document.getElementById('chapter-modal').style.display = 'none';
        }

        // AJAX Update Chapter Name
        function saveChapter(e) {
            e.preventDefault();
            const id = document.getElementById('form-chapter-id-val').value;
            const name = document.getElementById('form-chapter-title-val').value;

            fetch('/admin/api/chapters/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ chapter: id, chapter_name: name })
            })
            .then(res => res.json())
            .then(data => {
                closeChapterModal();
                showToast('অধ্যায়ের নাম সফলভাবে আপডেট করা হয়েছে');
                // Re-sync local dictionary and re-render grid
                chaptersDict[id] = name;
                populateChaptersSelectors();
                fetchChapters();
            })
            .catch(err => {
                console.error(err);
                showToast('অধ্যায়ের নাম আপডেট করতে সমস্যা হয়েছে');
            });
        }

        // Toggle user profile dropdown menu
        function toggleUserDropdown(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) {
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
            }
        }

        // Close dropdown when user clicks elsewhere
        window.addEventListener('click', () => {
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });

        // --- 8. Admin Chat Room Operations ---
        let adminChatInterval = null;
        let activeChatSessionId = null;

        function startAdminChatPolling() {
            fetchConversations();
            if (!adminChatInterval) {
                adminChatInterval = setInterval(() => {
                    fetchConversations();
                    if (activeChatSessionId) {
                        fetchConversationMessages(activeChatSessionId, false);
                    }
                }, 3000);
            }
        }

        function stopAdminChatPolling() {
            if (adminChatInterval) {
                clearInterval(adminChatInterval);
                adminChatInterval = null;
            }
        }

        function fetchConversations() {
            fetch('/admin/api/chat/conversations')
                .then(res => res.json())
                .then(conversations => {
                    renderConversationsList(conversations);
                })
                .catch(err => console.error("Error fetching conversations: ", err));
        }

        function renderConversationsList(conversations) {
            const listContainer = document.getElementById('admin-chat-list');
            listContainer.innerHTML = '';
            
            if (conversations.length === 0) {
                listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 12px;">কোনো চ্যাট উপলব্ধ নেই</div>`;
                return;
            }
            
            conversations.forEach(convo => {
                const item = document.createElement('div');
                item.className = `conversation-item ${activeChatSessionId === convo.session_id ? 'active' : ''}`;
                item.onclick = () => selectConversation(convo.session_id);
                
                item.innerHTML = `
                    <div class="conversation-avatar">GU</div>
                    <div class="conversation-meta">
                        <div class="conversation-name">Guest #${convo.session_id.substring(0, 8)}</div>
                        <div class="conversation-last-msg">${convo.last_message}</div>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        }

        function selectConversation(sessionId) {
            activeChatSessionId = sessionId;
            
            document.getElementById('admin-chat-fallback').style.display = 'none';
            document.getElementById('admin-chat-main-area').style.display = 'flex';
            
            document.getElementById('active-chat-name').innerText = `Guest User #${sessionId.substring(0, 8)}`;
            
            fetchConversationMessages(sessionId, true);
            
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            fetchConversations();
        }

        function fetchConversationMessages(sessionId, forceScroll = false) {
            fetch(`/admin/api/chat/messages/${sessionId}`)
                .then(res => res.json())
                .then(messages => {
                    renderConversationMessages(messages, forceScroll);
                })
                .catch(err => console.error("Error loading messages: ", err));
        }

        function renderConversationMessages(messages, forceScroll) {
            const container = document.getElementById('admin-chat-messages');
            const scrollAtBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;
            
            container.innerHTML = '';
            messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `chat-message-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`;
                bubble.innerText = msg.message;
                container.appendChild(bubble);
            });
            
            if (forceScroll || scrollAtBottom) {
                container.scrollTop = container.scrollHeight;
            }
        }

        function sendAdminChatMessage() {
            const input = document.getElementById('admin-chat-input');
            const messageText = input.value.trim();
            if (!messageText || !activeChatSessionId) return;
            
            input.value = '';
            
            fetch('/admin/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    session_id: activeChatSessionId,
                    message: messageText
                })
            })
            .then(res => res.json())
            .then(msg => {
                fetchConversationMessages(activeChatSessionId, true);
            })
            .catch(err => console.error("Error sending message: ", err));
        }

        // --- 9. Category Management Operations ---
        let categoriesData = [];

        function fetchCategories() {
            fetch('/admin/api/categories')
                .then(res => res.json())
                .then(data => {
                    categoriesData = data;
                    renderCategoriesTable();
                })
                .catch(err => {
                    console.error("Error loading categories: ", err);
                    showToast('ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
                });
        }

        function renderCategoriesTable() {
            const tbody = document.getElementById('categories-table-body');
            tbody.innerHTML = '';

            if (categoriesData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো ক্যাটাগরি পাওয়া যায়নি। নতুন ক্যাটাগরি তৈরি করুন!</td></tr>`;
                return;
            }

            categoriesData.forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${cat.id}</strong></td>
                    <td><strong>${cat.name}</strong></td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${cat.description || 'No description provided'}</td>
                    <td>
                        <div class="table-actions" style="justify-content: flex-end;">
                            <button class="action-btn edit" onclick="openEditCategoryModal(${cat.id}, '${cat.name.replace(/'/g, "\\'")}', '${(cat.description || '').replace(/'/g, "\\'")}')" title="Edit Category">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteCategory(${cat.id})" title="Delete Category">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openAddCategoryModal() {
            document.getElementById('category-form').reset();
            document.getElementById('form-category-id').value = '';
            document.getElementById('category-modal-title').innerText = 'Add New Category';
            document.getElementById('category-modal').style.display = 'flex';
        }

        function openEditCategoryModal(id, name, desc) {
            document.getElementById('form-category-id').value = id;
            document.getElementById('form-category-name').value = name;
            document.getElementById('form-category-desc').value = desc;
            document.getElementById('category-modal-title').innerText = 'Edit Category';
            document.getElementById('category-modal').style.display = 'flex';
        }

        function closeCategoryModal() {
            document.getElementById('category-modal').style.display = 'none';
        }

        function saveCategoryData(e) {
            e.preventDefault();
            const id = document.getElementById('form-category-id').value;
            const name = document.getElementById('form-category-name').value;
            const desc = document.getElementById('form-category-desc').value;

            const url = id ? `/admin/api/categories/update/${id}` : '/admin/api/categories/store';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ name: name, description: desc })
            })
            .then(res => res.json())
            .then(data => {
                closeCategoryModal();
                showToast(id ? 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে' : 'নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে');
                fetchCategories();
            })
            .catch(err => {
                console.error("Error saving category: ", err);
                showToast('ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে');
            });
        }

        function deleteCategory(id) {
            if (confirm("আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?")) {
                fetch(`/admin/api/categories/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                .then(res => res.json())
                .then(data => {
                    showToast('ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে');
                    fetchCategories();
                })
                .catch(err => {
                    console.error("Error deleting category: ", err);
                    showToast('ক্যাটাগরি মুছতে সমস্যা হয়েছে');
                });
            }
        }
    </script>
</body>
</html>
