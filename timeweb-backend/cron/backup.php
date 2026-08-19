<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once dirname(__DIR__) . '/api/_bootstrap.php';

try {
    $pdo = database();
    $privateDir = dirname(__DIR__) . '/.private';
    $backupDir = $privateDir . '/backups';
    if (!is_dir($backupDir) && !mkdir($backupDir, 0700, true) && !is_dir($backupDir)) {
        throw new RuntimeException('Cannot create backup directory');
    }

    $payload = [
        'created_at' => (new DateTimeImmutable())->format(DateTimeInterface::ATOM),
        'timezone' => 'Asia/Yekaterinburg',
        'slots' => $pdo->query('SELECT * FROM tutor_slots ORDER BY start_at')->fetchAll(),
        'bookings' => $pdo->query('SELECT * FROM tutor_bookings ORDER BY created_at')->fetchAll(),
    ];
    $legacyExists = (bool) $pdo->query("SHOW TABLES LIKE 'tutor_applications'")->fetchColumn();
    if ($legacyExists) {
        $payload['legacy_applications'] = $pdo->query(
            'SELECT * FROM tutor_applications ORDER BY created_at'
        )->fetchAll();
    }

    $filename = $backupDir . '/backup-' . date('Y-m-d-His') . '.json';
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($filename, $json, LOCK_EX) === false) {
        throw new RuntimeException('Cannot write backup');
    }
    chmod($filename, 0600);

    foreach (glob($backupDir . '/backup-*.json') ?: [] as $oldBackup) {
        if (is_file($oldBackup) && filemtime($oldBackup) < time() - 30 * 86400) {
            unlink($oldBackup);
        }
    }
    fwrite(STDOUT, basename($filename) . PHP_EOL);
} catch (Throwable $error) {
    fwrite(STDERR, 'Backup failed: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}

