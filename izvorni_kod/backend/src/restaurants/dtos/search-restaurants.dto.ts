import {
    IsOptional,
    IsString,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsInt,
    Min,
    Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CuisineType } from '../enums/cuisine-type.enum';
import { PriceRange } from '../enums/price-range.enum';

export class SearchRestaurantsDto {
    @ApiPropertyOptional({
        description: 'Pretraga po nazivu restorana',
        example: 'Pizza',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter po tipu kuhinje',
        enum: CuisineType,
        example: CuisineType.ITALIAN,
    })
    @IsOptional()
    @IsEnum(CuisineType)
    cuisineType?: CuisineType;

    @ApiPropertyOptional({
        description: 'Filter po gradu',
        example: 'Zagreb',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        description: 'Minimalna prosječna ocjena (npr. 4.0)',
        example: 4.0,
        minimum: 0,
        maximum: 5,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minRating?: number;

    @ApiPropertyOptional({
        description: 'Prikaži samo verificirane restorane',
        example: true,
        type: 'boolean',
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    verifiedOnly?: boolean;

    @ApiPropertyOptional({
        description: 'Maksimalni cjenovni razred (1-4)',
        example: 2,
        minimum: 1,
        maximum: 4,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    maxPriceRange?: number;

    @ApiPropertyOptional({
        description: 'Broj stranice (pagination)',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Broj rezultata po stranici',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Polje za sortiranje',
        enum: ['name', 'averageRating', 'createdAt', 'priceRange'],
        example: 'name',
        default: 'name',
    })
    @IsOptional()
    @IsEnum(['name', 'averageRating', 'createdAt', 'priceRange'])
    sortBy?: string = 'name';

    @ApiPropertyOptional({
        description: 'Redoslijed sortiranja',
        enum: ['ASC', 'DESC'],
        example: 'ASC',
        default: 'ASC',
    })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}