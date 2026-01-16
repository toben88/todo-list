<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$todosFile = __DIR__ . '/todos.json';

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($todosFile)) {
        $content = file_get_contents($todosFile);
        if ($content === false) {
            error_log("Error reading $todosFile");
            http_response_code(500);
            echo json_encode(['error' => 'Failed to read todos file']);
            exit;
        }
        
        // Parse JSON and ensure all IDs are strings
        $data = json_decode($content, true);
        if (isset($data['todos']) && is_array($data['todos'])) {
            foreach ($data['todos'] as &$todo) {
                if (isset($todo['id'])) {
                    $todo['id'] = (string)$todo['id']; // Ensure ID is a string
                }
            }
            echo json_encode($data);
        } else {
            echo $content;
        }
    } else {
        echo json_encode(['todos' => []]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Invalid JSON received: " . $input);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    if (!isset($data)) {
        error_log("No data received in POST request");
        http_response_code(400);
        echo json_encode(['error' => 'No data received']);
        exit;
    }
    
    // Ensure all IDs are strings before saving
    foreach ($data as &$todo) {
        if (isset($todo['id'])) {
            $todo['id'] = (string)$todo['id'];
        }
    }

    if (file_put_contents($todosFile, json_encode(['todos' => $data], JSON_PRETTY_PRINT)) === false) {
        error_log("Failed to write to $todosFile");
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save todos']);
        exit;
    }

    echo json_encode(['success' => true]);
}
?> 