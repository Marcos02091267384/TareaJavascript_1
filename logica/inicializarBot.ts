import { Context } from 'telegraf';
require('dotenv').config();
const { Telegraf } = require('telegraf');
import { selector, buscarUsuario, esComando, consulta } from './Funciones';
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
    })


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
        ctx.reply(`Para interactuar con el bot, primero debes registrarte`)
      }
    });


  });
  bot.command('test', (ctx: Context) => {

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
    ctx.reply('Has confirmado que tu clave es correcta');
    let us = buscarUsuario(listaU, ctx);
    us.state[1] = "aceptar_clave";
    selector(listaU, ctx);
  });
  bot.action('registro', (ctx: Context) => {
    listaU.push(getUsuario(ctx, ["clave", "introducir_clave"]));
    selector(listaU, ctx);
  });

  bot.action('rechazar clave', (ctx: Context) => {
    ctx.reply('Introzusca de nuevo la clave');
    let us = buscarUsuario(listaU, ctx);
    us.state[1] = "rechazar_clave";
    selector(listaU, ctx);
  });

  bot.action('regular', (ctx: Context) => {
    ctx.reply('Introduzca una imagen o un texto para agregar una imagen');
    let us = buscarUsuario(listaU, ctx);
    us.state[1] = "agregar_producto_imag";
    us.producto.fijo = true;
  });

  bot.action('no regular', (ctx: Context) => {
    ctx.reply('Introduzca una imagen o un texto para agregar una imagen');
    let us = buscarUsuario(listaU, ctx);
    us.state[1] = "agregar_producto_imag";
    us.producto.fijo = false;
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
    urlFoto: " "
  }
};

module.exports = { inicializarBot };