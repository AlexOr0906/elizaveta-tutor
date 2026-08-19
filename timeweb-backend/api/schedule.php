<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_method('GET');

try {
    $pdo = database();
    $statement = $pdo->query(
        'SELECT id, DATE_FORMAT(start_at, \'%Y-%m-%d\') AS slot_date, '
        . 'DATE_FORMAT(start_at, \'%H:%i\') AS slot_time '
        . 'FROM tutor_slots '
        . 'WHERE status = \'available\' AND start_at > NOW() '
        . 'AND start_at < DATE_ADD(NOW(), INTERVAL 60 DAY) '
        . 'ORDER BY start_at ASC'
    );
    json_response(200, [
        'ok' => true,
        'timezone' => 'Asia/Yekaterinburg',
        'slots' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    error_log('Schedule API error: ' . $error->getMessage());
    json_response(500, ['ok' => false, 'message' => 'Не удалось загрузить расписание']);
}

