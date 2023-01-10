import Knex from 'knex';
import knexConfig from '../../knexfile';

const { NODE_ENV } = process.env;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const config = knexConfig[NODE_ENV];

const knex = Knex(config);

export default knex;
