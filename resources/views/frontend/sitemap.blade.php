@include('frontend.layouts.header')

<div class="container py-5">
    <div class="card border-0 shadow-sm rounded-4 p-4" style="background-color: var(--bg-card);">
        <h1 class="h3 font-weight-bold mb-3" style="color: var(--text-primary);">HTML Directory & Sitemap</h1>
        <p class="text-muted mb-4">Complete structural overview of all chapters, pages, lecture classes, and cartelli categories available on Italy Bangla Patente.</p>

        <div class="row g-4">
            <!-- Chapters & Pages -->
            <div class="col-md-6">
                <div class="p-3 border rounded-3 h-100" style="background-color: var(--bg-page);">
                    <h2 class="h5 font-weight-bold text-success mb-3"><i class="fa-solid fa-book-open me-2"></i>Argomenti Chapters & Pages</h2>
                    <ul class="list-unstyled mb-0">
                        @foreach($chapters as $c)
                            <li class="mb-2">
                                <strong>Capitolo {{ $c->chapter_number }}: {{ $c->name }}</strong>
                                @if($c->pages && count($c->pages) > 0)
                                    <ul class="mt-1 text-muted small">
                                        @foreach($c->pages as $p)
                                            <li><a href="{{ url('/?page='.$p->id) }}" class="text-decoration-none text-secondary">Pagina {{ $p->sort_order }}: {{ $p->title }}</a></li>
                                        @endforeach
                                    </ul>
                                @endif
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>

            <!-- Cartelli & Lecture Classes -->
            <div class="col-md-6">
                <div class="p-3 border rounded-3 mb-4" style="background-color: var(--bg-page);">
                    <h2 class="h5 font-weight-bold text-primary mb-3"><i class="fa-solid fa-traffic-light me-2"></i>Cartelli Categories</h2>
                    <ul class="list-unstyled mb-0">
                        @foreach($cartelliCats as $cc)
                            <li class="mb-1"><a href="{{ url('/?cartelli_cat='.$cc->id) }}" class="text-decoration-none text-secondary">{{ $cc->name }}</a></li>
                        @endforeach
                    </ul>
                </div>

                <div class="p-3 border rounded-3" style="background-color: var(--bg-page);">
                    <h2 class="h5 font-weight-bold text-warning mb-3"><i class="fa-solid fa-video me-2"></i>Lecture Classes</h2>
                    <ul class="list-unstyled mb-0">
                        @foreach($lectures as $l)
                            <li class="mb-1"><a href="{{ url('/?lecture='.$l->id) }}" class="text-decoration-none text-secondary">{{ $l->title }}</a></li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

@include('frontend.layouts.footer')
