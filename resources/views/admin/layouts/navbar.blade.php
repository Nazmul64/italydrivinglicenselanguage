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
        @php
            $adminUser = \App\Models\User::where('role', 'super_admin')->first() ?? \App\Models\User::first();
            $adminName = $adminUser ? $adminUser->name : 'Admin';
            $adminAvatar = ($adminUser && $adminUser->avatar) ? asset($adminUser->avatar) : null;
            $initials = strtoupper(substr($adminName, 0, 2));
        @endphp
        <div class="nav-user" style="position: relative;" onclick="toggleUserDropdown(event)">
            @if($adminAvatar)
                <img src="{{ $adminAvatar }}" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
            @else
                <div class="user-avatar">{{ $initials }}</div>
            @endif
            <div class="user-info">
                <span class="user-name" style="display: flex; align-items: center; gap: 4px;">{{ $adminName }} <i class="fa-solid fa-angle-down" style="font-size: 10px;"></i></span>
                <span class="user-role">Super Admin</span>
            </div>
            
            <!-- Dropdown Menu -->
            <div id="user-dropdown-menu" style="display: none; position: absolute; top: 52px; right: 0; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 6px; width: 170px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 200;">
                <a href="javascript:void(0)" onclick="openAdminEditProfileModal()" style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 13px; color: var(--text-primary); text-decoration: none; border-radius: 8px; font-weight: 500; transition: background 0.2s;"><i class="fa-regular fa-user"></i> Profile & Password</a>
                <form id="logout-form" action="/admin/logout" method="POST" style="display: block; margin: 0;">
                    @csrf
                    <button type="submit" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 13px; color: var(--accent-red); background: none; border: none; cursor: pointer; text-align: left; border-radius: 8px; font-family: inherit; font-weight: 600; transition: background 0.2s;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out</button>
                </form>
            </div>
        </div>
    </div>
</div>
