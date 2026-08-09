<!-- SCREEN: Lezioni (Classes) -->
<div id="screen-lezioni" class="screen">
    <div class="section-header" style="margin-bottom: 24px;">
        <span class="section-title">ভিডিও লেকচার</span>
        <span class="section-subtitle">{{ $lectureClasses->count() }}টি ভিডিও</span>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
        @foreach($lectureClasses as $class)
            @php
                $vUrl = $class->video_url ?? $class->youtube_url ?? $class->vimeo_url ?? $class->video_path ?? '';
                $videoId = '';
                if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $vUrl, $matches)) {
                    $videoId = $matches[1];
                }
                $embedUrl = $videoId ? "https://www.youtube.com/embed/{$videoId}" : $vUrl;
            @endphp
            <div style="border-radius: 16px; overflow: hidden; background: #000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); border: 1px solid rgba(255,255,255,0.08);">
                @if($videoId)
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                        <iframe src="{{ $embedUrl }}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                @else
                    <video src="{{ $vUrl }}" controls style="width: 100%; max-height: 240px; background: #000;"></video>
                @endif
            </div>
        @endforeach
    </div>
</div>
