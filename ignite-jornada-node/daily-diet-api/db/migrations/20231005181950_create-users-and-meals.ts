import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('email').notNullable().unique()
    table.text('hash').notNullable()
    table.text('salt').notNullable()
  })

  await knex.schema.createTable('meals', (table) => {
    table.text('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.dateTime('datetime').notNullable()
    table.boolean('is_on_the_diet').notNullable()
    table.text('user_id').notNullable()
  })

  await knex.schema.alterTable('meals', (table) => {
    table.foreign('user_id').references('users.id').withKeyName('fk_fkey_users')
  })

  await knex.schema.alterTable('users', (table) => {
    table.index('email', 'idx_user_email')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
  await knex.schema.dropTable('meals')
}
