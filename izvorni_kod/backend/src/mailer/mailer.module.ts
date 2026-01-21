import { Module } from '@nestjs/common';
import { MailerService } from './providers/mailer.service';
import { EmailTemplatesService } from './providers/email-templates.service';

@Module({
  providers: [MailerService, EmailTemplatesService],
  exports: [MailerService, EmailTemplatesService],
})
export class MailerModule {}
