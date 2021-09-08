import { Roles } from '../../constants/Roles';
import { SetMetadata } from '@nestjs/common';

export const RolesAllowed = (...roles: Roles[]) => SetMetadata('roles', roles);
