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

/**
* El handler para manjear el POST de creación
* de usuario. Cuando se crea un usuario se debe
* llamar a este endpoint del API con los
* parámetros correctos.
*/
app.post("/user", async (req, res) =>{
	const user = req.body;
	// Se validan que  estén los parámetros del nuevo usuario
	if(validateNewUser(user)) {
		res.status(400).send({ message: "Parámetros insuficientes!"});
	}
	else {
		// Se calcula el "user_id" del objeto
		user.user_id = hashEmail(user.email);
		
		// Se hace el hash del password
		user.password = await bcrypt.hash(user.password, saltRounds);
		
		// La fecha actual es la fecha de creación del usuario
		user.created_date = new Date();
		
		try {
			const respuesta = await userBroker.call("usuario.add", user );
			
			res.send({ message: respuesta });
		} 
		catch (error) {
			res.status(400).send(error.message);
		}
	}
	
});

/**
 * El handler para manejar el POST de login
 * de usuario. Cuando un usuario inicia sesión
 * debe llamar este endpoint con su correo
 * y contraseña.
 */
app.post("/login", async (req, res) => {
	const credentials = req.body;

	// Se revisa que las credenciales si fueron enviadas
	if(!credentials || !credentials.email || !!credentials.password) {
		res.status(400).send({ message: "Parámetros insuficientes!"});
	}
	else {
		const user_id = hashEmail(credentials.email);
		let message = "";
		let status = 200;
		try {
			const hashedPswd = await userBroker.call("usuario.getPass", user_id );

			// Se valida la contraseña con bcrypt.
			const isValid = await bcrypt.compare(credentials.password, hashedPswd);
			
			if (isValid){
				message = "Inicio de sesión exitosa!";
			} else {
				status = 401;
				message = "Credenciales no válidas";
			}
			
		} catch (error) {
			status = 401;
			message = "El usuario no existe";
			console.error(error);
		}
		res.status(status).send(message);
	}
});

/**
* Se escucha en el puerto seleccionado
*/
app.listen(port, () => {
	const currentDate = new Date();
	const localDate = currentDate.toLocaleString().slice(0,19);
	console.log(`[${localDate}] Express JS corriendo en el puerto ${port}`);
});

/**
* Le aplica el algoritmo de md5 y retorna el resultado
* en base 64.
* @param {string} email El correo al cual se le aplica el hash de md5 
*/
function hashEmail(email) {
	return crypto.createHash("md5")
		.update(email)
		.digest("base64");
}

/**
* Valida la información del nuevo
* usuario a agregar en el sistema
* @param {{[keys]: string}} usuario El nuevo usuario a validar
*/
function validateNewUser(usuario) {
	return (!usuario || !usuario.email || 
		!usuario.password || !usuario.name || 
		!usuario.lastname || !usuario.birth_date);
}