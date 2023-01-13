import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('shopkeepers', (t) => {
		t.increments('id').primary();
		t.string('name').notNullable();
		t.string('cnpj').notNullable().unique();
		t.string('mail').notNullable().unique();
		t.string('passwd').notNullable();
		t.decimal('balance', 15, 2).defaultTo(0).notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists('shopkeepers');
}
