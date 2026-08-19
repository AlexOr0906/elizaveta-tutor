<?php

declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

require_method('GET');
require_admin();

$pdo = database();
$payload = [
    'created_at' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
    'timezone' => 'Asia/Yekaterinburg',
    'slots' => $pdo->query('SELECT * FROM tutor_slots ORDER BY start_at')->fetchAll(),
    'bookings' => $pdo->query('SELECT * FROM tutor_bookings ORDER BY created_at')->fetchAll(),
];

try {
    $legacyExists = (bool) $pdo->query("SHOW TABLES LIKE 'tutor_applications'")->fetchColumn();
    if ($legacyExists) {
        $payload['legacy_applications'] = $pdo->query(
            'SELECT * FROM tutor_applications ORDER BY created_at'
        )->fetchAll();
    }
} catch (Throwable $error) {
    error_log('Legacy backup skipped: ' . $error->getMessage());
}

header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="elizaveta-backup-' . date('Y-m-d-His') . '.json"');
header('Cache-Control: no-store');
echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

