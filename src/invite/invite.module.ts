import { Module } from '@nestjs/common';
import { BrevoProvider } from './email/brevo.provider';
import { EmailService } from './email/email.service';
import { ResendProvider } from './email/resend.provider';
import { InviteController } from './invite.controller';
import { InviteRateLimitService } from './invite-rate-limit.service';
import { InviteService } from './invite.service';

@Module({
  controllers: [InviteController],
  providers: [
    InviteService,
    InviteRateLimitService,
    EmailService,
    BrevoProvider,
    ResendProvider,
  ],
})
export class InviteModule {}
