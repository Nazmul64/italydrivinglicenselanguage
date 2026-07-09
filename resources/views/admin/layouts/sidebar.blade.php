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
