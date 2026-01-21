import { Injectable } from '@nestjs/common';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EmailTemplatesService {
  /**
   * Generate plain text email for new event notification
   */
  generateNewEventEmail(
    user: User,
    event: Event,
    restaurantName: string,
  ): { subject: string; text: string } {
    const eventDateFormatted = new Date(event.eventDate).toLocaleString(
      'hr-HR',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    const subject = `Novi događaj u restoranu ${restaurantName}`;

    const text = `Pozdrav ${user.firstName},

Restoran ${restaurantName}, koji ste dodali u favorite, objavio je novi događaj!

Naziv događaja: ${event.title}

Opis: ${event.description}

Datum i vrijeme: ${eventDateFormatted}

Ne propustite ovu priliku da posjetite vaš omiljeni restoran!

---
RestoraniZEGE
Vaš vodič kroz najbolje restorane
`;

    return { subject, text };
  }
}
