import { Context } from 'telegraf';
require('dotenv').config();
const { Telegraf } = require('telegraf');
import { selector, buscarUsuario } from './Funciones';
let listaU: any[] = [];
const bot = new Telegraf(process.env.BOT_TOKEN);
function inicializarBot() {
  bot.help((ctx: Context) => {
    ctx.reply("Te ayudo");
  });

  bot.start((ctx: Context) => {
    listaU.push(getUsuario(ctx, ["clave", "introducir_clave"]));
    ctx.reply("Hola bienvenido.");
    ctx.reply("Para interactuar con el bot es necesario registrarse. Para ello por favor incerte una contraseña");
    selector(listaU, ctx);

  });



  bot.command("agregar_producto", (ctx: Context) => {
    const us = getUsuario(ctx, ['agregar_producto', "entrada"]);
    listaU.push(us);
    selector(listaU, ctx);
  });


  bot.on("text", (ctx: Context) => {
    selector(listaU, ctx);
  });

  bot.on("photo", (ctx: Context) => {
    let us = buscarUsuario(listaU,ctx);
    if (us.state[1] === "agregar_producto_imag") {
      us.state[1] = "agregar_producto_imag_si";
      selector(listaU, ctx);
    }

  });
  bot.action('aceptar clave', (ctx: Context) => {
    ctx.reply('Has confirmado que tu clave es correcta');
    let us=buscarUsuario(listaU,ctx);
    us.state[1]="aceptar_clave";
    selector(listaU, ctx);
  });

  bot.action('rechazar clave', (ctx: Context) => {
    ctx.reply('Introzusca de nuevo la clave');
    let us=buscarUsuario(listaU,ctx);
    us.state[1]="rechazar_clave";
    selector(listaU, ctx);
  });
  bot.launch();
  console.log("El bot esta funcionando");
}
const getUsuario = (ctx: Context, sts: string[]) => {
  return {
    username: ctx.from?.username,
    id: ctx.from?.id,
    state: sts,
    password: "",
    admin: false,
    producto: getProducto()
  }
};
const getProducto = () => {
  return {
    descripcion: "",
    precio: 0.0,
    cantidad: 0,
    urlFoto: ""
  }
};

module.exports = { inicializarBot };