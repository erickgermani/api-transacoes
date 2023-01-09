// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const knex = {
	development: {
		client: 'pg',
		connection: {
			host: 'localhost',
			user: 'postgres',
			password: 'root',
			database: 'api_transacoes_test',
		},
		migrations: {
			directory: 'src/database/migrations',
		},
		seeds: {
			directory: 'src/database/seeds',
		},
		pool: {
			min: 0,
		},
	},
};

export default knex;
