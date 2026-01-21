import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mailer.host'),
      port: this.configService.get<number>('mailer.port'),
      secure: this.configService.get<boolean>('mailer.secure'),
      auth: {
        user: this.configService.get<string>('mailer.auth.user'),
        pass: this.configService.get<string>('mailer.auth.pass'),
      },
    });
  }

  /**
   * Send an email
   * @param options Email options (to, subject, text)
   * @returns Promise that resolves when email is sent
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    const from = this.configService.get<string>('mailer.from');

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  /**
   * Send email without waiting for result (fire-and-forget)
   * Logs errors but doesn't throw
   */
  sendMailAsync(options: SendMailOptions): void {
    this.sendMail(options).catch((error) => {
      this.logger.error(
        `Async email send failed to ${options.to}: ${error.message}`,
        error.stack,
      );
    });
  }
}
