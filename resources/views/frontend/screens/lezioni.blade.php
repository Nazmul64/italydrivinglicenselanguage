<!-- SCREEN: Lezioni (Classes) -->
<div id="screen-lezioni" class="screen">
    <div class="section-header">
        <span class="section-title">ভিডিও লেকচার</span>
        <span class="section-subtitle">{{ $lectureClasses->count() }}টি ক্লাস</span>
    </div>
    
    @foreach($lectureClasses as $class)
        <div class="content-card lesson-item" onclick="playLesson('{{ $class->title }}', '{{ $class->duration }}')">
            <div class="lesson-thumbnail">
                <img src="{{ $class->thumbnail_url }}" alt="{{ $class->title }}">
                <i class="fa-solid fa-circle-play"></i>
            </div>
            <div class="lesson-info">
                <div class="lesson-title">{{ $class->title }}</div>
                <div class="lesson-duration"><i class="fa-regular fa-clock"></i> {{ $class->duration }} • বাংলা ব্যাখ্যা</div>
            </div>
        </div>
    @endforeach
</div>
