import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly accountSid = process.env.TWILIO_ACCOUNT_SID;
  private readonly authToken = process.env.TWILIO_AUTH_TOKEN;
  private readonly from = process.env.TWILIO_FROM;

  async sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; provider: string; messageId: string }> {
    if (this.accountSid && this.authToken && this.from) {
      try {
        const client = twilio(this.accountSid, this.authToken);
        const res = await client.messages.create({
          body: message,
          from: this.from,
          to: phoneNumber,
        });
        Logger.log(`[TWILIO SMS] to ${phoneNumber}: ${message}`);
        return { success: true, provider: 'twilio', messageId: res.sid };
      } catch (err) {
        Logger.error(`[TWILIO ERROR] ${err}`);
        return { success: false, provider: 'twilio', messageId: '' };
      }
    }
    // fallback mock
    Logger.log(`[MOCK SMS] to ${phoneNumber}: ${message}`);
    return { success: true, provider: 'mock', messageId: `mock_${Date.now()}` };
  }
}
