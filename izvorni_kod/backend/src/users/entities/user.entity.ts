import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/userRole.enum';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
        unique: false,
    })
    firstName: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
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
        nullable: true,
    })
    @Exclude()
    password?: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    @Exclude()
    googleId?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        nullable: false,
        default: UserRole.user,
    })
    role: UserRole;

    @Column({
        default: false,
    })
    isBlocked: boolean;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt: Date;

    @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {
        //eager: true,  todo -> u servisu pozvati da se resotran prikaze i tako za ostale entitete
    })
    restaurant: Restaurant[];

    @OneToMany(() => Favorite, (favorite) => favorite.user, {
        eager: true,
    })
    favorite: Favorite[];

    @OneToMany(() => Rating, (rating) => rating.user)
    ratings: Rating[];

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];
}