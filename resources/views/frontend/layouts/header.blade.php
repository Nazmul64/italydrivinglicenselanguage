@php
    $seoData = $seo ?? \App\Services\SeoService::getSeoData();
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#3b82f6">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="{{ $gSettings->app_name ?? 'Italy Bangla Patente' }}">
    <link rel="manifest" href="{{ asset('manifest.json') }}">

    <!-- Dynamic Enterprise SEO Meta Tags -->
    <title>{{ $seoData->title }}</title>
    <meta name="description" content="{{ $seoData->description }}">
    <meta name="keywords" content="{{ $seoData->keywords }}">
    <meta name="robots" content="{{ $seoData->robots }}">
    <link rel="canonical" href="{{ $seoData->canonical }}">

    <!-- Hreflang Tags -->
    <link rel="alternate" hreflang="bn" href="{{ $seoData->canonical }}" />
    <link rel="alternate" hreflang="it" href="{{ $seoData->canonical }}" />
    <link rel="alternate" hreflang="x-default" href="{{ $seoData->canonical }}" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $seoData->og_url }}">
    <meta property="og:title" content="{{ $seoData->og_title }}">
    <meta property="og:description" content="{{ $seoData->og_description }}">
    <meta property="og:image" content="{{ $seoData->og_image }}">
    <meta property="og:site_name" content="{{ $gSettings->app_name ?? 'Italy Bangla Patente' }}">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seoData->twitter_title }}">
    <meta name="twitter:description" content="{{ $seoData->twitter_description }}">
    <meta name="twitter:image" content="{{ $seoData->twitter_image }}">

    <!-- JSON-LD Schemas -->
    @if(!empty($seoData->schemas))
        @foreach($seoData->schemas as $schemaItem)
            <script type="application/ld+json">
                {!! json_encode($schemaItem, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) !!}
            </script>
        @endforeach
    @endif

    <!-- Analytics & Verification Integrations -->
    @if(!empty($seoData->analytics->search_console))
        <meta name="google-site-verification" content="{{ $seoData->analytics->search_console }}" />
    @endif

    @if(!empty($seoData->analytics->ga4))
        <!-- Google Analytics 4 -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $seoData->analytics->ga4 }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $seoData->analytics->ga4 }}');
        </script>
    @endif

    @if(!empty($seoData->analytics->gtm))
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ $seoData->analytics->gtm }}');</script>
    @endif

    @if(!empty($seoData->analytics->fb_pixel))
        <!-- Meta Pixel Code -->
        <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '{{ $seoData->analytics->fb_pixel }}');
        fbq('track', 'PageView');
        </script>
    @endif

    @if($gSettings->favicon)
        <link rel="icon" type="image/x-icon" href="{{ asset($gSettings->favicon) }}">
    @endif
    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- External CSS Separated Asset -->
    <link rel="stylesheet" href="{{ asset('css/frontend/style.css') }}?v={{ time() }}">

    <!-- Dynamic Layout & Neumorphism Color Configuration from Admin Panel -->
    @php
        $primColor = $gSettings->primary_color ?? '#F4F7FA';
        $accColor  = $gSettings->accent_color ?? '#4CAF50';
        $txtColor  = $gSettings->text_color ?? '#1e293b';

        // Calculate Neumorphic dark and light shadows
        $hex = ltrim($primColor, '#');
        if (strlen($hex) == 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }
        $r = hexdec(strlen($hex) >= 2 ? substr($hex, 0, 2) : 'F4');
        $g = hexdec(strlen($hex) >= 4 ? substr($hex, 2, 2) : 'F7');
        $b = hexdec(strlen($hex) >= 6 ? substr($hex, 4, 2) : 'FA');

        // Dark shadow (14% darker)
        $dr = max(0, (int)($r * 0.86));
        $dg = max(0, (int)($g * 0.86));
        $db = max(0, (int)($b * 0.86));
        $darkShadow = sprintf("#%02x%02x%02x", $dr, $dg, $db);

        // Light shadow (15% lighter or max 255)
        $lr = min(255, (int)($r * 1.12) + 20);
        $lg = min(255, (int)($g * 1.12) + 20);
        $lb = min(255, (int)($b * 1.12) + 20);
        $lightShadow = sprintf("#%02x%02x%02x", $lr, $lg, $lb);
    @endphp
    <style id="dynamic-admin-layout-styles">
        :root {
            --home-desk-cols: {{ $gSettings->home_desktop_columns ?? 4 }};
            --home-tab-cols: {{ $gSettings->home_tablet_columns ?? 3 }};
            --home-mob-cols: {{ $gSettings->home_mobile_columns ?? 2 }};
            --home-card-w: {{ !empty($gSettings->home_card_width) ? (is_numeric($gSettings->home_card_width) ? $gSettings->home_card_width . 'px' : $gSettings->home_card_width) : '100%' }};
            --home-card-h: {{ !empty($gSettings->home_card_height) ? (is_numeric($gSettings->home_card_height) ? $gSettings->home_card_height . 'px' : $gSettings->home_card_height) : 'auto' }};
            --home-card-gap-px: {{ ($gSettings->home_card_gap ?? 24) . 'px' }};
            --schede-desk-cols: {{ $gSettings->schede_desktop_columns ?? 2 }};
            --schede-mob-cols: {{ $gSettings->schede_mobile_columns ?? 1 }};

            --home-icon-size-desk: {{ ($gSettings->icon_size_desktop ?? 90) . 'px' }};
            --home-icon-size-mob: {{ ($gSettings->icon_size_mobile ?? 60) . 'px' }};
            --home-title-size-desk: {{ ($gSettings->title_font_size_desktop ?? 16) . 'px' }};
            --home-title-size-mob: {{ ($gSettings->title_font_size_mobile ?? 14) . 'px' }};
            --home-subtitle-size-desk: {{ ($gSettings->subtitle_font_size_desktop ?? 12) . 'px' }};
            --home-subtitle-size-mob: {{ ($gSettings->subtitle_font_size_mobile ?? 11) . 'px' }};

            --cartelli-chap-title-desk: {{ ($gSettings->cartelli_chapter_title_font_desktop ?? 16) . 'px' }};
            --cartelli-chap-title-mob: {{ ($gSettings->cartelli_chapter_title_font_mobile ?? 14) . 'px' }};
            --cartelli-chap-img-desk: {{ ($gSettings->cartelli_chapter_image_size_desktop ?? 120) . 'px' }};
            --cartelli-chap-img-mob: {{ ($gSettings->cartelli_chapter_image_size_mobile ?? 80) . 'px' }};
            --cartelli-chap-img-w-desk: {{ !empty($gSettings->cartelli_chapter_image_width_desktop) ? (is_numeric($gSettings->cartelli_chapter_image_width_desktop) ? $gSettings->cartelli_chapter_image_width_desktop . 'px' : $gSettings->cartelli_chapter_image_width_desktop) : 'auto' }};
            --cartelli-chap-img-w-mob: {{ !empty($gSettings->cartelli_chapter_image_width_mobile) ? (is_numeric($gSettings->cartelli_chapter_image_width_mobile) ? $gSettings->cartelli_chapter_image_width_mobile . 'px' : $gSettings->cartelli_chapter_image_width_mobile) : 'auto' }};

            --cartelli-page-title-desk: {{ ($gSettings->cartelli_page_title_font_desktop ?? 15) . 'px' }};
            --cartelli-page-title-mob: {{ ($gSettings->cartelli_page_title_font_mobile ?? 13) . 'px' }};
            --cartelli-page-img-desk: {{ ($gSettings->cartelli_page_image_size_desktop ?? 120) . 'px' }};
            --cartelli-page-img-mob: {{ ($gSettings->cartelli_page_image_size_mobile ?? 80) . 'px' }};
            --cartelli-page-img-w-desk: {{ !empty($gSettings->cartelli_page_image_width_desktop) ? (is_numeric($gSettings->cartelli_page_image_width_desktop) ? $gSettings->cartelli_page_image_width_desktop . 'px' : $gSettings->cartelli_page_image_width_desktop) : 'auto' }};
            --cartelli-page-img-w-mob: {{ !empty($gSettings->cartelli_page_image_width_mobile) ? (is_numeric($gSettings->cartelli_page_image_width_mobile) ? $gSettings->cartelli_page_image_width_mobile . 'px' : $gSettings->cartelli_page_image_width_mobile) : 'auto' }};

            --argomenti-chap-title-desk: {{ ($gSettings->argomenti_chapter_title_font_desktop ?? 16) . 'px' }};
            --argomenti-chap-title-mob: {{ ($gSettings->argomenti_chapter_title_font_mobile ?? 14) . 'px' }};
            --argomenti-chap-img-desk: {{ ($gSettings->argomenti_chapter_image_size_desktop ?? 120) . 'px' }};
            --argomenti-chap-img-mob: {{ ($gSettings->argomenti_chapter_image_size_mobile ?? 80) . 'px' }};
            --argomenti-chap-img-w-desk: {{ !empty($gSettings->argomenti_chapter_image_width_desktop) ? (is_numeric($gSettings->argomenti_chapter_image_width_desktop) ? $gSettings->argomenti_chapter_image_width_desktop . 'px' : $gSettings->argomenti_chapter_image_width_desktop) : 'auto' }};
            --argomenti-chap-img-w-mob: {{ !empty($gSettings->argomenti_chapter_image_width_mobile) ? (is_numeric($gSettings->argomenti_chapter_image_width_mobile) ? $gSettings->argomenti_chapter_image_width_mobile . 'px' : $gSettings->argomenti_chapter_image_width_mobile) : 'auto' }};

            --argomenti-page-title-desk: {{ ($gSettings->argomenti_page_title_font_desktop ?? 15) . 'px' }};
            --argomenti-page-title-mob: {{ ($gSettings->argomenti_page_title_font_mobile ?? 13) . 'px' }};
            --argomenti-page-img-desk: {{ ($gSettings->argomenti_page_image_size_desktop ?? 120) . 'px' }};
            --argomenti-page-img-mob: {{ ($gSettings->argomenti_page_image_size_mobile ?? 80) . 'px' }};
            --argomenti-page-img-w-desk: {{ !empty($gSettings->argomenti_page_image_width_desktop) ? (is_numeric($gSettings->argomenti_page_image_width_desktop) ? $gSettings->argomenti_page_image_width_desktop . 'px' : $gSettings->argomenti_page_image_width_desktop) : 'auto' }};
            --argomenti-page-img-w-mob: {{ !empty($gSettings->argomenti_page_image_width_mobile) ? (is_numeric($gSettings->argomenti_page_image_width_mobile) ? $gSettings->argomenti_page_image_width_mobile . 'px' : $gSettings->argomenti_page_image_width_mobile) : 'auto' }};

            --argomenti-q-text-desk: {{ ($gSettings->argomenti_question_text_font_desktop ?? 18) . 'px' }};
            --argomenti-q-text-mob: {{ ($gSettings->argomenti_question_text_font_mobile ?? 16) . 'px' }};
            --argomenti-q-img-size-desk: {{ ($gSettings->argomenti_question_image_size_desktop ?? 110) . 'px' }};
            --argomenti-q-img-size-mob: {{ ($gSettings->argomenti_question_image_size_mobile ?? 85) . 'px' }};

            --mcq-num-font-desk: {{ ($gSettings->mcq_number_font_desktop ?? 16) . 'px' }};
            --mcq-num-font-mob: {{ ($gSettings->mcq_number_font_mobile ?? 14) . 'px' }};
            --schede-stat-font-desk: {{ ($gSettings->schede_stat_font_desktop ?? 13) . 'px' }};
            --schede-stat-font-mob: {{ ($gSettings->schede_stat_font_mobile ?? 11) . 'px' }};

            --custom-bg-card: {{ $primColor }};
            --custom-accent: {{ $accColor }};
            --custom-text: {{ $txtColor }};
            --custom-shadow-dark: {{ $darkShadow }};
            --custom-shadow-light: {{ $lightShadow }};
        }

        .nav-card,
        .content-card,
        .chapter-image-card {
            background-color: var(--custom-bg-card) !important;
            box-shadow: 8px 8px 18px var(--custom-shadow-dark), -8px -8px 18px var(--custom-shadow-light) !important;
        }

        .nav-card:hover,
        .content-card:hover,
        .chapter-image-card:hover {
            box-shadow: 12px 12px 26px var(--custom-shadow-dark), -12px -12px 26px var(--custom-shadow-light) !important;
        }

        .nav-card .illustration-box,
        .nav-card .fallback-icon-box {
            width: var(--home-icon-size-desk) !important;
            height: var(--home-icon-size-desk) !important;
        }

        .nav-card .card-title {
            font-size: var(--home-title-size-desk) !important;
            color: var(--custom-text, var(--text-primary));
        }

        .nav-card .card-subtitle {
            font-size: var(--home-subtitle-size-desk) !important;
        }

        .chapter-image-card h3,
        .chapter-image-card .card-title,
        .chapter-card-header h3,
        #screen-cartelli-schede .chapter-selector-trigger,
        #screen-cartelli-schede #cartelli-schede-chapter-label,
        #screen-cartelli-page #cartelli-page-chapter-label,
        #cartelli-page-chapter-label {
            font-size: var(--cartelli-chap-title-desk) !important;
        }

        .content-card h4,
        .content-card .card-title,
        .schede-page-title,
        #screen-cartelli-schede .schede-page-title,
        #screen-cartelli-page #cartelli-page-label,
        #cartelli-page-label {
            font-size: var(--cartelli-page-title-desk) !important;
        }

        #screen-cartelli .chapter-image-card img,
        #screen-cartelli .chapter-card-img {
            max-height: var(--cartelli-chap-img-desk) !important;
            height: var(--cartelli-chap-img-desk) !important;
            width: var(--cartelli-chap-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-cartelli-schede .content-card img,
        #screen-cartelli-schede .schede-page-img {
            max-height: var(--cartelli-page-img-desk) !important;
            height: var(--cartelli-page-img-desk) !important;
            width: var(--cartelli-page-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-argomenti .chapter-image-card h3,
        #screen-argomenti .chapter-card-header h3,
        #screen-argomenti-schede .chapter-selector-trigger,
        #screen-argomenti-schede #argomenti-schede-chapter-label,
        #screen-page-details #page-details-chapter-label,
        #page-details-chapter-label {
            font-size: var(--argomenti-chap-title-desk) !important;
        }

        #screen-argomenti .chapter-image-card img,
        #screen-argomenti .chapter-card-img {
            max-height: var(--argomenti-chap-img-desk) !important;
            height: var(--argomenti-chap-img-desk) !important;
            width: var(--argomenti-chap-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-argomenti-schede .content-card h4,
        #screen-argomenti-schede .schede-page-title,
        #screen-page-details #page-details-page-label,
        #page-details-page-label {
            font-size: var(--argomenti-page-title-desk) !important;
        }

        #screen-argomenti-schede .content-card img,
        #screen-argomenti-schede .schede-page-img {
            max-height: var(--argomenti-page-img-desk) !important;
            height: var(--argomenti-page-img-desk) !important;
            width: var(--argomenti-page-img-w-desk) !important;
            object-fit: contain !important;
        }

        #screen-argomenti-questions .question-text-box,
        #screen-argomenti-questions .question-italian-text,
        .detail-q-text-it {
            font-size: var(--argomenti-q-text-desk) !important;
        }

        #screen-argomenti-questions .question-image-box img,
        .detail-q-img {
            max-height: var(--argomenti-q-img-size-desk) !important;
            height: var(--argomenti-q-img-size-desk) !important;
            width: var(--argomenti-q-img-size-desk) !important;
            min-width: var(--argomenti-q-img-size-desk) !important;
            max-width: var(--argomenti-q-img-size-desk) !important;
            object-fit: contain !important;
        }

        .detail-q-num {
            font-size: var(--mcq-num-font-desk) !important;
        }

        .schede-stat-item,
        .schede-card-footer span,
        .schede-card-footer div,
        .stat-badge {
            font-size: var(--schede-stat-font-desk) !important;
        }

        .services-grid {
            display: grid !important;
            grid-template-columns: repeat(var(--home-desk-cols), 1fr) !important;
            gap: var(--home-card-gap-px) !important;
            width: 100% !important;
        }

        .services-grid .nav-card {
            width: var(--home-card-w) !important;
            min-height: var(--home-card-h) !important;
            box-sizing: border-box !important;
        }

        .argomenti-grid,
        .argomenti-schede-grid {
            display: grid !important;
            grid-template-columns: repeat(var(--schede-desk-cols), 1fr) !important;
            gap: 16px !important;
            width: 100% !important;
        }

        @media (max-width: 1024px) {
            .services-grid {
                grid-template-columns: repeat(var(--home-tab-cols), 1fr) !important;
            }
        }

        @media (max-width: 640px) {
            .services-grid {
                grid-template-columns: repeat(var(--home-mob-cols), 1fr) !important;
            }
            .argomenti-grid,
            .argomenti-schede-grid {
                grid-template-columns: repeat(var(--schede-mob-cols), 1fr) !important;
            }

            .nav-card .illustration-box,
            .nav-card .fallback-icon-box {
                width: var(--home-icon-size-mob) !important;
                height: var(--home-icon-size-mob) !important;
            }

            .nav-card .card-title {
                font-size: var(--home-title-size-mob) !important;
            }

            .nav-card .card-subtitle {
                font-size: var(--home-subtitle-size-mob) !important;
            }

            .chapter-image-card h3,
            .chapter-image-card .card-title,
            .chapter-card-header h3,
            #screen-cartelli-schede .chapter-selector-trigger,
            #screen-cartelli-schede #cartelli-schede-chapter-label,
            #screen-cartelli-page #cartelli-page-chapter-label,
            #cartelli-page-chapter-label {
                font-size: var(--cartelli-chap-title-mob) !important;
            }

            .content-card h4,
            .content-card .card-title,
            .schede-page-title,
            #screen-cartelli-schede .schede-page-title,
            #screen-cartelli-page #cartelli-page-label,
            #cartelli-page-label {
                font-size: var(--cartelli-page-title-mob) !important;
            }

            #screen-cartelli .chapter-image-card img,
            #screen-cartelli .chapter-card-img {
                max-height: var(--cartelli-chap-img-mob) !important;
                height: var(--cartelli-chap-img-mob) !important;
                width: var(--cartelli-chap-img-w-mob) !important;
            }

            #screen-cartelli-schede .content-card img,
            #screen-cartelli-schede .schede-page-img {
                max-height: var(--cartelli-page-img-mob) !important;
                height: var(--cartelli-page-img-mob) !important;
                width: var(--cartelli-page-img-w-mob) !important;
            }

            #screen-argomenti .chapter-image-card h3,
            #screen-argomenti .chapter-card-header h3,
            #screen-argomenti-schede .chapter-selector-trigger,
            #screen-argomenti-schede #argomenti-schede-chapter-label,
            #screen-page-details #page-details-chapter-label,
            #page-details-chapter-label {
                font-size: var(--argomenti-chap-title-mob) !important;
            }

            #screen-argomenti .chapter-image-card img,
            #screen-argomenti .chapter-card-img {
                max-height: var(--argomenti-chap-img-mob) !important;
                height: var(--argomenti-chap-img-mob) !important;
                width: var(--argomenti-chap-img-w-mob) !important;
            }

            #screen-argomenti-schede .content-card h4,
            #screen-argomenti-schede .schede-page-title,
            #screen-page-details #page-details-page-label,
            #page-details-page-label {
                font-size: var(--argomenti-page-title-mob) !important;
            }

            #screen-argomenti-schede .content-card img,
            #screen-argomenti-schede .schede-page-img {
                max-height: var(--argomenti-page-img-mob) !important;
                height: var(--argomenti-page-img-mob) !important;
                width: var(--argomenti-page-img-w-mob) !important;
            }

            #screen-argomenti-questions .question-text-box,
            #screen-argomenti-questions .question-italian-text,
            .detail-q-text-it {
                font-size: var(--argomenti-q-text-mob) !important;
            }

            #screen-argomenti-questions .question-image-box img,
            .detail-q-img {
                max-height: var(--argomenti-q-img-size-mob) !important;
                height: var(--argomenti-q-img-size-mob) !important;
                width: var(--argomenti-q-img-size-mob) !important;
                min-width: var(--argomenti-q-img-size-mob) !important;
                max-width: var(--argomenti-q-img-size-mob) !important;
                object-fit: contain !important;
            }

            .detail-q-num {
                font-size: var(--mcq-num-font-mob) !important;
            }

            .schede-stat-item,
            .schede-card-footer span,
            .schede-card-footer div,
            .stat-badge {
                font-size: var(--schede-stat-font-mob) !important;
            }
        }
    </style>
</head>
<body>
