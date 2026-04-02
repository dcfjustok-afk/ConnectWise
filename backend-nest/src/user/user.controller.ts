import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return this.userService.search(keyword);
  }
}
