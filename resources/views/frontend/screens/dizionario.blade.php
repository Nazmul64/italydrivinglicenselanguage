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
