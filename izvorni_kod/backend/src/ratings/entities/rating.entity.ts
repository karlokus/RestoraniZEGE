import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Check, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Rating {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.ratings, { 
        onDelete: 'CASCADE' 
    })
    user: User;

    @ManyToOne(() => Restaurant, restaurant => restaurant.ratings, { 
        onDelete: 'CASCADE'
    })
    restaurant: Restaurant;

    @Column({
        type: 'smallint',
        nullable: false,
    })
    @Check(`"rating" >= 1 AND "rating" <= 5`)
    rating: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    comment?: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;
}