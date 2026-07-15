<?php
/**
 * ДИСКРЕТ — Telegram-бот на вебхуке (PHP, без постоянного процесса).
 * Подходит для шаред-хостинга (reg.ru и т.п.): Telegram шлёт POST на этот файл,
 * файл отвечает. Ничего не крутится в фоне.
 *
 * НАСТРОЙКА (один раз):
 *   1) Скопируйте config.example.php → config.php и впишите токен/ссылки.
 *   2) Залейте bot.php и config.php на хостинг по https, напр. https://diskret.space/bot.php
 *   3) Откройте в браузере: https://diskret.space/bot.php?setup=ВАШ_SETUP_SECRET
 *      — это зарегистрирует вебхук, список команд и кнопку-меню. Готово.
 *
 * Что умеет бот:
 *   /start   — приветствие + кнопки (открыть приложение, вкладки, сайт, канал)
 *   /app     — открыть приложение
 *   /posts   — Лента
 *   /schedule— Расписание
 *   /devices — Девайсы
 *   /site    — сайт форума
 *   /contact — как связаться
 *   /help    — помощь
 *   + приём данных из приложения (обратная связь / конкурс) → пересылка админу.
 */

$cfg = @include __DIR__ . '/config.php';
if (!is_array($cfg)) { http_response_code(500); exit('config.php not found'); }

define('BOT_TOKEN',    $cfg['BOT_TOKEN']);
define('APP_URL',      rtrim($cfg['APP_URL'], '/') . '/');
define('SITE_URL',     $cfg['SITE_URL']);
define('CHANNEL_URL',  $cfg['CHANNEL_URL']);
define('ADMIN_CHAT_ID',$cfg['ADMIN_CHAT_ID']);
define('SETUP_SECRET', $cfg['SETUP_SECRET']);

/* ---------- вызов Telegram Bot API ---------- */
function tg($method, $params = []) {
  $url = 'https://api.telegram.org/bot' . BOT_TOKEN . '/' . $method;
  foreach ($params as $k => $v) {
    if (is_array($v)) $params[$k] = json_encode($v, JSON_UNESCAPED_UNICODE);
  }
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $params,
    CURLOPT_TIMEOUT => 20,
  ]);
  $res = curl_exec($ch);
  curl_close($ch);
  return json_decode($res, true);
}

/* deep-link на приложение с токеном (?k=...) — открывает нужную вкладку/карточку */
function appUrl($token = '') { return $token ? APP_URL . '?k=' . rawurlencode($token) : APP_URL; }

/* ---------- одноразовая настройка через ?setup=SECRET ---------- */
if (isset($_GET['setup'])) {
  if ($_GET['setup'] !== SETUP_SECRET) { http_response_code(403); exit('forbidden'); }
  $self = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http')
        . '://' . $_SERVER['HTTP_HOST'] . strtok($_SERVER['REQUEST_URI'], '?');
  $out = [];
  $out['setWebhook'] = tg('setWebhook', [
    'url' => $self,
    'allowed_updates' => ['message'],
    'drop_pending_updates' => true,
  ]);
  $out['setMyCommands'] = tg('setMyCommands', ['commands' => [
    ['command' => 'start',    'description' => 'Меню и приложение'],
    ['command' => 'app',      'description' => 'Открыть ДИСКРЕТ'],
    ['command' => 'posts',    'description' => 'Лента'],
    ['command' => 'schedule', 'description' => 'Расписание'],
    ['command' => 'devices',  'description' => 'Девайсы'],
    ['command' => 'site',     'description' => 'Сайт форума'],
    ['command' => 'contact',  'description' => 'Связаться'],
    ['command' => 'help',     'description' => 'Помощь'],
  ]]);
  $out['setChatMenuButton'] = tg('setChatMenuButton', ['menu_button' => [
    'type' => 'web_app', 'text' => 'ДИСКРЕТ', 'web_app' => ['url' => APP_URL],
  ]]);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  exit;
}

/* ---------- диагностика: ?ping=SECRET&chat=ВАШ_ID ----------
   Шлёт два тестовых сообщения (простой текст и с кнопкой приложения)
   и показывает ответ Telegram + текущий APP_URL. Если "с кнопкой" даёт
   ok:false — значит APP_URL кривой (пустой / без https / кириллица). */
if (isset($_GET['ping'])) {
  if ($_GET['ping'] !== SETUP_SECRET) { http_response_code(403); exit('forbidden'); }
  $chat = $_GET['chat'] ?? ADMIN_CHAT_ID;
  $plain = tg('sendMessage', ['chat_id' => $chat, 'text' => 'ping 1/2 · простой текст']);
  $btn   = tg('sendMessage', ['chat_id' => $chat, 'text' => 'ping 2/2 · с кнопкой приложения',
            'reply_markup' => ['inline_keyboard' => [[['text' => '🟥 Открыть ДИСКРЕТ', 'web_app' => ['url' => appUrl()]]]]]]);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['APP_URL' => APP_URL, 'chat' => $chat, 'plain_text' => $plain, 'with_webapp_button' => $btn],
        JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  exit;
}

