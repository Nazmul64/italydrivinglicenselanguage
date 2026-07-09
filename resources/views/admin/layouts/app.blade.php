@include('admin.layouts.header')

@include('admin.layouts.sidebar')

<!-- 2. Main Wrapper -->
<div class="main-wrapper">
    
    @include('admin.layouts.navbar')

    <!-- 4. Content Body -->
    <div class="content-body">
        @yield('content')
    </div>

</div>

@include('admin.layouts.footer')
