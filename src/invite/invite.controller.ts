import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SendInviteDto } from './dto/send-invite.dto';
import { InviteService } from './invite.service';
import { EmailService } from './email/email.service';

@Controller('api/invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly emailService: EmailService,
  ) {}

  @Get('status')
  getStatus() {
    return this.emailService.getStatus();
  }

  @Post()
  async sendInvite(
    @Body() dto: SendInviteDto,
    @Req() req: Request,
    @Headers('x-forwarded-for') forwardedFor?: string,
  ) {
    const clientIp =
      forwardedFor?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';

    const protocol = req.get('x-forwarded-proto')?.split(',')[0]?.trim() || req.protocol;
    const appUrl = `${protocol}://${req.get('host')}`;

    const result = await this.inviteService.sendInvite(dto, clientIp, appUrl);

    return {
      ok: true,
      provider: result.provider,
      messageId: result.messageId,
      message:
        'Урилга илгээгдлээ. Spam/Junk folder шалгаарай. Brevo → Transactional → Logs.',
    };
  }
}
