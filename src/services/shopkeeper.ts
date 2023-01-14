import bcrypt from 'bcrypt-nodejs';

import knex from '../database/knex';
import ValidationError from '../errors/ValidationError';
import { IShopkeeper } from '../interfaces';
import userService from './user';

const MAIN_DATABASE = 'shopkeepers';

const findOne = (filter = {}) => {
	return knex(MAIN_DATABASE).where(filter).first();
};

const getPasswdHash = (passwd: string) => {
	const salt = bcrypt.genSaltSync(10);

	return bcrypt.hashSync(passwd, salt);
};

const validate = async (s: IShopkeeper) => {
	if (!s.name) throw new ValidationError('Nome é um atributo obrigatório');
	if (!s.cnpj) throw new ValidationError('CNPJ é um atributo obrigatório');
	if (!s.mail) throw new ValidationError('Email é um atributo obrigatório');
	if (!s.passwd) throw new ValidationError('Senha é um atributo obrigatório');
	if (!checkCNPJ(s.cnpj)) throw new ValidationError('CNPJ inválido');

	const userSearchedByMail = await userService.findOne({ mail: s.mail });

	if (userSearchedByMail !== undefined)
		throw new ValidationError('Já existe um usuário cadastrado com este email');

	const shopkeeperSearchedByMail = await findOne({ mail: s.mail });

	if (shopkeeperSearchedByMail !== undefined)
		throw new ValidationError('Já existe um usuário cadastrado com este email');

	const shopkeeperSearchedByCpf = await findOne({ cnpj: s.cnpj });

	if (shopkeeperSearchedByCpf !== undefined)
		throw new ValidationError('Já existe um usuário cadastrado com este CNPJ');
};

const getVerifierDigit = (n: number) => {
	const rest = n % 11;

	if (rest < 2) return 0;
	else return 11 - rest;
};

const checkCNPJ = (cnpj: string) => {
	try {
		if (typeof cnpj !== 'string' || cnpj.length !== 14) return false;

		let sum = 0;

		const numbers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

		for (let i = 0; i <= 11; i++) sum += parseInt(cnpj[i]) * numbers[i];

		const firstVerifierDigit = getVerifierDigit(sum);

		if (firstVerifierDigit.toString() !== cnpj[12]) return false;

		numbers.unshift(6);

		sum = 0;

		for (let i = 0; i <= 12; i++) sum += parseInt(cnpj[i]) * numbers[i];

		const secondVerifierDigit = getVerifierDigit(sum);

		if (secondVerifierDigit.toString() !== cnpj[13]) return false;

		return true;
	} catch (err) {
		return false;
	}
};

const save = async (s: IShopkeeper) => {
	s.passwd = getPasswdHash(s.passwd);

	return knex(MAIN_DATABASE).insert(s, ['id', 'cnpj', 'name', 'mail']);
};

const getBalance = async (id: number) => {
	const res = await knex(MAIN_DATABASE).select('balance').where({ id }).first();

	return res;
};

const updateBalance = async (id: number, amount: number) => {
	const { balance } = await knex(MAIN_DATABASE).where({ id }).first();

	const newBalance = parseFloat(balance) + amount;

	const res = await knex(MAIN_DATABASE).where({ id }).update({ balance: newBalance });

	return res;
};

const shopkeeperService = { findOne, save, getBalance, updateBalance, validate };

export default shopkeeperService;
