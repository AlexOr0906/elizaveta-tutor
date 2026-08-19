<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/_bootstrap.php';

function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $config = app_config();
    $admin = is_array($config['admin'] ?? null) ? $config['admin'] : [];
    $name = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($admin['session_name'] ?? 'elizaveta_admin'));
    session_name($name !== '' ? $name : 'elizaveta_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function admin_settings(): array
{
    $config = app_config();
    return is_array($config['admin'] ?? null) ? $config['admin'] : [];
}

function admin_is_configured(): bool
{
    $hash = trim((string) (admin_settings()['password_hash'] ?? ''));
    return $hash !== '' && strncmp($hash, 'CHANGE_ME_', 10) !== 0;
}

function admin_is_authenticated(): bool
{
    start_admin_session();
    return isset($_SESSION['admin_authenticated_at'])
        && (time() - (int) $_SESSION['admin_authenticated_at']) < 43200;
}

function admin_csrf_token(): string
{
    start_admin_session();
    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function require_admin(): void
{
    if (!admin_is_authenticated()) {
        json_response(401, ['ok' => false, 'message' => 'Требуется вход в админ-панель']);
    }
    $_SESSION['admin_authenticated_at'] = time();
}

function require_admin_mutation(): void
{
    require_admin();
    require_same_origin();
    $token = trim((string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));
    if ($token === '' || !hash_equals(admin_csrf_token(), $token)) {
        json_response(403, ['ok' => false, 'message' => 'Сессия устарела. Обновите страницу']);
    }
}

