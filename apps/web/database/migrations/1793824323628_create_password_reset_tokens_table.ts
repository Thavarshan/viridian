import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens';

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('token_hash', 64).notNullable().unique();
      table.timestamp('created_at', { useTz: true }).notNullable();
      table.timestamp('expires_at', { useTz: true }).notNullable().index();
    });
  }

  override async down() {
    this.schema.dropTable(this.tableName);
  }
}
