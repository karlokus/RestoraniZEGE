import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Trenutna lozinka korisnika',
        example: 'StaraLozinka123!',
    })
    @IsString()
    @IsNotEmpty({ message: 'Trenutna lozinka je obavezna' })
    oldPassword: string;

    @ApiProperty({
        description: 'Nova lozinka korisnika (min 8 znakova)',
        example: 'NovaLozinka456!',
    })
    @IsString()
    @IsNotEmpty({ message: 'Nova lozinka je obavezna' })
    @MinLength(8, { message: 'Nova lozinka mora imati najmanje 8 znakova' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
        message: 'Nova lozinka mora sadržavati barem jedno malo slovo, jedno veliko slovo i jedan broj',
    })
    newPassword: string;
}
