// MBanglaPatente Admin Panel v2.2 (Modular Suite Aggregator)
// Sub-modules are modularized under public/js/admin/modules/

[
    '/js/admin/modules/core.js',
    '/js/admin/modules/argomenti.js',
    '/js/admin/modules/cartelli.js',
    '/js/admin/modules/manuales.js',
    '/js/admin/modules/dizionario.js',
    '/js/admin/modules/exams.js',
    '/js/admin/modules/chat.js',
    '/js/admin/modules/content.js',
    '/js/admin/modules/system.js'
].forEach(src => {
    if (!document.querySelector(`script[src*="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src;
        document.head.appendChild(s);
    }
});
