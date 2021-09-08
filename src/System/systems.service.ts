import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import UsersService from '../users/users.service';
import { Product } from '../products/product.entity';
import { Order } from './order.entity';

@Injectable()
export default class SystemsService {
  private readonly logger = new Logger(SystemsService.name);

  constructor(
    private readonly userService: UsersService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {}

  public async deposit(amount: number, userId: number) {
    const user = await this.userRepository.findOne(userId);

    user.deposit = amount + user.deposit;
    await this.userRepository.update(userId, {
      deposit: user.deposit,
    });

    return user;
  }

  public async reset(userId: number) {
    await this.userRepository.update(userId, {
      deposit: 0,
    });
  }

  public async buy(userId: number, productId: number, productQuantity: number) {
    const product = await this.productRepository.findOne(productId);
    if (!product) {
      throw new HttpException('Product not found!', HttpStatus.NOT_FOUND);
    }

    if (product.amount_available < productQuantity) {
      throw new HttpException(
        'Product is out of stock!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOne(userId);
    const totalCost = product.cost * productQuantity;
    if (user.deposit < totalCost) {
      throw new HttpException('Insufficient deposit!', HttpStatus.BAD_REQUEST);
    }

    const depositBalance = user.deposit - totalCost;
    const newOrder = this.orderRepository.create({
      product: product.id,
      user: userId,
      quantity: productQuantity,
    });

    await Promise.all([
      this.orderRepository.save(newOrder),
      this.productRepository.update(productId, {
        amount_available: product.amount_available - productQuantity,
      }),
      this.userRepository.update(userId, {
        deposit: depositBalance,
      }),
    ]);

    return await this.computeUserTotalOrders(userId, depositBalance);
  }

  private async computeUserTotalOrders(userId: number, depositBalance: number) {
    const orders: Record<string, any> = await this.orderRepository.find({
      where: { user: userId },
      relations: ['product'],
    });

    const totalSpent = orders.reduce(
      (totalCost: number, order: Record<string, any>) => {
        return (totalCost =
          totalCost + Number(order.quantity) * Number(order.product.cost));
      },
      0,
    );

    const orderedProduct = orders.map((order) => ({
      ...order.product,
      quantity: order.quantity,
    }));

    return {
      total_spent: totalSpent,
      change: {
        balance: depositBalance,
        breakdown: this.balanceBreakdown(depositBalance),
      },
      products: orderedProduct,
    };
  }

  private balanceBreakdown(balance) {
    const denominations = [100, 50, 20, 10, 5];
    let amount = balance;
    const denominationsCounts = {};

    denominations.forEach((denomination) => {
      denominationsCounts[denomination] = Math.floor(amount / denomination);
      amount = amount % denomination;
    });

    return denominationsCounts;
  }
}
