<!-- SCREEN: Cartelli (Traffic Signs) -->
<div id="screen-cartelli" class="screen">
    <div class="signs-tabs">
        <span class="sign-tab active" id="tab-pericolo" onclick="setSignCategory('pericolo')">Pericolo (বিপদ)</span>
        <span class="sign-tab" id="tab-divieto" onclick="setSignCategory('divieto')">Divieto (নিষেধ)</span>
        <span class="sign-tab" id="tab-obbligo" onclick="setSignCategory('obbligo')">Obbligo (বাধ্যতা)</span>
    </div>

    <!-- Search Bar matching screenshot -->
    <div style="margin-bottom: 16px;">
        <input type="text" id="cartelli-search-input" placeholder="Search here" oninput="filterCartelliSigns()" style="width: 100%; border-radius: 18px; padding: 12px 18px; border: 1px solid var(--border-card); background-color: var(--bg-card); color: var(--text-primary); font-weight: 700; font-size: 13px; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
    </div>

    <div class="signs-grid" id="signs-grid-container">
        <!-- Sign cards generated via JS -->
    </div>
</div>
