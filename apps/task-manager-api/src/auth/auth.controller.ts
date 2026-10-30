import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthService } from './auth.service.js';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @UseGuards(ThrottlerGuard)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    console.log('[login]', { ...dto, password: '***' });
    return { message: 'ok' };
  }
}
