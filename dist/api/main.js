/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(6);
const dev_controller_1 = __webpack_require__(9);
const auth_module_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(11);
const path_1 = __webpack_require__(41);
const user_entity_1 = __webpack_require__(13);
const communication_logs_module_1 = __webpack_require__(42);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: process.env.DB_PATH || (0, path_1.join)(__dirname, '../../data/sqlite.db'),
                entities: [user_entity_1.User],
                synchronize: false, // use migrations for schema changes
                logging: false,
            }),
            auth_module_1.AuthModule,
            communication_logs_module_1.CommunicationLogsModule,
        ],
        controllers: [app_controller_1.AppController, dev_controller_1.DevController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(6);
const jwt_auth_guard_1 = __webpack_require__(7);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
    getProfile(req) {
        // JwtStrategy puts user on request
        return { user: req.user };
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getProfile", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(8);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const users_service_1 = __webpack_require__(10);
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
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], DevController);


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(13);
const crypto_1 = __webpack_require__(15);
const encryption_service_1 = __webpack_require__(14);
let UsersService = class UsersService {
    // Activation/désactivation en masse
    async batchSetActive(ids, isActive) {
        if (this.repo) {
            const users = await this.repo.findByIds(ids);
            for (const user of users) {
                user.isActive = isActive;
                user.updatedAt = new Date();
            }
            await this.repo.save(users);
            return { success: true, count: users.length };
        }
        let count = 0;
        for (const id of ids) {
            const user = this.users.find(u => u.id === id);
            if (user) {
                user.isActive = isActive;
                user.updatedAt = new Date();
                count++;
            }
        }
        return { success: true, count };
    }
    // Pagination + recherche (in-memory ou repo)
    async paginateAndFilter({ page = 1, limit = 20, search, phone, name }) {
        const pageNum = Math.max(1, page);
        const limitNum = Math.max(1, Math.min(100, limit));
        // Repo TypeORM
        if (this.repo) {
            const where = {};
            if (phone)
                where.phoneNumber = phone;
            if (name)
                where.name = name;
            // Recherche globale (nom ou téléphone)
            let qb = this.repo.createQueryBuilder('user');
            if (search) {
                qb = qb.where('user.name LIKE :search OR user.phoneNumber LIKE :search', { search: `%${search}%` });
            }
            else if (phone || name) {
                qb = qb.where(where);
            }
            const [items, total] = await qb
                .orderBy('user.createdAt', 'DESC')
                .skip((pageNum - 1) * limitNum)
                .take(limitNum)
                .getManyAndCount();
            return { items, total, page: pageNum, limit: limitNum };
        }
        // In-memory
        let all = this.users;
        if (search) {
            const s = search.toLowerCase();
            all = all.filter(u => (u.name?.toLowerCase().includes(s) || u.phoneNumber.includes(search)));
        }
        if (phone) {
            all = all.filter(u => u.phoneNumber === phone);
        }
        if (name) {
            all = all.filter(u => u.name === name);
        }
        const total = all.length;
        const items = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        return { items, total, page: pageNum, limit: limitNum };
    }
    constructor(repo, encryptionService) {
        this.repo = repo;
        this.encryptionService = encryptionService;
        // In-memory fallback for tests or when TypeORM not configuré
        this.users = [
            (() => {
                const u = new user_entity_1.User();
                u.id = 'admin';
                u.phoneNumber = '+225000000000';
                u.role = 'admin';
                u.name = 'Admin';
                u.isActive = true;
                u.createdAt = new Date();
                u.updatedAt = new Date();
                u.plainName = 'Admin';
                u.plainPhone = '+225000000000';
                return u;
            })(),
        ];
    }
    // Pagination (in-memory ou repo)
    async paginate(page = 1, limit = 20) {
        const pageNum = Math.max(1, page);
        const limitNum = Math.max(1, Math.min(100, limit));
        if (this.repo) {
            const [items, total] = await this.repo.findAndCount({
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                order: { createdAt: 'DESC' },
            });
            return { items, total, page: pageNum, limit: limitNum };
        }
        const all = this.users;
        const total = all.length;
        const items = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        return { items, total, page: pageNum, limit: limitNum };
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
            // Génère un id si absent
            if (!user.id) {
                user.id = (0, crypto_1.randomUUID)();
            }
            // Gestion du nom et téléphone chiffrés
            const e = this.repo.create(user);
            if (user.name) {
                e.plainName = user.name;
            }
            if (user.phoneNumber) {
                e.plainPhone = user.phoneNumber;
            }
            const saved = await this.repo.save(e);
            return saved;
        }
        if (!user.phoneNumber) {
            throw new Error('phoneNumber is required');
        }
        const id = user.id || `user_${this.users.length + 1}`;
        const newUser = new user_entity_1.User();
        newUser.id = String(id);
        newUser.role = user.role || 'collector';
        newUser.isActive = user.isActive ?? true;
        newUser.createdAt = new Date();
        newUser.updatedAt = new Date();
        if (user.name) {
            const encrypted = encryption_service_1.EncryptionService.encrypt(user.name);
            newUser.name = encrypted.cipherText;
            newUser.name_iv = encrypted.iv;
            newUser.name_tag = encrypted.tag;
            newUser.plainName = user.name;
        }
        if (user.phoneNumber) {
            const encrypted = encryption_service_1.EncryptionService.encrypt(user.phoneNumber);
            newUser.phoneNumber = encrypted.cipherText;
            newUser.phone_iv = encrypted.iv;
            newUser.phone_tag = encrypted.tag;
            newUser.plainPhone = user.phoneNumber;
        }
        this.users.push(newUser);
        return newUser;
    }
    async setActive(id, isActive) {
        if (this.repo) {
            const user = await this.repo.findOne({ where: { id } });
            if (!user)
                throw new Error('User not found');
            user.isActive = isActive;
            user.updatedAt = new Date();
            return this.repo.save(user);
        }
        const user = this.users.find(u => u.id === id);
        if (!user)
            throw new Error('User not found');
        user.isActive = isActive;
        user.updatedAt = new Date();
        return user;
    }
    async delete(id) {
        if (this.repo) {
            const user = await this.repo.findOne({ where: { id } });
            if (!user)
                throw new Error('User not found');
            await this.repo.remove(user);
            return { success: true };
        }
        const idx = this.users.findIndex(u => u.id === id);
        if (idx === -1)
            throw new Error('User not found');
        this.users.splice(idx, 1);
        return { success: true };
    }
    async update(id, updates) {
        if (this.repo) {
            const user = await this.repo.findOne({ where: { id } });
            if (!user)
                throw new Error('User not found');
            Object.assign(user, updates);
            if (updates.name) {
                user.plainName = updates.name;
            }
            if (updates.phoneNumber) {
                user.plainPhone = updates.phoneNumber;
            }
            user.updatedAt = new Date();
            return this.repo.save(user);
        }
        const user = this.users.find(u => u.id === id);
        if (!user)
            throw new Error('User not found');
        Object.assign(user, updates);
        if (updates.name) {
            const encrypted = encryption_service_1.EncryptionService.encrypt(updates.name);
            user.name = encrypted.cipherText;
            user['name_iv'] = encrypted.iv;
            user['name_tag'] = encrypted.tag;
            user['plainName'] = updates.name;
        }
        if (updates.phoneNumber) {
            const encrypted = encryption_service_1.EncryptionService.encrypt(updates.phoneNumber);
            user.phoneNumber = encrypted.cipherText;
            user['phone_iv'] = encrypted.iv;
            user['phone_tag'] = encrypted.tag;
            user['plainPhone'] = updates.phoneNumber;
        }
        user.updatedAt = new Date();
        return user;
    }
    // Expose users array for in-memory listing (test/dev only)
    get allUsers() {
        return this.users;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Optional)()),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(1, (0, common_1.Optional)()),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof encryption_service_1.EncryptionService !== "undefined" && encryption_service_1.EncryptionService) === "function" ? _b : Object])
], UsersService);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const encryption_service_1 = __webpack_require__(14);
let User = class User {
    decryptPhone() {
        if (this.phoneNumber && this.phone_iv && this.phone_tag) {
            try {
                this._plainPhone = encryption_service_1.EncryptionService.decrypt(this.phoneNumber, this.phone_iv, this.phone_tag);
            }
            catch {
                this._plainPhone = undefined;
            }
        }
        else {
            this._plainPhone = undefined;
        }
    }
    get plainPhone() {
        return this._plainPhone;
    }
    set plainPhone(val) {
        this._plainPhone = val;
    }
    decryptName() {
        if (this.name && this.name_iv && this.name_tag) {
            try {
                this._plainName = encryption_service_1.EncryptionService.decrypt(this.name, this.name_iv, this.name_tag);
            }
            catch {
                this._plainName = undefined;
            }
        }
        else {
            this._plainName = undefined;
        }
    }
    get plainName() {
        return this._plainName;
    }
    set plainName(val) {
        this._plainName = val;
    }
    encryptName() {
        // Chiffre le nom
        if (typeof this._plainName === 'string' && this._plainName.length > 0) {
            const encrypted = encryption_service_1.EncryptionService.encrypt(this._plainName);
            this.name = encrypted.cipherText;
            this.name_iv = encrypted.iv;
            this.name_tag = encrypted.tag;
        }
        // Chiffre le téléphone
        if (typeof this._plainPhone === 'string' && this._plainPhone.length > 0) {
            const encrypted = encryption_service_1.EncryptionService.encrypt(this._plainPhone);
            this.phoneNumber = encrypted.cipherText;
            this.phone_iv = encrypted.iv;
            this.phone_tag = encrypted.tag;
        }
    }
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 50 }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "phone_iv", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "phone_tag", void 0);
tslib_1.__decorate([
    (0, typeorm_1.AfterLoad)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], User.prototype, "decryptPhone", null);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'collector' }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "name_iv", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "name_tag", void 0);
