import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from '../sms.service';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService],
    }).compile();
    service = module.get<SmsService>(SmsService);
  });

  it('should send mock SMS if no Twilio config', async () => {
    const res = await service.sendSms('+2250102030405', 'Test OTP');
    expect(res.success).toBe(true);
    expect(res.provider).toBe('mock');
    expect(res.messageId).toMatch(/^mock_/);
  });
});
