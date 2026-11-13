import type { CookieOptions } from 'express';
import { REFRESH_TOKEN_TTL_DAYS } from './auth.constants.js';

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: Number(process.env.JWT_EXPIRES_IN_MINUTES) * 60 * 1000,
  path: '/',
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: '/auth',
});
