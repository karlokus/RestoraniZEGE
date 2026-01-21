import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email adresa korisnika',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Lozinka korisnika',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
