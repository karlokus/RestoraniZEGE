import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../enums/verification-status.enum';

export class ReviewVerificationDto {
    @ApiProperty({
        description: 'Status verifikacije - APPROVED ili REJECTED',
        enum: VerificationStatus,
        example: VerificationStatus.APPROVED,
    })
    @IsEnum(VerificationStatus)
    status: VerificationStatus;

    @ApiPropertyOptional({
        description: 'Razlog odbijanja (obavezno ako je status REJECTED)',
        example: 'Nedostaju potrebni dokumenti',
    })
    @IsString()
    @IsOptional()
    rejectionReason?: string;
}