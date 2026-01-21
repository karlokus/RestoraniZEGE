import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.comments, { 
        onDelete: 'CASCADE'
    })
    user: User;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.comments, {
        onDelete: 'CASCADE',
    })
    restaurant: Restaurant;

    @Column('text')
    content: string;

    @Column({ default: true })
    isVisible: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
