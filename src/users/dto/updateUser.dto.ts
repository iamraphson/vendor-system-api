import { Roles } from '../../constants/Roles';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class UpdateUserDto {
  @ApiProperty({
    description: 'Username of the user',
    type: 'string',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Password of the user',
    type: 'string',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: Roles,
  })
  @IsEnum(Roles, { message: 'Role must be `BUYER` or `SELLER`' })
  @IsOptional()
  role?: Roles;
}
