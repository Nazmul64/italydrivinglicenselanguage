<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Check what the /api/pages/{id} endpoint returns
    $controller = new App\Http\Controllers\Api\PageApiController();
    $page = App\Models\Page::has('questions')->first();
    echo "Page ID: " . $page->id . "\n";
    $request = Illuminate\Http\Request::create('/api/pages/' . $page->id, 'GET');
    $response = $controller->show($request, $page->id);
    $data = json_decode($response->getContent(), true);
    
    echo "Page image: " . ($data['image'] ?? 'none') . "\n";
    echo "Questions count: " . count($data['questions'] ?? []) . "\n";
    if (!empty($data['questions'])) {
        $q = $data['questions'][0];
        echo "First question keys: " . implode(', ', array_keys($q)) . "\n";
        echo "First question image: " . ($q['image'] ?? 'EMPTY') . "\n";
    }
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine();
}
