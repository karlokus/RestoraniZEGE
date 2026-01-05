import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
    @ApiProperty({
        description: 'ID restorana koji se ocjenjuje',
        example: 1,
        type: 'number',
    })
    @IsInt()
    @IsNotEmpty()
    restaurantId: number;

    @ApiProperty({
        description: 'Ocjena restorana (1-5)',
        example: 5,
        minimum: 1,
        maximum: 5,
    })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional({
        description: 'Komentar uz ocjenu (opciono)',
        example: 'Odlična hrana i usluga!',
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    comment?: string;
}