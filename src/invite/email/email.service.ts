import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoProvider } from './brevo.provider';
import { EmailProvider, SendEmailInput } from './email-provider.interface';
import { ResendProvider } from './resend.provider';

@Injectable()
export class EmailService {
  constructor(
    private readonly config: ConfigService,
    private readonly brevo: BrevoProvider,
    private readonly resend: ResendProvider,
  ) {}

  getProvider(): EmailProvider {
    const configured = this.config.get<string>('EMAIL_PROVIDER', 'auto').toLowerCase();

    if (configured === 'brevo') {
      return this.brevo;
    }

    if (configured === 'resend') {
      return this.resend;
    }

    if (this.config.get<string>('RESEND_API_KEY')) {
      return this.resend;
    }

    if (this.config.get<string>('BREVO_API_KEY')) {
      return this.brevo;
    }

    if (
      this.config.get<string>('BREVO_SMTP_USER') &&
      this.config.get<string>('BREVO_SMTP_KEY')
    ) {
      return this.brevo;
    }

    throw new Error(
      'И-мэйл provider тохируулаагүй. BREVO_SMTP_* эсвэл BREVO_API_KEY эсвэл RESEND_API_KEY .env файлд нэмнэ үү.',
    );
  }

  async send(input: SendEmailInput): Promise<{ provider: string; messageId?: string }> {
    const provider = this.getProvider();
    const result = await provider.send(input);
    return { provider: provider.name, messageId: result.messageId };
  }
}
