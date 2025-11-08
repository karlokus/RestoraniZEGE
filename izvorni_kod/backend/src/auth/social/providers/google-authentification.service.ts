import { forwardRef, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { FindUserProvider } from 'src/users/providers/find-user.provider';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { UserPayloadData } from 'src/auth/interfaces/user-payload-data.interface';
import { CreateUserProvider } from 'src/users/providers/create-user.provider';
import { SaveGoogleIdProvider } from 'src/users/providers/save-googleId.provider';

@Injectable()
export class GoogleAuthentificationService implements OnModuleInit{
    private oAuthClient: OAuth2Client;
    
    constructor(
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

        @Inject(forwardRef(() => FindUserProvider))
        private readonly findUserProvider: FindUserProvider,

        @Inject(forwardRef(() => CreateUserProvider))
        private readonly createUserProvider: CreateUserProvider,            // todo popravit ovo da nemam 100 DI

        @Inject(forwardRef(() => SaveGoogleIdProvider))
        private readonly saveGoogleIdProvider: SaveGoogleIdProvider,

        private readonly generateTokensProvider: GenerateTokensProvider,
    ) {}

    onModuleInit() {
        const clientId = this.jwtConfiguration.googleClientId;
        const clientSecret = this.jwtConfiguration.googleClientSecret;
        this.oAuthClient = new OAuth2Client(clientId, clientSecret);
    }

    public async authenticate(googleTokenDto: GoogleTokenDto) {
        try {
            // verify the Google token sent by user
            const loginTicket = await this.oAuthClient.verifyIdToken({
                idToken: googleTokenDto.token
            });

            // extract the payload from Google JWT
            const payload = loginTicket.getPayload();

            if (!payload) {
                throw new UnauthorizedException('Invalid Google token');
            }

            const { email, sub: googleId, given_name: firstName, family_name: lastName } = payload;

            // find the user in the database using googleId
            const user = await this.findUserProvider.findOneByGoogleId(googleId);

            // if googleId exists generate token
            if (user) {
                return await this.generateTokensProvider.generateTokens(user);
            }

            // find the user in the database using email
            const userByEmail = await this.findUserProvider.findOneByEmail(email!);

            // if email exists update the user and generate token
            if (userByEmail) {
                const updatedUser = {
                    ...userByEmail,
                    firstName: firstName ?? userByEmail.firstName,
                    lastName: lastName ?? userByEmail.lastName,
                    googleId: googleId
                }

                const savedUser = await this.saveGoogleIdProvider.saveGoogleId(updatedUser);

                return await this.generateTokensProvider.generateTokens(savedUser!);
            }

            // if not create a new user and then generate tokens
            const newUser = await this.createUserProvider.createGoogleUser({ 
                email: email ?? '', 
                firstName: firstName ?? '',                                 // todo -> popraviti
                lastName: lastName ?? '',
                googleId: googleId
            });
            return await this.generateTokensProvider.generateTokens(newUser!);
        } catch(error) {
            // throw new unauthorised exeption
            throw new UnauthorizedException(error);
        }
    }
}
