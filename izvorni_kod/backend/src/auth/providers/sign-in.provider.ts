import { BadRequestException, forwardRef, Inject, Injectable, RequestTimeoutException, UnauthorizedException } from "@nestjs/common";
import { SignInDto } from "../dtos/signin.dto";
import { FindUserProvider } from "src/users/providers/find-user.provider";
import { HashingProvider } from "./hashing.provider";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "../config/jwt.config";
import type { ConfigType } from "@nestjs/config";
import { UserPayloadData } from "../interfaces/user-payload-data.interface";
import { GenerateTokensProvider } from "./generate-tokens.provider";


@Injectable()
export class SignInProvider {
    constructor(
        @Inject(forwardRef(() => FindUserProvider))
        private readonly findUserProvider: FindUserProvider,

        private readonly hashingProvider: HashingProvider,

        private readonly generateTokensProvider: GenerateTokensProvider,
    ) {}

    public async signIn(signInDto: SignInDto) {
        /* find user by email */
        let user = await this.findUserProvider.findOneByEmail(signInDto.email);

        /* throw exeption if user not found */
        if (!user) {
            throw new UnauthorizedException('Incorrect email or password');
        }

        /* compare passwords */
        let isEqual: boolean = false;

        try {
            if (user.password === null || user.password === undefined) {
                throw new UnauthorizedException('Ne postoji password');                              // todo -> bolja poruka
            }
            isEqual = await this.hashingProvider.comparePassword(
                signInDto.password,
                user.password,
            );
        } catch (error) {
            throw new RequestTimeoutException(error, {
                description: 'Could not compare passwords',
            })
        }

        if (!isEqual) {
            throw new UnauthorizedException('Incorrect email or password');
        }

        /* send conformation -> JWT access token and refresh token  */
        return await this.generateTokensProvider.generateTokens(user);
    }
}