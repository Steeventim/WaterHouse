"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const dev_controller_1 = require("./dev.controller");
const auth_module_1 = require("../modules/auth/auth.module");
const typeorm_1 = require("@nestjs/typeorm");
const path_1 = require("path");
const user_entity_1 = require("../modules/auth/entities/user.entity");
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
        ],
        controllers: [app_controller_1.AppController, dev_controller_1.DevController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map