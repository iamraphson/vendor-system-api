import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMigration1630704128511 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*await queryRunner.query(`CREATE TABLE \`users\` (
        \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
        \`username\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`deposit\` bigint(20) NOT NULL DEFAULT '0',
        \`role\` varchar(7) NOT NULL,
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `);*/
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
