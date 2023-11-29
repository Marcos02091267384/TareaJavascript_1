const axios = require("axios");
const { log } = require("console");
const fs = require("fs");
const { Client } = require('pg');
let conex;
function esComando(message) {
    return message.text[0] === '/' || message.text[0] === '#' || message.text[0] === '@'
}
function buscarUsuario(users, ctx) {
    let us;
    let parar = false;
    for (let index = 0; index < users.length && !parar; index++) {
        const element = users[index];
        if (element.id === ctx.from.id) {
            us = element;
            parar = true;
        }
    }
    return us;
}

function selector(users, ctx) {
    let us = buscarUsuario(users, ctx);
    let ban = us.state;

    switch (ban[0]) {
        case "agregar_producto":
            agregar_producto(users, ctx);
            break;
        case "escuchando":
        case "cancelar":
        case "clave":
            registrarse(users, ctx);
            break;
    }
}
function agregar_producto(users, ctx) {
    let us = buscarUsuario(users, ctx);
    let ban = us.state;
    switch (ban[1]) {
        case "entrada":
            ctx.reply("Introduzca una descripcion");
            ban[1] = "agregar_producto_desc";
            break;
        case "agregar_producto_desc":
            if (ctx !== undefined && ctx.message !== undefined && 'text' in ctx.message) {
                us.producto.descripcion = ctx.message.text;
            }
            ctx.reply("Introduzca un precio");
            ban[1] = "agregar_producto_val";
            break;
        case "agregar_producto_val":
            if (ctx !== undefined && ctx.message !== undefined && 'text' in ctx.message) {
                us.producto.precio = parseFloat(ctx.message.text);
            }
            ctx.reply("Introduzca la cantidad");
            ban[1] = "agregar_producto_cant";
            break;
        case "agregar_producto_cant":
            if (ctx !== undefined && ctx.message !== undefined && 'text' in ctx.message) {
                us.producto.cantidad = parseInt(ctx.message.text);
            }
            ctx.replyWithHTML(
                `Este producto sera una mercancia regular de la tienda?`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: 'Sí', callback_data: 'regular' },
                                { text: 'No', callback_data: 'no regular' }
                            ]
                        ]
                    }
                }
            );
            break;
        case "agregar_producto_imag_si":
            const tam = ctx.update.message.photo.length - 1;
            if (tam >= 0) {
                const fileId = ctx.update.message.photo[tam].file_id;
                ctx.telegram.getFileLink(fileId).then((response) => { DescargarImagen(response.href, `C:/Users/Marcos/Desktop/Bots/Fotos_Productos/${fileId}.jpg`) })
                us.urlFoto = `C:/Users/Marcos/Desktop/Bots/Fotos_Productos/${fileId}.jpg`;
                const fecha = new Date(Date.now()).toString();
                conex.query(`SELECT agregar_producto('${fecha}' , '${us.producto.urlFoto}',${us.producto.precio},${us.producto.cantidad},'${us.producto.descripcion}',${us.producto.fijo})`);

                ctx.reply("El producto ha sido registrado");

            } else {
                ctx.reply("Ha ocurrido un error con el envio de la foto. Intente de nuevo")
                agregar_producto(ban, ctx);
            }
            users = users.filter(item => item !== us);
            break;
        case "agregar_producto_imag":
            const fecha = new Date(Date.now()).toString();
            conex.query(`SELECT agregar_producto('${fecha}' , '${us.producto.urlFoto}',${us.producto.precio},${us.producto.cantidad},'${us.producto.descripcion}',${us.producto.fijo})`);

            ctx.reply("El producto ha sido registrado");
            users = users.filter(item => item !== us);
            break;
    }

}
function DescargarImagen(url, dir) {
    axios({ url, responseType: "stream" }).then(
        (response) =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(dir))
                    .on("finish", () => {
                        console.log("Se ha guardado una imagen");
                        resolve();
                    })
                    .on('error', (e) => { console.log(`Ha ocurrido un error: ${e}`); reject(e); });
            }));
};
function registrarse(users, ctx) {
    let us = buscarUsuario(users, ctx);
    let ban = us.state;
  
    switch (ban[1]) {
        case "introducir_clave":
            ctx.reply("Introduzca una clave de al menos 8 caracteres que contenga, al menos una letra y al menos un caracter. No puede empezar por @, # o / ");
            ban[1] = "confirmar_clave";
            us.id = ctx.from.id;
            us.username = ctx.from.username;
            us.admin = false;
            break;
        case "confirmar_clave":
            if (validarContrasena(ctx.message.text)) {
                ctx.replyWithHTML(
                    `Confirma que tu clave es ${ctx.message.text}`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: 'Sí', callback_data: 'aceptar clave' },
                                    { text: 'No', callback_data: 'rechazar clave' }
                                ]
                            ]
                        }
                    }
                );
                us.password = ctx.message.text;
            } else {
                ctx.reply("Clave invalida. Intente de nuevo");
            }
            break;
        case "aceptar_clave":
            conex.query(`Select crear_usuario(${us.id},'${us.username}','${us.password}')`);
            ctx.reply("Usted ha sido registrado");
            consulta("usuario", us);
            users = users.filter(item => item !== us);
            break;
        case "rechazar_clave":
            us.state[1] = "confirmar_clave";
            break;
    }

}
function validarContrasena(contrasena) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    return regex.test(contrasena);
}

function consulta() {
    if (conex === null || conex === undefined) {
        conex = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'TiendaOnline',
            password: '02091267384',
            port: 5432,
        });
        conex.connect()
            .then(() => console.log('Conectadoto a la Base de Datos'))
            .catch(err => console.error('Connection error', err.stack));
    }
    return conex;

}
module.exports = { selector, buscarUsuario, esComando, consulta };