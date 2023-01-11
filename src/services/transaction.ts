import knex from '../database/knex';
import SaldoInsuficienteError from '../errors/SaldoInsuficienteError';
import ValidationError from '../errors/ValidationError';
import { ITransaction } from '../interfaces';
import userService from './user';

const MAIN_DATABASE = 'transactions';

const validate = async (t: ITransaction) => {
	if (!t.description) throw new ValidationError('Descrição é um atributo obrigatório');
	if (!t.amount) throw new ValidationError('Valor é um atributo obrigatório');
	if (!t.payer) throw new ValidationError('Pagador é um atributo obrigatório');
	if (!t.payee) throw new ValidationError('Beneficiário é um atributo obrigatório');
	if (t.payer === t.payee)
		throw new ValidationError('O pagador deve ser diferente do beneficiário');

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
