import {
  Controller,
  Post,
  Get,
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
import { JwtAuthGuard, type AuthUser } from './jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.JWT_EXPIRES_IN_MINUTES) * 60 * 1000,
      path: '/',
    });
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.register(dto);
    this.setAuthCookie(res, token);
    return user;
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.login(dto);
    this.setAuthCookie(res, token);
    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
