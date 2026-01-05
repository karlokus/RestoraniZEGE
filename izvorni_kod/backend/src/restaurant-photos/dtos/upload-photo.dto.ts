import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UploadPhotoDto {
    @ApiProperty({
        description: 'ID restorana za koji se uploaduje slika',
        example: 1,
        type: 'number',
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    restaurantId: number;
}