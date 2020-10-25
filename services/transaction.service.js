"use strict";

/**
* Carga las credenciales de una DB a process.env
*/
require("dotenv").config();
const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const sqlAdapter = require("moleculer-db-adapter-sequelize");
const sequelize = require("sequelize");
const Exceljs = require("exceljs");

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
		}
	}
});

/**
 * Crea el servicio de listado de todas
 * las transacciones de un usuario,
 * el cual obtiene la información
 * del wrapper de la DB
 */
broker.createService({
	name: "transactions",
	actions: {
		/**
		 * Lista todas las transacciones de un usuario en 
		 * orden descendente. Arroja un error si el user_id
		 * no existe en el sistema o no es válido.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async list(ctx) {
			try {
				const transactions = await ctx.call("transaction.find", {
					sort: "-created_date",
					query: { user_id: ctx.params }
				});

				return transactions;
			} catch (error) {
				return Promise.reject(error);
			}
		}
	}
});

/**
 * Crea el servicio encargado de calcular los puntos
 * totales de un usuario mediante el
 * wrapper de la db.
 */
broker.createService({
	name: "points",
	actions: {
		/**
		 * Obtiene los puntos activos del usuario y calcula
		 * el total de puntos que ese posee.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async total(ctx) {
			try {
				const points = await ctx.call("transaction.find", {
					fields: [ "points" ],
					query: {
						user_id: ctx.params,
						status: 1
					}
				});

				return points.reduce((sum, item) => sum + item.points, 0);
			} catch (error) {
				console.log(error);
				console.log(error.message);
				return Promise.reject(error);
			}
		}
	}
});

/**
 * Crea el servicio encargado de 
 * deshabilitar una transacción
 * mediante el wrapper de la DB
 */
broker.createService({
	name: "disable",
	actions: {
		/**
		 * inactiva una transacción del sistema, cambiando
		 * su valor de la columna "status" a 0. Retorna
		 * un error si el transaction_id no existe o es
		 * inválido en el sistema.
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async transaction(ctx) {
			try {
				const updt = await ctx.call("transaction.update", {
					id: ctx.params,
					status: 0
				});
				return updt;
			} catch (error) {
				return Promise.reject(error);
			}
		}
	}
});

/**
 * Crea el servicio encargado de manipular
 * y crear el reporte de Excel de todas
 * las transacciones que posee un usuario
 */
broker.createService({
	name: "excel",
	actions: {
		/**
		 * Obtiene la lista de transacciones del
		 * usuario y crea un libro de excel reportando
		 * todas las transacciones que este tiene
		 * @param {Moleculer.Context} ctx El contexto del que se llama el servicio
		 */
		async report(ctx) {
			try {
				const transactions = await ctx.call("transaction.find", {
					query: { user_id: ctx.params }
				});
				const workbook = new Exceljs.Workbook();
				const sheet = workbook.addWorksheet("transactions");
				sheet.columns = [
					{ header: "transaction Id", key: "id" },
					{ header: "Created at", key: "created" },
					{ header: "Value", key: "value" },
					{ header: "Points", key: "points" },
					{ header: "Status", key: "status"}
				];

				transactions.map((transaction, index) => {
					const row = sheet.getRow (++index);
					row.getCell(1).value = transaction.transaction_id;
					row.getCell(2).value = transaction.created_date;
					row.getCell(3).value = transaction.value;
					row.getCell(4).value = transaction.points;
					row.getCell(5).value = transaction.status === 1 ? "Active" : "Inactive";
				});

				return workbook.xlsx;
			} catch (error) {
				return Promise.reject(error);
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