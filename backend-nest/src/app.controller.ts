import { Controller, Get } from '@nestjs/common';
import { AppService, HealthResult } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  health(): Promise<HealthResult> {
    return this.appService.healthCheck();
  }
}
