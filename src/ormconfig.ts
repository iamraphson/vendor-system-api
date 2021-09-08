import { ConnectionOptions } from 'typeorm';
import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();

export let config: ConnectionOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsRun: true,
  logging: true,
  cli: {
    migrationsDir: 'src/migrations',
  },
};

if (process.env.NODE_ENV === 'test') {
  config = {
    //name: 'test',
    type: 'mysql',
    host: process.env.TEST_MYSQL_HOST,
    port: Number(process.env.TEST_MYSQL_PORT),
    username: process.env.TEST_MYSQL_USER,
    password: process.env.TEST_MYSQL_PASSWORD,
    database: process.env.TEST_MYSQL_DB,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: true,
    logging: false,
    cli: {
      migrationsDir: 'src/migrations',
    },
  };
}
