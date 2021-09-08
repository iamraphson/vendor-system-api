import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../ormconfig';

const typeOrmModule = TypeOrmModule.forRoot(config);
@Module({
  imports: [typeOrmModule],
})
export class DatabaseModule {}
