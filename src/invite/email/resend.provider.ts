import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider, SendEmailInput, SendEmailResult } from './email-provider.interface';

@Injectable()
export class ResendProvider implements EmailProvider {
  readonly name = 'resend';
  private readonly logger = new Logger(ResendProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY тохируулаагүй байна.');
    }

    const from = this.formatFrom();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Resend error ${response.status}: ${body}`);
      throw new Error('Resend и-мэйл илгээхэд алдаа гарлаа.');
    }

    const data = (await response.json()) as { id?: string };
    return { messageId: data.id };
  }

  private formatFrom(): string {
    const fromEmail = this.config.get<string>('EMAIL_FROM');
    const fromName = this.config.get<string>('EMAIL_FROM_NAME', 'Video Call');
    return `${fromName} <${fromEmail}>`;
  }
}
