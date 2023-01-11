import request from 'supertest';
import jwt from 'jwt-simple';

import app from '../../src';
import knex from '../../src/database/knex';
import userService from '../../src/services/user';

const MAIN_ROUTE = '/v0/transaction';

let token: string;

let user: {
	id: number;
	cpf: string;
	mail: string;
};
let user2: {
	id: number;
	cpf: string;
	mail: string;
};

beforeAll(async () => {
	await knex('transactions').del();
	await knex('users').del();

	const payload = [
		{
			name: 'Erick Germani',
			cpf: '49185933058',
			mail: 'germani@mail.com',
			passwd: '123456',
			balance: 5000.0,
		},
		{
			name: 'Matheus Lucca',
			cpf: '22843530024',
			mail: 'lucca@mail.com',
			passwd: '123456',
		},
	];

	const res = await knex('users').insert(payload, ['id', 'cpf', 'mail']);

	[user, user2] = res;

	const { JWT_SECRET } = process.env;

	// @ts-expect-error will be fixed
	token = jwt.encode(user, JWT_SECRET); // FIXME environment type error
});
describe('Ao enviar uma transferência válida', () => {
	test('Deve inserir uma transferência válida', async () => {
		const payload = {
			description: 'Exemplo de transferência válida',
			date: new Date(),
			amount: 2,
			payee: user2.id,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(201);
		expect(res.body.payer).toBe(user.id);
		expect(res.body.payee).toBe(user2.id);
		expect(res.body.amount).toBe('2.00');
	});

	test('Deve acrescentar no saldo do beneficiário', async () => {
		const payload = {
			description: 'Exemplo de transferência válida',
			date: new Date(),
			amount: 4,
			payee: user2.id,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(201);

		const { balance } = await userService.getBalance(user2.id);

		expect(balance).toBe('6.00');
	});

	test('Deve subtrair do saldo do pagador', async () => {
		const payload = {
			description: 'Exemplo de transferência válida',
			date: new Date(),
			amount: 8,
			payee: user2.id,
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
		amount: 10500,
		payee: user2.id,
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
			payee?: number;
			payer?: number;
		},
		fieldError: string
	) => {
		const payload = {
			description: 'Descrição',
			date: new Date(),
			amount: 2,
			payee: user2.id,
			...params,
		};

		const res = await request(app)
			.post(MAIN_ROUTE)
			.send(payload)
			.set('authorization', `bearer ${token}`);

		expect(res.status).toBe(400);
		expect(res.body.error).toBe(fieldError);
	};

	test('Não deve efetuar uma transferência sem descrição', () =>
		testTemplate({ description: undefined }, 'Descrição é um atributo obrigatório'));

	test('Não deve efetuar uma transferência sem valor', () =>
		testTemplate({ amount: undefined }, 'Valor é um atributo obrigatório'));

	test('Não deve efetuar uma transferência sem beneficiário', () =>
		testTemplate({ payee: undefined }, 'Beneficiário é um atributo obrigatório'));

	test('Não deve efetuar uma transferência entre a mesma conta', () =>
		testTemplate({ payee: user.id }, 'O pagador deve ser diferente do beneficiário'));

	test('Não deve efetuar uma transferência com destinatáro inexistente', () =>
		testTemplate({ payee: -1 }, 'Destinatário não existe'));
});
