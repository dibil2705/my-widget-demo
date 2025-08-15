import { Telegraf, Markup } from 'telegraf';

export function createBot({ token, adminChatId, webAppUrl }) {
  if (!token) throw new Error('BOT_TOKEN is required');

  const bot = new Telegraf(token);

  const APP_URL = webAppUrl || 'http://localhost:3000';

  bot.start((ctx) => {
    const kb = Markup.keyboard([
      Markup.button.webApp('Открыть мини-приложение', APP_URL)
    ]).resize();

    return ctx.reply(
      'Добро пожаловать в NEURO FUSION 👋\nНажмите кнопку, чтобы открыть мини-приложение.',
      kb
    );
  });

  bot.command('app', (ctx) =>
    ctx.reply(
      'Открыть мини-приложение:',
      Markup.inlineKeyboard([[Markup.button.webApp('▶️ Открыть', APP_URL)]])
    )
  );

  // Приём данных из WebApp (форма заявки)
  bot.on('web_app_data', async (ctx) => {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data || '{}');
      const { name, phone, company, message } = data;

      const text =
`🌟 Новая заявка из мини-аппа NEURO FUSION
От: ${ctx.from.first_name || ''} ${ctx.from.last_name || ''} (@${ctx.from.username || '—'})
Имя: ${name || '—'}
Телефон: ${phone || '—'}
Компания: ${company || '—'}
Комментарий: ${message || '—'}`;

      await ctx.telegram.sendMessage(adminChatId || ctx.chat.id, text);
      await ctx.reply('Заявка получена ✅ Мы свяжемся с вами в ближайшее время.');
    } catch (e) {
      console.error(e);
      await ctx.reply('Не удалось обработать заявку. Попробуйте ещё раз.');
    }
  });

  return bot;
}
