<?php

declare(strict_types=1);

date_default_timezone_set('Asia/Yekaterinburg');

function json_response(int $status, array $payload): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function app_config(): array
{
    static $config;
    if (is_array($config)) {
        return $config;
    }

    $path = dirname(__DIR__) . '/.private/config.php';
    if (!is_file($path)) {
        json_response(503, ['ok' => false, 'message' => 'Сервис ещё настраивается']);
    }
    $loaded = require $path;
    if (!is_array($loaded)) {
        json_response(503, ['ok' => false, 'message' => 'Сервис ещё настраивается']);
    }
    $config = $loaded;
    return $config;
}

function database(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = app_config();
    $db = is_array($config['database'] ?? null) ? $config['database'] : [];
    if (strncmp((string) ($db['name'] ?? ''), 'CHANGE_ME_', 10) === 0) {
        json_response(503, ['ok' => false, 'message' => 'База данных ещё настраивается']);
    }

    $dsn = 'mysql:host=' . (string) ($db['host'] ?? 'localhost')
        . ';dbname=' . (string) ($db['name'] ?? '') . ';charset=utf8mb4';
    $pdo = new PDO($dsn, (string) ($db['user'] ?? ''), (string) ($db['password'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+05:00'");
    ensure_database_schema($pdo);
    return $pdo;
}

function ensure_database_schema(PDO $pdo): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS tutor_slots ('
        . 'id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,'
        . 'start_at DATETIME NOT NULL,'
        . 'end_at DATETIME NOT NULL,'
        . 'status VARCHAR(16) NOT NULL DEFAULT \'available\','
        . 'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,'
        . 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
        . 'UNIQUE KEY uq_slot_start (start_at),'
        . 'INDEX idx_slot_status_start (status, start_at)'
        . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS tutor_bookings ('
        . 'id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,'
        . 'slot_id BIGINT UNSIGNED NOT NULL,'
        . 'name VARCHAR(80) NOT NULL,'
        . 'phone VARCHAR(40) NULL,'
        . 'email VARCHAR(190) NULL,'
        . 'student_grade VARCHAR(20) NOT NULL,'
        . 'subject VARCHAR(30) NOT NULL,'
        . 'lesson_format VARCHAR(20) NOT NULL,'
        . 'goal TEXT NOT NULL,'
        . 'status VARCHAR(20) NOT NULL DEFAULT \'pending\','
        . 'admin_note TEXT NULL,'
        . 'consent_at DATETIME NOT NULL,'
        . 'ip_hash CHAR(64) NOT NULL,'
        . 'email_sent TINYINT(1) NOT NULL DEFAULT 0,'
        . 'notification_error VARCHAR(255) NULL,'
        . 'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,'
        . 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
        . 'INDEX idx_booking_slot (slot_id),'
        . 'INDEX idx_booking_status_created (status, created_at),'
        . 'INDEX idx_booking_ip_created (ip_hash, created_at),'
        . 'CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) REFERENCES tutor_slots(id)'
        . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS tutor_admin_login_attempts ('
        . 'id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,'
        . 'ip_hash CHAR(64) NOT NULL,'
        . 'succeeded TINYINT(1) NOT NULL DEFAULT 0,'
        . 'attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,'
        . 'INDEX idx_admin_attempt_ip_time (ip_hash, attempted_at)'
        . ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    seed_default_slots($pdo);
    $ready = true;
}

function seed_default_slots(PDO $pdo): void
{
    if ((int) $pdo->query('SELECT COUNT(*) FROM tutor_slots')->fetchColumn() > 0) {
        return;
    }

    $weekly = [
        1 => ['17:00', '18:00', '19:00', '20:00', '21:00'],
        2 => ['17:00', '18:00', '19:00', '20:00', '21:00'],
        3 => ['20:00'],
        4 => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
        5 => ['09:00'],
    ];
    $insert = $pdo->prepare(
        'INSERT IGNORE INTO tutor_slots (start_at, end_at, status) VALUES (:start_at, :end_at, \'available\')'
    );
    $day = new DateTimeImmutable('today');
    $lastDay = $day->modify('+41 days');
    while ($day <= $lastDay) {
        $weekday = (int) $day->format('N');
        foreach ($weekly[$weekday] ?? [] as $time) {
            $start = new DateTimeImmutable($day->format('Y-m-d') . ' ' . $time . ':00');
            if ($start <= new DateTimeImmutable()) {
                continue;
            }
            $insert->execute([
                'start_at' => $start->format('Y-m-d H:i:s'),
                'end_at' => $start->modify('+60 minutes')->format('Y-m-d H:i:s'),
            ]);
        }
        $day = $day->modify('+1 day');
    }
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $input = json_decode($raw !== false ? $raw : '', true);
    if (!is_array($input)) {
        json_response(400, ['ok' => false, 'message' => 'Некорректный формат данных']);
    }
    return $input;
}

function require_method(string ...$allowed): void
{
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        json_response(405, ['ok' => false, 'message' => 'Метод не поддерживается']);
    }
}

function require_same_origin(): void
{
    $requestHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return;
    }
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $requestHost = explode(':', $requestHost)[0];
    if ($originHost === '' || !hash_equals($requestHost, $originHost)) {
        json_response(403, ['ok' => false, 'message' => 'Недопустимый источник запроса']);
    }
}

function client_ip_hash(): string
{
    $config = app_config();
    return hash_hmac(
        'sha256',
        (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
        (string) ($config['app_secret'] ?? 'change-me')
    );
}

function app_text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function valid_date(string $value): bool
{
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    return $date instanceof DateTimeImmutable && $date->format('Y-m-d') === $value;
}

function valid_time(string $value): bool
{
    return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $value) === 1;
}
