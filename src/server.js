import 'dotenv/config';
import express from 'express';
import { createBot } from './bot.js';

const {
  BOT_TOKEN,
  ADMIN_CHAT_ID,
  PORT = 3000,
  WEB_APP_URL
} = process.env;

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (_req, res) => res.send('ok'));

// Fallback: если сайт открыт вне Telegram — отправим заявку администратору
app.post('/lead', async (req, res) => {
  try {
    const { name, phone, company, message } = req.body || {};
    const text =
`🌟 Новая заявка с сайта NEURO FUSION
Имя: ${name || '—'}
Телефон: ${phone || '—'}
Компания: ${company || '—'}
Комментарий: ${message || '—'}`;

    if (ADMIN_CHAT_ID && BOT_TOKEN) {
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, text);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// ---- Telegram Bot ----
let bot;
if (BOT_TOKEN) {
  bot = createBot({ token: BOT_TOKEN, adminChatId: ADMIN_CHAT_ID, webAppUrl: WEB_APP_URL });
  bot.launch().then(() => console.log('🤖 Bot started'));
} else {
  console.log('⚠️ BOT_TOKEN не задан — бот не запущен');
}

app.listen(PORT, () => {
  console.log(`🌐 Web app: http://localhost:${PORT}`);
  if (WEB_APP_URL) console.log(`🔗 Public URL: ${WEB_APP_URL}`);
});
