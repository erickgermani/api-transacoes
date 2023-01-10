import knex from '../database/knex';
import ValidationError from '../errors/ValidationError';
import { ITransaction } from '../interfaces';
import balanceService from './balance';

const MAIN_DATABASE = 'transactions';

const save = async (transaction: ITransaction) => {
	await balanceService.get(transaction.payer);

	return 100;
};

const transactionService = { save };

export default transactionService;
