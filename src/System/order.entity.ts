import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
@Entity({
  name: 'orders',
})
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'bigint' })
  @ManyToOne(() => Product, {
    cascade: ['insert'],
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'product_id',
  })
  product: number;

  @Column({ name: 'quantity', type: 'bigint' })
  quantity: number;

  @Column({ name: 'user_id', type: 'bigint' })
  @ManyToOne(() => User, {
    cascade: ['insert'],
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'user_id',
  })
  user: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
