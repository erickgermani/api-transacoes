import request from 'supertest';

import app from '../../../src';
import knex from '../../../src/database/knex';
import shopkeeperService from '../../../src/services/shopkeeper';

const SIGNIN_ROUTE = '/shopkeeper/signin';
const SIGNUP_ROUTE = '/shopkeeper/signup';

beforeAll(async () => {
	await knex('shopkeepers').del();
});

describe('Ao tentar criar uma conta de lojista', () => {
	let id: number;

	describe('... com parâmetros válidos', () => {
		test('Deve criar uma conta com sucesso', async () => {
			const name = 'Lojista Premium';

			const shopkeeperPayload = {
				name,
				cnpj: '64140333000107',
				mail: 'lojista@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(shopkeeperPayload);

			id = res.body.id;

			expect(res.status).toBe(201);
			expect(res.body.name).toBe(name);
			expect(res.body).not.toHaveProperty('passwd');
		});

		test('Deve salvar a senha criptografada', async () => {
			const userDB = await shopkeeperService.findOne({ id });

			expect(userDB.passwd).not.toBeUndefined();
			expect(userDB.passwd).not.toBe('123456');
		});
	});

	describe('... com parâmetros inválidos', () => {
		test('Não deve criar uma conta com email duplicado', async () => {
			const shopkeeperPayload = {
				name: 'Lojista Premium',
				cnpj: '64140333000107',
				mail: 'lojista@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(shopkeeperPayload);

			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário cadastrado com este email');
		});

		test('Não deve criar uma conta com cnpj duplicado', async () => {
			const shopkeeperPayload = {
				name: 'Lojista Premium',
				cnpj: '64140333000107',
				mail: 'lojista1@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(shopkeeperPayload);

			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário cadastrado com este CNPJ');
		});

		test('Não deve criar uma conta com cnpj inválido', async () => {
			const shopkeeperPayload = {
				name: 'Lojista Premium',
				cnpj: '64140333000108',
				mail: 'lojista@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(shopkeeperPayload);

			expect(res.status).toBe(400);
			expect(res.body.error).toBe('CNPJ inválido');
		});
	});

	describe('... com parâmetros ausentes', () => {
		const testTemplate = async (
			params: {
				name?: string;
				cnpj?: string;
				mail?: string;
				passwd?: string;
			},
			fieldError: string
		) => {
			const shopkeeperPayload = {
				name: 'Lojista Premium',
				cnpj: Date.now().toString(),
				mail: Date.now() + '@mail.com',
				passwd: '123456',
				...params,
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(shopkeeperPayload);
			expect(res.status).toBe(400);
			expect(res.body.error).toBe(fieldError + ' é um atributo obrigatório');
		};

		test('Não deve criar uma conta sem nome', () => testTemplate({ name: '' }, 'Nome'));
		test('Não deve criar uma conta sem senha', () => testTemplate({ passwd: '' }, 'Senha'));
		test('Não deve criar uma conta sem cnpj', () => testTemplate({ cnpj: '' }, 'CNPJ'));
		test('Não deve criar uma conta sem email', () => testTemplate({ mail: '' }, 'Email'));
	});
});

describe('Ao solicitar autenticação', () => {
	test('Deve receber token ao logar', async () => {
		const shopkeeperPayload = {
			mail: 'lojista@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post(SIGNIN_ROUTE).send(shopkeeperPayload);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('token');
	});

	test('Não deve autenticar com credenciais incorretas', async () => {
		const shopkeeperPayload = {
			mail: 'lojista@mail.com',
			passwd: '12345678',
		};

		const res = await request(app).post(SIGNIN_ROUTE).send(shopkeeperPayload);
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Credenciais incorretas');
	});
});
