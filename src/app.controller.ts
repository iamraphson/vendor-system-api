import { Controller, Get, Header } from "@nestjs/common";
import { AppService } from './app.service';

@Controller('/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getIsAlive(): Record<string, string | boolean> {
    return this.appService.getIsAlive();
  }
}
