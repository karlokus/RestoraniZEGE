import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestVerificationDto {
    @ApiProperty({
        description: 'ID restorana za koji se traži verifikacija',
        example: 1,
        type: 'number',
    })
    @IsInt()
    @IsNotEmpty()
    restaurantId: number;

    @ApiPropertyOptional({
        description: 'Dodatne napomene ili dokazi za verifikaciju (opciono)',
        example: 'Priloženi svi potrebni dokumenti',
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
