<?php
/**
 * Скопируйте этот файл в config.php и впишите свои значения.
 * config.php НЕ коммитится в репозиторий (см. .gitignore) — там токен.
 */
return [
  // Токен бота от @BotFather
  'BOT_TOKEN'  => '123456:PASTE-YOUR-TOKEN-HERE',

  // URL мини-приложения (та же ссылка, что в кнопке-меню). Обязательно https, со слэшем на конце.
  'APP_URL'    => 'https://diskret.space/app/',

  // Ссылки для кнопок
  'SITE_URL'   => 'https://diskret.space',
  'CHANNEL_URL'=> 'https://t.me/diskret_space',

  // Билеты (необязательно: если не указать, берётся ссылка по умолчанию из bot.php)
  'TICKETS_URL'=> 'https://flat.audio/e/2470',

  // Куда пересылать заявки/сообщения из приложения (ваш численный chat_id).
  // Узнать свой id: напишите боту @userinfobot. Можно оставить 0 — тогда просто не пересылаем.
  'ADMIN_CHAT_ID' => 0,

  // Секрет для одноразовой настройки (?setup=СЕКРЕТ). Придумайте любую строку.
  'SETUP_SECRET'  => 'change-me-please',
];
