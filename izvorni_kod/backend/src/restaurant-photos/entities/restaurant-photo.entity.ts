import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RestaurantPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Restaurant, restaurant => restaurant.photos, { 
        onDelete: 'CASCADE' 
    })
    restaurant: Restaurant;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    photoUrl: string;

    @Column({
        type: 'boolean',
        default: false,
        nullable: false,
    })
    isPrimary: boolean;

    @CreateDateColumn({
        type: 'timestamp',
    })
    uploadedAt: Date;
}