"use strict";

/**
* Carga las credenciales de una DB a process.env
*/
require("dotenv").config();

const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const sqlAdapter = require("moleculer-db-adapter-sequelize");
const sequelize = require("sequelize");

/**
* Las credenciales para conectar con la DB se
* toman de estas variables de entorno.
*/
const { DB_HOST, DB_USER, DB_PASS, DB_SCHEMA } = process.env;

/**
* Se crea el broker para el microservicio
*/
const broker = new ServiceBroker();


/**
* Se crea el microservicio para manipular
* la tabla "user" de la base de datos
*/
broker.createService({
	name: "user",
	mixins: [DbService],
	adapter: new sqlAdapter( DB_SCHEMA, DB_USER, DB_PASS, { 
		host: DB_HOST,
		dialect: "mysql"
	}),
	model: {
		name: "user",
		define: {
			user_id: {
				type: sequelize.STRING,
				primaryKey: true
			},
			created_date: sequelize.DATE,
			name: sequelize.STRING,
			lastname: sequelize.STRING,
			birth_date: sequelize.DATE,
			email: sequelize.STRING,
			password: sequelize.STRING
		},
		options: {
			tableName: "user",
			timestamps: false
		}
	},
});

/**
 * Se inicia el servicio de usuarios
 */
broker.start()
	.then( () => broker.call("user.find"))
	.then( res => {
		console.log("De la base de datos obtuve:");
		console.log( res );
	})
	.catch(err => console.error(err));

/**
 * Se exporta el broker que contiene los servicios del usuario.
 */
module.exports = broker;