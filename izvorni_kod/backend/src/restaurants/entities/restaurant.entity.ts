import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Favorite } from "src/favorites/entities/favorite.entity";
import { CuisineType } from "../enums/cuisine-type.enum";

import { Event } from "../../events/entities/event.entity";
import { Rating } from "../../ratings/entities/rating.entity";
import { Comment } from "../../comments/entities/comment.entity";
import { VerificationRequest } from "../../verification/entities/verification-request.entity";
import { RestaurantPhoto } from "../../restaurant-photos/entities/restaurant-photo.entity";


@Entity()
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
        unique: false,
    })
    name: string;

    @Column({
        type: 'text',
        nullable: true,
        unique: false,
    })
    description: string;

    @Column({
        type: 'enum',
        enum: CuisineType,
        nullable: true,
        default: CuisineType.BISTRO,
    })
    cuisineType: CuisineType;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: false,
    })
    adress: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: false,
    })
    city: string;

    @Column({
        type: 'decimal',
        nullable: true,
        unique: false,
    })
    latitude: number;

    @Column({
        type: 'decimal',
        nullable: true,
        unique: false,
    })
    longitude: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
        unique: true,
    })
    phone?: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: true,
    })
    email?: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: true,
    })
    website?: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: false,
    })
    workingHours: string;   // todo -> napraviti poseban data WorkingHours

    @Column({
        type: 'boolean',
        unique: false,
        default: false,
    })
    verified: boolean;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt: Date;

    @Column({ 
        type: 'decimal', 
        precision: 3, 
        scale: 2, 
        default: 0 
    })
    averageRating: number;

    @Column({ 
        default: 0 
    })
    totalRatings: number;

    @ManyToOne(() => User, (user) => user.restaurant, {
        onDelete: 'CASCADE',
    })
    user: User;

    @OneToMany(() => Favorite, (favorite) => favorite.restaurant, {
        //eager: true,
    })
    favorite: Favorite[];

    @OneToMany(() => Event, (event) => event.restaurant)
    events: Event[];

    @OneToMany(() => Rating, (rating) => rating.restaurant)
    ratings: Rating[];

    @OneToMany(() => Comment, (comment) => comment.restaurant)
    comments: Comment[];

    @OneToMany(() => VerificationRequest, (vr) => vr.restaurant)
    verificationRequests: VerificationRequest[];

    @OneToMany(() => RestaurantPhoto, (photo) => photo.restaurant)
    photos: RestaurantPhoto[];
}