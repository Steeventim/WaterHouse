"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const send_otp_dto_1 = require("./dto/send-otp.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getProfile(req) {
        return { user: req.user };
    }
    // Suppression du login username/password : tout passe par OTP
    async sendOtp(body) {
        return this.authService.sendOtp(body.phoneNumber);
    }
    async verifyOtp(body) {
        return this.authService.verifyOtp(body.phoneNumber, body.otp, body.requestId);
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.Post)('send-otp'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [send_otp_dto_1.SendOtpDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
tslib_1.__decorate([
    (0, common_1.Post)('verify-otp'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map