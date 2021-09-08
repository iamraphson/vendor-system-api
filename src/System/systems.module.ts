import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import SystemsService from './systems.service';
import SystemsController from './systems.controller';
import { UsersModule } from '../users/users.module';
import { Product } from '../products/product.entity';
import { Order } from './order.entity';
@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([User, Product, Order])],
  providers: [SystemsService],
  controllers: [SystemsController],
})
export class SystemsModule {}
