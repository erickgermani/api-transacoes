// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const knex = {
	development: {
		client: 'pg',
		version: '15.1',
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
	},
};

export default knex;
