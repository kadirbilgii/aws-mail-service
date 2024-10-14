import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Patch('update-telecoms')
  async updateTelecoms(
    @Body() body: { email: string; telecoms: { email: string }[] },
    @Res() res,
  ) {
    try {
      await this.userService.updateTelecoms(body.email, body.telecoms);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Verification email sent' });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to update telecoms', error });
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
