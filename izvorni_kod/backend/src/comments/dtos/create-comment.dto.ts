import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({
        description: 'ID restorana za koji se komentar ostavlja',
        example: 1,
        type: 'number',
    })
    @IsInt()
    @IsNotEmpty()
    restaurantId: number;

    @ApiProperty({
        description: 'Sadržaj komentara',
        example: 'Odlična hrana i atmosfera!',
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;
}