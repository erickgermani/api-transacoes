import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('users', (t) => {
		t.increments('id').primary();
		t.string('name').notNullable();
		t.string('cpf').notNullable().unique();
		t.string('mail').notNullable().unique();
		t.string('passwd').notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists('users');
}
