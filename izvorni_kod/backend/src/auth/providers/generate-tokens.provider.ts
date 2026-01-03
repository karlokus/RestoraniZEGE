import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { User } from 'src/users/entities/user.entity';
import { UserPayloadData } from '../interfaces/user-payload-data.interface';

@Injectable()
export class GenerateTokensProvider {
    constructor(
        private readonly jwtService: JwtService,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) {}

    public async signToken<T>(userId: number, expiresIn: number, payload?: T): Promise<string> {
        return await this.jwtService.signAsync(                                                     // todo -> ttl u .env podesit
            {
                sub: userId,
                ...payload
            },
            {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                expiresIn,
            }
        );
    }

    public async generateTokens(user: User) {
        const [accessToken, refreshToken] = await Promise.all([
            // generate access token
            this.signToken<Partial<UserPayloadData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                {
                    email: user.email,
                    role: user.role,
                    isBlocked: user.isBlocked,
                }
            ),

            //generate the refresh token
            this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
        ]);

        return { accessToken, refreshToken };
    }
}
