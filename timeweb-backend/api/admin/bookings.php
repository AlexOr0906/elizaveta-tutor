<?php

declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

require_method('GET', 'POST');
require_admin();
$pdo = database();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $statement = $pdo->query(
        'SELECT b.id, b.slot_id, b.name, b.phone, b.email, b.student_grade, b.subject, '
        . 'b.lesson_format, b.goal, b.status, b.admin_note, b.email_sent, b.created_at, '
        . 'DATE_FORMAT(s.start_at, \'%Y-%m-%d\') AS slot_date, '
        . 'DATE_FORMAT(s.start_at, \'%H:%i\') AS slot_time '
        . 'FROM tutor_bookings b JOIN tutor_slots s ON s.id = b.slot_id '
        . 'ORDER BY FIELD(b.status, \'pending\', \'confirmed\', \'completed\', \'cancelled\', \'rejected\'), '
        . 's.start_at ASC, b.created_at DESC LIMIT 500'
    );
    json_response(200, ['ok' => true, 'bookings' => $statement->fetchAll()]);
}

require_admin_mutation();
$input = read_json_body();
$bookingId = (int) ($input['booking_id'] ?? 0);
$action = trim((string) ($input['action'] ?? ''));
$note = trim((string) ($input['admin_note'] ?? ''));
if ($bookingId < 1 || !in_array($action, ['confirm', 'reject', 'cancel', 'complete', 'note'], true)) {
    json_response(422, ['ok' => false, 'message' => 'Некорректное действие']);
}
if (app_text_length($note) > 2000) {
    json_response(422, ['ok' => false, 'message' => 'Заметка слишком длинная']);
}

$pdo->beginTransaction();
try {
    $statement = $pdo->prepare(
        'SELECT b.id, b.slot_id, b.status FROM tutor_bookings b WHERE b.id = :id FOR UPDATE'
    );
    $statement->execute(['id' => $bookingId]);
    $booking = $statement->fetch();
    if (!is_array($booking)) {
        $pdo->rollBack();
        json_response(404, ['ok' => false, 'message' => 'Заявка не найдена']);
    }

    $current = (string) $booking['status'];
    $next = $current;
    $slotStatus = null;
    if ($action === 'confirm' && $current === 'pending') {
        $next = 'confirmed';
        $slotStatus = 'booked';
    } elseif ($action === 'reject' && $current === 'pending') {
        $next = 'rejected';
        $slotStatus = 'available';
    } elseif ($action === 'cancel' && in_array($current, ['pending', 'confirmed'], true)) {
        $next = 'cancelled';
        $slotStatus = 'available';
    } elseif ($action === 'complete' && $current === 'confirmed') {
        $next = 'completed';
        $slotStatus = 'booked';
    } elseif ($action !== 'note') {
        $pdo->rollBack();
        json_response(409, ['ok' => false, 'message' => 'Для заявки с таким статусом действие недоступно']);
    }

    $update = $pdo->prepare(
        'UPDATE tutor_bookings SET status = :status, admin_note = :admin_note WHERE id = :id'
    );
    $update->execute([
        'status' => $next,
        'admin_note' => $note !== '' ? $note : null,
        'id' => $bookingId,
    ]);
    if ($slotStatus !== null) {
        $updateSlot = $pdo->prepare('UPDATE tutor_slots SET status = :status WHERE id = :id');
        $updateSlot->execute(['status' => $slotStatus, 'id' => (int) $booking['slot_id']]);
    }
    $pdo->commit();
    json_response(200, ['ok' => true, 'status' => $next]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    throw $error;
}
