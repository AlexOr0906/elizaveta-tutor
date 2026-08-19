<?php

declare(strict_types=1);

require_once __DIR__ . '/_auth.php';

require_method('GET');

$authenticated = admin_is_authenticated();
json_response(200, [
    'ok' => true,
    'configured' => admin_is_configured(),
    'authenticated' => $authenticated,
    'csrf_token' => $authenticated ? admin_csrf_token() : null,
]);

