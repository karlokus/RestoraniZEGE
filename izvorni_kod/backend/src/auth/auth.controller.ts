import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { AuthService } from "./providers/auth.service";
import { SignInDto } from "./dtos/signin.dto";
import { Auth } from "./decorators/auth.decorator";
import { AuthType } from "./enums/auth-type.enum";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Prijava korisnika (login)' })
    @ApiResponse({
        status: 200,
        description: 'Uspješna prijava, vraća access i refresh token',
    })
    @ApiResponse({
        status: 401,
        description: 'Neispravni korisnički podaci',
    })
    public async signIn(
        @Body() signInDto: SignInDto
    ) {
        return this.authService.signIn(signInDto);
    }

    @Post('refresh-tokens')
    @HttpCode(HttpStatus.OK)
    @Auth(AuthType.None)
    @ApiOperation({ summary: 'Obnova access tokena pomoću refresh tokena' })
    @ApiResponse({
        status: 200,
        description: 'Vraća novi access token (i opcionalno novi refresh token)',
    })
    @ApiResponse({
        status: 401,
        description: 'Nevažeći ili istekao refresh token',
    })
    public async refreshTokens(
        @Body() refreshTokenDto: RefreshTokenDto,
    ) {
        return this.authService.refreshTokens(refreshTokenDto);
    }
}