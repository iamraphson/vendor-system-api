import {
  Body,
  Controller,
  Post,
  Header,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
  Param,
  HttpException,
  Request,
  Put,
  Logger,
  Delete,
} from '@nestjs/common';
import UserService from './users.service';
import CreateUserDto from './dto/createUser.dto';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import UpdateUserDto from './dto/updateUser.dto';

@Controller('users')
export default class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly userService: UserService) {}

  @Post()
  @Header('Content-Type', 'application/json')
  @HttpCode(HttpStatus.CREATED)
  public async createUser(@Body() userData: CreateUserDto) {
    delete userData['deposit'];
    const user = await this.userService.create(userData);
    return {
      message: 'User Created',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json')
  @Get()
  public async indexUsers() {
    return {
      message: 'Users Retrieved',
      data: await this.userService.findAll(),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json')
  public async getMe(@Request() req) {
    return {
      message: 'User Retrieved',
      data: await this.userService.findById(req.user?.userId),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json')
  public async showUser(@Param() param: { id: number }) {
    const { id } = param;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'User Retrieved',
      data: user,
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json')
  public async updateMe(@Request() req, @Body() meData: UpdateUserDto) {
    meData.role = undefined;
    delete meData['deposit'];
    const user = await this.userService.update(req.user?.userId, meData);
    return {
      message: 'User Updated',
      data: user,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/json')
  public async update(
    @Param() param: { id: number },
    @Body() userData: UpdateUserDto,
  ) {
    delete userData['deposit'];
    const user = await this.userService.update(param.id, userData);
    return {
      message: 'User Updated',
      data: user,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param() param: { id: number }) {
    await this.userService.delete(param.id);
  }
}
