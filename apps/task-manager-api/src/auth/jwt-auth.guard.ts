import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Request } from 'express';

export type AuthUser = { id: string; name: string; email: string };
export type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = req.cookies?.['access_token'];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    req.user = user;
    return true;
  }
}
