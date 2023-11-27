//TODO algo que esta pendiente
//! problema en el codigo
//? Algo que debo quitar o mejorar
//* Informacion importante

import { setServers } from "dns";

// const init = require('./logica/inicializarBot.ts');
// //const fun = require("./logica/Funciones.js");
// init.inicializarBot();


const {BDConectar}=require('./logica/conexion');

const con=BDConectar('TiendaOnline');
con.abrir();
const respuesta:any=con.crearUsuario(2,'Pedro Farrada','1234');
console.log(respuesta);
con.cerrar();

