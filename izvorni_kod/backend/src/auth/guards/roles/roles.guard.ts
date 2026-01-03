import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { UserRole } from 'src/users/enums/userRole.enum';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

/**
 * RolesGuard - Provjerava da li korisnik ima potrebnu ulogu za pristup endpointu
 *
 * Koristi se sa @Roles() dekoratorom:
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * adminEndpoint() { ... }
 *
 * Ako nema @Roles dekoratora, dozvoljava pristup (guard se preskače)
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // Dohvati potrebne uloge iz metadate (postavljeno sa @Roles dekoratorom)
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [
                context.getHandler(), // Handler (metoda)
                context.getClass(),   // Controller (klasa)
            ],
        );

        // Ako nema role requirementa, dopusti pristup
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Dohvati korisnika iz requesta (postavljeno od AccessTokenGuard)
        const request = context.switchToHttp().getRequest();
        const user = request[REQUEST_USER_KEY];

        // Provjeri da li user postoji (trebao bi jer je prošao kroz AuthenticationGuard)
        if (!user) {
            return false;
        }

        // Provjeri da li korisnik ima neku od potrebnih uloga
        return requiredRoles.some((role) => user.role === role);
    }
}