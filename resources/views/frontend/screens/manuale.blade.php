<!-- SCREEN: Manuale (Theory Guidebook) -->
<div id="screen-manuale" class="screen">
    <div class="section-header">
        <span class="section-title">ম্যানুয়াল থিওরি গাইড (Manuale)</span>
        <span class="section-subtitle">পাতেন্তে ড্রাইভিং থিওরি ও বিস্তারিত ব্যাখ্যা</span>
    </div>

    <!-- Manuale Search / Filter Bar -->
    <div style="margin-bottom: 16px;">
        <input type="text" id="manuale-search-input" placeholder="থিওরি বা চ্যাপ্টার খুঁজুন..." oninput="filterManualeTopics()" style="width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--border-card); background: var(--bg-card); color: var(--text-primary); font-size: 14px; box-sizing: border-box;">
    </div>

    <!-- Manuale Topics List Container -->
    <div id="manuale-topics-container" style="display: flex; flex-direction: column; gap: 14px;">
        @if(isset($manualeChapters) && $manualeChapters->count() > 0)
            @foreach($manualeChapters as $index => $ch)
                @php
                    $titleText = $ch->title ?? $ch->name ?? ('Capitolo ' . ($ch->chapter_number ?? ($index + 1)));
                    $chapterNum = $ch->chapter_number ?? $ch->order_index ?? ($index + 1);
                    $imgUrl = $ch->image_path ?? $ch->image ?? '';
                    $contentText = $ch->content ?? 'Nessuna spiegazione teorica inserita.';
                    $vocabs = is_array($ch->vocabulary) ? $ch->vocabulary : (json_decode($ch->vocabulary ?? '[]', true) ?: []);
                @endphp
                <div class="content-card manuale-chapter-card"
                     data-search-title="{{ strtolower($titleText) }}"
                     data-search-content="{{ strtolower($contentText) }}"
                     data-search-chap="{{ $chapterNum }}"
                     style="padding: 20px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-card); margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                    
                    <!-- Header Badge & Title -->
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
                        <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); color: var(--accent-blue, #2563EB); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0;">
                            {{ $chapterNum }}
                        </div>
                        <div>
                            <div style="font-size: 12px; font-weight: 700; color: var(--accent-blue, #2563EB); text-transform: uppercase; letter-spacing: 0.5px;">Capitolo {{ $chapterNum }}</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-top: 2px;">{{ $titleText }}</div>
                        </div>
                    </div>

                    <!-- Theory Illustration Image (Top) -->
                    @if($imgUrl)
                        <div style="text-align: center; margin-bottom: 16px; background: var(--bg-primary); padding: 12px; border-radius: 16px; border: 1px solid var(--border-card);">
                            <img src="{{ $imgUrl }}" style="max-height: 320px; width: auto; max-width: 100%; object-fit: contain; border-radius: 12px; cursor: pointer;" onclick="if(typeof openImageZoomModal === 'function') openImageZoomModal(this.src)" title="ছবি জুম করুন">
                        </div>
                    @endif

                    <!-- Theory Content -->
                    <div style="background: var(--bg-primary); border: 1px solid var(--border-card); border-radius: 14px; padding: 16px 18px; color: var(--text-primary); font-size: 15px; line-height: 1.8; font-weight: 500;">
                        {!! nl2br(e($contentText)) !!}
                    </div>

                    <!-- Vocabulary Section -->
                    @if(!empty($vocabs) && is_array($vocabs))
                        <div style="margin-top: 18px; border-top: 1px dashed var(--border-card); padding-top: 14px;">
                            <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-spell-check" style="color: var(--accent-blue, #2563EB);"></i> Vocabolario & Traduzioni ({{ count($vocabs) }})
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                                @foreach($vocabs as $v)
                                    @php
                                        $vWord = $v['italian'] ?? $v['word'] ?? '';
                                        $vMeaning = $v['bangla'] ?? $v['meaning'] ?? '';
                                        $vImg = $v['image'] ?? '';
                                    @endphp
                                    <div style="background: var(--bg-primary); border: 1px solid var(--border-card); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; gap: 10px;">
                                        @if($vImg)
                                            <img src="{{ $vImg }}" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-card);">
                                        @endif
                                        <div>
                                            <div style="font-weight: 800; font-size: 13px; color: var(--text-primary);">{{ $vWord }}</div>
                                            <div style="font-size: 12px; color: var(--accent-green); font-weight: 600; margin-top: 2px;">{{ $vMeaning }}</div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                </div>
            @endforeach
        @else
            <div style="text-align: center; color: var(--text-secondary); padding: 30px;">কোনো ম্যানুয়াল থিওরি পাওয়া যায়নি।</div>
        @endif
    </div>
</div>

<script>
    window.allManualeChaptersData = [
        @if(isset($manualeChapters) && $manualeChapters->count() > 0)
            @foreach($manualeChapters as $index => $ch)
            {
                id: {{ $ch->id }},
                chapter_number: {{ $ch->chapter_number ?? ($index + 1) }},
                title: @json($ch->title ?? $ch->name ?? ''),
                content: @json($ch->content ?? ''),
                image: @json($ch->image_path ?? $ch->image ?? ''),
                vocabulary: @json($ch->vocabulary ?? [])
            },
            @endforeach
        @endif
    ];

    function filterManualeTopics() {
        const searchInput = document.getElementById('manuale-search-input');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const cards = document.querySelectorAll('#manuale-topics-container .manuale-chapter-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.getAttribute('data-search-title') || '';
            const content = card.getAttribute('data-search-content') || '';
            const chap = card.getAttribute('data-search-chap') || '';

            if (!query || title.includes(query) || content.includes(query) || chap.includes(query)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
    }
</script>
