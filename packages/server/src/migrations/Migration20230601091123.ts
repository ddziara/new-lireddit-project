import { Migration } from '@mikro-orm/migrations';

export class Migration20230601091123 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "user" text not null, "password" text not null);');
    this.addSql('alter table "user" add constraint "user_user_unique" unique ("user");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
