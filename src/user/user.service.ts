import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.entity';
import { SesService } from '../ses/ses.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly awsSesService: SesService,
  ) {}

  async registerUser(email: string, password: string): Promise<void> {
    const verificationToken = this.generateVerificationToken();

    const user = new this.userModel({
      email,
      password,
      verificationToken,
    });

    await user.save();

    await this.awsSesService.sendVerificationEmail(email, verificationToken);
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userModel.findOne({ verificationToken: token });

    if (!user) {
      return false;
    }

    user.isVerified = true;
      await this.userModel.updateOne(
        { _id: user._id },
        { $unset: { verificationToken: "" } }
      );
    await user.save();
    return true;
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substr(2, 25);
  }
}
