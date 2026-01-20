<?php
$visitorsFile = __DIR__ . '/data/visitors.json';
$visitors = [];
if (file_exists($visitorsFile)) {
    $visitors = json_decode(file_get_contents($visitorsFile), true) ?: [];
}

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

// Group visitors by visitorId
$visitorGroups = [];
foreach ($visitors as $v) {
    $vid = $v['visitorId'] ?? 'unknown';
    if (!isset($visitorGroups[$vid])) {
        $visitorGroups[$vid] = [];
    }
    $visitorGroups[$vid][] = $v;
}

// Sort each group by timestamp (newest first) and get summary info
$uniqueVisitorsList = [];
foreach ($visitorGroups as $vid => $visits) {
    // Sort visits by timestamp descending
    usort($visits, fn($a, $b) => strtotime($b['timestamp'] ?? 0) - strtotime($a['timestamp'] ?? 0));

    $latestVisit = $visits[0];
    $firstVisit = $visits[count($visits) - 1];
    $parsed = parseUserAgent($latestVisit['userAgent'] ?? '');

    $uniqueVisitorsList[] = [
        'visitorId' => $vid,
        'visitCount' => count($visits),
        'lastVisit' => $latestVisit['timestamp'] ?? '-',
        'firstVisit' => $firstVisit['timestamp'] ?? '-',
        'browser' => $parsed['browser'],
        'os' => $parsed['os'],
        'device' => ($latestVisit['touchSupport'] ?? false) ? 'Mobile' : 'Desktop',
        'screen' => ($latestVisit['screenWidth'] && $latestVisit['screenHeight'])
            ? $latestVisit['screenWidth'] . 'x' . $latestVisit['screenHeight'] : '-',
        'ip' => $latestVisit['ip'] ?? '-',
        'visits' => $visits
    ];
}

// Sort by last visit (newest first)
usort($uniqueVisitorsList, fn($a, $b) => strtotime($b['lastVisit']) - strtotime($a['lastVisit']));

// Get stats summary
$totalVisits = count($visitors);
$uniqueIps = count(array_unique(array_column($visitors, 'ip')));
$uniqueVisitors = count($uniqueVisitorsList);
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
    <meta name="robots" content="noindex, nofollow">
    <title>Visitor Statistics</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .visitor-details { display: none; }
        .visitor-details.open { display: table-row; }
        .visitor-row { cursor: pointer; }
        .visitor-row:hover { background-color: #f3f4f6; }
        .chevron { transition: transform 0.2s; }
        .chevron.open { transform: rotate(90deg); }
    </style>
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

        <!-- Unique Visitors Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <h2 class="font-bold p-4 border-b">Unique Visitors (click to expand)</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-3 text-left w-8"></th>
                            <th class="p-3 text-left">Visitor ID</th>
                            <th class="p-3 text-left">Visits</th>
                            <th class="p-3 text-left">Last Visit</th>
                            <th class="p-3 text-left">Browser/OS</th>
                            <th class="p-3 text-left">Screen</th>
                            <th class="p-3 text-left">Device</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach (array_slice($uniqueVisitorsList, 0, 50) as $index => $visitor):
                            $visitorIdShort = substr($visitor['visitorId'], 0, 12) . '...';
                        ?>
                        <tr class="border-t visitor-row" onclick="toggleVisitor(<?= $index ?>)">
                            <td class="p-3">
                                <span class="chevron text-gray-400" id="chevron-<?= $index ?>">▶</span>
                            </td>
                            <td class="p-3 font-mono text-xs"><?= htmlspecialchars($visitorIdShort) ?></td>
                            <td class="p-3">
                                <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                    <?= $visitor['visitCount'] ?>
                                </span>
                            </td>
                            <td class="p-3"><?= htmlspecialchars($visitor['lastVisit']) ?></td>
                            <td class="p-3"><?= $visitor['browser'] ?> / <?= $visitor['os'] ?></td>
                            <td class="p-3"><?= $visitor['screen'] ?></td>
                            <td class="p-3">
                                <span class="px-2 py-1 rounded text-xs <?= $visitor['device'] === 'Mobile' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700' ?>">
                                    <?= $visitor['device'] ?>
                                </span>
                            </td>
                        </tr>
                        <tr class="visitor-details bg-gray-50" id="details-<?= $index ?>">
                            <td colspan="7" class="p-0">
                                <div class="p-4 border-l-4 border-blue-500 ml-4">
                                    <h4 class="font-semibold mb-2 text-gray-700">Visit History (<?= $visitor['visitCount'] ?> visits)</h4>
                                    <table class="w-full text-xs">
                                        <thead>
                                            <tr class="text-gray-500">
                                                <th class="p-2 text-left">Time</th>
                                                <th class="p-2 text-left">IP Address</th>
                                                <th class="p-2 text-left">Screen</th>
                                                <th class="p-2 text-left">Timezone</th>
                                                <th class="p-2 text-left">Language</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach (array_slice($visitor['visits'], 0, 20) as $visit):
                                                $vScreen = ($visit['screenWidth'] && $visit['screenHeight'])
                                                    ? $visit['screenWidth'] . 'x' . $visit['screenHeight'] : '-';
                                            ?>
                                            <tr class="border-t border-gray-200">
                                                <td class="p-2"><?= htmlspecialchars($visit['timestamp'] ?? '-') ?></td>
                                                <td class="p-2 font-mono"><?= htmlspecialchars($visit['ip'] ?? '-') ?></td>
                                                <td class="p-2"><?= $vScreen ?></td>
                                                <td class="p-2"><?= htmlspecialchars($visit['timezone'] ?? '-') ?></td>
                                                <td class="p-2"><?= htmlspecialchars($visit['language'] ?? '-') ?></td>
                                            </tr>
                                            <?php endforeach; ?>
                                            <?php if ($visitor['visitCount'] > 20): ?>
                                            <tr class="border-t border-gray-200">
                                                <td colspan="5" class="p-2 text-gray-500 italic">
                                                    ... and <?= $visitor['visitCount'] - 20 ?> more visits
                                                </td>
                                            </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>
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

    <script>
        function toggleVisitor(index) {
            const details = document.getElementById('details-' + index);
            const chevron = document.getElementById('chevron-' + index);
            details.classList.toggle('open');
            chevron.classList.toggle('open');
        }
    </script>
</body>
</html>
