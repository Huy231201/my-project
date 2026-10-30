import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsByteLength,
} from 'class-validator';
import { PASSWORD_MAX_BYTES, PASSWORD_REGEX } from '@repo/shared-validation';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @IsString()
  @IsByteLength(0, PASSWORD_MAX_BYTES, {
    message: 'Password is too long',
  })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
