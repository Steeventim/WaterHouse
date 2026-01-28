"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRequest = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let OtpRequest = class OtpRequest {
};
exports.OtpRequest = OtpRequest;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 50 }),
    tslib_1.__metadata("design:type", String)
], OtpRequest.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", String)
], OtpRequest.prototype, "phoneNumber", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    tslib_1.__metadata("design:type", String)
], OtpRequest.prototype, "otpCode", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    tslib_1.__metadata("design:type", String)
], OtpRequest.prototype, "requestId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    tslib_1.__metadata("design:type", Date)
], OtpRequest.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], OtpRequest.prototype, "isUsed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], OtpRequest.prototype, "attempts", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], OtpRequest.prototype, "createdAt", void 0);
exports.OtpRequest = OtpRequest = tslib_1.__decorate([
    (0, typeorm_1.Entity)('otp_requests'),
    (0, typeorm_1.Index)('idx_otp_requests_phone', ['phoneNumber']),
    (0, typeorm_1.Index)('idx_otp_requests_request_id', ['requestId']),
    (0, typeorm_1.Index)('idx_otp_requests_expires', ['expiresAt'])
], OtpRequest);
//# sourceMappingURL=otp-request.entity.js.map