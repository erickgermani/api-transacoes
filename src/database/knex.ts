import Knex from 'knex';
import knexConfig from '../../knexfile';

const environment = process.env?.NODE_ENV ?? 'development';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const config = knexConfig[environment];

const knex = Knex(config);

// knex.on('query', (query) => {
// 	console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
// })
// 	.on('query-response', (response) => console.log(response))
// 	.on('error', (error) => console.log(error));

export default knex;
