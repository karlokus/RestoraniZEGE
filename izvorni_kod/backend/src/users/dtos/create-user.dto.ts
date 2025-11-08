import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../enums/userRole.enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(96)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(96)
    lastName: string;

    @IsEmail()                                                                      // todo -> unique?
    @IsNotEmpty()
    @MaxLength(96)
    email: string;

    @IsString()
    @IsNotEmpty()                                                                       // todo -> IsOptional ???
    @MinLength(8)
    @MaxLength(96)
    /*@Matches(/((?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[\W]).{8,64})/, {                      // todo -> password
        message: 'password too weak',
    }) // at least one upper case, one lower case, one number, one special character regex*/
    password: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}