import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getIsAlive(): Record<string, string | boolean> {
    return {
      status: true,
      message: 'System is up',
    };
  }
}
