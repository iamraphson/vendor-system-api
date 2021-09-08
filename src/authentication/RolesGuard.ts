import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { Roles } from '../constants/Roles';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger: Logger = new Logger(RolesGuard.name);
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles =
        this.reflector.getAllAndMerge<Roles[]>('roles', [
          context.getHandler(),
          context.getClass(),
        ]) || [];

      const { user: userPayload } = context.switchToHttp().getRequest();
      return Array.isArray(roles) && roles.includes(userPayload.role);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
