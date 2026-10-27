import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: RegisterDto) {
    console.log('[register]', { ...dto, password: '***' });
    return { message: 'ok' };
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    console.log('[login]', { ...dto, password: '***' });
    return { message: 'ok' };
  }
}
