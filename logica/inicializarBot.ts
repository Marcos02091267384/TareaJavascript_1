import { Context } from 'telegraf';
require('dotenv').config();
const { Telegraf } = require('telegraf');
import { selector, buscarUsuario, esComando, consulta, ReservarProducto } from './Funciones';
let listaU: any[] = [];
const bot = new Telegraf(process.env.BOT_TOKEN);

function inicializarBot() {
  bot.help((ctx: Context) => {
    ctx.reply("Te ayudo");
  });

  bot.start((ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res: any) => {
      if (!res.rows[0].existe_usuario) {
        ctx.replyWithHTML(
          `Hola bienvenido. Para interactuar con el bot es necesario registrarse. Para ello por favor incerte una contraseña`,
          { reply_markup: { inline_keyboard: [[{ text: 'Registrarse', callback_data: 'registro' }]] } }
        );
      } else {
        ctx.reply(`Usted ya esta registrado`)
      }
    });


  });

  bot.command("agregar_producto", (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {
        consulta().query(`Select es_admin(${ctx.from?.id})`).then(async (res2: any) => {

          if (res2.rows[0].es_admin) {

            consulta().query(`Select bloqueado(${ctx.from?.id})`).then(async (res3: any) => {
              if (!res3.rows[0].bloqueado) {
                const us = getUsuario(ctx, ['agregar_producto', "entrada"]);
                listaU.push(us);
                selector(listaU, ctx);

              } else {

                ctx.reply(`Usted esta bloqueado. Presione el comando de /administradores para ver la lista de administradores y contactar a uno`);
              }
            });
          } else {
            ctx.reply(`Solo los administradores pueden agregar un producto`);
          }

        });
      } else {
        ctx.reply(`Para interactuar con el bot, primero debes registrarte`);
      }
    });


  });

  bot.command('test', (ctx: Context) => {

  });

  bot.hears(/\/comprar_producto_(.+)/, (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {
        const us = getUsuario(ctx, ['ReservarProducto', "PedirClave"]);
        listaU.push(us);
        selector(listaU, ctx);
      }else{
        ctx.reply('No esta registrado. Por favor registrese')
      }
    });
    //ReservarProducto(ctx);
  });

  bot.command('productos', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {

        const us = getUsuario(ctx, ['ver_productos', ""]);
        us.producto.inicio = 0;
        listaU.push(us);

        selector(listaU, ctx);
        listaU.splice(listaU.indexOf(us));

      } else {
        ctx.reply(`Para interactuar con el bot, primero debes registrarte`);
      }
    }
    );
  });

  bot.on("text", (ctx: Context) => {
    if (!esComando(ctx.message))
      selector(listaU, ctx);

  });

  bot.on("photo", (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us.state[1] === "agregar_producto_imag") {
      us.state[1] = "agregar_producto_imag_si";
      selector(listaU, ctx);
    }

  });

  bot.action('aceptar clave', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'confirmar_clave') {
      ctx.reply('Has confirmado que tu clave es correcta');
      us.state[1] = "aceptar_clave";
      selector(listaU, ctx);
    }
  });

  bot.action('registro', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res: any) => {
      if (!res.rows[0].existe_usuario) {
        let us = getUsuario(ctx, ["clave", "introducir_clave"]);
        listaU.push(us);
        selector(listaU, ctx);

      } else {
        ctx.reply(`Usted ya esta registrado`)
      }
    });


  });

  bot.action('rechazar clave', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'confirmar_clave') {
      ctx.reply('Introzusca de nuevo la clave');
      us.state[1] = "rechazar_clave";
      selector(listaU, ctx);
    }
  });

  bot.action('regular', (ctx: Context) => {

    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'agregar_producto_cant') {
      ctx.reply('Introduzca una imagen o un texto para agregar una imagen');
      us.state[1] = "agregar_producto_imag";
      us.producto.fijo = true;
    }
  });

  bot.action(/pagina:(.+)/, async (ctx: Context) => {
    const us = getUsuario(ctx, ['siguiente pagina', ""]);
    listaU.push(us);
    selector(listaU, ctx);
    listaU.splice(listaU.indexOf(us));
  });

  bot.action('no regular', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'agregar_producto_cant') {
      ctx.reply('Introduzca una imagen o un texto para agregar una imagen');
      us.state[1] = "agregar_producto_imag";
      us.producto.fijo = false;
    }
  });
  bot.launch();
  console.log("El bot esta funcionando");
}
const getUsuario = (ctx: Context, sts: string[]) => {
  return {
    username: ctx.from?.username,
    id: ctx.from?.id,
    state: sts,
    password: " ",
    admin: false,
    producto: getProducto()
  }
};
const getProducto = () => {
  return {
    descripcion: " ",
    precio: 0.0,
    cantidad: 0,
    id_prod: " ",
    urlFoto: " ",
    inicio: 0
  }
};

module.exports = { inicializarBot };