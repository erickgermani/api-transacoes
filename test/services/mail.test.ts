import mailService from '../../src/services/mail';
import knex from '../../src/database/knex';
import { IUser } from '../interfaces';

let user2: IUser;

beforeAll(async () => {
	await knex('transactions').del();
	await knex('users').del();

	const payload = {
		name: 'Erick Germani',
		cpf: '52998224725',
		mail: 'erick@mail.com',
		passwd: '123456',
	};

	const res = await knex('users').insert(payload, 'id');

	user2 = { ...res[0] };
});

describe('Ao efetuar uma transferência', () => {
	test('Deve enviar email com sucesso', async () => {
		const res = await mailService.send();

		expect(res).toBe(true);
	});

	test('Deve salvar log caso email não seja enviado', async () => {
		const userPayload = {
			name: 'Germani Erick',
			cpf: '50162105002',
			mail: 'germani@mail.com',
			passwd: '123456',
		};

		const userId = (await knex('users').insert(userPayload, 'id'))[0].id;

		const transactionPayload = {
			description: 'Exemplo de transferência válida',
			date: new Date(),
			amount: 2,
			payer: user2.id,
			payee: userId,
		};

		const transactionId = (await knex('transactions').insert(transactionPayload, 'id'))[0].id;

		const res = mailService.addTransactionInCrontab(transactionId);

		expect(res.status).toBe(true);
	});
});
