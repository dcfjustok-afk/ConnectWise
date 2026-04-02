import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';

interface SessionUser {
  userId: number;
  username: string;
}

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: SessionUser,
  ) {
    return this.shareService.findByUser(userId, user.userId);
  }

  @Get(':canvasId')
  findByCanvas(
    @Param('canvasId', ParseIntPipe) canvasId: number,
    @CurrentUser() user: SessionUser,
  ) {
    return this.shareService.findByCanvas(canvasId, user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: SessionUser,
    @Body() dto: CreateShareDto,
  ) {
    return this.shareService.create(user.userId, dto);
  }

  @Put()
  update(
    @CurrentUser() user: SessionUser,
    @Body() dto: UpdateShareDto,
  ) {
    return this.shareService.update(user.userId, dto);
  }

  @Delete(':shareId')
  remove(
    @Param('shareId', ParseIntPipe) shareId: number,
    @CurrentUser() user: SessionUser,
  ) {
    return this.shareService.remove(shareId, user.userId);
  }
}
