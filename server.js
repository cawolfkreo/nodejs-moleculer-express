"use strict";

/**
* Se carga la variable de entorno PORT
* del archivo .env
*/
require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

/**
 * Se importan los clientes de los
 * microservicios del proyecto
 */
const userBroker = require("./services/user.service");
const transacBroker = require("./services/transaction.service");
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
	if(!credentials || !credentials.email || !credentials.password) {
		res.status(400).send({ message: "Parámetros insuficientes!"});
	}
	else {
		const user_id = hashEmail(credentials.email);
		let message = "";
		let status = 200;
		try {
			const user = await userBroker.call("usuario.getPass", user_id );

			// Se valida la contraseña con bcrypt.
			const isValid = await bcrypt.compare(credentials.password, user.password);
			
			if (isValid){
				message = { mensaje: "inicio de sesión exitoso!", user_id: user.user_id };
			} 
			else {
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
 * El handler para manejar el POST para
 * agregar una transacción en el sistema.
 * El endpoint debe ser llamado los parámetros
 * válidos.
 */
app.post("/transaction", async (req, res) => {
	const newTransact = req.body;

	if(validateNewTransaction(newTransact)) {
		res.status(400).send("Parámetros insuficientes");
	}
	else {
		// La fecha actual es la fecha de creación de la transacción.
		newTransact.created_date = new Date();

		// El estado de una transacción nueva siempre es 1.
		newTransact.status = 1;
		try {
			const resultado = await transacBroker.call("transaccion.add", newTransact);
			res.send(resultado);
		} catch (error) {
			res.status(400).send("user_id inválido!");
			console.error(error);
			console.error(error.message);
		}
	}
});

/**
 * El handler para manejar el GET para
 * obtener la lista de transacciones de
 * un usuario. El endpoint debe ser 
 * llamado con el user_id de un usuario válido.
 */
app.get("/transactions", async (req, res) => {
	const { user_id } = req.body;
	if(!user_id){
		res.status(400).send("Parámetros insuficientes");
	}
	else {
		let message = {};
		let status = 200;

		try {
			// Pide la lista de transacciones del usuario
			const transactions = await transacBroker.call("transaccion.list", user_id);
			message = transactions;
		} catch (error) {
			message = "user_id inválido";
			status = 400;
			console.log(error.message);
		}
		//retorna el código y mensaje seleccionado.
		res.status(status).send(message);
	}
});

/**
 * Se inician los microservicios de transacciones y del usuario
 */
Promise.all([userBroker.start(), transacBroker.start()]).then(() =>{
	/**
	 * Se activa express una vez que los microservicios están 
	 * activos para que incie a escuchar en el puerto seleccionado.
	 */
	app.listen(port, () => {
		const currentDate = new Date();
		const localDate = currentDate.toLocaleString().slice(0,19);
		console.log(`[${localDate}] Express JS corriendo en el puerto ${port}`);
	});
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

/**
 * Valida la información de la nueva
 * transacción a agregar en el sistema.
 * @param {*} transaction La nueva transacción a validar
 */
function validateNewTransaction(transaction) {

	return (!transaction || !transaction.value ||
		!transaction.points ||!transaction.user_id);
}