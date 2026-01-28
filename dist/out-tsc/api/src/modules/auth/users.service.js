"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(repo) {
        this.repo = repo;
        // In-memory fallback for tests or when TypeORM not configured
        this.users = [
            { id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        ];
    }
    async findByPhoneNumber(phoneNumber) {
        if (this.repo) {
            return this.repo.findOne({ where: { phoneNumber } });
        }
        return this.users.find((u) => u.phoneNumber === phoneNumber);
    }
    // helper to create a user (used later for migrations/seeds)
    async create(user) {
        if (this.repo) {
            const e = this.repo.create(user);
            const saved = await this.repo.save(e);
            return saved;
        }
        if (!user.phoneNumber) {
            throw new Error('phoneNumber is required');
        }
        const id = user.id || `user_${this.users.length + 1}`;
        const newUser = {
            id: String(id),
            phoneNumber: user.phoneNumber,
            role: user.role || 'collector',
            name: user.name,
            isActive: user.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.push(newUser);
        return newUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Optional)()),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map