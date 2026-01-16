<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$settingsFile = __DIR__ . '/settings.json';

// Default settings
$defaults = [
    'title' => "TODAY'S TASKS",
    'accentColor' => '#2563EB'
];

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($settingsFile)) {
        $content = file_get_contents($settingsFile);
        if ($content !== false) {
            echo $content;
            exit;
        }
    }
    // Return defaults if file doesn't exist or can't be read
    echo json_encode($defaults);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    // Merge with defaults to ensure all fields exist
    $settings = array_merge($defaults, $data);

    // Only keep valid settings keys
    $validSettings = [
        'title' => $settings['title'] ?? $defaults['title'],
        'accentColor' => $settings['accentColor'] ?? $defaults['accentColor']
    ];

    if (file_put_contents($settingsFile, json_encode($validSettings, JSON_PRETTY_PRINT)) === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save settings']);
        exit;
    }

    echo json_encode(['success' => true, 'settings' => $validSettings]);
}
?>
