import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { FindUserProvider } from 'src/users/providers/find-user.provider';
import { UserPayloadData } from '../interfaces/user-payload-data.interface';

@Injectable()
export class RefreshTokensProvider {

    constructor(
        @Inject(forwardRef(() => FindUserProvider))
        private readonly findUserProvider: FindUserProvider,

        private readonly jwtService: JwtService,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

        private readonly generateTokensProvider: GenerateTokensProvider,
    ) {}

    public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        try {
            // verify the refresh token using jwtService
            const { sub } = await this.jwtService.verifyAsync<Pick<UserPayloadData, 'sub'>>(                          // todo -> error handling svugdje 
                refreshTokenDto.refreshToken,
                {
                    secret: this.jwtConfiguration.secret,
                    audience: this.jwtConfiguration.audience,                           // todo -> zašto ne cijeli jwtConfiguration kao u accesstokenguard
                    issuer: this.jwtConfiguration.issuer,
                }
            );

            // fetch user from the database
            const user = await this.findUserProvider.findOneById(sub);

            // generate tokens
            return await this.generateTokensProvider.generateTokens(user!);
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }
}
