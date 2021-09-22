require("dotenv").config();

const db = require("./db");

const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_API_TOKEN)

const { getDefaultClient } = require('@rightech/api');

const ric = getDefaultClient({ token: process.env.RIC_API_TOKEN });

const objectId = '613f74015dab3700105c0365';

ric.get('/objects').then(objects => {
   console.log(objects);
});

const hello = `
По нажатию на кнопку бот отправляет запрос в платформу на открытие шлагбаума
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

     ctx.reply(hello + ``,
       Markup.inlineKeyboard([
       Markup.button.callback(`Прибыл`, 'send-command ' + `barrier-on`),
     ]))
});

bot.action(/send-command (.*)/, async (ctx) => {
  console.log("1", ctx.update.callback_query.data);
  console.log("2", ctx.match);

  const command = ctx.match[1];
  await ctx.answerCbQuery('sending: ' + command);
  
  try {
    const res = await ric.post(`objects/${objectId}/commands/${command}`);

    let delay = 1000;
    let timerId = setTimeout(async function request() {
      const object = await ric.get(`objects/${objectId}`);
      if (object.state.barrier) {
        ctx.editMessageText('Отлично! Вы можете проехать на разгрузку к складу №5');
      } else
      {
        // увеличить интервал для следующего запроса
        delay *= 2;
        // ctx.editMessageText('delay: ' + delay);
        if (delay >= 8000)
        {
          ctx.editMessageText('Что-то пошло не так, можно попробовать еще раз');
          return;
        }
      }
      timerId = setTimeout(request, delay);
    }, delay);

  } catch (err) {
    ctx.editMessageText(err.toString())
  }
});

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
