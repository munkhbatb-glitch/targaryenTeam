import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailProvider, SendEmailInput, SendEmailResult } from './email-provider.interface';

@Injectable()
export class BrevoProvider implements EmailProvider {
  readonly name = 'brevo';
  private readonly logger = new Logger(BrevoProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (apiKey) {
      return this.sendViaApi(input);
    }

    const smtpUser = this.config.get<string>('BREVO_SMTP_USER');
    const smtpKey = this.config.get<string>('BREVO_SMTP_KEY');

    if (smtpUser && !smtpKey) {
      throw new Error(
        'BREVO_SMTP_KEY хоосон байна. Эсвэл BREVO_API_KEY (xkeysib-...) ашиглана.',
      );
    }

    if (this.hasSmtpConfig()) {
      await this.sendViaSmtp(input);
      return {};
    }

    throw new Error(
      'Brevo тохиргоо байхгүй. BREVO_API_KEY эсвэл BREVO_SMTP_* .env файлд оруулна уу.',
    );
  }

  private isUnauthorizedIpError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const err = error as { code?: string; response?: string };
    return (
      err.code === 'EAUTH' &&
      (err.response?.includes('Unauthorized IP') ?? false)
    );
  }

  private smtpErrorMessage(error: unknown): string {
    if (this.isUnauthorizedIpError(error)) {
      return (
        'Brevo IP зөвшөөрөгдөөгүй. Dashboard → Security → Authorized IPs дээр IP нэм, ' +
        'эсвэл BREVO_API_KEY ашиглана.'
      );
    }
    return 'Brevo SMTP и-мэйл илгээхэд алдаа гарлаа.';
  }

  private hasSmtpConfig(): boolean {
    return Boolean(
      this.config.get<string>('BREVO_SMTP_USER') &&
        this.config.get<string>('BREVO_SMTP_KEY'),
    );
  }

  private async sendViaSmtp(input: SendEmailInput): Promise<void> {
    const host = this.config.get<string>(
      'BREVO_SMTP_HOST',
      'smtp-relay.brevo.com',
    );
    const port = Number(this.config.get<string>('BREVO_SMTP_PORT', '587'));
    const user = this.config.get<string>('BREVO_SMTP_USER')!;
    const pass = this.config.get<string>('BREVO_SMTP_KEY')!;
    const fromEmail = this.config.get<string>('EMAIL_FROM');
    const fromName = this.config.get<string>('EMAIL_FROM_NAME', 'Video Call');
    this.validateSender(fromEmail);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
    } catch (error) {
      this.logger.error('Brevo SMTP error', error);
      throw new Error(this.smtpErrorMessage(error));
    }
  }

  private validateSender(fromEmail: string | undefined) {
    if (
      !fromEmail ||
      fromEmail.includes('yourdomain.com') ||
      fromEmail.includes('example.com')
    ) {
      throw new Error(
        'EMAIL_FROM буруу байна. Brevo → Senders дээр баталгаажуулсан и-мэйл .env файлд оруулна уу.',
      );
    }
  }

  private async sendViaApi(input: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error(
        'Brevo тохиргоо байхгүй. BREVO_SMTP_USER + BREVO_SMTP_KEY эсвэл BREVO_API_KEY оруулна уу.',
      );
    }

    const fromEmail = this.config.get<string>('EMAIL_FROM');
    const fromName = this.config.get<string>('EMAIL_FROM_NAME', 'Video Call');
    this.validateSender(fromEmail);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Brevo API error ${response.status}: ${body}`);
      throw new Error(this.apiErrorMessage(response.status, body));
    }

    const data = (await response.json()) as { messageId?: string };
    this.logger.log(
      `Brevo и-мэйл илгээгдлээ → ${input.to} (messageId: ${data.messageId ?? 'n/a'})`,
    );
    return { messageId: data.messageId };
  }

  private apiErrorMessage(status: number, body: string): string {
    try {
      const data = JSON.parse(body) as { message?: string; code?: string };
      if (data.message?.includes('unrecognised IP') || data.message?.includes('Unauthorized IP')) {
        const ipMatch = data.message.match(/\d{1,3}(?:\.\d{1,3}){3}/);
        const ip = ipMatch?.[0] ?? 'таны IP';
        return (
          `Brevo IP зөвшөөрөгдөөгүй (${ip}). ` +
          `https://app.brevo.com/security/authorised_ips дээр IP нэм, ` +
          `эсвэл IP restriction идэвхгүй болгоно.`
        );
      }
      if (data.message) {
        return `Brevo API: ${data.message}`;
      }
    } catch {
      /* use fallback */
    }
    return `Brevo API алдаа (${status}). API key болон EMAIL_FROM sender зөв эсэхийг шалгана уу.`;
  }
}
