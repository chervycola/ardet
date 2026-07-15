/**
 * ДИСКРЕТ — Telegram-бот на Cloudflare Workers.
 * Полноценная замена bot.php: Telegram гарантированно достаёт до воркера,
 * никакой зависимости от хостинга reg.ru для входящего вебхука.
 *
 * НАСТРОЙКА (см. README, раздел «Cloudflare Workers»):
 *   1) Создать воркер на dash.cloudflare.com, вставить этот код.
 *   2) В Settings → Variables добавить переменные:
 *        BOT_TOKEN (Secret), APP_URL, SITE_URL, CHANNEL_URL, ADMIN_CHAT_ID, SETUP_SECRET
 *   3) Открыть один раз:  https://<воркер>.workers.dev/setup?secret=SETUP_SECRET
 *   4) Написать боту /start.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Одноразовая настройка: /setup?secret=...
    if (url.pathname === "/setup") {
      if (url.searchParams.get("secret") !== env.SETUP_SECRET)
        return new Response("forbidden", { status: 403 });
      const webhook = url.origin + "/";
      const out = {};
      out.setWebhook = await api(env, "setWebhook", {
        url: webhook, allowed_updates: ["message"], drop_pending_updates: true,
      });
      out.setMyCommands = await api(env, "setMyCommands", { commands: [
        { command: "start",    description: "Меню и приложение" },
        { command: "app",      description: "Открыть ДИСКРЕТ" },
        { command: "posts",    description: "Лента" },
        { command: "schedule", description: "Расписание" },
        { command: "devices",  description: "Девайсы" },
        { command: "site",     description: "Сайт форума" },
        { command: "contact",  description: "Связаться" },
        { command: "help",     description: "Помощь" },
      ]});
      out.setChatMenuButton = await api(env, "setChatMenuButton", {
        menu_button: { type: "web_app", text: "ДИСКРЕТ", web_app: { url: appUrl(env) } },
      });
      return json(out);
    }

    // Вебхук от Telegram — это POST
    if (request.method === "POST") {
      let update;
      try { update = await request.json(); } catch (e) { return new Response("ok"); }
      try { await handle(update, env); } catch (e) { /* не роняем ответ Telegram */ }
      return new Response("ok");
    }

    return new Response("DISKRET bot is running.");
  },
};

function api(env, method, params) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  }).then((r) => r.json()).catch((e) => ({ ok: false, error: String(e) }));
}
function json(o) {
  return new Response(JSON.stringify(o, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
function appUrl(env, token) {
  const base = env.APP_URL.endsWith("/") ? env.APP_URL : env.APP_URL + "/";
  return token ? base + "?k=" + encodeURIComponent(token) : base;
}
function send(env, chatId, text, markup) {
  return api(env, "sendMessage", {
    chat_id: chatId, text, ...(markup ? { reply_markup: markup } : {}),
  });
}

async function handle(update, env) {
  const msg = update.message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const name = (msg.from && msg.from.first_name) || "";

  // Данные из мини-приложения (обратная связь / конкурс)
  if (msg.web_app_data && msg.web_app_data.data) {
    let data;
    try { data = JSON.parse(msg.web_app_data.data); } catch (e) { data = { raw: msg.web_app_data.data }; }
    const type = data.type || "data";
    if (env.ADMIN_CHAT_ID && Number(env.ADMIN_CHAT_ID)) {
      await send(env, Number(env.ADMIN_CHAT_ID),
        `📨 Из приложения (${type}) от ${name} [${chatId}]:\n` + JSON.stringify(data));
    }
    await send(env, chatId, type === "lottery"
      ? "Заявка на конкурс принята. Итоги — на форуме."
      : "Сообщение получено. Спасибо, мы на связи.");
    return;
  }

  const text = (msg.text || "").trim();
  const cmd = text.split(" ")[0].replace(/@.*$/, "").toLowerCase();
  const webApp = (token) => ({ inline_keyboard: [[{ text: "🟥 Открыть в приложении", web_app: { url: appUrl(env, token) } }]] });

  switch (cmd) {
    case "/start":
    case "меню":
      await send(env, chatId,
        "ДИСКРЕТ — научно-технический форум творческого приборостроения.\n" +
        "19.09.2026 · Зеленоград, МИЭТ.\n\n" +
        "Открой приложение: девайсы участников, расписание, лента анонсов.",
        { inline_keyboard: [
          [{ text: "🟥 Открыть ДИСКРЕТ", web_app: { url: appUrl(env) } }],
          [{ text: "Лента",      web_app: { url: appUrl(env, "t_posts") } },
           { text: "Расписание", web_app: { url: appUrl(env, "t_schedule") } }],
          [{ text: "Девайсы",    web_app: { url: appUrl(env, "t_devices") } },
           { text: "О форуме",   web_app: { url: appUrl(env, "t_forum") } }],
          [{ text: "Сайт",  url: env.SITE_URL },
           { text: "Канал", url: env.CHANNEL_URL }],
        ]});
      break;
    case "/app":      await send(env, chatId, "Открыть приложение:", webApp()); break;
    case "/posts":    await send(env, chatId, "Лента анонсов:", webApp("t_posts")); break;
    case "/schedule": await send(env, chatId, "Расписание форума (черновик):", webApp("t_schedule")); break;
    case "/devices":  await send(env, chatId, "Девайсы участников:", webApp("t_devices")); break;
    case "/site":     await send(env, chatId, "Сайт форума:", { inline_keyboard: [[{ text: env.SITE_URL, url: env.SITE_URL }]] }); break;
    case "/contact":  await send(env, chatId, "Связь с организаторами:\n• Telegram-канал — ниже\n• Почта — contact@diskret.space", { inline_keyboard: [[{ text: "Канал ДИСКРЕТ", url: env.CHANNEL_URL }]] }); break;
    case "/help":     await send(env, chatId, "Команды:\n/start — меню\n/app — приложение\n/posts — лента\n/schedule — расписание\n/devices — девайсы\n/site — сайт\n/contact — связаться"); break;
    default:
      if (/^([dac])[_:\/-][a-z0-9_-]+$/i.test(text))
        await send(env, chatId, "Открыть карточку:", webApp(text));
      else
        await send(env, chatId, "Не понял команду. Нажми /start или кнопку-меню слева от поля ввода.");
  }
}
