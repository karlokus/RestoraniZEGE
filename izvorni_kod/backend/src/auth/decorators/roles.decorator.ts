import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/enums/userRole.enum';

/**
 * Metadata key za roles
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles() dekorator - Postavlja potrebne uloge za pristup endpointu
 *
 * Primjeri korištenja:
 *
 * // Samo admini
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * adminEndpoint() { ... }
 *
 * // Admini ili restaurant vlasnici
 * @Roles(UserRole.ADMIN, UserRole.RESTAURANT)
 * @Post('create-event')
 * createEvent() { ... }
 *
 * // Kombinacija sa @Auth dekoratorom
 * @Roles(UserRole.ADMIN)
 * @Get('users')
 * getAllUsers() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);