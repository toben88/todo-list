<?php
$visitorsFile = __DIR__ . '/data/visitors.json';
$visitors = [];
if (file_exists($visitorsFile)) {
    $visitors = json_decode(file_get_contents($visitorsFile), true) ?: [];
}

// Reverse to show newest first
$visitors = array_reverse($visitors);

// Parse user agent to get browser/OS info
function parseUserAgent($ua) {
    $browser = 'Unknown';
    $os = 'Unknown';

    // Browser detection
    if (preg_match('/Firefox/i', $ua)) $browser = 'Firefox';
    elseif (preg_match('/Edg/i', $ua)) $browser = 'Edge';
    elseif (preg_match('/Chrome/i', $ua)) $browser = 'Chrome';
    elseif (preg_match('/Safari/i', $ua)) $browser = 'Safari';
    elseif (preg_match('/Opera|OPR/i', $ua)) $browser = 'Opera';
    elseif (preg_match('/MSIE|Trident/i', $ua)) $browser = 'IE';

    // OS detection
    if (preg_match('/Windows/i', $ua)) $os = 'Windows';
    elseif (preg_match('/Mac/i', $ua)) $os = 'macOS';
    elseif (preg_match('/Linux/i', $ua)) $os = 'Linux';
    elseif (preg_match('/Android/i', $ua)) $os = 'Android';
    elseif (preg_match('/iPhone|iPad/i', $ua)) $os = 'iOS';

    return ['browser' => $browser, 'os' => $os];
}

// Get stats summary
$totalVisits = count($visitors);
$uniqueIps = count(array_unique(array_column($visitors, 'ip')));
$uniqueVisitors = count(array_unique(array_filter(array_column($visitors, 'visitorId'))));
$newVisitorCount = count(array_filter($visitors, fn($v) => $v['isNewVisitor'] ?? false));
$mobileCount = 0;
$browserCounts = [];
$osCounts = [];

foreach ($visitors as $v) {
    $parsed = parseUserAgent($v['userAgent'] ?? '');
    $browserCounts[$parsed['browser']] = ($browserCounts[$parsed['browser']] ?? 0) + 1;
    $osCounts[$parsed['os']] = ($osCounts[$parsed['os']] ?? 0) + 1;
    if ($v['touchSupport'] ?? false) $mobileCount++;
}
arsort($browserCounts);
arsort($osCounts);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visitor Statistics</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-6">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Visitor Statistics</h1>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="text-2xl font-bold text-blue-600"><?= $totalVisits ?></div>
                <div class="text-gray-500 text-sm">Total Visits</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="text-2xl font-bold text-green-600"><?= $uniqueVisitors ?></div>
                <div class="text-gray-500 text-sm">Unique Visitors</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="text-2xl font-bold text-cyan-600"><?= $uniqueIps ?></div>
                <div class="text-gray-500 text-sm">Unique IPs</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="text-2xl font-bold text-purple-600"><?= $mobileCount ?></div>
                <div class="text-gray-500 text-sm">Mobile Visits</div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="text-2xl font-bold text-orange-600"><?= $totalVisits - $mobileCount ?></div>
                <div class="text-gray-500 text-sm">Desktop Visits</div>
            </div>
        </div>

        <!-- Browser & OS Stats -->
        <div class="grid md:grid-cols-2 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow">
                <h2 class="font-bold mb-3">Browsers</h2>
                <?php foreach ($browserCounts as $browser => $count): ?>
                <div class="flex justify-between py-1">
                    <span><?= htmlspecialchars($browser) ?></span>
                    <span class="text-gray-500"><?= $count ?></span>
                </div>
                <?php endforeach; ?>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <h2 class="font-bold mb-3">Operating Systems</h2>
                <?php foreach ($osCounts as $os => $count): ?>
                <div class="flex justify-between py-1">
                    <span><?= htmlspecialchars($os) ?></span>
                    <span class="text-gray-500"><?= $count ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Visitor Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <h2 class="font-bold p-4 border-b">Recent Visitors</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-3 text-left">Time</th>
                            <th class="p-3 text-left">Visitor ID</th>
                            <th class="p-3 text-left">IP</th>
                            <th class="p-3 text-left">Browser/OS</th>
                            <th class="p-3 text-left">Screen</th>
                            <th class="p-3 text-left">Device</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach (array_slice($visitors, 0, 50) as $v):
                            $parsed = parseUserAgent($v['userAgent'] ?? '');
                            $screen = ($v['screenWidth'] && $v['screenHeight'])
                                ? $v['screenWidth'] . 'x' . $v['screenHeight']
                                : '-';
                            $device = ($v['touchSupport'] ?? false) ? 'Mobile' : 'Desktop';
                            $visitorIdShort = isset($v['visitorId']) ? substr($v['visitorId'], 0, 12) . '...' : '-';
                            $isNew = $v['isNewVisitor'] ?? false;
                        ?>
                        <tr class="border-t hover:bg-gray-50">
                            <td class="p-3"><?= htmlspecialchars($v['timestamp'] ?? '-') ?></td>
                            <td class="p-3 font-mono text-xs">
                                <?= htmlspecialchars($visitorIdShort) ?>
                                <?php if ($isNew): ?>
                                <span class="ml-1 px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">NEW</span>
                                <?php endif; ?>
                            </td>
                            <td class="p-3 font-mono text-xs"><?= htmlspecialchars($v['ip'] ?? '-') ?></td>
                            <td class="p-3"><?= $parsed['browser'] ?> / <?= $parsed['os'] ?></td>
                            <td class="p-3"><?= $screen ?></td>
                            <td class="p-3">
                                <span class="px-2 py-1 rounded text-xs <?= $device === 'Mobile' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700' ?>">
                                    <?= $device ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <p class="text-gray-400 text-sm mt-4 text-center">
            <a href="./" class="hover:underline">&larr; Back to Todo List</a>
        </p>
    </div>
</body>
</html>
