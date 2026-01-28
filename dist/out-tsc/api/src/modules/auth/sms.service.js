"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const twilio_1 = tslib_1.__importDefault(require("twilio"));
let SmsService = class SmsService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.from = process.env.TWILIO_FROM;
    }
    async sendSms(phoneNumber, message) {
        if (this.accountSid && this.authToken && this.from) {
            try {
                const client = (0, twilio_1.default)(this.accountSid, this.authToken);
                const res = await client.messages.create({
                    body: message,
                    from: this.from,
                    to: phoneNumber,
                });
                common_1.Logger.log(`[TWILIO SMS] to ${phoneNumber}: ${message}`);
                return { success: true, provider: 'twilio', messageId: res.sid };
            }
            catch (err) {
                common_1.Logger.error(`[TWILIO ERROR] ${err}`);
                return { success: false, provider: 'twilio', messageId: '' };
            }
        }
        // fallback mock
        common_1.Logger.log(`[MOCK SMS] to ${phoneNumber}: ${message}`);
        return { success: true, provider: 'mock', messageId: `mock_${Date.now()}` };
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], SmsService);
//# sourceMappingURL=sms.service.js.map