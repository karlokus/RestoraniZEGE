import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { CuisineType } from '../enums/cuisine-type.enum';
import { PriceRange } from '../enums/price-range.enum';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
    @ApiProperty({
        example: 'Pizzeria Napoli',
        maxLength: 96,
        description: 'Naziv restorana',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(96)
    name: string;

    @ApiPropertyOptional({
        example: 'Autentična talijanska pizza iz krušne peći',
        description: 'Opis restorana',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        enum: CuisineType,
        example: CuisineType.BISTRO,
        description: 'Vrsta kuhinje',
    })
    @IsEnum(CuisineType)
    @IsOptional()
    cuisineType?: CuisineType;

    @ApiPropertyOptional({
        enum: PriceRange,
        example: PriceRange.MEDIUM,
        description: 'Cijenovni razred restorana (1=€, 2=€€, 3=€€€, 4=€€€€)',
    })
    @IsEnum(PriceRange)
    @IsOptional()
    priceRange?: PriceRange;

    @ApiPropertyOptional({
        example: 'Ilica 10',
        maxLength: 96,
        description: 'Adresa restorana',
    })
    @IsString()
    @IsOptional()
    @MaxLength(96)
    adress?: string;

    @ApiPropertyOptional({
        example: 'Zagreb',
        maxLength: 96,
        description: 'Grad',
    })
    @IsString()
    @IsOptional()
    @MaxLength(96)
    city?: string;

    @ApiPropertyOptional({
        example: 45.815399,
        description: 'Geografska širina (latitude)',
    })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiPropertyOptional({
        example: 15.966568,
        description: 'Geografska dužina (longitude)',
    })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiPropertyOptional({
        example: '+385 1 2345 678',
        maxLength: 50,
        description: 'Kontakt telefon',
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    phone?: string;

    @ApiPropertyOptional({
        example: 'info@napoli.hr',
        maxLength: 96,
        description: 'Kontakt email restorana',
    })
    @IsEmail()
    @IsOptional()
    @MaxLength(96)
    email?: string;

    @ApiPropertyOptional({
        example: 'https://www.napoli.hr',
        maxLength: 96,
        description: 'Web stranica restorana',
    })
    @IsString()
    @IsOptional()
    @MaxLength(96)
    website?: string;

    @ApiPropertyOptional({
        example: '{"monday":"10:00-22:00","tuesday":"10:00-22:00","wednesday":"10:00-22:00","thursday":"10:00-22:00","friday":"10:00-22:00","saturday":"10:00-23:00","sunday":"Zatvoreno"}',
        maxLength: 500,
        description: 'Radno vrijeme (JSON format sa danima tjedna)',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    workingHours?: string;

    @ApiPropertyOptional({
        example: false,
        description: 'Je li restoran verificiran od strane admina',
    })
    @IsBoolean()
    @IsOptional()
    verified?: boolean;
}