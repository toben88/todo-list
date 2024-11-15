<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$todosFile = 'todos.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($todosFile)) {
        echo file_get_contents($todosFile);
    } else {
        echo json_encode(['todos' => []]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    file_put_contents($todosFile, json_encode(['todos' => $data], JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
}
?> 