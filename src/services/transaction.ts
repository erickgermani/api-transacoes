import knex from '../database/knex';
import SaldoInsuficienteError from '../errors/SaldoInsuficienteError';
import ValidationError from '../errors/ValidationError';
import { ITransaction } from '../interfaces';
import shopkeeperService from './shopkeeper';
import userService from './user';

const MAIN_DATABASE = 'transactions';

const validate = async (t: ITransaction) => {
	if (typeof t.description !== 'string' || !t.description.length)
		throw new ValidationError('Descrição é um atributo string obrigatório');

	if (typeof t.amount !== 'number')
		throw new ValidationError('Valor é um atributo number obrigatório');

	if (typeof t.payer !== 'number' || !t.payer)
		throw new ValidationError('Pagador é um atributo number obrigatório');

	if (typeof t.shopkeeper !== 'number' || !t.shopkeeper)
		throw new ValidationError('Lojista é um atributo number obrigatório');

	if (t.amount < 0.01) throw new ValidationError('Valor deve ser maior do que R$ 0,01');

	const b = await userService.getBalance(t.payer);
	const balance = parseFloat(b.balance);

	if (t.amount > balance)
		throw new SaldoInsuficienteError('Saldo insuficiente para realizar a operação');

	const p = await shopkeeperService.findOne({ id: t.shopkeeper });

	if (p === undefined) throw new ValidationError('Lojista não existe');
};

const authorizeTransaction = async () => {
	/* mock service is very slow
	const res = await fetch('https://run.mocky.io/v3/8fafdd68-a090-496f-8c9a-3442cf30dae6');

	return await res.json();
	*/

	return {
		message: 'Autorizado',
	};
};

const save = async (t: ITransaction) => {
	return await knex(MAIN_DATABASE).insert(t, ['*']);
};

const transactionService = { save, validate, authorizeTransaction };

export default transactionService;
