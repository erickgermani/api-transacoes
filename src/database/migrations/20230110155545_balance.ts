import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.table('users', (t) => {
		t.decimal('balance', 15, 2).defaultTo(0).notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists('balance');
}
