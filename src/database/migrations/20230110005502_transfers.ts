import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('transfers', (t) => {
		t.increments('id').primary();
		t.string('description').notNullable();
		t.date('date').notNullable();
		t.decimal('amount', 15, 2).notNullable();
		t.enum('status', ['ok', 'under_review', 'canceled']).defaultTo('ok').notNullable();
		t.integer('payer').references('id').inTable('users').notNullable();
		t.integer('payee').references('id').inTable('users').notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists('transfers');
}
