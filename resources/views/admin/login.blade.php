<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $gSettings->app_name }} Admin Login</title>
    @if($gSettings->favicon)
        <link rel="icon" type="image/x-icon" href="{{ asset($gSettings->favicon) }}">
    @endif
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- FontAwesome Vector Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- External CSS Separated Asset -->
    <link rel="stylesheet" href="{{ asset('css/admin/login.css') }}">
</head>
<body>

    <div class="login-card">
        <span class="brand-logo">
            @if($gSettings->app_logo)
                <img src="{{ asset($gSettings->app_logo) }}" alt="{{ $gSettings->app_name }}" style="max-height: 48px; object-fit: contain; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;">
            @else
                <i class="fa-solid fa-graduation-cap"></i> {{ $gSettings->app_name }}
            @endif
        </span>

        <h2 class="login-title">Sign in to account</h2>
        <p class="login-subtitle">Enter your email & password to login</p>

        @if(session('error'))
            <div class="error-alert">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ session('error') }}</span>
            </div>
        @endif

        <form action="/admin/login" method="POST">
            @csrf
            
            <div class="form-group">
                <label class="form-label" for="email">Email Address</label>
                <div class="input-wrapper">
                    <i class="fa-regular fa-envelope"></i>
                    <input type="email" name="email" id="email" class="form-control" placeholder="admin@gmail.com" required autocomplete="email" autofocus>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Password</label>
                <div class="input-wrapper">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" name="password" id="password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
                </div>
            </div>

            <button type="submit" class="btn-submit">Sign In</button>
        </form>
    </div>

</body>
</html>
