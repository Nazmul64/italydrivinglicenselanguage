@extends('admin.layouts.app')

@section('content')
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
@endsection
