import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Inject,
    forwardRef,
    NotFoundException,
} from '@nestjs/common';

import { UserRole } from 'src/users/enums/userRole.enum';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';
import { RestaurantsService } from 'src/restaurants/providers/restaurants.service';

/**
 * OwnershipGuard - Provjerava da li korisnik posjeduje resurs (restoran)
 *
 * Korištenje:
 * @UseGuards(OwnershipGuard)
 * @Patch('restaurants/:id')
 * updateRestaurant(@Param('id') id: string) { ... }
 *
 * Pravila:
 * - Admin može pristupiti svemu (bypassuje provjeru)
 * - Restaurant owner može pristupiti samo svojim restoranima
 * - Ostali korisnici ne mogu pristupiti
 *
 * Guard očekuje da postoji:
 * - request.params.id ILI request.body.restaurantId
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => RestaurantsService))
        private readonly restaurantsService: RestaurantsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request[REQUEST_USER_KEY];

        // Ako nema usera (nije autentificiran), zabrani pristup
        if (!user) {
            return false;
        }

        // Admin može sve
        if (user.role === UserRole.admin) {
            return true;
        }

        // Dohvati restaurantId iz params ili body
        const restaurantId = request.params.id || request.body.restaurantId;

        if (!restaurantId) {
            // Nema restaurantId, ne možemo provjeriti ownership
            return false;
        }

        // Dohvati restoran sa userom (vlasnik)
        const restaurant = await this.restaurantsService.getRestaurant(+restaurantId);

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found.');
        }

        // Provjeri da li je korisnik vlasnik restorana
        // Napomena: Restaurant entitet ima 'user' relaciju prema User entitetu
        return restaurant.user?.id === user.sub;
    }
}