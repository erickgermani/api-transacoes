class SaldoInsuficienteError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SaldoInsuficienteError';
	}
}

export default SaldoInsuficienteError;
