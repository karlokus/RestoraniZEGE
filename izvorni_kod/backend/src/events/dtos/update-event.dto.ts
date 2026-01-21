import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['restaurantId'] as const)
) {
  @ApiPropertyOptional({
    description: 'Status događaja (aktivan / neaktivan)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
