import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductMigration1630705577952 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*await queryRunner.query(`CREATE TABLE \`products\` (
          \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
          \`amount_available\` bigint(20) NOT NULL,
          \`cost\` bigint(20) NOT NULL,
          \`product_name\` varchar(255) NOT NULL,
          \`seller_id\` bigint(20) NOT NULL,
          \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`seller_id\` (\`seller_id\`),
          CONSTRAINT \`product_table_3_ibfk_1\` FOREIGN KEY (\`seller_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);*/
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`products\``);
  }
}
