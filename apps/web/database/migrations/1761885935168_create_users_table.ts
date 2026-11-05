import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'users';

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable();
      table.string('full_name').nullable();
      table.string('email', 254).notNullable().unique();
      table.string('password').notNullable();

      table.string('username', 32).nullable().unique();
      table.string('phone', 32).nullable();
      table.string('avatar_url', 2048).nullable();
      table.string('website', 2048).nullable();
      table.text('about').nullable();
      table.jsonb('social_links').notNullable().defaultTo('{}');
      table.string('headline', 160).nullable();
      table.string('job_title', 120).nullable();
      table.string('company', 160).nullable();
      table.string('industry', 120).nullable();
      table.string('pronouns', 64).nullable();
      table.string('address_line_1', 255).nullable();
      table.string('address_line_2', 255).nullable();
      table.string('city', 120).nullable();
      table.string('region', 120).nullable();
      table.string('postal_code', 32).nullable();
      table.string('country', 2).nullable();
      table.string('locale', 16).nullable();
      table.string('time_zone', 64).nullable();
      table.date('date_of_birth').nullable();
      table.timestamp('email_verified_at', { useTz: true }).nullable();
      table.timestamp('phone_verified_at', { useTz: true }).nullable();
      table.timestamp('last_login_at', { useTz: true }).nullable();
      table.boolean('is_profile_public').notNullable().defaultTo(false);

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();
    });
  }

  override async down() {
    this.schema.dropTable(this.tableName);
  }
}
