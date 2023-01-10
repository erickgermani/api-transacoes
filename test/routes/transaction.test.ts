import request from 'supertest';
import jwt from 'jwt-simple';

import app from '../../src';
import knex from '../../src/database/knex';

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
		},
		{
			name: 'Erick Germani',
			cpf: '22843530024',
			mail: 'erickgermani@mail.com',
			passwd: '123456',
		},
	];

	const res = await knex('users').insert(payload, ['id', 'cpf', 'mail']);

	[user, user2] = res;

	const { JWT_SECRET } = process.env;

	// @ts-expect-error will be fixed
	token = jwt.encode(user, JWT_SECRET); // FIXME environment type error
});

test('Deve inserir uma transferência válida', async () => {
	const payload = {
		description: 'Exemplo de transferência válida',
		date: Date.now(),
		amount: 2,
		payer: user.id,
		payee: user2.id,
	};

	const res = await request(app)
		.post(MAIN_ROUTE)
		.send(payload)
		.set('authorization', `bearer ${token}`);

	// TODO implement transaction test
	expect(res.status).toBe(500);
});
