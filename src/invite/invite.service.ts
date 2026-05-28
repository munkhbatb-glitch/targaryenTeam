import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildInviteEmail } from './email/invite.template';
import { EmailService } from './email/email.service';
import { SendInviteDto } from './dto/send-invite.dto';
import { InviteRateLimitService } from './invite-rate-limit.service';

@Injectable()
export class InviteService {
  constructor(
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly rateLimit: InviteRateLimitService,
  ) {}

  async sendInvite(dto: SendInviteDto, clientIp: string, appUrl?: string) {
    const rateKey = `${clientIp}:${dto.roomId}`;
    if (!this.rateLimit.check(rateKey)) {
      throw new HttpException(
        'Хэт олон урилга илгээлээ. 1 цагийн дараа дахин оролдоно уу.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const baseUrl = appUrl || this.config.get<string>('APP_URL');
    if (!baseUrl) {
      throw new BadRequestException('APP_URL тохируулаагүй байна.');
    }

    const hostName = dto.hostName?.trim() || 'Хэн нэгэн';
    const inviteLink = `${baseUrl.replace(/\/$/, '')}/call/?room=${encodeURIComponent(dto.roomId)}`;
    const subject = `${hostName} таныг "${dto.roomId}" video call-д урьж байна`;
    const html = buildInviteEmail({
      hostName,
      roomId: dto.roomId,
      inviteLink,
    });

    try {
      return await this.emailService.send({
        to: dto.email,
        subject,
        html,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'И-мэйл илгээхэд алдаа гарлаа.';
      throw new BadRequestException(message);
    }
  }
}
