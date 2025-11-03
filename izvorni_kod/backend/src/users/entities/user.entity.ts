import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/userRole.enum';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

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
    username: string;

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
        nullable: false,  // prebacit u true
    })
    //@Exclude() i ?
    password: string;

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

    @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {
        eager: true,
    })
    restaurant: Restaurant[];
}