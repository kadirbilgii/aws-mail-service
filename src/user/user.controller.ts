import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: { email: string, password: string }) {
    await this.userService.registerUser(body.email, body.password);
    return { message: 'Verification email sent' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const isVerified = await this.userService.verifyEmail(token);
    if (isVerified) {
      return { message: 'Email verified successfully' };
    } else {
      return { message: 'Invalid or expired token' };
    }
  }
}
