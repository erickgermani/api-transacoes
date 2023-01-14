import mailService from '../../src/services/mail';
import knex from '../../src/database/knex';

let user2Id: number;

let shopkeeperId: number;

beforeAll(async () => {
	await knex('transfers').del();
	await knex('transactions').del();
	await knex('users').del();
	await knex('shopkeepers').del();

	const userPayload = {
		name: 'Erick Germani',
		cpf: '52998224725',
		mail: 'erick@mail.com',
		passwd: '123456',
	};

	const shopkeeperPayload = {
		name: 'Adam Smith',
		cnpj: '57763027000153',
		mail: 'adam@mail.com',
		passwd: '123456',
	};

	const userResponse = await knex('users').insert(userPayload, 'id');

	user2Id = userResponse[0].id;

	const shopkeeperResponse = await knex('shopkeepers').insert(shopkeeperPayload, 'id');

	shopkeeperId = shopkeeperResponse[0].id;
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

		const transferPayload = {
			description: 'Exemplo de transferência válida',
			date: new Date(),
			amount: 2,
			payer: user2Id,
			payee: userId,
		};

		const transferId = (await knex('transfers').insert(transferPayload, 'id'))[0].id;

		const res = mailService.addTransferInCrontab(transferId);

		expect(res.status).toBe(true);
	});
});

describe('Ao efetuar uma transação', () => {
	test('Deve enviar email com sucesso', async () => {
		const res = await mailService.send();

		expect(res).toBe(true);
	});

	test('Deve salvar log caso email não seja enviado', async () => {
		const userPayload = {
			name: 'Germani Erick',
			cpf: '71861764022',
			mail: 'germani1@mail.com',
			passwd: '123456',
			balance: 2,
		};

		const userId = (await knex('users').insert(userPayload, 'id'))[0].id;

		const transactionPayload = {
			description: 'Exemplo de transação válida',
			date: new Date(),
			amount: 2,
			payer: userId,
			shopkeeper: shopkeeperId,
		};

		const transactionId = (await knex('transactions').insert(transactionPayload, 'id'))[0].id;

		const res = mailService.addTransactionInCrontab(transactionId);

		expect(res.status).toBe(true);
	});
});
