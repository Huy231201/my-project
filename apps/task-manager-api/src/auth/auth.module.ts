import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        const expiresInMinutes = Number(process.env.JWT_EXPIRES_IN_MINUTES);

        if (!secret || secret === 'change_me') {
          throw new Error(
            'JWT_SECRET is missing or still set to the placeholder',
          );
        }
        if (!Number.isInteger(expiresInMinutes) || expiresInMinutes <= 0) {
          throw new Error('JWT_EXPIRES_IN_MINUTES must be a positive integer');
        }
        return {
          secret,
          signOptions: { expiresIn: expiresInMinutes * 60 },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
