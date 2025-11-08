import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthentificationService } from './providers/google-authentification.service';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { AuthType } from '../enums/auth-type.enum';
import { Auth } from '../decorators/auth.decorator';

@Controller('auth/google-authentication')
export class GoogleAuthenticationController {

    constructor(
        private readonly googleAuthenticationService: GoogleAuthentificationService,
    ) {}

    @Post()
    @Auth(AuthType.None)
    public authenticate(
        @Body() googleTokenDto: GoogleTokenDto
    ) {
        return this.googleAuthenticationService.authenticate(googleTokenDto);
    }
}
