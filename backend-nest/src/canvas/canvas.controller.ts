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
import { CanvasService } from './canvas.service';
import { CreateCanvasDto } from './dto/create-canvas.dto';
import { UpdateCanvasDto } from './dto/update-canvas.dto';

interface SessionUser {
  userId: number;
  username: string;
}

@Controller('canvas')
export class CanvasController {
  constructor(private readonly canvasService: CanvasService) {}

  @Post('create/:userId')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: SessionUser,
    @Body() dto: CreateCanvasDto,
  ) {
    return this.canvasService.createForUser(userId, user.userId, dto);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: SessionUser,
  ) {
    return this.canvasService.findByUser(userId, user.userId);
  }

  @Get('connection')
  getConnections(@CurrentUser() user: SessionUser) {
    return this.canvasService.getConnections(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: SessionUser,
  ) {
    return this.canvasService.findOne(id, user.userId);
  }

  @Put()
  update(
    @CurrentUser() user: SessionUser,
    @Body() dto: UpdateCanvasDto,
  ) {
    return this.canvasService.update(user.userId, dto);
  }

  @Delete(':canvasId')
  remove(
    @Param('canvasId', ParseIntPipe) canvasId: number,
    @CurrentUser() user: SessionUser,
  ) {
    return this.canvasService.remove(canvasId, user.userId);
  }
}