tslib_1.__decorate([
    (0, typeorm_1.AfterLoad)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], User.prototype, "decryptName", null);
tslib_1.__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], User.prototype, "encryptName", null);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], User.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "updatedAt", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)('idx_users_phone', ['phoneNumber']),
    (0, typeorm_1.Index)('idx_users_active', ['isActive'])
], User);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EncryptionService = void 0;
const tslib_1 = __webpack_require__(4);
const crypto = tslib_1.__importStar(__webpack_require__(15));
class EncryptionService {
    // In production, use a secure key management system
    static getKey() {
        // TODO: Replace with secure key retrieval
        const key = process.env.APP_ENCRYPTION_KEY;
        if (!key || key.length !== 64) {
            throw new Error('APP_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
        }
        return Buffer.from(key, 'hex');
    }
    static encrypt(plainText) {
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const key = this.getKey();
        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return {
            cipherText: encrypted.toString('base64'),
            iv: iv.toString('base64'),
            tag: tag.toString('base64'),
        };
    }
    static decrypt(cipherText, iv, tag) {
        const key = this.getKey();
        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(tag, 'base64'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(cipherText, 'base64')),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
}
exports.EncryptionService = EncryptionService;
EncryptionService.ALGORITHM = 'aes-256-gcm';
EncryptionService.IV_LENGTH = 12; // 96 bits for GCM


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(17);
const auth_controller_1 = __webpack_require__(21);
const jwt_1 = __webpack_require__(18);
const jwt_strategy_1 = __webpack_require__(38);
const users_service_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const user_entity_1 = __webpack_require__(13);
const otp_request_entity_1 = __webpack_require__(40);
const pin_code_entity_1 = __webpack_require__(31);
const pin_code_service_1 = __webpack_require__(30);
const biometric_key_entity_1 = __webpack_require__(27);
const biometric_key_service_1 = __webpack_require__(26);
const refresh_token_entity_1 = __webpack_require__(23);
const refresh_token_service_1 = __webpack_require__(22);
const sms_service_1 = __webpack_require__(19);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'DEV_SECRET',
                signOptions: { expiresIn: '1h' },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, otp_request_entity_1.OtpRequest, pin_code_entity_1.PinCode, biometric_key_entity_1.BiometricKey, refresh_token_entity_1.RefreshToken]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, users_service_1.UsersService, jwt_strategy_1.JwtStrategy, sms_service_1.SmsService, pin_code_service_1.PinCodeService, biometric_key_service_1.BiometricKeyService, refresh_token_service_1.RefreshTokenService],
        exports: [auth_service_1.AuthService, users_service_1.UsersService],
    })
], AuthModule);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(18);
const users_service_1 = __webpack_require__(10);
const sms_service_1 = __webpack_require__(19);
let AuthService = class AuthService {
    constructor(usersService, jwtService, smsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.smsService = smsService;
        this.store = new Map();
    }
    // Réinitialisation OTP par l’admin
    async resetOtp(userId) {
        const user = await this.usersService['repo']
            ? await this.usersService['repo'].findOne({ where: { id: userId } })
            : this.usersService.allUsers.find(u => u.id === userId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const otp = this.generateOtp();
        const requestId = this.generateRequestId();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        this.store.set(user.phoneNumber, {
            phoneNumber: user.phoneNumber,
            otp,
            requestId,
            expiresAt,
            attempts: 0,
            isUsed: false,
        });
        await this.smsService.sendSms(user.phoneNumber, `Votre nouveau code OTP est : ${otp}`);
        return { success: true, message: 'OTP reset and sent', requestId };
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
        const baseRes = { success: smsRes.success, message: smsRes.success ? 'OTP sent successfully' : 'OTP failed', requestId };
        if (process.env.NODE_ENV === 'test') {
            return { ...baseRes, otp };
        }
        return baseRes;
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
        // Génère un vrai JWT pour permettre l'accès au profil
        const user = { id: 'user_123', phoneNumber, role: 'collector', name: 'Demo User' };
        const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            refreshToken: 'fake-refresh-token',
            user,
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
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof sms_service_1.SmsService !== "undefined" && sms_service_1.SmsService) === "function" ? _c : Object])
], AuthService);


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SmsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const twilio_1 = tslib_1.__importDefault(__webpack_require__(20));
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


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("twilio");

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const tslib_1 = __webpack_require__(4);
const refresh_token_service_1 = __webpack_require__(22);
const refresh_token_dto_1 = __webpack_require__(24);
const biometric_key_service_1 = __webpack_require__(26);
const register_bio_dto_1 = __webpack_require__(28);
const verify_bio_dto_1 = __webpack_require__(29);
const pin_code_service_1 = __webpack_require__(30);
const setup_pin_dto_1 = __webpack_require__(32);
const login_pin_dto_1 = __webpack_require__(33);
const common_1 = __webpack_require__(1);
const jwt_auth_guard_1 = __webpack_require__(7);
const auth_service_1 = __webpack_require__(17);
const send_otp_dto_1 = __webpack_require__(34);
const verify_otp_dto_1 = __webpack_require__(35);
const create_user_dto_1 = __webpack_require__(36);
const users_service_1 = __webpack_require__(10);
const common_2 = __webpack_require__(1);
const update_user_dto_1 = __webpack_require__(37);
let AuthController = class AuthController {
    constructor(authService, usersService, pinCodeService, biometricKeyService, refreshTokenService) {
        this.authService = authService;
        this.usersService = usersService;
        this.pinCodeService = pinCodeService;
        this.biometricKeyService = biometricKeyService;
        this.refreshTokenService = refreshTokenService;
    }
    /**
     * Endpoint pour obtenir un refresh token après login (à appeler après login OTP/PIN/Bio)
     */
    async issueRefreshToken(req) {
        return this.refreshTokenService.issue(req.user.id);
    }
    /**
     * Endpoint pour rafraîchir le JWT avec un refresh token valide
     */
    async refreshToken(body) {
        await this.refreshTokenService.verify(body.userId, body.refreshToken);
        // On retourne un nouveau JWT
        const user = await this.usersService['repo']?.findOne({ where: { id: body.userId } })
            ?? this.usersService.allUsers.find(u => u.id === body.userId);
        if (!user)
            throw new common_2.ForbiddenException('User not found');
        return this.authService.login(user);
    }
    /**
     * Endpoint pour logout (révoque le refresh token)
     */
    async logout(body) {
        return this.refreshTokenService.revoke(body.userId, body.refreshToken);
    }
    /**
     * Enregistrement d'une clé biométrique (clé publique)
     */
    async registerBio(req, body) {
        // L'utilisateur doit être admin ou le user concerné
        if (req.user.role !== 'admin' && req.user.id !== body.userId)
            throw new common_2.ForbiddenException('Not allowed');
        return this.biometricKeyService.registerKey(body.userId, body.publicKey);
    }
    /**
     * Authentification biométrique (vérification de signature)
     */
    async verifyBio(body) {
        await this.biometricKeyService.verifySignature(body.userId, body.challenge, body.signature);
        // On retourne le même format que login classique
        const user = await this.usersService['repo']?.findOne({ where: { id: body.userId } })
            ?? this.usersService.allUsers.find(u => u.id === body.userId);
        if (!user)
            throw new common_2.ForbiddenException('User not found');
        return this.authService.login(user);
    }
    /**
     * Setup PIN pour l'utilisateur connecté
     */
    async setupPin(req, body) {
        // L'utilisateur doit être connecté
        return this.pinCodeService.setupPin(req.user.id, body.pin);
    }
    /**
     * Authentification par PIN (retourne JWT si succès)
     */
    async loginPin(body) {
        await this.pinCodeService.verifyPin(body.userId, body.pin);
        // On retourne le même format que login classique
        const user = await this.usersService['repo']?.findOne({ where: { id: body.userId } })
            ?? this.usersService.allUsers.find(u => u.id === body.userId);
        if (!user)
            throw new common_2.ForbiddenException('User not found');
        return this.authService.login(user);
    }
    /**
     * Réinitialisation du PIN par un admin
     */
    async resetPin(id, body, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.pinCodeService.resetPin(req.user.id, id, body.pin);
    }
    async resetOtp(id, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.authService.resetOtp(id);
    }
    async batchActivate(ids, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.batchSetActive(ids, true);
    }
    async batchDeactivate(ids, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.batchSetActive(ids, false);
    }
    getProfile(req) {
        return { user: req.user };
    }
    async sendOtp(body) {
        return this.authService.sendOtp(body.phoneNumber);
    }
    async verifyOtp(body) {
        return this.authService.verifyOtp(body.phoneNumber, body.otp, body.requestId);
    }
    async createUser(body, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.create(body);
    }
    async activateUser(id, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.setActive(id, true);
    }
    async deactivateUser(id, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.setActive(id, false);
    }
    async deleteUser(id, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.delete(id);
    }
    async listUsers(req, page = '1', limit = '20', search, phone, name) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
        // Recherche et pagination via service
        return this.usersService.paginateAndFilter({ page: pageNum, limit: limitNum, search, phone, name });
    }
    async updateUser(id, body, req) {
        if (req.user?.role !== 'admin')
            throw new common_2.ForbiddenException('Admin only');
        return this.usersService.update(id, body);
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('refresh-token/issue'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "issueRefreshToken", null);
tslib_1.__decorate([
    (0, common_1.Post)('refresh-token'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_f = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('register-bio'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_h = typeof register_bio_dto_1.RegisterBioDto !== "undefined" && register_bio_dto_1.RegisterBioDto) === "function" ? _h : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "registerBio", null);
tslib_1.__decorate([
    (0, common_1.Post)('verify-bio'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_j = typeof verify_bio_dto_1.VerifyBioDto !== "undefined" && verify_bio_dto_1.VerifyBioDto) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "verifyBio", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('setup-pin'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_k = typeof setup_pin_dto_1.SetupPinDto !== "undefined" && setup_pin_dto_1.SetupPinDto) === "function" ? _k : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "setupPin", null);
tslib_1.__decorate([
    (0, common_1.Post)('login-pin'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_l = typeof login_pin_dto_1.LoginPinDto !== "undefined" && login_pin_dto_1.LoginPinDto) === "function" ? _l : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "loginPin", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('users/:id/reset-pin'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_m = typeof setup_pin_dto_1.SetupPinDto !== "undefined" && setup_pin_dto_1.SetupPinDto) === "function" ? _m : Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "resetPin", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('users/:id/reset-otp'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "resetOtp", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('users/batch-activate'),
    tslib_1.__param(0, (0, common_1.Body)('ids')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "batchActivate", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('users/batch-deactivate'),
    tslib_1.__param(0, (0, common_1.Body)('ids')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "batchDeactivate", null);
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
    tslib_1.__metadata("design:paramtypes", [typeof (_o = typeof send_otp_dto_1.SendOtpDto !== "undefined" && send_otp_dto_1.SendOtpDto) === "function" ? _o : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
tslib_1.__decorate([
    (0, common_1.Post)('verify-otp'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_p = typeof verify_otp_dto_1.VerifyOtpDto !== "undefined" && verify_otp_dto_1.VerifyOtpDto) === "function" ? _p : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('users'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_q = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _q : Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('users/:id/activate'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "activateUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('users/:id/deactivate'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "deactivateUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('users/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('users'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Query)('page')),
    tslib_1.__param(2, (0, common_1.Query)('limit')),
    tslib_1.__param(3, (0, common_1.Query)('search')),
    tslib_1.__param(4, (0, common_1.Query)('phone')),
    tslib_1.__param(5, (0, common_1.Query)('name')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "listUsers", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('users/:id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_r = typeof update_user_dto_1.UpdateUserDto !== "undefined" && update_user_dto_1.UpdateUserDto) === "function" ? _r : Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof pin_code_service_1.PinCodeService !== "undefined" && pin_code_service_1.PinCodeService) === "function" ? _c : Object, typeof (_d = typeof biometric_key_service_1.BiometricKeyService !== "undefined" && biometric_key_service_1.BiometricKeyService) === "function" ? _d : Object, typeof (_e = typeof refresh_token_service_1.RefreshTokenService !== "undefined" && refresh_token_service_1.RefreshTokenService) === "function" ? _e : Object])
], AuthController);


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const refresh_token_entity_1 = __webpack_require__(23);
const user_entity_1 = __webpack_require__(13);
const crypto = tslib_1.__importStar(__webpack_require__(15));
const REFRESH_TOKEN_EXP_MINUTES = 15;
let RefreshTokenService = class RefreshTokenService {
    constructor(tokenRepo, userRepo) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
    }
    async issue(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const token = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXP_MINUTES * 60 * 1000);
        const refresh = this.tokenRepo.create({ user, token, expiresAt, lastUsedAt: now, revoked: false });
        await this.tokenRepo.save(refresh);
        return { refreshToken: token, expiresAt };
    }
    async verify(userId, token) {
        const refresh = await this.tokenRepo.findOne({ where: { user: { id: userId }, token }, relations: ['user'] });
        if (!refresh || refresh.revoked)
            throw new common_1.ForbiddenException('Refresh token invalid');
        if (refresh.expiresAt < new Date())
            throw new common_1.ForbiddenException('Refresh token expired');
        // Vérifie l'inactivité
        const now = new Date();
        const maxInactive = new Date(refresh.lastUsedAt.getTime() + REFRESH_TOKEN_EXP_MINUTES * 60 * 1000);
        if (now > maxInactive)
            throw new common_1.ForbiddenException('Session inactive');
        // Met à jour la dernière activité
        refresh.lastUsedAt = now;
        await this.tokenRepo.save(refresh);
        return refresh;
    }
    async revoke(userId, token) {
        const refresh = await this.tokenRepo.findOne({ where: { user: { id: userId }, token }, relations: ['user'] });
        if (refresh) {
            refresh.revoked = true;
            await this.tokenRepo.save(refresh);
        }
        return { success: true };
    }
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], RefreshTokenService);


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshToken = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(13);
let RefreshToken = class RefreshToken {
};
exports.RefreshToken = RefreshToken;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], RefreshToken.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    tslib_1.__metadata("design:type", String)
], RefreshToken.prototype, "token", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: false }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], RefreshToken.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: false }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], RefreshToken.prototype, "lastUsedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], RefreshToken.prototype, "revoked", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], RefreshToken.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], RefreshToken.prototype, "updatedAt", void 0);
exports.RefreshToken = RefreshToken = tslib_1.__decorate([
    (0, typeorm_1.Entity)('refresh_tokens'),
    (0, typeorm_1.Index)(['user', 'token'], { unique: true })
], RefreshToken);


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], RefreshTokenDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);


/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricKeyService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const biometric_key_entity_1 = __webpack_require__(27);
const user_entity_1 = __webpack_require__(13);
const crypto = tslib_1.__importStar(__webpack_require__(15));
let BiometricKeyService = class BiometricKeyService {
    constructor(bioRepo, userRepo) {
        this.bioRepo = bioRepo;
        this.userRepo = userRepo;
    }
    async registerKey(userId, publicKey) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        let key = await this.bioRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
        if (key) {
            key.publicKey = publicKey;
            await this.bioRepo.save(key);
        }
        else {
            key = this.bioRepo.create({ user, publicKey });
            await this.bioRepo.save(key);
        }
        return { success: true };
    }
    async verifySignature(userId, challenge, signature) {
        const key = await this.bioRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
        if (!key)
            throw new common_1.BadRequestException('Biometric key not set');
        // Pour la démo, on suppose une signature RSA SHA256
        const verifier = crypto.createVerify('SHA256');
        verifier.update(challenge);
        verifier.end();
        const isValid = verifier.verify(key.publicKey, signature, 'base64');
        if (!isValid)
            throw new common_1.ForbiddenException('Invalid biometric signature');
        return { success: true };
    }
};
exports.BiometricKeyService = BiometricKeyService;
exports.BiometricKeyService = BiometricKeyService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(biometric_key_entity_1.BiometricKey)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], BiometricKeyService);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricKey = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(13);
let BiometricKey = class BiometricKey {
};
exports.BiometricKey = BiometricKey;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], BiometricKey.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], BiometricKey.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 2048, nullable: false }),
    tslib_1.__metadata("design:type", String)
], BiometricKey.prototype, "publicKey", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BiometricKey.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], BiometricKey.prototype, "updatedAt", void 0);
exports.BiometricKey = BiometricKey = tslib_1.__decorate([
    (0, typeorm_1.Entity)('biometric_keys'),
    (0, typeorm_1.Index)(['user'], { unique: true })
], BiometricKey);


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterBioDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class RegisterBioDto {
}
exports.RegisterBioDto = RegisterBioDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], RegisterBioDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], RegisterBioDto.prototype, "publicKey", void 0);


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VerifyBioDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class VerifyBioDto {
}
exports.VerifyBioDto = VerifyBioDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], VerifyBioDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VerifyBioDto.prototype, "challenge", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], VerifyBioDto.prototype, "signature", void 0);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinCodeService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const pin_code_entity_1 = __webpack_require__(31);
const user_entity_1 = __webpack_require__(13);
const crypto = tslib_1.__importStar(__webpack_require__(15));
let PinCodeService = class PinCodeService {
    constructor(pinRepo, userRepo) {
        this.pinRepo = pinRepo;
        this.userRepo = userRepo;
    }
    async setupPin(userId, pin) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const salt = crypto.randomBytes(16).toString('hex');
        const pinHash = this.hashPin(pin, salt);
        let pinCode = await this.pinRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
        if (pinCode) {
            pinCode.pinHash = pinHash;
            pinCode.salt = salt;
            await this.pinRepo.save(pinCode);
        }
        else {
            pinCode = this.pinRepo.create({ user, pinHash, salt });
            await this.pinRepo.save(pinCode);
        }
        return { success: true };
    }
    async verifyPin(userId, pin) {
        const pinCode = await this.pinRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
        if (!pinCode)
            throw new common_1.BadRequestException('PIN not set');
        const hash = this.hashPin(pin, pinCode.salt);
        if (hash !== pinCode.pinHash)
            throw new common_1.ForbiddenException('Invalid PIN');
        return { success: true };
    }
    async resetPin(adminId, userId, newPin) {
        // Optionnel: vérifier que adminId correspond à un admin
        return this.setupPin(userId, newPin);
    }
    hashPin(pin, salt) {
        return crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');
    }
};
exports.PinCodeService = PinCodeService;
exports.PinCodeService = PinCodeService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(pin_code_entity_1.PinCode)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], PinCodeService);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinCode = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(13);
let PinCode = class PinCode {
};
exports.PinCode = PinCode;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], PinCode.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], PinCode.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    tslib_1.__metadata("design:type", String)
], PinCode.prototype, "pinHash", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    tslib_1.__metadata("design:type", String)
], PinCode.prototype, "salt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], PinCode.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], PinCode.prototype, "updatedAt", void 0);
exports.PinCode = PinCode = tslib_1.__decorate([
    (0, typeorm_1.Entity)('pin_codes'),
    (0, typeorm_1.Index)(['user'], { unique: true })
], PinCode);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SetupPinDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class SetupPinDto {
}
exports.SetupPinDto = SetupPinDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 8),
    tslib_1.__metadata("design:type", String)
], SetupPinDto.prototype, "pin", void 0);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginPinDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class LoginPinDto {
}
exports.LoginPinDto = LoginPinDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], LoginPinDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 8),
    tslib_1.__metadata("design:type", String)
], LoginPinDto.prototype, "pin", void 0);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SendOtpDto = void 0;
class SendOtpDto {
}
exports.SendOtpDto = SendOtpDto;


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VerifyOtpDto = void 0;
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
tslib_1.__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], CreateUserDto.prototype, "isActive", void 0);


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateUserDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(25);
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(8);
const passport_jwt_1 = __webpack_require__(39);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'DEV_SECRET',
        });
    }
    async validate(payload) {
        return { userId: payload.sub, phoneNumber: payload.phoneNumber, role: payload.role };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], JwtStrategy);


