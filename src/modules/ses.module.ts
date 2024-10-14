import { Module } from '@nestjs/common';
import { SesService } from 'src/ses/ses.service';

@Module({
  providers: [SesService],
  exports: [SesService],
})
export class SesModule {}
