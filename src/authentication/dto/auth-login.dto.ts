import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
