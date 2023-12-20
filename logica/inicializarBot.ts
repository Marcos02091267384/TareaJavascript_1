import { Context, Telegram } from 'telegraf';
require('dotenv').config();
const { Telegraf } = require('telegraf');
import { selector, buscarUsuario, esComando, consulta, ReservarProducto } from './Funciones';
let listaU: any[] = [];
const bot = new Telegraf(process.env.BOT_TOKEN);

function inicializarBot() {
  //*******************************Comandos*******************************

  bot.help((ctx: Context) => {
    ctx.reply(`Listado de comandos:
    /agregar_producto: Solo lo pueden usar los administradores. Permite poner a la venta un nuevo producto.
    /eliminame: Te permite eliminar tu cuenta de la base de datos.
    /productos: Te va mostrando la lista de productos de 10 en 10.
    /comprar_producto_idProducto: Permite reservar un producto. Este comando aparece en los productos y solamente se puede activar desde ellos.
    /bloquear: Solo esta permitido para administradores y permite loboquear a un usuario por malas acciones.
    /reglas: Muestra las reglas.
    /start: Permite iniciarse en el bot si no te has registrado.
    /cancelar: Detiene un proceo en curso`);
  });

  bot.start((ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then((res: any) => {
      if (res.rows[0].existe_usuario === 0) {


        ctx.replyWithHTML(
          `Hola bienvenido. Para interactuar con el bot es necesario registrarse. Para ello por favor incerte una contraseña`,
          { reply_markup: { inline_keyboard: [[{ text: 'Registrarse', callback_data: 'registro' }]] } }
        );


      } else if (res.rows[0].existe_usuario === 2) {
        ctx.reply(`Usted ya se ha registrado en el bot. Para iniciar una nueva cuenta preciones recuperar_crear_cuenta`);
      } else if (res.rows[0].existe_usuario === 1) {
        ctx.reply(`Usted ya esta registrado`)
      } else if (res.rows[0].existe_usuario === 3) {
        ctx.reply(`Usted esta bloqueado. Presione el comando de /administradores para ver la lista de administradores y contactar a uno`);
      }
    });


  });

  bot.command('recuperar_crear_cuenta', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then((res: any) => {
      if (res.rows[0].existe_usuario === 0) {


        ctx.replyWithHTML(
          `Hola bienvenido. Para interactuar con el bot es necesario registrarse. Para ello por favor incerte una contraseña`,
          { reply_markup: { inline_keyboard: [[{ text: 'Registrarse', callback_data: 'registro' }]] } }
        );


      } else if (res.rows[0].existe_usuario === 2) {
        consulta().query(`delete from usuario where id_= ${ctx.from?.id}`)
        let us = getUsuario(ctx, ["clave", "introducir_clave"]);
        listaU.push(us);
        selector(listaU, ctx);
      } else if (res.rows[0].existe_usuario === 1) {
        ctx.reply(`Usted ya esta registrado`)
      } else if (res.rows[0].existe_usuario === 3) {
        ctx.reply(`Usted esta bloqueado. Presione el comando de /administradores para ver la lista de administradores y contactar a uno`);
      }
    });

  });

  bot.command("agregar_producto", (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id}) `).then((res1: any) => {
      if (res1.rows[0].existe_usuario === 1) {
        consulta().query(`Select es_admin(${ctx.from?.id})`).then((res3: any) => {
          if (res3.rows[0].es_admin) {
            const us = getUsuario(ctx, ['agregar_producto', "entrada"]);
            listaU.push(us);
            selector(listaU, ctx);
          } else {
            ctx.reply('Esta accion solo esta disponible para un administrador')
          }
        });
      } else if (res1.rows[0].existe_usuario === 0 && res1.rows[0].existe_usuario === 2) {
        ctx.reply(`Para interactuar con el bot, primero debes registrarte`);
      } else if (res1.rows[0].existe_usuario === 3) {
        ctx.reply("Usted esta bloqueado, por lo que no puede interactuar con el bot. Pongase en contacto con algun admin ( /administradores )")
      }
    });


  });

  bot.command('test', (ctx: Context) => {

  });

  bot.command('eliminame', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res: any) => {
      if (res.rows[0].existe_usuario === 1) {

        const us = getUsuario(ctx, ['eliminarse', "confirmar"]);
        listaU.push(us);
        selector(listaU, ctx);

      } else if (res.rows[0].existe_usuario === 2) {
        ctx.reply(`Usted ya esta eliminado`);
      } else if (res.rows[0].existe_usuario === 3) {
        ctx.reply(`Usted esta bloqueado. Porgase en contacto con algun admin ( /administradores ) `)
      }
    });

  });

  bot.command('borrar_cuenta', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id}) `).then((res1: any) => {

      if (res1.rows[0].existe_usuario === 1) {
        consulta().query(`Select es_admin(${ctx.from?.id})`).then((res3: any) => {
          console.log(res3.rows);
          if (res3.rows[0].es_admin) {
            const us = getUsuario(ctx, ['borrarCuenta', "PedirNombre"]);
            listaU.push(us);
            selector(listaU, ctx);
          } else {
            ctx.reply('Esta accion solo esta disponible para un administrador')
          }
        });
      } else if (res1.rows[0].existe_usuario === 0 && res1.rows[0].existe_usuario === 2) {
        ctx.reply(`Para interactuar con el bot, primero debes registrarte`);
      } else if (res1.rows[0].existe_usuario === 3) {
        ctx.reply("Usted esta bloqueado, por lo que no puede interactuar con el bot. Pongase en contacto con algun admin ( /administradores )")
      }
    });

  });

  bot.hears(/\/comprar_producto_(.+)/, (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {
        consulta().query(`Select bloqueado(${ctx.from?.id})`).then((resp2: any) => {
          if (resp2.rows[0].bloqueado) {
            const us = getUsuario(ctx, ['ReservarProducto', "PedirClave"]);
            listaU.push(us);
            selector(listaU, ctx);
          } else {
            ctx.reply(`Usted esta bloqueado. Presione el comando de /administradores para ver la lista de administradores y contactar a uno`);
          }
        });
      } else {
        ctx.reply('No esta registrado. Por favor registrese')
      }
    });

  });

  bot.command('productos', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {
        consulta().query(`Select bloqueado(${ctx.from?.id})`).then((resp2: any) => {
          if (resp2.rows[0].bloqueado) {
            const us = getUsuario(ctx, ['ver_productos', ""]);
            us.producto.inicio = 0;
            listaU.push(us);

            selector(listaU, ctx);
            listaU.splice(listaU.indexOf(us));
          } else {
            ctx.reply(`Usted esta bloqueado. Presione el comando de /administradores para ver la lista de administradores y contactar a uno.`);
          }
        })

      } else {
        ctx.reply(`Para interactuar con el bot, primero debes registrarte`);
      }
    }
    );
  });

  bot.command('cancelar', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null) {
      us.state[0] = 'cancelar'
      selector(listaU, ctx);
    }
  });

  bot.command("bloquear", (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id}) and `).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {
        consulta().query(`Select es_admin(${ctx.from?.id})`).then(async (res2: any) => {

          if (res2.rows[0].es_admin) {

            consulta().query(`Select bloqueado(${ctx.from?.id})`).then(async (res3: any) => {
              if (!res3.rows[0].bloqueado) {
                const us = getUsuario(ctx, ['bloquear', "nombre"]);
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

  bot.command('administradores', (ctx: Context) => {
    consulta().query(`Select nombre from usuario where admin_= true; `).then((resp: any) => {
      const listaAdmin: any[] = resp.rows;
      let msg: string = 'Listado de Administradores:\n';
      for (let index = 0; index < listaAdmin.length; index++) {
        const element = listaAdmin[index];
        msg += `@${listaAdmin[index].nombre}\n`;
      }
      ctx.reply(msg);
    });
  })

  bot.command('anunciar', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id}) and `).then(async (res1: any) => {
      if (res1.rows[0].existe_usuario) {
        consulta().query(`Select es_admin(${ctx.from?.id})`).then(async (res2: any) => {

          if (res2.rows[0].es_admin) {

            consulta().query(`Select bloqueado(${ctx.from?.id})`).then(async (res3: any) => {
              if (!res3.rows[0].bloqueado) {
                const us = getUsuario(ctx, ['anunciar', "activar"]);
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
  //*******************************on*******************************

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


  //*******************************Acciones*******************************

  bot.action('aceptar clave', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'confirmar_clave') {
      ctx.reply('Has confirmado que tu clave es correcta');
      us.state[1] = "aceptar_clave";
      selector(listaU, ctx);
    }
    ctx.telegram.deleteMessage(us.idSMSClave.chat.id,us.idSMSClave.message_id);
  });

  bot.action('borrar', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us.state[1] === "borrar") {
      consulta().query('Select id_ from usuario where nombre=' + us.borrar.slice(1)).then((resp: any) => {
        consulta().query('delete from usuario where nombre=' + us.borrar.slice(1)).then((resp: any) => {
          ctx.telegram.sendMessage(resp.rows[0].id_, "Su cuenta ha sido borrada totalmente")
        });
      });

      const index = us.indexOf(us);
      listaU.splice(index, 1);
    }
  });

  bot.action('cancelar', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us.state[1] === "borrar") {
      const index = us.indexOf(us);
      listaU.splice(index, 1);
    }
  });

  bot.action('eliminar cuenta', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'eliminarse') {
      ctx.reply('Has confirmado que tu clave es correcta');
      us.state[1] = "confirmar";
      selector(listaU, ctx);
    }
  });

  bot.action('no eliminar cuenta', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'eliminarse') {
      ctx.reply('Has confirmado que tu clave es correcta');
      us.state[0] = "cancelar";
      selector(listaU, ctx);
    }
  });

  bot.action('sms', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'activar') {
      ctx.reply('¿Que desea enviar?');
      us.state[0] = "sms";
      selector(listaU, ctx);
    }
  });
  bot.action('audio', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'activar') {
      ctx.reply('¿Que desea enviar?');
      us.state[0] = "audio";
      selector(listaU, ctx);
    }
  });
  bot.action('imagen', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'activar') {
      ctx.reply('¿Que desea enviar?');
      us.state[0] = "imagen";
      selector(listaU, ctx);
    }
  });
  bot.action('doc', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'activar') {
      ctx.reply('¿Que desea enviar?');
      us.state[0] = "doc";
      selector(listaU, ctx);
    }
  });

  bot.action('registro', (ctx: Context) => {
    consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res: any) => {
      if (res.rows[0].existe_usuario === 0) {
        consulta().query(`Select existe_usuario(${ctx.from?.id})`).then(async (res: any) => {

          let us = getUsuario(ctx, ["clave", "introducir_clave"]);
          listaU.push(us);
          selector(listaU, ctx);

        });
      } else {
        switch (res.rows[0].existe_usuario) {
          case 3:
            ctx.reply('Usted esta bloqueado. Presione el comando de /administradores para ver la lista de administradores y contactar a uno');
            break;

          case 1:
            ctx.reply(`Usted ya esta registrado`)
            break;

          case 2:
            ctx.reply(`Usted ya se ha registrado en el bot. Para iniciar una nueva cuenta preciones recuperar_crear_cuenta`);
            break;
        }
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
    ctx.telegram.deleteMessage(us.idSMSClave.chat.id,us.idSMSClave.message_id);
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

  bot.action('aceptar bloqueo', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'conf') {
      consulta().query(`SELECT bloquear_usuario(${us.usBloq},${us.usBloqDesc})`).then((resp: any) => {
        ctx.reply(`El usuario ${us.usBloq} ha sido bloqueado`);
        bot.telegram.sendMessage(resp.rows[0].bloquear_usuario, "Usted a sido bloqueado. Pongase en contacto con alguno de los administradores de la tienda ( /administradores )")
      }
      );
    }
  });

  bot.action(' rechazar bloqueo', (ctx: Context) => {
    let us = buscarUsuario(listaU, ctx);
    if (us !== null && us.state[1] === 'conf') {
      us.state[0] = 'cancelar';
      selector(listaU, ctx);
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
    idSMSClave: "",
    producto: getProducto()
  }
};
const getProducto = () => {
  return {
    descripcion: " ",
    precio: 0.0,
    cantidad: 0,
    id_prod: " ",
    urlRecurso: " ",
    inicio: 0
  }
};

module.exports = { inicializarBot };