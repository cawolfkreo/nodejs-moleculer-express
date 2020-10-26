// Carga de los servicios
const userSchema = require("../services/user.service");
const transactionSchema = require("../services/transaction.service");

describe("Test 'servicios usuario'", () => {
	//Se toma el cliente de usuario
	let broker = userSchema;

	// Se inician los microservicios de usuario
	beforeAll(() => broker.start());

	// Se detienen los servicios de usuario al finalizar los test
	afterAll(() => broker.stop());

	// mock de usuario para utilizar en las pruebas
	const usuarioMock = {
		email:"prueba@email.com",
		name:"prueba",
		lastname: "prueba",
		birth_date: new Date(),
		password:"password3Simple",
		user_id:"NKBfL2KJRZOCZdzJQSocYQ==",
		created_date: new Date()
	};

	describe("Test 'registrar.add' action", () => {
		
		it("Debe crear un usuario", async () => {
			const resultado = await broker.call("registrar.add", usuarioMock);
			expect(resultado).toBe("Usuario creado exitosamente!");
		});
		it("No debe crear un usuario", async () =>{
			
			await expect(broker.call("registrar.add", usuarioMock))
				.rejects
				.toThrow("El usuario ya existe!");
		});
	});

	describe("Test 'login.login' action", () => {

		it("Debe iniciar sesión", async () => {
			const resultado = await broker.call("login.login", usuarioMock.user_id);
			expect(resultado).toStrictEqual({
				password: usuarioMock.password,
				user_id: usuarioMock.user_id
			});
		});

		it("Debe fallar el inicio", async () => {
			await expect(broker.call("login.login",{
				user_id:"IdInvalido"
			}))
				.rejects
				.toThrow();
		});
	});
});

describe(" Test 'servicios transacciones'", () => {
	//Se toma el cliente de transacciones
	const broker = transactionSchema;

	// Se inician los microservicios de usuario
	beforeAll(() => broker.start());

	// Se detienen los servicios de usuario al finalizar los test
	afterAll(() => broker.stop());
	
	// mock de un objeto de transaccion para probar en las pruebas
	const transactionMock = {
		value: 50249.99,
		points: 5,
		user_id: "NKBfL2KJRZOCZdzJQSocYQ==",
		created_date: new Date(),
		status: 1
	};
	
	// lista para almacenar los IDs de transacciones.
	const transactionIds = [];

	describe("Test 'transaccion.add' action", () => {
		
		it("Debe crear una transaccion", async () => {
			const resultado = await broker.call("transaccion.add", transactionMock);
			expect(resultado.message).toBe("Transacción agregada creado exitosamente!");
			transactionIds.push(resultado.transaction_id);
		});

		it("No debe crear un usuario", async () =>{
			
			await expect(broker.call("transaccion.add", "usuarioNoValido"))
				.rejects
				.toThrow();
		});
	});

	describe("Test 'transactions.list' action", () =>{
		it("Debe listar todas las transacciones creadas", async () =>{
			const nuevaTrans = await broker.call("transaccion.add", transactionMock);
			transactionIds.push(nuevaTrans.transaction_id);

			const result = await broker.call("transactions.list", transactionMock.user_id);
			expect(result.length).toBe(transactionIds.length);
		});

		it("Debe arrojar una lista vacia", async () => {
			const respuesta = await broker.call("transactions.list", "usuarioInvalido");
			expect(respuesta).toStrictEqual([]);
		});
	});

	describe("Test 'points.total' action", () => {
		it("Debe dar el total de puntos de las transacciones creadas", async () => {
			const puntos = await broker.call("points.total", transactionMock.user_id);
			expect(puntos).toBe(transactionIds.length * transactionMock.points);
		});

		it("Debe arrojar 0 puntos", async () => {
			const puntos = await broker.call("points.total", "usuarioInvalido");
			expect(puntos).toBe(0);
		});
	});

	describe("Test 'disable.transaction' action", () => {

		it("debe deshabilitar una transaccion", async () => {
			const { user_id, points, status} = await broker.call("disable.transaction", transactionIds[0]);
			expect(user_id).toBe(transactionMock.user_id);
			expect(points).toBe(transactionMock.points);
			expect(status).toBe(0);
		});

		it("debe arrojar un error", async () => {
			await expect(  broker.call("disable.transaction", "idInvalido"))
				.rejects
				.toThrow();
		});
	});

	describe("Test 'excel.report' action", () => {
		it("debe deolver un archivo xlsx", async () => {
			const { workbook } = await broker.call("excel.report", transactionMock.user_id);

			expect(workbook).not.toBe(null);
			expect(workbook).not.toBe(undefined);
			
			expect(workbook._worksheets).not.toBe(null);
			expect(workbook._worksheets).not.toBe(undefined);
		});
	});
});
