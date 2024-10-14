import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SesModule } from './ses/ses.module';
import { User, UserSchema } from './models/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://127.0.0.1:27017/db?directConnection=true',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    SesModule,
  ],
})
export class AppModule {}
