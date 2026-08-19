<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

fwrite(STDOUT, 'Новый пароль администратора: ');
$restore = null;
if (DIRECTORY_SEPARATOR === '/') {
    $restore = trim((string) shell_exec('stty -g 2>/dev/null'));
    if ($restore !== '') {
        shell_exec('stty -echo 2>/dev/null');
    }
}
$password = trim((string) fgets(STDIN));
if ($restore !== null && $restore !== '') {
    shell_exec('stty ' . escapeshellarg($restore) . ' 2>/dev/null');
    fwrite(STDOUT, PHP_EOL);
}
if (strlen($password) < 12) {
    fwrite(STDERR, 'Пароль должен содержать не менее 12 символов.' . PHP_EOL);
    exit(1);
}
fwrite(STDOUT, password_hash($password, PASSWORD_DEFAULT) . PHP_EOL);

