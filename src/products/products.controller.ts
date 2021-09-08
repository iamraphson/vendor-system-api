import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import ProductsService from './products.service';
import CreateProductDto from './dto/createProduct.dto';
import { RolesAllowed } from '../authentication/decorators/roles-allowed.decorator';
import { Roles } from '../constants/Roles';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { RolesGuard } from '../authentication/RolesGuard';
import { IProduct } from './interfaces/product';
import UpdateProductDto from './dto/updateProduct.dto';

@Controller('products')
export default class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productService: ProductsService) {}

  @Post()
  @Header('Content-Type', 'application/json')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.SELLER)
  public async createProduct(
    @Request() req,
    @Body() productData: CreateProductDto,
  ) {
    const productWithSeller: IProduct = {
      ...productData,
      seller: req.user?.userId,
    };
    const product = await this.productService.createProduct(productWithSeller);
    return {
      message: 'Product Created',
      data: product,
    };
  }

  @Get()
  @Header('Content-Type', 'application/json')
  public async indexProducts() {
    return {
      message: 'Products Retrieved',
      data: await this.productService.findAll(),
    };
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  public async showProduct(@Param() param: { id: number }) {
    const { id } = param;
    return {
      message: 'Product Retrieved',
      data: await this.productService.findById(id),
    };
  }

  @Put(':id')
  @Header('Content-Type', 'application/json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.SELLER)
  public async update(
    @Param() { id }: { id: number },
    @Body() updateData: UpdateProductDto,
    @Request() req,
  ) {
    const productIsForUser = await this.productService.userOwnThisProduct(
      Number(id),
      req.user?.userId,
    );
    if (!productIsForUser) {
      throw new HttpException(
        "You can't edit this product.",
        HttpStatus.FORBIDDEN,
      );
    }
    return {
      message: 'Product Updated',
      data: await this.productService.update(Number(id), updateData),
    };
  }

  @Delete(':id')
  @Header('Content-Type', 'application/json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.SELLER)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param() { id }: { id: number }, @Request() req) {
    const productIsForUser = await this.productService.userOwnThisProduct(
      Number(id),
      req.user?.userId,
    );
    if (!productIsForUser) {
      throw new HttpException(
        "You can't delete this product.",
        HttpStatus.FORBIDDEN,
      );
    }

    await this.productService.delete(id);
  }
}
