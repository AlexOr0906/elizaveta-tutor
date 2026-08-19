<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function telegram_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function send_telegram_via_relay(string $relayUrl, string $relaySecret, string $message): bool
{
    $relayUrl = trim($relayUrl);
    $relaySecret = trim($relaySecret);
    if ($relayUrl === '' || $relaySecret === '' || !filter_var($relayUrl, FILTER_VALIDATE_URL)) {
        return false;
    }
    if (strtolower((string) parse_url($relayUrl, PHP_URL_SCHEME)) !== 'https') {
        return false;
    }

    $payload = json_encode([
        'secret' => $relaySecret,
        'text' => $message,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payload === false || !function_exists('curl_init')) {
        return false;
    }

    $curl = curl_init($relayUrl);
    $curlOptions = [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    ];
    if (defined('CURLOPT_POSTREDIR')) {
        $curlOptions[CURLOPT_POSTREDIR] = defined('CURL_REDIR_POST_ALL') ? CURL_REDIR_POST_ALL : 7;
    }
    curl_setopt_array($curl, $curlOptions);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if ($response === false || $status < 200 || $status >= 300) {
        error_log('Telegram relay request failed: HTTP ' . $status . '; ' . $curlError);
        return false;
    }
    $decoded = json_decode((string) $response, true);
    $sent = is_array($decoded) && ($decoded['ok'] ?? false) === true;
    if (!$sent) {
        error_log('Telegram relay rejected message: ' . (string) ($decoded['error'] ?? 'unknown error'));
    }
    return $sent;
}

function send_telegram(string $token, string $chatId, string $message): bool
{
    $token = trim($token);
    $chatId = trim($chatId);
    if ($token === '' || $chatId === '') {
        return false;
    }

    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
    $payload = http_build_query([
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => 'true',
    ]);

    if (function_exists('curl_init')) {
        $ipModes = [null];
        if (defined('CURLOPT_IPRESOLVE') && defined('CURL_IPRESOLVE_V6')) {
            $ipModes = [CURL_IPRESOLVE_V6, null];
        }
        $lastStatus = 0;
        $lastError = '';
        $response = false;

        foreach ($ipModes as $ipMode) {
            $curl = curl_init($url);
            $curlOptions = [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_TIMEOUT => 5,
                CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            ];
            if ($ipMode !== null) {
                $curlOptions[CURLOPT_IPRESOLVE] = $ipMode;
            }
            curl_setopt_array($curl, $curlOptions);
            $response = curl_exec($curl);
            $lastStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $lastError = curl_error($curl);
            curl_close($curl);

            if ($response !== false && $lastStatus >= 200 && $lastStatus < 300) {
                break;
            }
            if ($response !== false && $lastStatus >= 400 && $lastStatus < 500) {
                break;
            }
        }

        if ($response === false || $lastStatus < 200 || $lastStatus >= 300) {
            error_log('Telegram request failed: HTTP ' . $lastStatus . '; ' . $lastError);
            return false;
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $payload,
                'timeout' => 4,
                'ignore_errors' => true,
            ],
        ]);
        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            return false;
        }
    }

    $decoded = json_decode((string) $response, true);
    $sent = is_array($decoded) && ($decoded['ok'] ?? false) === true;
    if (!$sent) {
        error_log('Telegram API rejected message: ' . (string) ($decoded['description'] ?? 'unknown error'));
    }
    return $sent;
}

