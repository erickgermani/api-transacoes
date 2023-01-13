import request from 'supertest';

import app from '../../src';
import knex from '../../src/database/knex';
import userService from '../../src/services/user';

const SIGNIN_ROUTE = '/signin';
const SIGNUP_ROUTE = '/signup';

beforeAll(async () => {
	await knex('transfers').del();
	await knex('users').del();
});

describe('Ao tentar criar uma conta', () => {
	let id: number;

	describe('... com parâmetros válidos', () => {
		test('Deve criar uma conta com sucesso', async () => {
			const name = 'Erick Germani';

			const userPayload = {
				name,
				cpf: '52998224725',
				mail: 'erick@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(userPayload);

			id = res.body.id;

			expect(res.status).toBe(201);
			expect(res.body.name).toBe(name);
			expect(res.body).not.toHaveProperty('passwd');
		});

		test('Deve salvar a senha criptografada', async () => {
			const userDB = await userService.findOne({ id });

			expect(userDB.passwd).not.toBeUndefined();
			expect(userDB.passwd).not.toBe('123456');
		});
	});

	describe('... com parâmetros inválidos', () => {
		test('Não deve criar uma conta com email duplicado', async () => {
			const userPayload = {
				name: 'Erick Germani',
				cpf: '49185933058',
				mail: 'erick@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(userPayload);

			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário cadastrado com este email');
		});

		test('Não deve criar uma conta com cpf duplicado', async () => {
			const userPayload = {
				name: 'Erick Germani',
				cpf: '52998224725',
				mail: 'germani@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(userPayload);

			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Já existe um usuário cadastrado com este cpf');
		});

		test('Não deve criar uma conta com cpf inválido', async () => {
			const userPayload = {
				name: 'Erick Germani',
				cpf: Date.now().toString(),
				mail: Date.now() + '@mail.com',
				passwd: '123456',
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(userPayload);

			expect(res.status).toBe(400);
			expect(res.body.error).toBe('CPF inválido');
		});
	});

	describe('... com parâmetros ausentes', () => {
		const testTemplate = async (
			params: {
				name?: string;
				cpf?: string;
				mail?: string;
				passwd?: string;
			},
			fieldError: string
		) => {
			const userPayload = {
				name: 'Erick Germani',
				cpf: Date.now().toString(),
				mail: Date.now() + '@mail.com',
				passwd: '123456',
				...params,
			};

			const res = await request(app).post(SIGNUP_ROUTE).send(userPayload);
			expect(res.status).toBe(400);
			expect(res.body.error).toBe(fieldError + ' é um atributo obrigatório');
		};

		test('Não deve criar uma conta sem nome', () => testTemplate({ name: '' }, 'Nome'));
		test('Não deve criar uma conta sem senha', () => testTemplate({ passwd: '' }, 'Senha'));
		test('Não deve criar uma conta sem cpf', () => testTemplate({ cpf: '' }, 'CPF'));
		test('Não deve criar uma conta sem email', () => testTemplate({ mail: '' }, 'Email'));
	});
});

describe('Ao solicitar autenticação', () => {
	test('... Deve receber token ao logar', async () => {
		const userPayload = {
			mail: 'erick@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post(SIGNIN_ROUTE).send(userPayload);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('token');
	});

	test('... Não deve autenticar com credenciais incorretas', async () => {
		const userPayload = {
			mail: 'erick@mail.com',
			passwd: '12345678',
		};

		const res = await request(app).post(SIGNIN_ROUTE).send(userPayload);
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Credenciais incorretas');
	});
});

test('Não deve acessar uma rota protegida sem token', async () => {
	const res = await request(app).get('/v0');
	expect(res.status).toBe(401);
});
