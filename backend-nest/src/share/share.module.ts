import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareRepository } from './share.repository';
import { ShareService } from './share.service';

@Module({
  controllers: [ShareController],
  providers: [ShareService, ShareRepository],
  exports: [ShareService],
})
export class ShareModule {}
