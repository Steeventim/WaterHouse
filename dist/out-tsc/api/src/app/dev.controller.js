"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const users_service_1 = require("../modules/auth/users.service");
let DevController = class DevController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async seedAdmin() {
        const phoneNumber = '+225000000000';
        const existing = await this.usersService.findByPhoneNumber(phoneNumber);
        if (existing) {
            return { ok: true, existing: true, id: existing.id };
        }
        const created = await this.usersService.create({ id: 'admin', phoneNumber, role: 'admin', name: 'Admin', isActive: true });
        return { ok: true, created: { id: created.id, phoneNumber: created.phoneNumber } };
    }
};
exports.DevController = DevController;
tslib_1.__decorate([
    (0, common_1.Post)('seed-admin'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "seedAdmin", null);
exports.DevController = DevController = tslib_1.__decorate([
    (0, common_1.Controller)('dev'),
    tslib_1.__metadata("design:paramtypes", [users_service_1.UsersService])
], DevController);
//# sourceMappingURL=dev.controller.js.map