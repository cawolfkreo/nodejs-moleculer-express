"use strict";

/**
* Carga las credenciales de una DB a process.env
*/
require("dotenv").config();
const { promises } = require("fs");
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
* la tabla "transaction" de la base de datos
*/
broker.createService({
	name: "transaction",
	mixins: [DbService],
	adapter: new sqlAdapter( DB_SCHEMA, DB_USER, DB_PASS, { 
		host: DB_HOST,
		dialect: "mysql"
	}),
	model: {
		name: "transaction",
		define: {
			transaction_id: {
				type: sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			created_date: sequelize.DATE,
			value: sequelize.DECIMAL(19,12),
			points: sequelize.INTEGER,
			status: sequelize.INTEGER,
			user_id: sequelize.STRING
		},
		options: {
			tableName: "transaction",
			timestamps: false
		}
	},
});

/**
 * Se crean los microservicios para manipular los
 * datos del usuario y para manipular el wrapper
 * respectivo de la base de datos.
 */
broker.createService({
	name: "transaccion",
	actions:{
		/**
		 * Agrega una transacción al sistema para el usuario dado
		 * por parámetro. Arroja un error en caso de que no exista
		 * el user_id recibido en el sistema
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async add(ctx) {
			try {
				const transacion = await ctx.call("transaction.create", ctx.params);
				return {
					message: "Transacción agregada creado exitosamente!", 
					transaction_id: transacion.transaction_id
				};
			} catch (error) {
				return Promise.reject(error);
			}
		},
		/**
		 * Lista todas las transacciones de un usuario en 
		 * orden descendente. Arroja un error si el user_id
		 * no existe en el sistema o no es válido.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async list(ctx) {
			try {
				const transactions = await ctx.call("transaction.find", { 
					sort: "-created_date" 
				},
				{
					where:{
						user_id: ctx.params
					}
				});

				return transactions;
			} catch (error) {
				return promises.reject(error);
			}
		}
	}
});

/**
 * Se exporta el broker que contiene el cliente
 * de los servicios relacionados con las 
 * transacciones
 */
module.exports = broker;