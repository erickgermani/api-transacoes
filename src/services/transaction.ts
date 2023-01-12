import knex from '../database/knex';
import SaldoInsuficienteError from '../errors/SaldoInsuficienteError';
import ValidationError from '../errors/ValidationError';
import { ITransaction } from '../interfaces';
import userService from './user';

const MAIN_DATABASE = 'transactions';

const validate = async (t: ITransaction) => {
	if (typeof t.description !== 'string' || !t.description.length)
		throw new ValidationError('Descrição é um atributo string obrigatório');

	if (typeof t.amount !== 'number')
		throw new ValidationError('Valor é um atributo number obrigatório');

	if (typeof t.payer !== 'number' || !t.payer)
		throw new ValidationError('Pagador é um atributo number obrigatório');

	if (typeof t.payee !== 'number' || !t.payee)
		throw new ValidationError('Beneficiário é um atributo number obrigatório');

	if (t.payer === t.payee)
		throw new ValidationError('Pagador deve ser diferente do beneficiário');

	if (t.amount < 0.01) throw new ValidationError('Valor deve ser maior do que R$ 0,01');

	const b = await userService.getBalance(t.payer);
	const balance = parseFloat(b.balance);

	if (t.amount > balance)
		throw new SaldoInsuficienteError('Saldo insuficiente para realizar a operação');

	const p = await userService.findOne({ id: t.payee });

	if (p === undefined) throw new ValidationError('Destinatário não existe');
};

const authorizeTransaction = async () => {
	const res = await fetch('https://run.mocky.io/v3/8fafdd68-a090-496f-8c9a-3442cf30dae6');

	return await res.json();
};

const save = async (t: ITransaction) => {
	return await knex(MAIN_DATABASE).insert(t, ['*']);
};

const transactionService = { save, validate, authorizeTransaction };

export default transactionService;
