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

  private hasBrevoConfig(): boolean {
    return Boolean(
      this.config.get<string>('BREVO_API_KEY') ||
        (this.config.get<string>('BREVO_SMTP_USER') &&
          this.config.get<string>('BREVO_SMTP_KEY')),
    );
  }

  private hasResendConfig(): boolean {
    return Boolean(this.config.get<string>('RESEND_API_KEY'));
  }

  getStatus() {
    const emailFrom = this.config.get<string>('EMAIL_FROM');
    const provider = this.config.get<string>('EMAIL_PROVIDER', 'auto');
    const brevo = this.hasBrevoConfig();
    const resend = this.hasResendConfig();

    return {
      configured: Boolean(emailFrom && (brevo || resend)),
      emailProvider: provider,
      hasBrevoApiKey: Boolean(this.config.get<string>('BREVO_API_KEY')),
      hasBrevoSmtp: Boolean(
        this.config.get<string>('BREVO_SMTP_USER') &&
          this.config.get<string>('BREVO_SMTP_KEY'),
      ),
      hasResendApiKey: resend,
      hasEmailFrom: Boolean(emailFrom),
      emailFrom: emailFrom?.includes('yourdomain.com') ? null : emailFrom,
    };
  }

  getProvider(): EmailProvider {
    const configured = this.config.get<string>('EMAIL_PROVIDER', 'auto').toLowerCase();

    if (configured === 'brevo') {
      if (!this.hasBrevoConfig()) {
        throw new Error(
          'BREVO_API_KEY эсвэл BREVO_SMTP_* тохируулаагүй. Render → Environment дээр нэмнэ үү.',
        );
      }
      return this.brevo;
    }

    if (configured === 'resend') {
      if (!this.hasResendConfig()) {
        throw new Error(
          'RESEND_API_KEY тохируулаагүй. Render → Environment дээр нэмнэ үү.',
        );
      }
      return this.resend;
    }

    if (this.hasResendConfig()) {
      return this.resend;
    }

    if (this.hasBrevoConfig()) {
      return this.brevo;
    }

    throw new Error(
      'И-мэйл provider тохируулаагүй. Render dashboard → Environment дээр BREVO_API_KEY + EMAIL_FROM нэмнэ үү.',
    );
  }

  async send(input: SendEmailInput): Promise<{ provider: string; messageId?: string }> {
    const provider = this.getProvider();
    const result = await provider.send(input);
    return { provider: provider.name, messageId: result.messageId };
  }
}
