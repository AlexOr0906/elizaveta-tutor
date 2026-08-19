<?php

declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

require_method('POST');
require_same_origin();

if (!admin_is_configured()) {
    json_response(503, ['ok' => false, 'message' => 'Пароль администратора ещё не настроен']);
}

$input = read_json_body();
$username = trim((string) ($input['username'] ?? ''));
$password = (string) ($input['password'] ?? '');
$settings = admin_settings();
$expectedUsername = trim((string) ($settings['username'] ?? 'elizaveta'));
$passwordHash = (string) ($settings['password_hash'] ?? '');
$ipHash = client_ip_hash();
$pdo = database();

$attempts = $pdo->prepare(
    'SELECT COUNT(*) FROM tutor_admin_login_attempts '
    . 'WHERE ip_hash = :ip_hash AND succeeded = 0 AND attempted_at >= (NOW() - INTERVAL 15 MINUTE)'
);
$attempts->execute(['ip_hash' => $ipHash]);
if ((int) $attempts->fetchColumn() >= 5) {
    json_response(429, ['ok' => false, 'message' => 'Слишком много попыток. Попробуйте через 15 минут']);
}

$valid = $username !== ''
    && hash_equals($expectedUsername, $username)
    && password_verify($password, $passwordHash);
$record = $pdo->prepare(
    'INSERT INTO tutor_admin_login_attempts (ip_hash, succeeded) VALUES (:ip_hash, :succeeded)'
);
$record->execute(['ip_hash' => $ipHash, 'succeeded' => $valid ? 1 : 0]);
if (!$valid) {
    usleep(350000);
    json_response(401, ['ok' => false, 'message' => 'Неверный логин или пароль']);
}

start_admin_session();
session_regenerate_id(true);
$_SESSION['admin_authenticated_at'] = time();
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
json_response(200, [
    'ok' => true,
    'authenticated' => true,
    'csrf_token' => $_SESSION['csrf_token'],
]);

