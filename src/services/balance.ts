import knex from '../database/knex';

const get = async (id: number) => {
	const res = await knex('transfers')
		.sum('amount')
		.join('users', 'users.id', '=', 'transfers.payer')
		.where({ payer: id });

	return res;
};

const balanceService = { get };

export default balanceService;
