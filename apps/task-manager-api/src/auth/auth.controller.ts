import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { JwtAuthGuard, type AuthUser } from './jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from './auth.cookie.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('access_token', accessToken, getAccessTokenCookieOptions());

    res.cookie('refresh_token', refreshToken, getRefreshTokenCookieOptions());
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    this.setAuthCookies(res, accessToken, newRefreshToken);

    return {
      message: 'Token refreshed successfully',
    };
  }

  @Post('logout')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    await this.authService.logout(refreshToken);

    res.clearCookie('access_token', getAccessTokenCookieOptions());

    res.clearCookie('refresh_token', getRefreshTokenCookieOptions());

    return {
      message: 'Logged out successfully',
    };
  }
}
