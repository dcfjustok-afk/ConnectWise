import { Module } from '@nestjs/common';
import { CanvasController } from './canvas.controller';
import { CanvasRepository } from './canvas.repository';
import { CanvasService } from './canvas.service';

@Module({
  controllers: [CanvasController],
  providers: [CanvasService, CanvasRepository],
  exports: [CanvasService, CanvasRepository],
})
export class CanvasModule {}
