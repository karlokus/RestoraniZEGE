import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'ID restorana kojem događaj pripada',
    example: '64f1c9a2e8b4a1a23f9c1234',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({
    description: 'Naslov događaja',
    example: 'Wine Tasting Night',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    description: 'Opis događaja',
    example: 'Večer degustacije vrhunskih vina uz sommeliere.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Datum i vrijeme održavanja događaja (ISO 8601)',
    example: '2025-03-20T19:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @ApiPropertyOptional({
    description: 'URL slike događaja',
    example: 'https://example.com/images/event.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  imageUrl?: string;
}
