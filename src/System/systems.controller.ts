import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { RolesGuard } from '../authentication/RolesGuard';
import { RolesAllowed } from '../authentication/decorators/roles-allowed.decorator';
import { Roles } from '../constants/Roles';
import DepositDto from './dto/deposit.dto';
import SystemsService from './systems.service';
import BuyDto from './dto/Buy.dto';

@Controller('')
export default class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Header('Content-Type', 'application/json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.BUYER)
  @Post('/deposit')
  @HttpCode(HttpStatus.OK)
  public async deposit(@Request() req, @Body() { amount }: DepositDto) {
    const user = await this.systemsService.deposit(amount, req.user?.userId);

    return {
      message: 'Deposit Completed',
      data: {
        new_deposit: user.deposit,
      },
    };
  }

  @Header('Content-Type', 'application/json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.BUYER)
  @Post('/reset')
  @HttpCode(HttpStatus.OK)
  public async reset(@Request() req) {
    await this.systemsService.reset(req.user?.userId);
    return {
      message: 'Reset Complete',
      data: {
        new_deposit: 0,
      },
    };
  }

  @Header('Content-Type', 'application/json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.BUYER)
  @Post('/buy')
  @HttpCode(HttpStatus.OK)
  public async buy(
    @Request() req,
    @Body() { product_quantity, product_id }: BuyDto,
  ) {
    return await this.systemsService.buy(
      req.user?.userId,
      product_id,
      product_quantity,
    );
  }
}
