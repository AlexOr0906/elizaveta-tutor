<?php

declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

require_method('POST');
require_admin_mutation();

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], '', (bool) $params['secure'], true);
}
session_destroy();
json_response(200, ['ok' => true]);

