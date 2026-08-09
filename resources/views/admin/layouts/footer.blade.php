@include('admin.layouts.footer_parts.modals')

<!-- Admin Modular JavaScript Assets -->
<script src="{{ asset('js/admin/modules/core.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/argomenti.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/cartelli.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/manuales.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/dizionario.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/exams.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/chat.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/content.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/admin/modules/system.js') }}?v={{ time() }}"></script>

@stack('scripts')
