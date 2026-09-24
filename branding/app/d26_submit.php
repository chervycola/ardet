<?php
// ДИСКРЕТ · приёмник формы Д-26
// Складывает анкету и фото в d26_inbox/<дата_проект>/ и шлёт письмо оргам.

header('Content-Type: application/json; charset=utf-8');
mb_internal_encoding('UTF-8');

const NOTIFY_EMAIL = 'contact@diskret.space';
const MAX_FILE = 15 * 1024 * 1024;   // 15 МБ на файл
const MAX_FILES = 40;                 // суммарно на заявку
const INBOX = __DIR__ . '/d26_inbox';

function fail($msg, $code = 400) {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('только POST', 405);
if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; } // honeypot: боту говорим «ок»
if (empty($_POST['project']) || empty($_POST['contact'])) fail('нет обязательных полей');

// --- папка заявки ---
$slug = mb_strtolower(trim($_POST['project']));
$slug = preg_replace('/[^a-zа-яё0-9]+/ui', '-', $slug);
$slug = trim(mb_substr($slug, 0, 40), '-');
if ($slug === '') $slug = 'untitled';
$dir = INBOX . '/' . date('Ymd_His') . '_' . $slug . '_' . substr(bin2hex(random_bytes(3)), 0, 6);
if (!is_dir(INBOX) && !mkdir(INBOX, 0755, true)) fail('server: inbox', 500);
if (!mkdir($dir, 0755, true)) fail('server: dir', 500);

// --- текстовые поля ---
$fields = [];
foreach ($_POST as $k => $v) {
  if ($k === 'website') continue;
  $fields[$k] = mb_substr(trim((string)$v), 0, 4000);
}
$fields['_received'] = date('c');
$fields['_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
file_put_contents($dir . '/form.json',
  json_encode($fields, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

// --- файлы ---
$saved = 0;
$fi = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
$extmap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
foreach ($_FILES as $k => $f) {
  if (!preg_match('/^d\d+_photo_\d+$/', $k)) continue;
  if ($f['error'] !== UPLOAD_ERR_OK) continue;
  if ($f['size'] <= 0 || $f['size'] > MAX_FILE) continue;
  if ($saved >= MAX_FILES) break;
  $mime = $fi ? $fi->file($f['tmp_name']) : ($f['type'] ?? '');
  if (!isset($extmap[$mime])) continue;             // только картинки, по сигнатуре
  $name = preg_replace('/[^a-z0-9_]+/i', '_', $k) . '.' . $extmap[$mime];
  if (move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) $saved++;
}

// --- письмо оргам ---
$sum = "Новая заявка Д-26\n\n";
$sum .= 'Проект: ' . ($fields['project'] ?? '') . "\n";
$sum .= 'Контакт: ' . ($fields['contact'] ?? '') . "\n";
$sum .= 'Город: ' . ($fields['city'] ?? '—') . "\n";
$devs = [];
foreach ($fields as $k => $v) if (preg_match('/^d(\d+)_name$/', $k, $m) && $v !== '') $devs[] = $v;
$sum .= 'Приборы: ' . (count($devs) ? implode(' · ', $devs) : '—') . "\n";
$sum .= 'Фото: ' . $saved . " шт\n";
$sum .= 'Папка: ' . basename($dir) . "\n";
@mail(NOTIFY_EMAIL,
  '=?UTF-8?B?' . base64_encode('Д-26 · ' . ($fields['project'] ?? 'заявка')) . '?=',
  $sum,
  "From: form@diskret.space\r\nContent-Type: text/plain; charset=UTF-8\r\n");

echo json_encode(['ok' => true, 'photos' => $saved], JSON_UNESCAPED_UNICODE);
