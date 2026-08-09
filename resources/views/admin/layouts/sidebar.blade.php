<!-- 1. Sidebar -->
<div class="sidebar">
    <div class="sidebar-brand">
        <span class="brand-logo">
            @if($gSettings->app_logo)
                <img src="{{ asset($gSettings->app_logo) }}" alt="{{ $gSettings->app_name }}" style="max-height: 24px; object-fit: contain; margin-right: 8px;">
            @else
                <i class="fa-solid fa-graduation-cap"></i> 
            @endif
            {{ $gSettings->app_name }}
        </span>
        <i class="fa-solid fa-bars-staggered" style="color: var(--text-sidebar); font-size: 16px; cursor: pointer; transition: color 0.2s;" onclick="showToast('Sidebar View')"></i>
    </div>

    <div class="sidebar-menu">
        <div class="menu-header">General</div>
        
        <div class="menu-item active" onclick="switchPanel('dashboard')" id="menu-dashboard">
            <span class="menu-link-group">
                <i class="fa-solid fa-house"></i>
                <span>Dashboard</span>
            </span>
        </div>

        <div class="menu-header">Applications</div>

        <!-- ARGOMENTI Dropdown Menu Item -->
        <div class="menu-item menu-dropdown-header" onclick="toggleSidebarDropdown('argomenti-dropdown')" id="menu-argomenti-dropdown-parent" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span class="menu-link-group">
                <i class="fa-solid fa-layer-group" style="color: #fbbf24;"></i>
                <span style="font-weight: bold;">ARGOMENTI</span>
            </span>
            <i class="fa-solid fa-chevron-down dropdown-arrow" id="arrow-argomenti-dropdown" style="font-size: 11px; transition: transform 0.3s ease;"></i>
        </div>
        <div class="sidebar-dropdown-container" id="argomenti-dropdown" style="display: none; padding-left: 10px; border-left: 2px solid #fbbf24; margin: 4px 0 8px 16px;">
            <div class="menu-item" onclick="switchPanel('mcq-questions')" id="menu-questions">
                <span class="menu-link-group">
                    <i class="fa-solid fa-database" style="color: #fbbf24; font-size: 12px;"></i>
                    <span style="font-size: 13px;">Manage MCQs (এমসিকিউ)</span>
                </span>
            </div>
            <div class="menu-item" onclick="switchPanel('mcq-chapters')" id="menu-chapters">
                <span class="menu-link-group">
                    <i class="fa-solid fa-book-open" style="color: #60a5fa; font-size: 12px;"></i>
                    <span style="font-size: 13px;">Manage Chapters</span>
                </span>
            </div>
        </div>

        <div class="menu-item" onclick="switchPanel('mcq-exams')" id="menu-exams">
            <span class="menu-link-group">
                <i class="fa-solid fa-file-invoice"></i>
                <span>Scheda Esame Scheduler</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('file-manager')" id="menu-file-manager">
            <span class="menu-link-group">
                <i class="fa-solid fa-folder-open"></i>
                <span>File Manager</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('chat-room')" id="menu-chat-room" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="menu-link-group">
                <i class="fa-solid fa-comments"></i>
                <span>Chat Room</span>
            </span>
            <span id="chat-unread-badge" style="display: none; background-color: #ef4444; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 12px; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);">0</span>
        </div>

        <div class="menu-item" onclick="switchPanel('customers')" id="menu-customers">
            <span class="menu-link-group">
                <i class="fa-solid fa-users" style="color: #ec4899;"></i>
                <span>Manage Customers (কাস্টমার তালিকা)</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('dizionario')" id="menu-dizionario">
            <span class="menu-link-group">
                <i class="fa-solid fa-spell-check"></i>
                <span>Manage Dictionary</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('manuale')" id="menu-manuale">
            <span class="menu-link-group">
                <i class="fa-solid fa-book-bookmark" style="color: #38bdf8;"></i>
                <span>Manage Manuale (ম্যানুয়াল থিওরি)</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('sliders')" id="menu-sliders">
            <span class="menu-link-group">
                <i class="fa-solid fa-images"></i>
                <span>Manage Sliders</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('popup-promo')" id="menu-popup-promo">
            <span class="menu-link-group">
                <i class="fa-solid fa-rectangle-ad"></i>
                <span>Popup Promo Settings</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('home-cards')" id="menu-home-cards">
            <span class="menu-link-group">
                <i class="fa-solid fa-shapes"></i>
                <span>Home Cards (Icons)</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('classes')" id="menu-classes">
            <span class="menu-link-group">
                <i class="fa-solid fa-video"></i>
                <span>Manage Lecture Videos</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('live-classes')" id="menu-live-classes">
            <span class="menu-link-group">
                <i class="fa-solid fa-tower-broadcast"></i>
                <span>Manage Live Sessions</span>
            </span>
        </div>

        <!-- Cartelli MCQ Module Dropdown Menu Item -->
        <div class="menu-item menu-dropdown-header" onclick="toggleSidebarDropdown('cartelli-dropdown')" id="menu-cartelli-dropdown-parent" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span class="menu-link-group">
                <i class="fa-solid fa-layer-group" style="color: #34d399;"></i>
                <span style="font-weight: bold;">Cartelli MCQ Module</span>
            </span>
            <i class="fa-solid fa-chevron-down dropdown-arrow" id="arrow-cartelli-dropdown" style="font-size: 11px; transition: transform 0.3s ease;"></i>
        </div>
        <div class="sidebar-dropdown-container" id="cartelli-dropdown" style="display: none; padding-left: 10px; border-left: 2px solid #34d399; margin: 4px 0 8px 16px;">
            <div class="menu-item" onclick="switchPanel('cartelli-mcqs')" id="menu-cartelli-mcqs">
                <span class="menu-link-group">
                    <i class="fa-solid fa-database" style="color: #fbbf24; font-size: 12px;"></i>
                    <span style="font-size: 13px;">Manage Cartelli MCQs (এমসিকিউ)</span>
                </span>
            </div>
            <div class="menu-item" onclick="switchPanel('cartelli-chapters')" id="menu-cartelli-chapters">
                <span class="menu-link-group">
                    <i class="fa-solid fa-book-open" style="color: #60a5fa; font-size: 12px;"></i>
                    <span style="font-size: 13px;">Manage Cartelli Chapters</span>
                </span>
            </div>
        </div>

        <script>
        function toggleSidebarDropdown(id) {
            const container = document.getElementById(id);
            const arrow = document.getElementById('arrow-' + id);
            if (!container) return;
            const isHidden = container.style.display === 'none' || container.style.display === '';
            container.style.display = isHidden ? 'block' : 'none';
            if (arrow) {
                arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
        </script>

        <div class="menu-header">System</div>

        <a href="/admin/server-mode" class="menu-item" id="menu-server-mode" style="text-decoration: none; display: block;">
            <span class="menu-link-group">
                <i class="fa-solid fa-server" style="color: #3b82f6;"></i>
                <span>Server Mode Configuration</span>
            </span>
        </a>

        <div class="menu-item" onclick="switchPanel('general-settings')" id="menu-general-settings">
            <span class="menu-link-group">
                <i class="fa-solid fa-gears" style="color: #60a5fa;"></i>
                <span>General Settings</span>
            </span>
        </div>

        <div class="menu-item" onclick="switchPanel('admin-profile')" id="menu-admin-profile">
            <span class="menu-link-group">
                <i class="fa-solid fa-user-gear" style="color: #10b981;"></i>
                <span>Admin Profile & Password</span>
            </span>
        </div>

    </div>
</div>
