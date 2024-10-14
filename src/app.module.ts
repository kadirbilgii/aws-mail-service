import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/entities/user.entity';
import { UserModule } from './modules/user.module';
import { SesModule } from './modules/ses.module';
import { RedisModule } from './modules/redis.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://127.0.0.1:27017/db?directConnection=true',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    SesModule,
    RedisModule,
  ],
})
export class AppModule {}
