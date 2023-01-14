import request from 'supertest';
import jwt from 'jwt-simple';

import app from '../../src';
import knex from '../../src/database/knex';
import userService from '../../src/services/user';
import shopkeeperService from '../../src/services/shopkeeper';

const MAIN_ROUTE = '/v0/transaction';

let token: string;

let user: {
	id: number;
	cpf: string;
	mail: string;
};

let shopkeeper: {
	id: number;
	cnpj: string;
	mail: string;
};

beforeAll(async () => {
	await knex('transfers').del();
	await knex('transactions').del();
	await knex('users').del();
	await knex('shopkeepers').del();

	const userPayload = {
		name: 'Adam Smith',
		cpf: '04886569072',
		mail: 'adam@mail.com',
		passwd: '123456',
		balance: 5000.0,
	};

	const shopkeeperPayload = {
		name: 'Adam Smith',
		cnpj: '57763027000153',
		mail: 'adam@mail.com',
		passwd: '123456',
	};

	const userResponse = await knex('users').insert(userPayload, ['id', 'cpf', 'mail']);

	user = { ...userResponse[0] };

	const shopkeeperResponse = await knex('shopkeepers').insert(shopkeeperPayload, [
		'id',
		'cnpj',
		'mail',
	]);

	shopkeeper = { ...shopkeeperResponse[0] };

	const { JWT_SECRET } = process.env;

	// @ts-expect-error will be fixed
	token = jwt.encode(user, JWT_SECRET); // FIXME environment type error
});

describe('Ao enviar uma transação válida', () => {
	test('Deve inserir uma transação válida', async () => {
		const payload = {
			description: 'Exemplo de transação válida',
			date: new Date(),
			amount: 2,
			shopkeeper: shopkeeper.id,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(201);
		expect(res.body.payer).toBe(user.id);
		expect(res.body.shopkeeper).toBe(shopkeeper.id);
		expect(res.body.amount).toBe('2.00');
	});

	test('Deve acrescentar no saldo do lojista', async () => {
		const payload = {
			description: 'Exemplo de transação válida',
			date: new Date(),
			amount: 4,
			shopkeeper: shopkeeper.id,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(201);

		const { balance } = await shopkeeperService.getBalance(shopkeeper.id);

		expect(balance).toBe('6.00');
	});

	test('Deve subtrair do saldo do pagador', async () => {
		const payload = {
			description: 'Exemplo de transação válida',
			date: new Date(),
			amount: 8,
			shopkeeper: shopkeeper.id,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(201);

		const { balance } = await userService.getBalance(user.id);

		expect(balance).toBe('4986.00');
	});
});

test('Não deve transferir com saldo insuficiente', async () => {
	const payload = {
		description: 'Descrição',
		date: new Date(),
		amount: 5000,
		shopkeeper: shopkeeper.id,
	};

	const res = await request(app)
		.post(MAIN_ROUTE)
		.send(payload)
		.set('authorization', `bearer ${token}`);

	expect(res.status).toBe(403);
	expect(res.body.error).toBe('Saldo insuficiente para realizar a operação');
});

describe('Ao transferir com parâmetros inválidos', () => {
	const testTemplate = async (
		params: {
			description?: string;
			date?: Date;
			amount?: number;
			shopkeeper?: number;
		},
		fieldError: string
	) => {
		const payload = {
			description: 'Descrição',
			date: new Date(),
			amount: 2,
			shopkeeper: shopkeeper.id,
			...params,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(400);
		expect(res.body.error).toBe(fieldError);
	};

	test('Não deve efetuar uma transação sem descrição', () =>
		testTemplate({ description: undefined }, 'Descrição é um atributo string obrigatório'));

	test('Não deve efetuar uma transação sem valor', () =>
		testTemplate({ amount: undefined }, 'Valor é um atributo number obrigatório'));

	test('Não deve efetuar uma transação sem lojista', () =>
		testTemplate({ shopkeeper: undefined }, 'Lojista é um atributo number obrigatório'));

	test('Não deve efetuar uma transação com lojista inexistente', () =>
		testTemplate({ shopkeeper: -1 }, 'Lojista não existe'));

	test('Não deve efetuar uma transação abaixo do mínimo', () =>
		testTemplate({ amount: 0 }, 'Valor deve ser maior do que R$ 0,01'));
});
