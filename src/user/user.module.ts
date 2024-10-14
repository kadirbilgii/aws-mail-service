import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../models/entities/user.entity';
import { SesModule } from '../ses/ses.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SesModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
