import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import UsersService from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(authPayload: AuthLoginDto) {
    const user = await this.validateUser(authPayload);

    const payload = {
      userId: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role,
    };
  }

  public async validateUser(authPayload: AuthLoginDto): Promise<User> {
    const { username, password } = authPayload;
    const user = await this.userService.findByEmail(username);

    if (!(await user?.validatePassword(password))) {
      throw new HttpException('Incorrect Credential', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
