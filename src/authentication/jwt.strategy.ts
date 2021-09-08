import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Roles } from '../constants/Roles';
import UsersService from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: number; role: Roles }) {
    const authUser = await this.userService.findById(payload.userId);
    if (!authUser) {
      throw new HttpException('Unauthorized user', HttpStatus.UNAUTHORIZED);
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  }
}
