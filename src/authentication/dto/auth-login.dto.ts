import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDto {
  @ApiProperty({
    description: 'Username for user',
    type: 'string',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password for user',
    type: 'string',
  })
  @IsNotEmpty()
  password: string;
}
