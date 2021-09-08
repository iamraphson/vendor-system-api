import { Roles } from '../../constants/Roles';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export default class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Roles, { message: 'Role must be `BUYER` or `SELLER`' })
  @IsNotEmpty({ message: 'Role must be `BUYER` or `SELLER`' })
  role: Roles;
}
