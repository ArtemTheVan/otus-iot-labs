require("dotenv").config();

const db = require("./db");

const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_API_TOKEN)

const { getDefaultClient } = require('@rightech/api');

const ric = getDefaultClient({ token: process.env.RIC_API_TOKEN });

const objectId = '613e018d5dab3700105bd327';

ric.get('/objects').then(objects => {
   console.log(objects);
});

const hello = `
По нажатию на кнопку бот отправляет запрос в платформу на открытие или закрытие замка
`;

bot.help((ctx) => {
    console.log(ctx.update);

    ctx.reply(hello + '/start - формирует клавиатуру с кнопкой')

})

bot.use((ctx, next) => {

  const user = db.users.find(x => x.username === ctx.from.username);
  if (!user) {
    return ctx.reply('not authorized!');
  }

  next();
})

bot.command("start", async (ctx) => {

  const object = await ric.get(`objects/${objectId}`);

  ctx.reply(hello + ` 
    Сейчас замок ${!object.state.lock ? "открыт" : "закрыт"}, доступна команда:`,
    Markup.inlineKeyboard([
    Markup.button.callback(`${!object.state.lock ? "Закрыть замок" : "Открыть замок"}`, 'send-command ' + `${!object.state.lock ? "close" : "open"}`),
  ]))
});

bot.action(/send-command (.*)/, async (ctx) => {
  console.log("1", ctx.update.callback_query.data);
  console.log("2", ctx.match);

  const command = ctx.match[1];
  await ctx.answerCbQuery('sending: ' + command);
  
  try {
    const res = await ric.post(`objects/${objectId}/commands/${command}`);
    ctx.editMessageText(command + ' ok');
  } catch (err) {
    ctx.editMessageText(err.toString())
  }
});

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
