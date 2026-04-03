import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async search(
    @Query('username') username?: string,
    @Query('keyword') keyword?: string,
  ) {
    const q = username ?? keyword ?? '';
    return this.userService.search(q);
  }
}
