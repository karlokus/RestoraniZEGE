import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GoogleAuthentificationService } from './providers/google-authentification.service';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { AuthType } from '../enums/auth-type.enum';
import { Auth } from '../decorators/auth.decorator';

@ApiTags('Auth / Google')
@Controller('auth/google-authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthentificationService,
  ) {}

  @Post()
  @Auth(AuthType.None)
  @ApiOperation({
    summary: 'Google authentication',
    description: 'Prijava ili registracija korisnika pomoću Google ID tokena',
  })
  @ApiBody({
    type: GoogleTokenDto,
    description: 'Google ID token dobiven s Google Sign-Ina',
  })
  @ApiResponse({
    status: 201,
    description: 'Uspješna autentifikacija',
  })
  @ApiResponse({
    status: 400,
    description: 'Neispravan Google token',
  })
  public authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    return this.googleAuthenticationService.authenticate(googleTokenDto);
  }
}
