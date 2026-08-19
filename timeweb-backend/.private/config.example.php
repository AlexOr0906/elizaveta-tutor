<?php

return [
    'database' => [
        'host' => 'localhost',
        'name' => 'CHANGE_ME_DATABASE',
        'user' => 'CHANGE_ME_USER',
        'password' => 'CHANGE_ME_PASSWORD',
    ],
    'telegram' => [
        'enabled' => false,
        'bot_token' => '',
        'chat_id' => '',
        'relay_url' => '',
        'relay_secret' => '',
    ],
    'mail' => [
        'to' => 'CHANGE_ME_RECIPIENT_EMAIL',
        'from' => 'zayavki@lizochkaorlowa.ru',
        'from_name' => 'Сайт Елизаветы Вячеславовны',
        'smtp_host' => 'smtp.timeweb.ru',
        'smtp_port' => 587,
        'smtp_encryption' => 'tls',
        'smtp_username' => 'zayavki@lizochkaorlowa.ru',
        'smtp_password' => 'CHANGE_ME_SMTP_PASSWORD',
    ],
    'admin' => [
        'username' => 'elizaveta',
        'password_hash' => 'CHANGE_ME_ADMIN_PASSWORD_HASH',
        'session_name' => 'elizaveta_admin',
    ],
    'app_secret' => 'CHANGE_ME_LONG_RANDOM_SECRET',
];
