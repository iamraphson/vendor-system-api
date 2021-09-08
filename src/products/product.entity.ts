import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
@Entity({
  name: 'products',
})
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount_available: number;

  @Column()
  cost: number;

  @Column()
  product_name: string;

  @Column({ name: 'seller_id', type: 'bigint' })
  @ManyToOne(() => User)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'seller_id',
  })
  seller: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