/***/ }),
/* 39 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OtpRequest = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
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
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
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
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], OtpRequest.prototype, "createdAt", void 0);
exports.OtpRequest = OtpRequest = tslib_1.__decorate([
    (0, typeorm_1.Entity)('otp_requests'),
    (0, typeorm_1.Index)('idx_otp_requests_phone', ['phoneNumber']),
    (0, typeorm_1.Index)('idx_otp_requests_request_id', ['requestId']),
    (0, typeorm_1.Index)('idx_otp_requests_expires', ['expiresAt'])
], OtpRequest);


/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationLogsModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const communication_log_entity_1 = __webpack_require__(43);
const communication_logs_service_1 = __webpack_require__(44);
const communication_logs_controller_1 = __webpack_require__(46);
const communication_metrics_entity_1 = __webpack_require__(49);
const communication_metrics_service_1 = __webpack_require__(48);
const communication_metrics_controller_1 = __webpack_require__(50);
const communication_history_controller_1 = __webpack_require__(51);
const communication_logs_archiver_service_1 = __webpack_require__(52);
let CommunicationLogsModule = class CommunicationLogsModule {
};
exports.CommunicationLogsModule = CommunicationLogsModule;
exports.CommunicationLogsModule = CommunicationLogsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([communication_log_entity_1.CommunicationLog, communication_metrics_entity_1.CommunicationMetric])],
        providers: [communication_logs_service_1.CommunicationLogsService, communication_metrics_service_1.CommunicationMetricsService, communication_logs_archiver_service_1.CommunicationLogsArchiverService],
        controllers: [communication_logs_controller_1.CommunicationLogsController, communication_metrics_controller_1.CommunicationMetricsController, communication_history_controller_1.CommunicationHistoryController],
    })
], CommunicationLogsModule);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationLog = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
let CommunicationLog = class CommunicationLog {
};
exports.CommunicationLog = CommunicationLog;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "recipientId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "recipientContact", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "subject", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "content", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "contentIv", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "contentTag", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    (0, typeorm_1.Index)(),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "providerMessageId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationLog.prototype, "errorMessage", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], CommunicationLog.prototype, "retryCount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], CommunicationLog.prototype, "sentAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], CommunicationLog.prototype, "deliveredAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], CommunicationLog.prototype, "failedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, nullable: true }),
    tslib_1.__metadata("design:type", Number)
], CommunicationLog.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    tslib_1.__metadata("design:type", Object)
], CommunicationLog.prototype, "metadata", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], CommunicationLog.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], CommunicationLog.prototype, "updatedAt", void 0);
exports.CommunicationLog = CommunicationLog = tslib_1.__decorate([
    (0, typeorm_1.Entity)('communication_logs')
], CommunicationLog);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationLogsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const communication_log_entity_1 = __webpack_require__(43);
const json2csv_1 = __webpack_require__(45);
const encryption_service_1 = __webpack_require__(14);
let CommunicationLogsService = class CommunicationLogsService {
    constructor(logRepo) {
        this.logRepo = logRepo;
    }
    async findAll(params) {
        const qb = this.logRepo.createQueryBuilder('log');
        if (params.type)
            qb.andWhere('log.type = :type', { type: params.type });
        if (params.status)
            qb.andWhere('log.status = :status', { status: params.status });
        if (params.userId)
            qb.andWhere('log.recipientId = :userId', { userId: params.userId });
        if (params.startDate)
            qb.andWhere('log.createdAt >= :startDate', { startDate: params.startDate });
        if (params.endDate)
            qb.andWhere('log.createdAt <= :endDate', { endDate: params.endDate });
        const page = Math.max(1, params.page || 1);
        const limit = Math.max(1, Math.min(100, params.limit || 20));
        qb.skip((page - 1) * limit).take(limit).orderBy('log.createdAt', 'DESC');
        const [items, total] = await qb.getManyAndCount();
        // Déchiffre le champ content
        const decryptedItems = items.map((log) => {
            if (log.content && log.contentIv && log.contentTag) {
                try {
                    log.content = encryption_service_1.EncryptionService.decrypt(log.content, log.contentIv, log.contentTag);
                }
                catch (e) {
                    log.content = '[UNREADABLE]';
                }
            }
            return log;
        });
        return {
            items: decryptedItems,
            total,
            page,
            limit,
            pageCount: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const log = await this.logRepo.findOne({ where: { id } });
        if (log && log.content && log.contentIv && log.contentTag) {
            try {
                log.content = encryption_service_1.EncryptionService.decrypt(log.content, log.contentIv, log.contentTag);
            }
            catch (e) {
                log.content = '[UNREADABLE]';
            }
        }
        return log;
    }
    async export(params) {
        const qb = this.logRepo.createQueryBuilder('log');
        if (params.type)
            qb.andWhere('log.type = :type', { type: params.type });
        if (params.status)
            qb.andWhere('log.status = :status', { status: params.status });
        if (params.userId)
            qb.andWhere('log.recipientId = :userId', { userId: params.userId });
        if (params.startDate)
            qb.andWhere('log.createdAt >= :startDate', { startDate: params.startDate });
        if (params.endDate)
            qb.andWhere('log.createdAt <= :endDate', { endDate: params.endDate });
        const logs = await qb.orderBy('log.createdAt', 'DESC').getMany();
        // Déchiffre le champ content
        const decryptedLogs = logs.map((log) => {
            if (log.content && log.contentIv && log.contentTag) {
                try {
                    log.content = encryption_service_1.EncryptionService.decrypt(log.content, log.contentIv, log.contentTag);
                }
                catch (e) {
                    log.content = '[UNREADABLE]';
                }
            }
            return log;
        });
        if (params.format === 'csv') {
            const fields = ['id', 'type', 'provider', 'recipientId', 'recipientContact', 'subject', 'content', 'status', 'providerMessageId', 'errorMessage', 'retryCount', 'sentAt', 'deliveredAt', 'failedAt', 'cost', 'createdAt'];
            const parser = new json2csv_1.Parser({ fields });
            const csv = parser.parse(Array.isArray(decryptedLogs) ? decryptedLogs : [decryptedLogs]);
            return { csv };
        }
        // JSON export (toujours tableau)
        return Array.isArray(decryptedLogs) ? decryptedLogs : [decryptedLogs];
    }
};
exports.CommunicationLogsService = CommunicationLogsService;
exports.CommunicationLogsService = CommunicationLogsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(communication_log_entity_1.CommunicationLog)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], CommunicationLogsService);


/***/ }),
/* 45 */
/***/ ((module) => {

module.exports = require("json2csv");

/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationLogsController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_auth_guard_1 = __webpack_require__(7);
const communication_logs_service_1 = __webpack_require__(44);
const express_1 = __webpack_require__(47);
const communication_metrics_service_1 = __webpack_require__(48);
let CommunicationLogsController = class CommunicationLogsController {
    constructor(logsService, metricsService) {
        this.logsService = logsService;
        this.metricsService = metricsService;
    }
    async getLogs(type, status, userId, startDate, endDate, page, limit, req) {
        if (req.user?.role !== 'admin')
            throw new Error('Admin only');
        return this.logsService.findAll({
            type,
            status,
            userId,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
    }
    async exportLogs(req, res, format = 'csv', type, status, userId, startDate, endDate) {
        if (req.user?.role !== 'admin')
            throw new Error('Admin only');
        if (format === 'csv') {
            const result = await this.logsService.export({ format, type, status, userId, startDate, endDate });
            const csv = result.csv;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="communication-logs.csv"');
            return res.send(csv);
        }
        else {
            const logs = await this.logsService.export({ format, type, status, userId, startDate, endDate });
            return res.json(logs);
        }
    }
    async getLogById(req, id) {
        if (req.user?.role !== 'admin')
            throw new Error('Admin only');
        return this.logsService.findById(id);
    }
    async getMetrics(req, period, type) {
        if (req.user?.role !== 'admin')
            throw new Error('Admin only');
        return this.metricsService.findAll({ period, type });
    }
};
exports.CommunicationLogsController = CommunicationLogsController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)('type')),
    tslib_1.__param(1, (0, common_1.Query)('status')),
    tslib_1.__param(2, (0, common_1.Query)('userId')),
    tslib_1.__param(3, (0, common_1.Query)('startDate')),
    tslib_1.__param(4, (0, common_1.Query)('endDate')),
    tslib_1.__param(5, (0, common_1.Query)('page')),
    tslib_1.__param(6, (0, common_1.Query)('limit')),
    tslib_1.__param(7, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, String, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationLogsController.prototype, "getLogs", null);
tslib_1.__decorate([
    (0, common_1.Get)('export'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__param(2, (0, common_1.Query)('format')),
    tslib_1.__param(3, (0, common_1.Query)('type')),
    tslib_1.__param(4, (0, common_1.Query)('status')),
    tslib_1.__param(5, (0, common_1.Query)('userId')),
    tslib_1.__param(6, (0, common_1.Query)('startDate')),
    tslib_1.__param(7, (0, common_1.Query)('endDate')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object, String, String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationLogsController.prototype, "exportLogs", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Query)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationLogsController.prototype, "getLogById", null);
tslib_1.__decorate([
    (0, common_1.Get)('/../communication-metrics'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Query)('period')),
    tslib_1.__param(2, (0, common_1.Query)('type')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationLogsController.prototype, "getMetrics", null);
exports.CommunicationLogsController = CommunicationLogsController = tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/communication-logs'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof communication_logs_service_1.CommunicationLogsService !== "undefined" && communication_logs_service_1.CommunicationLogsService) === "function" ? _a : Object, typeof (_b = typeof communication_metrics_service_1.CommunicationMetricsService !== "undefined" && communication_metrics_service_1.CommunicationMetricsService) === "function" ? _b : Object])
], CommunicationLogsController);


/***/ }),
/* 47 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationMetricsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const communication_metrics_entity_1 = __webpack_require__(49);
let CommunicationMetricsService = class CommunicationMetricsService {
    constructor(metricRepo) {
        this.metricRepo = metricRepo;
    }
    async findAll(params) {
        const qb = this.metricRepo.createQueryBuilder('metric');
        if (params.type)
            qb.andWhere('metric.type = :type', { type: params.type });
        // Pour la démo, ignore le filtrage par période (à implémenter selon besoin)
        qb.orderBy('metric.date', 'DESC');
        return qb.getMany();
    }
};
exports.CommunicationMetricsService = CommunicationMetricsService;
exports.CommunicationMetricsService = CommunicationMetricsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(communication_metrics_entity_1.CommunicationMetric)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], CommunicationMetricsService);


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationMetric = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
let CommunicationMetric = class CommunicationMetric {
};
exports.CommunicationMetric = CommunicationMetric;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], CommunicationMetric.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    tslib_1.__metadata("design:type", String)
], CommunicationMetric.prototype, "date", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    tslib_1.__metadata("design:type", String)
], CommunicationMetric.prototype, "type", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    tslib_1.__metadata("design:type", String)
], CommunicationMetric.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], CommunicationMetric.prototype, "totalSent", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], CommunicationMetric.prototype, "totalDelivered", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], CommunicationMetric.prototype, "totalFailed", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    tslib_1.__metadata("design:type", Number)
], CommunicationMetric.prototype, "successRate", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], CommunicationMetric.prototype, "createdAt", void 0);
exports.CommunicationMetric = CommunicationMetric = tslib_1.__decorate([
    (0, typeorm_1.Entity)('communication_metrics')
], CommunicationMetric);


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationMetricsController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_auth_guard_1 = __webpack_require__(7);
const communication_metrics_service_1 = __webpack_require__(48);
let CommunicationMetricsController = class CommunicationMetricsController {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async getMetrics(req, period, type) {
        if (req.user?.role !== 'admin')
            throw new Error('Admin only');
        return this.metricsService.findAll({ period, type });
    }
};
exports.CommunicationMetricsController = CommunicationMetricsController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Query)('period')),
    tslib_1.__param(2, (0, common_1.Query)('type')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationMetricsController.prototype, "getMetrics", null);
exports.CommunicationMetricsController = CommunicationMetricsController = tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/communication-metrics'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof communication_metrics_service_1.CommunicationMetricsService !== "undefined" && communication_metrics_service_1.CommunicationMetricsService) === "function" ? _a : Object])
], CommunicationMetricsController);


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationHistoryController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_auth_guard_1 = __webpack_require__(7);
const communication_logs_service_1 = __webpack_require__(44);
let CommunicationHistoryController = class CommunicationHistoryController {
    constructor(logsService) {
        this.logsService = logsService;
    }
    async getMyHistory(req, type, startDate, endDate, page, limit) {
        if (!req.user)
            throw new Error('Auth required');
        // Seul le gestionnaire peut voir son historique
        if (req.user.role !== 'manager' && req.user.role !== 'gestionnaire')
            throw new Error('Manager only');
        return this.logsService.findAll({
            userId: req.user.id,
            type,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
    }
};
exports.CommunicationHistoryController = CommunicationHistoryController;
tslib_1.__decorate([
    (0, common_1.Get)('my-history'),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__param(1, (0, common_1.Query)('type')),
    tslib_1.__param(2, (0, common_1.Query)('startDate')),
    tslib_1.__param(3, (0, common_1.Query)('endDate')),
    tslib_1.__param(4, (0, common_1.Query)('page')),
    tslib_1.__param(5, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationHistoryController.prototype, "getMyHistory", null);
exports.CommunicationHistoryController = CommunicationHistoryController = tslib_1.__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('communication'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof communication_logs_service_1.CommunicationLogsService !== "undefined" && communication_logs_service_1.CommunicationLogsService) === "function" ? _a : Object])
], CommunicationHistoryController);


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var CommunicationLogsArchiverService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationLogsArchiverService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(12);
const communication_log_entity_1 = __webpack_require__(43);
let CommunicationLogsArchiverService = CommunicationLogsArchiverService_1 = class CommunicationLogsArchiverService {
    constructor(logRepo) {
        this.logRepo = logRepo;
        this.logger = new common_1.Logger(CommunicationLogsArchiverService_1.name);
    }
    /**
     * Archive (soft-delete) logs older than the given date (default: 1 an)
     */
    async archiveOldLogs(beforeDate) {
        const cutoff = beforeDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        // Ajoute un champ isArchived si besoin, sinon suppression physique
        const result = await this.logRepo.delete({ createdAt: (0, typeorm_2.LessThan)(cutoff) });
        this.logger.log(`Archived ${result.affected} communication logs older than ${cutoff.toISOString()}`);
        return result.affected || 0;
    }
};
exports.CommunicationLogsArchiverService = CommunicationLogsArchiverService;
exports.CommunicationLogsArchiverService = CommunicationLogsArchiverService = CommunicationLogsArchiverService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(communication_log_entity_1.CommunicationLog)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], CommunicationLogsArchiverService);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map