function send_email(array $mailConfig, string $subject, string $message, ?string &$errorCode = null): bool
{
    $errorCode = null;
    $to = trim((string) ($mailConfig['to'] ?? ''));
    $from = trim((string) ($mailConfig['from'] ?? ''));
    $fromName = trim((string) ($mailConfig['from_name'] ?? 'Сайт'));
    $smtpHost = trim((string) ($mailConfig['smtp_host'] ?? 'smtp.timeweb.ru'));
    $smtpPort = (int) ($mailConfig['smtp_port'] ?? 587);
    $smtpEncryption = strtolower(trim((string) ($mailConfig['smtp_encryption'] ?? 'tls')));
    $smtpUsername = trim((string) ($mailConfig['smtp_username'] ?? $from));
    $smtpPassword = (string) ($mailConfig['smtp_password'] ?? '');

    if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
        $errorCode = 'invalid_address';
        return false;
    }

    $smtpConfigured = $smtpHost !== ''
        && $smtpPort > 0
        && filter_var($smtpUsername, FILTER_VALIDATE_EMAIL)
        && trim($smtpPassword) !== ''
        && strncmp(trim($smtpPassword), 'CHANGE_ME_', 10) !== 0;

    if ($smtpConfigured) {
        try {
            $phpMailerPath = dirname(__DIR__) . '/vendor/phpmailer/src';
            $requiredFiles = [
                $phpMailerPath . '/Exception.php',
                $phpMailerPath . '/PHPMailer.php',
                $phpMailerPath . '/SMTP.php',
            ];
            foreach ($requiredFiles as $requiredFile) {
                if (!is_file($requiredFile)) {
                    $errorCode = 'mailer_missing';
                    error_log('SMTP mailer file is missing: ' . basename($requiredFile));
                    return false;
                }
                require_once $requiredFile;
            }

            $mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mailer->isSMTP();
            $mailer->Host = $smtpHost;
            $mailer->Port = $smtpPort;
            $mailer->SMTPAuth = true;
            $mailer->Username = $smtpUsername;
            $mailer->Password = $smtpPassword;
            $mailer->Timeout = 8;
            $mailer->getSMTPInstance()->Timelimit = 8;
            $mailer->CharSet = \PHPMailer\PHPMailer\PHPMailer::CHARSET_UTF8;
            if ($smtpEncryption === 'ssl' || $smtpEncryption === 'smtps') {
                $mailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($smtpEncryption === 'tls' || $smtpEncryption === 'starttls') {
                $mailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            } else {
                $mailer->SMTPSecure = '';
                $mailer->SMTPAutoTLS = false;
            }
            $mailer->setFrom($from, $fromName);
            $mailer->addAddress($to);
            $mailer->Subject = $subject;
            $mailer->Body = $message;
            $mailer->isHTML(false);
            return $mailer->send();
        } catch (Throwable $error) {
            $errorMessage = strtolower($error->getMessage());
            if (strpos($errorMessage, 'authenticate') !== false) {
                $errorCode = 'smtp_auth';
            } elseif (strpos($errorMessage, 'connect') !== false) {
                $errorCode = 'smtp_connect';
            } elseif (strpos($errorMessage, 'recipient') !== false) {
                $errorCode = 'smtp_recipient';
            } elseif (strpos($errorMessage, 'from') !== false || strpos($errorMessage, 'sender') !== false) {
                $errorCode = 'smtp_sender';
            } else {
                $errorCode = 'mailer_runtime';
            }
            error_log('SMTP email failed: ' . $error->getMessage());
            return false;
        }
    }

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    if (filter_var($from, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'From: ' . $encodedFromName . ' <' . $from . '>';
        $sent = mail($to, $encodedSubject, $message, implode("\r\n", $headers), '-f' . $from);
        $errorCode = $sent ? null : 'mail_rejected';
        return $sent;
    }

    $sent = mail($to, $encodedSubject, $message, implode("\r\n", $headers));
    $errorCode = $sent ? null : 'mail_rejected';
    return $sent;
}

require_method('POST');
require_same_origin();

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12288) {
    respond(413, ['ok' => false, 'message' => 'Слишком большой запрос']);
}