/* ---------- обработка входящего апдейта ---------- */
$update = json_decode(file_get_contents('php://input'), true);
if (!$update) { exit; }

$msg = $update['message'] ?? null;
if (!$msg) { exit; }

$chatId = $msg['chat']['id'];
$name   = trim(($msg['from']['first_name'] ?? '') . '');

/* данные из мини-приложения (обратная связь / конкурс) */
if (isset($msg['web_app_data']['data'])) {
  $data = json_decode($msg['web_app_data']['data'], true);
  $type = $data['type'] ?? 'data';
  if (ADMIN_CHAT_ID) {
    $txt = "📨 Из приложения ({$type}) от {$name} [{$chatId}]:\n" .
           json_encode($data, JSON_UNESCAPED_UNICODE);
    tg('sendMessage', ['chat_id' => ADMIN_CHAT_ID, 'text' => $txt]);
  }
  $reply = $type === 'lottery' ? 'Заявка на конкурс принята. Итоги — на форуме.'
                               : 'Сообщение получено. Спасибо, мы на связи.';
  tg('sendMessage', ['chat_id' => $chatId, 'text' => $reply]);
  exit;
}

$text = trim($msg['text'] ?? '');
$cmd  = strtolower(preg_replace('/@.*$/', '', strtok($text, ' '))); // /start@bot → /start

switch ($cmd) {
  case '/start':
  case 'меню':
    tg('sendMessage', [
      'chat_id' => $chatId,
      'text' => "ДИСКРЕТ — научно-технический форум творческого приборостроения.\n"
              . "19.09.2026 · Зеленоград, МИЭТ.\n\n"
              . "Открой приложение: девайсы участников, расписание, лента анонсов.",
      'reply_markup' => ['inline_keyboard' => [
        [['text' => '🟥 Открыть ДИСКРЕТ', 'web_app' => ['url' => appUrl()]]],
        [['text' => 'Лента',      'web_app' => ['url' => appUrl('t_posts')]],
         ['text' => 'Расписание', 'web_app' => ['url' => appUrl('t_schedule')]]],
        [['text' => 'Девайсы',    'web_app' => ['url' => appUrl('t_devices')]],
         ['text' => 'О форуме',   'web_app' => ['url' => appUrl('t_forum')]]],
        [['text' => 'Сайт',  'url' => SITE_URL],
         ['text' => 'Канал', 'url' => CHANNEL_URL]],
      ]],
    ]);
    break;

  case '/app':
    tg('sendMessage', ['chat_id' => $chatId, 'text' => 'Открыть приложение:',
      'reply_markup' => ['inline_keyboard' => [[['text' => '🟥 Открыть ДИСКРЕТ', 'web_app' => ['url' => appUrl()]]]]]]);
    break;

  case '/posts':
    tg('sendMessage', ['chat_id' => $chatId, 'text' => 'Лента анонсов:',
      'reply_markup' => ['inline_keyboard' => [[['text' => 'Открыть ленту', 'web_app' => ['url' => appUrl('t_posts')]]]]]]);
    break;

  case '/schedule':
    tg('sendMessage', ['chat_id' => $chatId, 'text' => 'Расписание форума (черновик):',
      'reply_markup' => ['inline_keyboard' => [[['text' => 'Открыть расписание', 'web_app' => ['url' => appUrl('t_schedule')]]]]]]);
    break;

  case '/devices':
    tg('sendMessage', ['chat_id' => $chatId, 'text' => 'Девайсы участников:',
      'reply_markup' => ['inline_keyboard' => [[['text' => 'Открыть девайсы', 'web_app' => ['url' => appUrl('t_devices')]]]]]]);
    break;

  case '/site':
    tg('sendMessage', ['chat_id' => $chatId, 'text' => 'Сайт форума:',
      'reply_markup' => ['inline_keyboard' => [[['text' => SITE_URL, 'url' => SITE_URL]]]]]);
    break;

  case '/contact':
    tg('sendMessage', ['chat_id' => $chatId,
      'text' => "Связь с организаторами:\n• Telegram-канал — ниже\n• Почта — contact@diskret.space",
      'reply_markup' => ['inline_keyboard' => [[['text' => 'Канал ДИСКРЕТ', 'url' => CHANNEL_URL]]]]]);
    break;

  case '/help':
    tg('sendMessage', ['chat_id' => $chatId,
      'text' => "Команды:\n/start — меню\n/app — приложение\n/posts — лента\n/schedule — расписание\n"
              . "/devices — девайсы\n/site — сайт\n/contact — связаться"]);
    break;

  default:
    // QR-код со стойки вида d_archeon — откроем прямо на карточке
    if (preg_match('/^([dac])[_:\/-][a-z0-9_-]+$/i', $text)) {
      tg('sendMessage', ['chat_id' => $chatId, 'text' => 'Открыть карточку:',
        'reply_markup' => ['inline_keyboard' => [[['text' => '🟥 Открыть в приложении', 'web_app' => ['url' => appUrl($text)]]]]]]);
    } else {
      tg('sendMessage', ['chat_id' => $chatId,
        'text' => 'Не понял команду. Нажми /start или кнопку-меню слева от поля ввода.']);
    }
}
exit;
