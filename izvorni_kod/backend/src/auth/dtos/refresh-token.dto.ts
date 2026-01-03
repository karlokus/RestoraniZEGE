import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY5...',
        description: 'Refresh token za dobivanje novog access tokena',
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}