$input = read_json_body();
if (trim((string) ($input['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

$slotId = (int) ($input['slot_id'] ?? 0);
$name = trim((string) ($input['name'] ?? ''));
$phone = trim((string) ($input['phone'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$grade = trim((string) ($input['grade'] ?? ''));
$subject = trim((string) ($input['subject'] ?? ''));
$lessonFormat = trim((string) ($input['lesson_format'] ?? ''));
$goal = trim((string) ($input['goal'] ?? ''));
$consent = ($input['consent'] ?? false) === true;

if (!$consent) {
    respond(422, ['ok' => false, 'message' => 'Необходимо согласие на обработку данных']);
}
if ($slotId < 1) {
    respond(422, ['ok' => false, 'message' => 'Выберите свободную дату и время']);
}
if (text_length($name) < 2 || text_length($name) > 80) {
    respond(422, ['ok' => false, 'message' => 'Проверьте имя']);
}
if ($phone === '' && $email === '') {
    respond(422, ['ok' => false, 'message' => 'Укажите телефон или электронную почту']);
}
if (text_length($phone) > 40 || ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    respond(422, ['ok' => false, 'message' => 'Проверьте контактные данные']);
}
if (!in_array($grade, ['1–4 класс', '5–8 класс', '9 класс'], true)) {
    respond(422, ['ok' => false, 'message' => 'Выберите класс']);
}
if (!in_array($subject, ['Математика', 'Русский язык'], true)) {
    respond(422, ['ok' => false, 'message' => 'Выберите предмет']);
}
if (!in_array($lessonFormat, ['Онлайн', 'Офлайн'], true)) {
    respond(422, ['ok' => false, 'message' => 'Выберите формат занятия']);
}
if (text_length($goal) < 3 || text_length($goal) > 1000) {
    respond(422, ['ok' => false, 'message' => 'Проверьте описание запроса']);
}

$pdo = null;
try {
    $config = app_config();
    $pdo = database();
    $ipHash = client_ip_hash();
    $rateStatement = $pdo->prepare(
        'SELECT COUNT(*) FROM tutor_bookings '
        . 'WHERE ip_hash = :ip_hash AND created_at >= (NOW() - INTERVAL 15 MINUTE)'
    );
    $rateStatement->execute(['ip_hash' => $ipHash]);
    if ((int) $rateStatement->fetchColumn() >= 10) {
        respond(429, ['ok' => false, 'message' => 'Слишком много заявок. Попробуйте немного позже']);
    }

    $pdo->beginTransaction();
    $slotStatement = $pdo->prepare(
        'SELECT id, start_at, end_at, status FROM tutor_slots WHERE id = :id FOR UPDATE'
    );
    $slotStatement->execute(['id' => $slotId]);
    $slot = $slotStatement->fetch();
    if (!is_array($slot) || $slot['status'] !== 'available' || strtotime((string) $slot['start_at']) <= time()) {
        $pdo->rollBack();
        respond(409, ['ok' => false, 'message' => 'Это время уже занято. Выберите другое окно']);
    }

    $insert = $pdo->prepare(
        'INSERT INTO tutor_bookings '
        . '(slot_id, name, phone, email, student_grade, subject, lesson_format, goal, consent_at, ip_hash) '
        . 'VALUES (:slot_id, :name, :phone, :email, :student_grade, :subject, :lesson_format, :goal, NOW(), :ip_hash)'
    );
    $insert->execute([
        'slot_id' => $slotId,
        'name' => $name,
        'phone' => $phone !== '' ? $phone : null,
        'email' => $email !== '' ? $email : null,
        'student_grade' => $grade,
        'subject' => $subject,
        'lesson_format' => $lessonFormat,
        'goal' => $goal,
        'ip_hash' => $ipHash,
    ]);
    $bookingId = (int) $pdo->lastInsertId();
    $updateSlot = $pdo->prepare('UPDATE tutor_slots SET status = \'pending\' WHERE id = :id');
    $updateSlot->execute(['id' => $slotId]);
    $pdo->commit();

    $start = new DateTimeImmutable((string) $slot['start_at']);
    $dateText = $start->format('d.m.Y H:i');
    $contactText = implode(', ', array_filter([$phone, $email], static fn(string $value): bool => $value !== ''));
    $emailMessage = "Новая заявка с сайта\n\n"
        . "Дата и время: {$dateText}\n"
        . "Имя: {$name}\nКонтакты: {$contactText}\n"
        . "Класс: {$grade}\nПредмет: {$subject}\nФормат: {$lessonFormat}\n"
        . "Запрос: {$goal}\nНомер заявки: #{$bookingId}\n";

    $mailConfig = is_array($config['mail'] ?? null) ? $config['mail'] : [];
    $mailConfigured = trim((string) ($mailConfig['to'] ?? '')) !== '';
    $emailError = null;
    $emailSent = $mailConfigured && send_email(
        $mailConfig,
        'Новая заявка на занятие ' . $dateText,
        $emailMessage,
        $emailError
    );
    $notificationError = $emailSent ? null : 'email:' . ($emailError ?? 'unknown');
    $updateBooking = $pdo->prepare(
        'UPDATE tutor_bookings SET email_sent = :email_sent, notification_error = :notification_error WHERE id = :id'
    );
    $updateBooking->execute([
        'email_sent' => $emailSent ? 1 : 0,
        'notification_error' => $notificationError,
        'id' => $bookingId,
    ]);

    respond(201, [
        'ok' => true,
        'booking_id' => $bookingId,
        'email_sent' => $emailSent,
    ]);
} catch (Throwable $error) {
    if ($pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Tutor booking error: ' . $error->getMessage());
    respond(500, ['ok' => false, 'message' => 'Не удалось сохранить заявку']);
}
