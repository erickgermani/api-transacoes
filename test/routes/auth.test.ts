import knex from '../../src/database/knex';

import request from 'supertest';

import app from '../../src';
import userService from '../../src/services/user';

beforeAll(async () => {
	await knex('users').del();
});

describe('Ao criar uma conta...', () => {
	let id: number;

	test('Deve criar uma conta com sucesso', async () => {
		const name = 'Erick Germani';

		const user = {
			name,
			cpf: '52998224725',
			mail: 'erick@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post('/signup').send(user);

		id = res.body.id;

		expect(res.status).toBe(201);
		expect(res.body.name).toBe(name);
		expect(res.body).not.toHaveProperty('passwd');
	});

	test('Deve salvar a senha criptografada', async () => {
		const userDB = await userService().findOne({ id });

		expect(userDB.passwd).not.toBeUndefined();
		expect(userDB.passwd).not.toBe('123456');
	});

	test('Não deve criar uma conta com email duplicado', async () => {
		const user = {
			name: 'Erick Germani',
			cpf: '49185933058',
			mail: 'erick@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post('/signup').send(user);

		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Já existe um usuário cadastrado com este email');
	});

	test('Não deve criar uma conta com cpf duplicado', async () => {
		const user = {
			name: 'Erick Germani',
			cpf: '52998224725',
			mail: 'germani@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post('/signup').send(user);

		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Já existe um usuário cadastrado com este cpf');
	});

	test('Não deve criar uma conta com parâmetros faltando', async () => {
		const user = {
			name: '',
			cpf: Date.now().toString(),
			mail: Date.now() + '@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post('/signup').send(user);

		expect(res.status).toBe(400);

		const hasError = res.body.error.includes('é um atributo obrigatório');

		expect(hasError).toBe(true);
	});

	test('Não deve criar uma conta com CPF inválido', async () => {
		const user = {
			name: 'Erick Germani',
			cpf: Date.now().toString(),
			mail: Date.now() + '@mail.com',
			passwd: '123456',
		};

		const res = await request(app).post('/signup').send(user);

		expect(res.status).toBe(400);
		expect(res.body.error).toBe('CPF inválido');
	});
});
