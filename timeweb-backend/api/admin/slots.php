<?php

declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

require_method('GET', 'POST');
require_admin();
$pdo = database();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $statement = $pdo->query(
        'SELECT s.id, DATE_FORMAT(s.start_at, \'%Y-%m-%d\') AS slot_date, '
        . 'DATE_FORMAT(s.start_at, \'%H:%i\') AS slot_time, s.status, '
        . 'b.id AS booking_id, b.name AS booking_name '
        . 'FROM tutor_slots s '
        . 'LEFT JOIN tutor_bookings b ON b.slot_id = s.id '
        . 'AND b.status IN (\'pending\', \'confirmed\') '
        . 'WHERE s.start_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) '
        . 'AND s.start_at < DATE_ADD(CURDATE(), INTERVAL 120 DAY) '
        . 'ORDER BY s.start_at ASC'
    );
    json_response(200, ['ok' => true, 'slots' => $statement->fetchAll()]);
}

require_admin_mutation();
$input = read_json_body();
$action = trim((string) ($input['action'] ?? ''));

if ($action === 'create') {
    $date = trim((string) ($input['date'] ?? ''));
    $time = trim((string) ($input['time'] ?? ''));
    if (!valid_date($date) || !valid_time($time)) {
        json_response(422, ['ok' => false, 'message' => 'Проверьте дату и время']);
    }
    $start = new DateTimeImmutable($date . ' ' . $time . ':00');
    if ($start <= new DateTimeImmutable()) {
        json_response(422, ['ok' => false, 'message' => 'Нельзя добавить прошедшее время']);
    }
    try {
        $statement = $pdo->prepare(
            'INSERT INTO tutor_slots (start_at, end_at, status) VALUES (:start_at, :end_at, \'available\')'
        );
        $statement->execute([
            'start_at' => $start->format('Y-m-d H:i:s'),
            'end_at' => $start->modify('+60 minutes')->format('Y-m-d H:i:s'),
        ]);
    } catch (PDOException $error) {
        if ((string) $error->getCode() === '23000') {
            json_response(409, ['ok' => false, 'message' => 'Такое окно уже существует']);
        }
        throw $error;
    }
    json_response(201, ['ok' => true, 'slot_id' => (int) $pdo->lastInsertId()]);
}

if ($action === 'generate') {
    $from = trim((string) ($input['from_date'] ?? ''));
    $to = trim((string) ($input['to_date'] ?? ''));
    $weekdays = array_values(array_unique(array_map('intval', (array) ($input['weekdays'] ?? []))));
    $times = array_values(array_unique(array_map(
        static fn($value): string => trim((string) $value),
        (array) ($input['times'] ?? [])
    )));
    if (!valid_date($from) || !valid_date($to) || $weekdays === [] || $times === []) {
        json_response(422, ['ok' => false, 'message' => 'Заполните период, дни недели и время']);
    }
    foreach ($weekdays as $weekday) {
        if ($weekday < 1 || $weekday > 7) {
            json_response(422, ['ok' => false, 'message' => 'Проверьте дни недели']);
        }
    }
    foreach ($times as $time) {
        if (!valid_time($time)) {
            json_response(422, ['ok' => false, 'message' => 'Время указывается в формате 17:00']);
        }
    }
    $day = new DateTimeImmutable($from);
    $lastDay = new DateTimeImmutable($to);
    if ($lastDay < $day || $lastDay > $day->modify('+90 days')) {
        json_response(422, ['ok' => false, 'message' => 'Период должен быть не больше 90 дней']);
    }
    $insert = $pdo->prepare(
        'INSERT IGNORE INTO tutor_slots (start_at, end_at, status) VALUES (:start_at, :end_at, \'available\')'
    );
    $created = 0;
    $pdo->beginTransaction();
    while ($day <= $lastDay) {
        if (in_array((int) $day->format('N'), $weekdays, true)) {
            foreach ($times as $time) {
                $start = new DateTimeImmutable($day->format('Y-m-d') . ' ' . $time . ':00');
                if ($start > new DateTimeImmutable()) {
                    $insert->execute([
                        'start_at' => $start->format('Y-m-d H:i:s'),
                        'end_at' => $start->modify('+60 minutes')->format('Y-m-d H:i:s'),
                    ]);
                    $created += $insert->rowCount();
                }
            }
        }
        $day = $day->modify('+1 day');
    }
    $pdo->commit();
    json_response(201, ['ok' => true, 'created' => $created]);
}

if ($action === 'set_status') {
    $slotId = (int) ($input['slot_id'] ?? 0);
    $status = trim((string) ($input['status'] ?? ''));
    if ($slotId < 1 || !in_array($status, ['available', 'blocked'], true)) {
        json_response(422, ['ok' => false, 'message' => 'Некорректное изменение окна']);
    }
    $statement = $pdo->prepare(
        'UPDATE tutor_slots SET status = :status '
        . 'WHERE id = :id AND status IN (\'available\', \'blocked\')'
    );
    $statement->execute(['status' => $status, 'id' => $slotId]);
    if ($statement->rowCount() === 0) {
        json_response(409, ['ok' => false, 'message' => 'Окно уже связано с заявкой']);
    }
    json_response(200, ['ok' => true]);
}

json_response(422, ['ok' => false, 'message' => 'Неизвестное действие']);

