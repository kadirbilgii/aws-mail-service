import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { SesService } from '../ses/ses.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly redisService: RedisService,
    private readonly sesService: SesService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  generateVerificationToken(): string {
    return uuidv4();
  }

  async register(email: string, password: string): Promise<void> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new this.userModel({ email, password });
    await user.save();

    const verificationToken = this.generateVerificationToken();
    await this.redisService.set(
      `verification:${verificationToken}`,
      email,
      3600,
    );

    await this.sesService.sendVerificationEmail(email, verificationToken);
  }

  async verifyEmail(token: string): Promise<boolean> {
    const email = await this.redisService.get(`verification:${token}`);
    if (!email) {
      return false;
    }

    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }

    user.isVerified = true;
    user.telecoms.push({ email: email });
    await user.save();

    await this.redisService.del(`verification:${token}`);
    return true;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const verificationToken = this.generateVerificationToken();
    await this.redisService.set(
      `verification:${verificationToken}`,
      email,
      3600,
    );

    await this.sesService.sendVerificationEmail(email, verificationToken);
  }
}
