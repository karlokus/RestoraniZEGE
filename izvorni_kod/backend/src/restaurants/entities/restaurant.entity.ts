import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CousineType } from "../enums/cousine-type.enum";


@Entity()
export class Restaurant {                           //  todo -> provjeriti tablice i atribute sve
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.restaurant, {
        onDelete: 'CASCADE',
    })
    user: User;

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
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: false,
    })
    role: string;                            // todo -> cousinetype

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
    phone: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: true,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: true,
    })
    website: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true,
        unique: false,
    })
    workingHours: string;   // todo -> napraviti poseban data WorkingHours

    @Column({
        type: 'boolean',
        //nullable: false,
        unique: false,
        default: false,
    })
    verified: boolean;

    // todo -> created at i jos ostale, tako i za user
}