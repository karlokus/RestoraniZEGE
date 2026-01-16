import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
    @ApiProperty({
        description: 'Novi sadržaj komentara',
        example: 'Ažurirani komentar - i dalje odlično!',
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;
}