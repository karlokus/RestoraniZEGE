import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";


@Entity()
export class Favorite {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, (user) => user.favorite, {
        onDelete: 'CASCADE',
    })
    user: User;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.favorite, { 
        onDelete: 'CASCADE' 
    })
    restaurant: Restaurant;
}