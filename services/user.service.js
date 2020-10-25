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
 * 
 */
broker.createService({
	name: "usuario",
	actions:{
		/**
		 * Agregua a un usuario a la DB si este no existe.
		 * En caso de existir no lo agrega y lanza un error.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el selvicio
		 */
		async add(ctx) {
			try {
				await ctx.call("user.create", ctx.params);
				return Promise.resolve("Usuario creado exitosamente!");
			} catch (error) {
				return Promise.reject("El usuario ya existe!");
			}
		},
		async getPass(ctx) {
			const user_id = ctx.params;
			try {
				const user = await ctx.call("user.get", {
					id: user_id
				});
				return user.password;
			} catch (error) {
				return Promise.reject(error.message);
			}
		}
	}
});

/**
 * Se inicia el servicio de usuarios
 */
broker.start();

/**
 * Se exporta el broker que contiene los servicios del usuario.
 */
module.exports = broker;