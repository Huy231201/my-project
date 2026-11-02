import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Res,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.register(dto);

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.JWT_EXPIRES_IN_MINUTES) * 60 * 1000,
      path: '/',
    });

    return user;
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    console.log('[login]', { ...dto, password: '***' });
    return { message: 'ok' };
  }
}
