import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/entities/user.entity';
import { SesService } from '../ses/ses.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly awsSesService: SesService,
  ) {}

  private generateVerificationToken(email: string): string {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1m' });
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
    user.verificationToken = verificationToken;

    await this.awsSesService.sendVerificationEmail(email, verificationToken);

    user.telecoms.push(...telecoms.map((t) => ({ email: t.email })));
    user.verificationToken = null;

    await user.save();
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        email: string;
      };
      const user = await this.userModel.findOne({
        email: decoded.email,
        verificationToken: token,
      });

      if (!user) {
        return false;
      }

      user.isVerified = true;
      user.verificationToken = undefined; // Clear the verification token
      user.telecoms.push({ email: decoded.email });
      await user.save();
      return true;
    } catch (err) {
      return false;
    }
  }
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const newToken = this.generateVerificationToken(email);
    user.verificationToken = newToken;
    await user.save();
    await this.awsSesService.sendVerificationEmail(email, newToken);
  }
}
