import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/userRole.enum';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 96,
        //nullable: false,          // todo
        nullable: true,
        unique: false,
    })
    firstName: string;

    @Column({
        type: 'varchar',
        length: 96,
        //nullable: false,
        nullable: true,
        unique: false,
    })
    lastName: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
        unique: true,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,  // prebacit u true
    })
    //@Exclude() i ?        // todo
    password?: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    //@Exclude()
    googleId?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        nullable: false,
        default: UserRole.user,                                                 // todo -> maknut role
    })
    role: UserRole;

    @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {             // todo -> poboljšat bazu podataka i onda dodat guardove
        eager: true,
    })
    restaurant: Restaurant[];

    @OneToMany(() => Favorite, (favorite) => favorite.user, {
        eager: true,
    })
    favorite: Favorite[];
}