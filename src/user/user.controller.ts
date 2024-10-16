import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string },
    @Res() res,
  ) {
    try {
      await this.userService.register(body.email, body.password);
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'Verification email sent' });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.message });
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res) {
    const isVerified = await this.userService.verifyEmail(token);
    if (isVerified) {
      return res.status(HttpStatus.OK).send('Email verified successfully');
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Invalid or expired token');
    }
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() body: { email: string }, @Res() res) {
    try {
      await this.userService.resendVerificationEmail(body.email);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Verification email resent' });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to resend verification email', error });
    }
  }
}
