import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../enums/userRole.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: 'Ivan',
        maxLength: 96,
        description: 'Ime korisnika',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(96)
    firstName: string;

    @ApiProperty({
        example: 'Horvat',
        maxLength: 96,
        description: 'Prezime korisnika',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(96)
    lastName: string;

    @ApiProperty({
        example: 'ivan.horvat@email.com',
        maxLength: 96,
        description: 'Email adresa korisnika',
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(96)
    email: string;

    @ApiProperty({
        example: 'StrongPassword123!',
        minLength: 8,
        maxLength: 96,
        description: 'Lozinka korisnika (min. 8 znakova, mora sadržavati veliko slovo, malo slovo, broj i specijalni znak). Obavezno za registraciju, nije potrebno za Google OAuth.',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(96)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Lozinka mora sadržavati minimalno 8 znakova, jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalni znak (@$!%*?&)',
    })
    password: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.user,
        description: 'Uloga korisnika u sustavu',
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}