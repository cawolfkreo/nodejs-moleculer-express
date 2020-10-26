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
* Se crea el nodo para manejar los
* servicios relacionados con los
* usuarios.
*/
const broker = new ServiceBroker({ logger: false });

/**
* Se crea el microservicio para manipular
* la tabla "user" de la base de datos
*/
broker.createService({
	name: "user",
	mixins: [DbService],
	adapter: new sqlAdapter( DB_SCHEMA, DB_USER, DB_PASS, { 
		host: DB_HOST,
		dialect: "mysql",
		logging: false
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
 * Se crea el Microservicio encargado
 * de manipular el wrapper de la db
 * al momento de iniciar sesión.
 */
broker.createService({
	name: "registrar",
	actions:{
		/**
		 * Agregua a un usuario a la DB si este no existe.
		 * En caso de existir no lo agrega y lanza un error.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async add(ctx) {
			try {
				await ctx.call("user.create", ctx.params);
				return Promise.resolve("Usuario creado exitosamente!");
			} catch (error) {
				return Promise.reject("El usuario ya existe!");
			}
		}
	}
});

/**
 * Se crea el Microservicio encargado 
 * de manipular el wrapper de la db
 * para el inicio de sesión del usuario
 */
broker.createService({
	name: "login",
	actions:{
		/**
		 * Obtiene la contraseña hasheada y el id del usuario
		 * de la base de datos. En caso de que el usuario no
		 * exista se retorna un mensaje de error.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async login(ctx) {
			const user_id = ctx.params;
			try {
				const user = await ctx.call("user.get", {
					id: user_id
				});
				return { password: user.password, user_id: user.user_id };
			} catch (error) {
				return Promise.reject(error.message);
			}
		}
	}
});

/**
 * Se exporta el broker que contiene el cliente
 * de los servicios relacionados con los usuarios
 */
module.exports = broker;