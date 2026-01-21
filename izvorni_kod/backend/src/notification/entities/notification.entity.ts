import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Event } from "src/events/entities/event.entity";

export enum NotificationType {
    EVENT = 'event',
    PROMOTION = 'promotion',
    FAVORITE = 'favorite',
    GENERAL = 'general',
}

export enum DeliveryStatus {
    SENT = 'sent',
    FAILED = 'failed',
    PENDING = 'pending',
}

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    title: string;

    @Column({
        type: 'text',
    })
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.GENERAL,
    })
    type: NotificationType;

    @Column({
        type: 'boolean',
        default: false,
    })
    read: boolean;

    @Column({
        type: 'enum',
        enum: DeliveryStatus,
        default: DeliveryStatus.PENDING,
    })
    deliveryStatus: DeliveryStatus;

    @CreateDateColumn({
        type: 'timestamp',
    })
    sentAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'eventId' })
    event: Event;

    @Column({ nullable: true })
    eventId: string;
}