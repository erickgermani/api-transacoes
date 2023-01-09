import bcrypt from 'bcrypt-nodejs';

import knex from '../database/knex';
import ValidationError from '../errors/ValidationError';
import { IUser } from '../interfaces';

const MAIN_DATABASE = 'users';

const userService = () => {
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

	const checkCPF = (cpf: string) => {
		try {
			if (typeof cpf !== 'string' || cpf.length !== 11) return false;

			const allCharactersAreEquals = cpf.split('').every((char) => char === cpf[0]);

			if (allCharactersAreEquals) return false;

			let result = 0;

			for (let ind = 0; ind < 9; ind++) {
				result += parseInt(cpf[ind]) * (10 - ind);
			}

			const firstRest = (result * 10) % 11;

			if (firstRest.toString() !== cpf[9]) return false;

			result = 0;

			for (let ind = 0; ind < 10; ind++) {
				result += parseInt(cpf[ind]) * (11 - ind);
			}

			const secondRest = (result * 10) % 11;

			if (secondRest.toString() !== cpf[10]) return false;

			return true;
		} catch (error) {
			return false;
		}
	};

	const save = async (user: IUser) => {
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

		user.passwd = getPasswdHash(user.passwd);

		return knex(MAIN_DATABASE).insert(user, ['id', 'name', 'mail']);
	};

	return { findAll, findOne, save };
};

export default userService;
