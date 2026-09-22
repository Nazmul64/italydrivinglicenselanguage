<!-- SCREEN: Argomenti (Scegli Categoria) -->
<div id="screen-argomenti" class="screen" style="width: 100%; max-width: 1360px; margin: 0 auto; box-sizing: border-box;">
    <div class="category-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">Tutti i Capitoli</h3>
        <div id="argomenti-chapters-count-badge" style="font-size: 11px; color: var(--text-secondary); font-weight: bold; background-color: var(--bg-card); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-card);">
            {{ isset($argomentiChapters) ? $argomentiChapters->count() : 0 }} Capitoli
        </div>
    </div>

    <!-- Selection Control Pills matching screenshot -->
    <div class="pill-btn-group" style="margin-bottom: 24px;">
        <button class="pill-btn" id="pill-argomenti-chap-select-all" onclick="selectAllArgomentiChapters()">Select All</button>
        <button class="pill-btn" id="pill-argomenti-chap-select" onclick="toggleSelectArgomentiChapters()">Select</button>
        <button class="pill-btn active" id="pill-argomenti-chap-unselect" onclick="unselectAllArgomentiChapters()">Unselect All</button>
    </div>

    <div id="argomenti-list" class="argomenti-grid" style="padding-bottom: 80px;">
        @if(isset($argomentiChapters) && $argomentiChapters->count() > 0)
            @foreach($argomentiChapters as $ch)
                @php
                    $coverImage = \App\Helpers\ImageHelper::formatImageUrl($ch->cover_image ?: $ch->image);
                    $chapNum = $ch->chapter_number ?? $ch->sort_order ?? $ch->id;
                @endphp
                <div class="chapter-image-card" data-chapter-id="{{ $ch->id }}" onclick="handleArgomentiChapterCardClick({{ $ch->id }})">
                    <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between; width: 100%; position: relative;">
                        <div class="chapter-card-title" style="text-align: center; font-size: 18px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; line-height: 1.3; width: 100%; margin-bottom: 10px;">
                            {{ $chapNum }}) {{ $ch->name }}
                        </div>
                        @if(!empty($coverImage))
                        <div class="chapter-card-img-wrapper" style="width: 100%; height: 250px; min-height: 220px; display: flex; align-items: center; justify-content: center; margin: 10px 0; background: transparent; overflow: hidden; border-radius: 14px; padding: 0;">
                            <img src="{{ $coverImage }}" onerror="this.parentElement.style.display='none'" class="chapter-card-img" alt="{{ $ch->name }}" style="height: 100%; width: 100%; max-height: 250px; max-width: 92%; object-fit: contain; border-radius: 14px; background: transparent; display: block;">
                        </div>
                        @endif

                        @php
                            $chTotal = $ch->questions_count ?? ($ch->questions ? $ch->questions->count() : 0);
                            $chCorrect = $ch->corrette ?? 0;
                            $chWrong = $ch->errori ?? 0;
                            $chUnanswered = max(0, $chTotal - $chCorrect - $chWrong);
                            $chSafeTotal = $chTotal > 0 ? $chTotal : 1;
                        @endphp
                        <div style="width: 100%; margin-top: 14px;">
                            <div style="text-align: center; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Progresso</div>
                            <div style="display: flex; justify-content: space-between; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
                                <div>
                                    <div>Corrette</div>
                                    <div style="font-weight: 700; color: #4CAF50; margin-top: 2px;">{{ $chCorrect }}</div>
                                </div>
                                <div>
                                    <div>Errori</div>
                                    <div style="font-weight: 700; color: #ef4444; margin-top: 2px;">{{ $chWrong }}</div>
                                </div>
                                <div>
                                    <div>Non risposte</div>
                                    <div style="font-weight: 700; color: var(--text-secondary); margin-top: 2px;">{{ $chUnanswered }}</div>
                                </div>
                                <div>
                                    <div>Totale</div>
                                    <div style="font-weight: 700; color: var(--text-primary); margin-top: 2px;">{{ $chTotal }}</div>
                                </div>
                            </div>
                            <div style="height: 12px; background-color: #e5e7eb; border-radius: 999px; display: flex; overflow: hidden; border: 1.5px solid #d1d5db; padding: 1px;">
                                <div style="background-color: #22c55e; width: {{ ($chCorrect / $chSafeTotal) * 100 }}%; border-radius: 999px 0 0 999px; transition: width 0.3s;"></div>
                                <div style="background-color: #ef4444; width: {{ ($chWrong / $chSafeTotal) * 100 }}%; transition: width 0.3s;"></div>
                                <div style="background-color: transparent; flex: 1;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        @else
            <div style="text-align: center; color: var(--text-secondary); padding: 45px; grid-column: 1 / -1;">
                Nessun capitolo trovato.
            </div>
        @endif
    </div>

    <!-- Floating QUIZ button (Always visible) -->
    <button class="floating-quiz-btn" id="argomenti-category-quiz-btn" onclick="startArgomentiCategoryQuiz()" style="display: flex;">
        <i class="fa-solid fa-play"></i> QUIZ <i class="fa-solid fa-chevron-right"></i>
    </button>
</div>

<script>
    window.allArgomentiChapters = [
        @if(isset($argomentiChapters) && $argomentiChapters->count() > 0)
            @foreach($argomentiChapters as $ch)
            {
                id: {{ $ch->id }},
                name: @json($ch->name ?? ''),
                chapter_number: {{ $ch->chapter_number ?? $ch->id }},
                cover_image: @json(\App\Helpers\ImageHelper::formatImageUrl($ch->cover_image ?: $ch->image)),
                pages_count: {{ $ch->pages_count ?? ($ch->pages ? $ch->pages->count() : 0) }}
            },
            @endforeach
        @endif
    ];

    function handleArgomentiChapterCardClick(chId) {
        if (typeof isArgomentiSelectMode !== 'undefined' && isArgomentiSelectMode) {
            if (typeof toggleChapterSelection === 'function') {
                toggleChapterSelection(chId);
            }
        } else {
            if (typeof openChapterSheetsScreen === 'function') {
                openChapterSheetsScreen(chId);
            } else if (typeof openArgomentiSchedeScreen === 'function') {
                openArgomentiSchedeScreen(chId);
            }
        }
    }
</script>
