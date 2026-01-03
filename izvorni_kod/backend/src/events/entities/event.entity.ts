import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Restaurant, restaurant => restaurant.events, { 
        onDelete: 'CASCADE'
    })
    restaurant: Restaurant;

    @Column({
        type: 'varchar',
        length: 150,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    description: string;

    @Column({
        type: 'timestamp',
        nullable: false,
    })
    eventDate: Date;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    imageUrl?: string;

    @Column({
        type: 'boolean',
        default: true,
        nullable: false,
    })
    isActive: boolean;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt: Date;
}