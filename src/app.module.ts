import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user.module';
import { RedisModule } from './modules/redis.module';
import { SesModule } from './modules/ses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    RedisModule,
    SesModule,
  ],
})
export class AppModule {}
