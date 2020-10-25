"use strict";

/**
* Se carga la variable de entorno PORT
* del archivo .env
*/
require("dotenv").config();
const userBroker = require("./services/user.service");
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

/**
 * El número de iteraciones para la generación
 * de la sal que bycript utilizará
 */
const saltRounds = 15;

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

app.post("/user", async (req, res) =>{
	const user = req.body;

	// Se calcula el "user_id" del objeto
	user.user_id = crypto.createHash("md5").update(user.email).digest("base64");

	// Se hace el hash del password
	user.password = await bcrypt.hash(user.password, saltRounds);

	// La fecha actual es la fecha de creación del usuario
	user.created_date = new Date();

	try {
		await userBroker.call("usuario.add", user );
		res.send({ message: "usuario creado exitosamente" });
	} catch (error) {
		res.status(400).send(error);
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
