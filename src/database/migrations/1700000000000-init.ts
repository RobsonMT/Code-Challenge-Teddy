import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(160) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        password varchar NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE urls (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        original_url text NOT NULL,
        short_code varchar(6) NOT NULL,
        user_id uuid REFERENCES users(id),
        clicks int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      );
    `);

    // Índice único apenas para registros ativos (deleted_at IS NULL)
    await queryRunner.query(`
      CREATE UNIQUE INDEX ux_urls_shortcode_active
      ON urls(short_code)
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`CREATE INDEX idx_urls_user ON urls(user_id);`);
    await queryRunner.query(
      `CREATE INDEX idx_urls_shortcode ON urls(short_code);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS ux_urls_shortcode_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_urls_user;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_urls_shortcode;`);
    await queryRunner.query(`DROP TABLE IF EXISTS urls;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
