import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, DeliveryStatus } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationsRepository: Repository<Notification>,
    ) {}

    /**
     * Kreiranje notifikacije
     */
    async createNotification(data: {
        userId: number;
        title: string;
        message: string;
        type: NotificationType;
        eventId?: string;
        deliveryStatus?: DeliveryStatus;
    }): Promise<Notification> {
        const notification = this.notificationsRepository.create({
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            eventId: data.eventId,
            deliveryStatus: data.deliveryStatus || DeliveryStatus.SENT,
        });

        return await this.notificationsRepository.save(notification);
    }

    /**
     * Dohvat svih notifikacija za korisnika
     */
    async findByUser(userId: number): Promise<Notification[]> {
        return await this.notificationsRepository.find({
            where: { userId },
            relations: ['event', 'event.restaurant'],
            order: { sentAt: 'DESC' },
            take: 50, // Limit na zadnjih 50 notifikacija
        });
    }

    /**
     * Dohvat nepročitanih notifikacija za korisnika
     */
    async findUnreadByUser(userId: number): Promise<Notification[]> {
        return await this.notificationsRepository.find({
            where: { userId, read: false },
            relations: ['event', 'event.restaurant'],
            order: { sentAt: 'DESC' },
        });
    }

    /**
     * Broj nepročitanih notifikacija
     */
    async countUnread(userId: number): Promise<number> {
        return await this.notificationsRepository.count({
            where: { userId, read: false },
        });
    }

    /**
     * Označavanje notifikacije kao pročitane
     */
    async markAsRead(id: number, userId: number): Promise<Notification> {
        const notification = await this.notificationsRepository.findOne({
            where: { id, userId },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.read = true;
        return await this.notificationsRepository.save(notification);
    }

    /**
     * Označavanje svih notifikacija kao pročitane
     */
    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationsRepository.update(
            { userId, read: false },
            { read: true },
        );
    }

    /**
     * Brisanje notifikacije
     */
    async delete(id: number, userId: number): Promise<void> {
        const result = await this.notificationsRepository.delete({ id, userId });
        if (result.affected === 0) {
            throw new NotFoundException('Notification not found');
        }
    }

    /**
     * Kreiranje notifikacija za sve korisnike koji su favoritali restoran
     * Koristi se kad se kreira novi event
     */
    async createEventNotifications(
        event: { id: string; title: string; description: string },
        userIds: number[],
        restaurantName: string,
    ): Promise<void> {
        const notifications = userIds.map(userId => ({
            userId,
            title: `Novi događaj u ${restaurantName}`,
            message: `${event.title} - ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}`,
            type: NotificationType.EVENT,
            eventId: event.id,
            deliveryStatus: DeliveryStatus.SENT,
        }));

        await this.notificationsRepository.save(
            notifications.map(n => this.notificationsRepository.create(n))
        );
    }
}
