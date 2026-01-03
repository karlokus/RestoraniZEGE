import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { Request } from 'express'
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // extract the request from the execution context
        const request = context.switchToHttp().getRequest();

        // extract the token from header
        const token = this.extractRequestFromHeader(request);

        // validate the token
        if(!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                this.jwtConfiguration
            );                                        // todo -> decorator ali za parametre(ne fje ili klase) da nemoramo ˇ ovak payload dohvaćat u funkciji

            // Provjera je li korisnik blokiran
            if (payload.isBlocked === true) {
                throw new ForbiddenException('Your account has been blocked. Please contact support.');
            }

            request[REQUEST_USER_KEY] = payload;      // onda mogu u controlleru doć do payloada req.user ili req[REQUEST_USER_KEY]
            // todo request.user = payload
        } catch (error) {
            // Ako je ForbiddenException, proširuj ga dalje
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractRequestFromHeader(request: Request): string | undefined{
        const [bearer, token] = request.headers.authorization?.split(' ') ?? [];    // Bearer nvjisobeubpiufd<-token
        return token;
    }
}
