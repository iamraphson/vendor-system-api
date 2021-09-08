import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { IProduct } from './interfaces/product';
import UpdateProductDto from './dto/updateProduct.dto';

@Injectable()
export default class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  public async createProduct(product: IProduct) {
    if (product.cost % 5 !== 0) {
      throw new HttpException(
        'Product cost is not multiple of 5',
        HttpStatus.BAD_REQUEST,
      );
    }
    const productUser = this.productRepository.create(product);
    await this.productRepository.save(productUser);

    return productUser;
  }

  public async findAll() {
    const products = await this.productRepository.find({
      relations: ['seller'],
    });

    return products.map((product) => {
      delete product.seller['password'];
      delete product.seller['deposit'];
      return product;
    });
  }

  public async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne(id, {
      relations: ['seller'],
    });

    if (!product) {
      throw new HttpException('Product Not Found', HttpStatus.NOT_FOUND);
    }

    delete product.seller['password'];
    delete product.seller['deposit'];

    return product;
  }

  public async update(id: number, data: UpdateProductDto) {
    await this.productRepository.update(id, data);

    return this.findById(id);
  }

  public async userOwnThisProduct(
    productId: number,
    authUserId: number,
  ): Promise<boolean> {
    const userProduct = await this.productRepository.findOne({
      where: {
        id: productId,
        seller: authUserId,
      },
    });

    return !!userProduct;
  }

  public async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await this.productRepository.delete(id);
  }
}
