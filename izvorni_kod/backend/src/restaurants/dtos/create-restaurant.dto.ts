import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { CousineType } from '../enums/cousine-type.enum';

export class CreateRestaurantDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(96)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;           // todo -> patch ne updata ove opcionalne vrijednosti

    @IsEnum(CousineType)
    @IsOptional()
    role?: CousineType;

    @IsString()
    @IsOptional()
    @MaxLength(96)
    adress?: string;

    @IsString()
    @IsOptional()
    @MaxLength(96)
    city?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    phone?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(96)
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(96)
    website?: string;

    @IsString()
    @IsOptional()
    @MaxLength(96)
    workingHours?: string;

    @IsBoolean()
    @IsOptional()
    verified?: boolean;
}