"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("./users.service");
const sms_service_1 = require("./sms.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, smsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.smsService = smsService;
        this.store = new Map();
    }
    // Public API - OTP flow
    async sendOtp(phoneNumber) {
        const otp = this.generateOtp();
        const requestId = this.generateRequestId();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        const record = {
            phoneNumber,
            otp,
            requestId,
            expiresAt,
            attempts: 0,
            isUsed: false,
        };
        this.store.set(requestId, record);
        // Envoi OTP via provider SMS (Twilio ou mock)
        const smsRes = await this.smsService.sendSms(phoneNumber, `Votre code OTP est : ${otp}`);
        return { success: smsRes.success, message: smsRes.success ? 'OTP sent successfully' : 'OTP failed', requestId };
    }
    async verifyOtp(phoneNumber, otp, requestId) {
        const rec = this.store.get(requestId);
        if (!rec) {
            throw new common_1.BadRequestException({ error: { code: 'INVALID_REQUEST', message: 'Request not found' } });
        }
        if (rec.isUsed) {
            throw new common_1.BadRequestException({ error: { code: 'INVALID_OTP', message: 'Code already used' } });
        }
        if (rec.phoneNumber !== phoneNumber) {
            throw new common_1.BadRequestException({ error: { code: 'INVALID_REQUEST', message: 'Phone mismatch' } });
        }
        if (Date.now() > rec.expiresAt) {
            throw new common_1.BadRequestException({ error: { code: 'OTP_EXPIRED', message: "Code OTP expiré, veuillez en demander un nouveau" } });
        }
        if (rec.attempts >= 3) {
            throw new common_1.BadRequestException({ error: { code: 'TOO_MANY_ATTEMPTS', message: 'Trop de tentatives, veuillez demander un nouveau code' } });
        }
        rec.attempts += 1;
        if (rec.otp !== otp) {
            this.store.set(requestId, rec);
            throw new common_1.BadRequestException({ error: { code: 'INVALID_OTP', message: 'Code OTP invalide' } });
        }
        rec.isUsed = true;
        this.store.set(requestId, rec);
        // Simulate token generation; replace with real JWT claims in production
        return {
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
            user: { id: 'user_123', phoneNumber, role: 'collector', name: 'Demo User' },
            expiresIn: 3600,
        };
    }
    // Plus de login username/password : tout passe par OTP
    async login(user) {
        const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }
    // Private helpers
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        sms_service_1.SmsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map