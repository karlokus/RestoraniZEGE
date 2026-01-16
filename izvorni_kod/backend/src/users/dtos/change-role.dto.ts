import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/userRole.enum';

export class ChangeRoleDto {
    @ApiProperty({
        description: 'Nova uloga korisnika',
        enum: UserRole,
        example: UserRole.restaurant,
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}