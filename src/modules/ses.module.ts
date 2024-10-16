import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SesService } from '../ses/ses.service';
import { SESClient } from '@aws-sdk/client-ses';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SES_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new SESClient({
          region: configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    SesService,
  ],
  exports: [SesService],
})
export class SesModule {}
