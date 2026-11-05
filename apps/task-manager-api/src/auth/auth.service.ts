import {
  ConflictException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';

const SALT_ROUNDS = 10;
const DUMMY_HASH =
  '$2b$10$aNYPe8JpZ00TJu8GAIxYSe0JIh4DzqJfogw9Guze7dRXoWrHDUE.6';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Unable to register with this email');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
        },
        select: { id: true, name: true, email: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Unable to register with this email');
      }
      throw error;
    }

    const token = await this.jwtService.signAsync({ sub: user.id });
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    const hash = user?.passwordHash ?? DUMMY_HASH;
    const isMatch = await bcrypt.compare(dto.password, hash);

    if (!user || !isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwtService.signAsync({ sub: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}
