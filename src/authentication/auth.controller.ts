import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './RolesGuard';
import { RolesAllowed } from './decorators/roles-allowed.decorator';
import { Roles } from '../constants/Roles';

@Controller('auth')
export class AuthController {
  constructor(public readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() authLogin: AuthLoginDto) {
    const loginDetail = await this.authService.login(authLogin);

    return {
      message: 'Login Successful',
      data: loginDetail,
    };
  }

  /*
  @UseGuards(JwtAuthGuard)
  @Get('protected-test')
  public async protectedTest() {
    return 'Protected Success!';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.SELLER)
  @Get('protected-seller-test')
  public async protectedSellerTest() {
    return 'Protected Seller Success!';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesAllowed(Roles.BUYER)
  @Get('protected-buyer-test')
  public async protectedBuyerTest() {
    return 'Protected Buyer Success!';
  }

  @Get('public-test')
  public async publicTest() {
    return 'Public Success!';
  }
  */
}
