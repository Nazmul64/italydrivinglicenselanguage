<!-- SCREEN: Dictionary -->
<div id="screen-dizionario" class="screen">
    <div class="search-bar">
        <i class="fa-solid fa-magnifying-glass" style="color: var(--text-secondary);"></i>
        <input type="text" id="dictionary-search" placeholder="ইতালীয় বা বাংলা শব্দ দিয়ে খুঁজুন..." oninput="filterDictionary()">
    </div>

    <div id="dictionary-list">
        @if(isset($dictionaryTerms) && $dictionaryTerms->count() > 0)
            @foreach($dictionaryTerms as $term)
                @php
                    $w = $term->word ?? '';
                    $bn = $term->bn ?? '';
                    $descIt = $term->desc_it ?? $term->definition ?? '';
                    $descBn = $term->desc_bn ?? $term->bn ?? '';
                    $img = $term->image ?? '';
                    $aud = $term->audio ?? '';
                    $vid = $term->video ?? '';
                @endphp
                <div class="content-card dictionary-item"
                     data-word="{{ strtolower($w) }}"
                     data-bn="{{ strtolower($bn) }}"
                     onclick="openDictTermModal('{{ addslashes($w) }}', '{{ addslashes($bn) }}', '{{ addslashes($descIt) }}', '{{ $img }}', '{{ $aud }}', '{{ $vid }}')"
                     style="padding: 16px; border-radius: 16px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-card); cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;">
                    <div class="dict-word" style="font-size: 16px; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">{{ $w }}</div>
                    <div class="dict-meaning" style="font-size: 14px; font-weight: 700; color: var(--accent-green); margin-top: 2px;">{{ $bn }}</div>
                    @if(!empty($descIt) || !empty($descBn))
                        <div class="dict-desc" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">{{ $descIt ?: $descBn }}</div>
                    @endif
                </div>
            @endforeach
        @else
            <div style="text-align: center; padding: 30px; color: var(--text-secondary);">কোনো অভিধানের শব্দ পাওয়া যায়নি!</div>
        @endif
    </div>
</div>

<script>
    window.dictionaryData = [
        @if(isset($dictionaryTerms) && $dictionaryTerms->count() > 0)
            @foreach($dictionaryTerms as $term)
            {
                word: @json($term->word ?? ''),
                bn: @json($term->bn ?? ''),
                desc_it: @json($term->desc_it ?? $term->definition ?? ''),
                desc_bn: @json($term->desc_bn ?? $term->bn ?? ''),
                image: @json($term->image ?? ''),
                audio: @json($term->audio ?? null),
                video: @json($term->video ?? null)
            },
            @endforeach
        @endif
    ];

    function filterDictionary() {
        const input = document.getElementById('dictionary-search');
        const query = input ? input.value.toLowerCase().trim() : '';
        const items = document.querySelectorAll('#dictionary-list .dictionary-item');
        let visibleCount = 0;

        items.forEach(item => {
            const word = item.getAttribute('data-word') || '';
            const bn = item.getAttribute('data-bn') || '';
            if (!query || word.includes(query) || bn.includes(query)) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        let noResultEl = document.getElementById('dictionary-no-result');
        if (!noResultEl) {
            noResultEl = document.createElement('div');
            noResultEl.id = 'dictionary-no-result';
            noResultEl.style.cssText = 'text-align: center; padding: 20px; color: var(--text-secondary); display: none;';
            noResultEl.innerText = 'কোনো ফলাফল পাওয়া যায়নি!';
            const list = document.getElementById('dictionary-list');
            if (list) list.appendChild(noResultEl);
        }
        noResultEl.style.display = (visibleCount === 0 && items.length > 0) ? 'block' : 'none';
    }
</script>
