const axios = require("axios");
const { log, Console } = require("console");
const fs = require("fs");
const { Client } = require('pg');
let conex;
function esComando(message) {
    return message.text[0] === '/' || message.text[0] === '#' || message.text[0] === '@'
}
function buscarUsuario(users, ctx) {
    let us = null;
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
            us.producto.id_prod = ctx.message?.text.substring(18);
            agregar_producto(users, ctx);
            break;
        case 'ReservarProducto':
            ConfirmarClave(ctx, users);
            break;
        case "siguiente pagina":
            const pageNumber = parseInt(ctx.match[1]);
            verProductos(users, ctx, pageNumber);
            break;
        case "cancelar":
        case "ver_productos":
            verProductos(users, ctx, 0)
            break;
        case "clave":
            registrarse(users, ctx);
            break;
    }
}

function ConfirmarClave(ctx, users) {
    let us = buscarUsuario(users, ctx);
    let ban = us.state;
    switch (ban[1]) {
        case "PedirClave":
            ctx.reply('Por favor introduzca su clave');
            us.state[1] = "RevisarClave";
            break;
        case "RevisarClave": conex.query(`select revisar_clave(${ctx.from.id}, '${cambiarLetras(ctx.message.text)}')`).then((resp) => {
            if (resp.rows[0].revisar_clave) {
                ReservarProducto(ctx, users);
            } else {
                us.state[1] = "PedirClave";
                ctx.reply('La clave introducida es incorrecta');
                ConfirmarClave(ctx, users);
            }
        });
    }
}

function ReservarProducto(ctx, users) {
    let us = buscarUsuario(users, ctx);
    conex.query(`SELECT reservar_producto('${us.producto.id}')`).then((resp) => {
        const datos = resp.rows[0].reservar_producto.split(',');
        ctx.reply(`Su producto ha sido reservado.\nRecibo de reserva:\nCodigo del producto: ${datos[3]}\nDescripcion: ${datos[5]}\nPrecio: ${datos[0]}`);
        const index = users.indexOf(us);
        users.splice(index, 1)
    })
}

function verProductos(users, ctx, inicio) {
    let us = buscarUsuario(users, ctx);
    conex.query(`Select obtener_producto(${inicio * 10})`).then((res, err) => {
        for (let index = 0; index < res.rows.length; index++) {
            const datos = res.rows[index].obtener_producto.split(',');
            const filePath = `${datos[4]}`;
            if (fs.existsSync(filePath)) {
                const stream = fs.createReadStream(filePath);
                ctx.replyWithPhoto({ source: stream }, { caption: `Descripcion:${datos[5]}\nPrecio: ${datos[0]}\nCantidad en existencia: ${datos[1]}\n/comprar_producto_${datos[3]}` })
                    .then(
                        conex.query(`SELECT COUNT(*) FROM producto`).then(resp => {
                            if (resp.rows[0].count > (inicio + 1) * 10 && index === 9) {
                                ctx.replyWithHTML(
                                    `Precione este boton para ver mas productos`,
                                    { reply_markup: { inline_keyboard: [[{ text: `proxima pagina`, callback_data: `pagina: ${inicio + 1}` },]] } });
                            }
                        }));
            } else {
                ctx.reply(`Descripcion:${datos[5]}\nPrecio: ${datos[0]}\nCantidad en existencia: ${datos[1]}\n/comprar_producto_${datos[3]}`)
                    .then(
                        conex.query(`SELECT COUNT(*) FROM producto`).then(resp => {
                            if (resp.rows[0].count > (inicio + 1) * 10 && index === 9) {
                                ctx.replyWithHTML(
                                    `Precione este boton para ver mas productos`,
                                    { reply_markup: { inline_keyboard: [[{ text: `proxima pagina`, callback_data: `pagina: ${inicio + 1}` },]] } });
                            }
                        }))
            }

        }
    });
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
                us.producto.urlFoto = `C:/Users/Marcos/Desktop/Bots/Fotos_Productos/${fileId}.jpg`;
                conex.query(`SELECT agregar_producto('${Date.now() + ""}', '${us.producto.urlFoto}' , ${us.producto.precio},${us.producto.cantidad},'${us.producto.descripcion}',${us.producto.fijo})`);
                ctx.reply("El producto ha sido registrado");
                const index = users.indexOf(us);
                users.splice(index, 1)
            } else {
                ctx.reply("Ha ocurrido un error con el envio de la foto. Intente de nuevo")
                agregar_producto(ban, ctx);
            }
            break;
        case "agregar_producto_imag":
            conex.query(`SELECT agregar_producto('${Date.now() + ""}', '${null}', ${us.producto.precio}, ${us.producto.cantidad}, '${us.producto.descripcion}', ${us.producto.fijo})`);

            ctx.reply("El producto ha sido registrado");
            const index = users.indexOf(us);
            users.splice(index, 1)
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
}

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
            conex.query(`Select crear_usuario(${us.id},'${us.username}','${cambiarLetras(us.password)}')`);
            ctx.reply("Usted ha sido registrado");
            consulta("usuario", us);
            const index = users.indexOf(us);
            users.splice(index, 1);
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

function cambiarLetras(str) {
    let resultado = '';
    for (let i = 0; i < str.length; i++) {
        let ascii = str.charCodeAt(i);
        if (ascii >= 65 && ascii <= 90) { // Letras mayúsculas
            if (ascii === 90) { // Si es la 'Z', cambiar a 'A'
                resultado += String.fromCharCode(65);
            } else {
                resultado += String.fromCharCode(ascii + 1);
            }
        } else if (ascii >= 97 && ascii <= 122) { // Letras minúsculas
            if (ascii === 122) { // Si es la 'z', cambiar a 'a'
                resultado += String.fromCharCode(97);
            } else {
                resultado += String.fromCharCode(ascii + 1);
            }
        } else { // Si no es una letra, mantenerla igual
            resultado += str[i];
        }
    }
    return resultado;
}
function revertirLetras(str) {
    let resultado = '';
    for (let i = 0; i < str.length; i++) {
        let ascii = str.charCodeAt(i);
        if (ascii >= 65 && ascii <= 90) { // Letras mayúsculas
            if (ascii === 65) { // Si es la 'A', cambiar a 'Z'
                resultado += String.fromCharCode(90);
            } else {
                resultado += String.fromCharCode(ascii - 1);
            }
        } else if (ascii >= 97 && ascii <= 122) { // Letras minúsculas
            if (ascii === 97) { // Si es la 'a', cambiar a 'z'
                resultado += String.fromCharCode(122);
            } else {
                resultado += String.fromCharCode(ascii - 1);
            }
        } else { // Si no es una letra, mantenerla igual
            resultado += str[i];
        }
    }
    return resultado;
}
module.exports = { selector, buscarUsuario, esComando, consulta, ReservarProducto };