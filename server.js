"use strict";

/**
* Se carga la variable de entorno PORT
* del archivo .env
*/
require("dotenv").config();
require("./services/user.service");
const express = require("express");

/**
* Si la variable de entorno PORT
* se encuentra definida se utiliza,
* en caso contrario se utiliza 8000
*/
const port = process.env.PORT || 8000;

/**
* Se inicia la applicación de Express
*/
const app = express();

/**
 * El middleware de express para 
 * parsear el cuerpo de los jsons
 * recibidos en las peticiones.
 */
app.use(express.json());

/**
 * El get de ...
 */
app.get("/", (req, res) =>{
	res.send("Hola!!");
});

/**
 * El post de ...
 */
app.post("/brew", (req, res) =>{
	const { brew } = req.body;

	if ( brew === "tea" ){		
		res.send("Ok! I'll brew that!");
	} else {		
		res.status(418).send("I am a teapot");
	}
});

/**
* Se escucha en el puerto seleccionado
*/
app.listen(port, ()=>{
	const currentDate = new Date();
	const localDate = currentDate.toLocaleString().slice(0,19);
	console.log(`[${localDate}] Express JS corriendo en el puerto ${port}`);
});