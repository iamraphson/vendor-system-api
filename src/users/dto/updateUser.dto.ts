import { Roles } from '../../constants/Roles';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export default class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(Roles, { message: 'Role must be `BUYER` or `SELLER`' })
  @IsOptional()
  role?: Roles;
}
