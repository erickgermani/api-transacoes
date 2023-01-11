import bcrypt from 'bcrypt-nodejs';

import knex from '../database/knex';
import ValidationError from '../errors/ValidationError';
import { IUser } from '../interfaces';

const MAIN_DATABASE = 'users';

const findAll = () => {
	return knex(MAIN_DATABASE).select(['id', 'name', 'mail']);
};

const findOne = (filter = {}) => {
	return knex(MAIN_DATABASE).where(filter).first();
};

const getPasswdHash = (passwd: string) => {
	const salt = bcrypt.genSaltSync(10);

	return bcrypt.hashSync(passwd, salt);
};

const validate = async (user: IUser) => {
	if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
	if (!user.cpf) throw new ValidationError('CPF é um atributo obrigatório');
	if (!user.mail) throw new ValidationError('Email é um atributo obrigatório');
	if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatório');
	if (!checkCPF(user.cpf)) throw new ValidationError('CPF inválido');

	const userSearchedByMail = await findOne({ mail: user.mail });

	if (userSearchedByMail !== undefined)
		throw new ValidationError('Já existe um usuário cadastrado com este email');

	const userSearchedByCpf = await findOne({ cpf: user.cpf });

	if (userSearchedByCpf !== undefined)
		throw new ValidationError('Já existe um usuário cadastrado com este cpf');
};

const checkCPF = (cpf: string) => {
	try {
		if (typeof cpf !== 'string' || cpf.length !== 11) return false;

		const allCharactersAreEquals = cpf.split('').every((char) => char === cpf[0]);

		if (allCharactersAreEquals) return false;

		let sum = 0;

		for (let ind = 0; ind < 9; ind++) {
			sum += parseInt(cpf[ind]) * (10 - ind);
		}

		const firstRest = (sum * 10) % 11;

		if (firstRest.toString() !== cpf[9]) return false;

		sum = 0;

		for (let ind = 0; ind < 10; ind++) {
			sum += parseInt(cpf[ind]) * (11 - ind);
		}

		const secondRest = (sum * 10) % 11;

		if (secondRest.toString() !== cpf[10]) return false;

		return true;
	} catch (error) {
		return false;
	}
};

const save = async (user: IUser) => {
	user.passwd = getPasswdHash(user.passwd);

	return knex(MAIN_DATABASE).insert(user, ['id', 'cpf', 'name', 'mail']);
};

const getBalance = async (id: number) => {
	const res = await knex('users').select('balance').where({ id }).first();

	return res;
};

const updateBalance = async (id: number, amount: number) => {
	const { balance } = await knex('users').where({ id }).first();

	const newBalance = parseFloat(balance) + amount;

	const res = await knex('users').where({ id }).update({ balance: newBalance });

	return res;
};

const userService = { findAll, findOne, save, getBalance, updateBalance, validate };

export default userService;
