<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$visitorsFile = __DIR__ . '/visitors.json';
$matchWindowHours = 48; // Time window for IP+fingerprint matching

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper: Find existing visitor by combined matching
function findExistingVisitor($visitors, $ip, $userAgent, $screenWidth, $screenHeight, $matchWindowHours) {
    $cutoffTime = strtotime("-{$matchWindowHours} hours");

    // Search from newest to oldest
    for ($i = count($visitors) - 1; $i >= 0; $i--) {
        $v = $visitors[$i];
        $visitTime = strtotime($v['timestamp'] ?? '1970-01-01');

        // Only check within time window
        if ($visitTime < $cutoffTime) {
            break; // Older entries won't match
        }

        // Combined matching: IP + user agent + screen size
        if (
            isset($v['visitorId']) &&
            $v['ip'] === $ip &&
            $v['userAgent'] === $userAgent &&
            $v['screenWidth'] === $screenWidth &&
            $v['screenHeight'] === $screenHeight
        ) {
            return $v['visitorId'];
        }
    }

    return null;
}

// POST - Log a new visitor
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $clientData = json_decode($input, true) ?: [];

    $visitors = [];
    if (file_exists($visitorsFile)) {
        $content = file_get_contents($visitorsFile);
        $visitors = json_decode($content, true) ?: [];
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $screenWidth = $clientData['screenWidth'] ?? null;
    $screenHeight = $clientData['screenHeight'] ?? null;

    // Determine visitor ID
    $visitorId = $clientData['visitorId'] ?? null;
    $isNewVisitor = false;

    if (!$visitorId) {
        // No localStorage ID - try combined matching
        $visitorId = findExistingVisitor($visitors, $ip, $userAgent, $screenWidth, $screenHeight, $matchWindowHours);

        if (!$visitorId) {
            // No match found - create new visitor ID
            $visitorId = uniqid('v_', true);
            $isNewVisitor = true;
        }
    }

    $visitor = [
        'id' => uniqid(),
        'visitorId' => $visitorId,
        'isNewVisitor' => $isNewVisitor,
        'timestamp' => date('Y-m-d H:i:s'),
        // Server-side data
        'ip' => $ip,
        'userAgent' => $userAgent,
        'referer' => $_SERVER['HTTP_REFERER'] ?? '',
        // Client-side data
        'screenWidth' => $screenWidth,
        'screenHeight' => $screenHeight,
        'viewportWidth' => $clientData['viewportWidth'] ?? null,
        'viewportHeight' => $clientData['viewportHeight'] ?? null,
        'pixelRatio' => $clientData['pixelRatio'] ?? null,
        'language' => $clientData['language'] ?? null,
        'timezone' => $clientData['timezone'] ?? null,
        'platform' => $clientData['platform'] ?? null,
        'touchSupport' => $clientData['touchSupport'] ?? null,
        'connectionType' => $clientData['connectionType'] ?? null,
    ];

    $visitors[] = $visitor;

    // Keep only last 1000 visits
    if (count($visitors) > 1000) {
        $visitors = array_slice($visitors, -1000);
    }

    file_put_contents($visitorsFile, json_encode($visitors, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'visitorId' => $visitorId, 'isNewVisitor' => $isNewVisitor]);
}

// GET - Return visitor data (for stats page)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($visitorsFile)) {
        echo file_get_contents($visitorsFile);
    } else {
        echo json_encode([]);
    }
}
?>
