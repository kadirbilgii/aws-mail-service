import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/entities/user.entity';
import { SesService } from '../ses/ses.service';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class UserService {
  private redisClient: RedisClientType;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly awsSesService: SesService,
  ) {
    this.redisClient = createClient();
    this.redisClient.connect().catch(console.error);
  }

  private generateVerificationToken(email: string): string {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  async registerUser(email: string, password: string): Promise<void> {
    const verificationToken = this.generateVerificationToken(email);

    const user = new this.userModel({
      email,
      password,
      verificationToken,
    });

    await user.save();
    await this.awsSesService.sendVerificationEmail(email, verificationToken);

    await this.setRedisVerificationToken(verificationToken, email);
  }

  private async setRedisVerificationToken(
    token: string,
    email: string,
  ): Promise<void> {
    await this.redisClient.setEx(`verification:${token}`, 60, email);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateTelecoms(
    email: string,
    telecoms: { email: string }[],
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const verificationToken = this.generateVerificationToken(email);

    await this.awsSesService.sendVerificationEmail(email, verificationToken);

    await this.setRedisVerificationToken(verificationToken, email);

    user.telecoms.push(...telecoms.map((t) => ({ email: t.email })));

    await user.save();
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        email: string;
      };

      const storedEmail = await this.getRedisVerificationToken(token);

      if (storedEmail !== decoded.email) {
        return false;
      }

      const user = await this.userModel.findOne({
        email: decoded.email,
        verificationToken: token,
      });

      if (!user) {
        return false;
      }

      user.isVerified = true;
      user.telecoms.push({ email: decoded.email });
      await user.save();

      await this.deleteRedisVerificationToken(token);

      return true;
    } catch (err) {
      return false;
    }
  }

  private async getRedisVerificationToken(
    token: string,
  ): Promise<string | null> {
    try {
      const reply = await this.redisClient.get(`verification:${token}`);
      return reply;
    } catch (err) {
      throw err;
    }
  }

  private async deleteRedisVerificationToken(token: string): Promise<void> {
    try {
      await this.redisClient.del(`verification:${token}`);
    } catch (err) {
      throw err;
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const newToken = this.generateVerificationToken(email);

    await this.setRedisVerificationToken(newToken, email);

    await user.save();
    await this.awsSesService.sendVerificationEmail(email, newToken);
  }
}
