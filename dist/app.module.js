"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./config/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const documents_module_1 = require("./modules/documents/documents.module");
const signatures_module_1 = require("./modules/signatures/signatures.module");
const users_module_1 = require("./modules/users/users.module");
const icp_brasil_module_1 = require("./core/icp-brasil/icp-brasil.module");
const audit_logger_interceptor_1 = require("./common/interceptors/audit-logger.interceptor");
const icp_exception_filter_1 = require("./common/filters/icp-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.LOG_LEVEL || 'info',
                    transport: process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty' }
                        : undefined,
                    redact: {
                        paths: ['req.headers.authorization', 'req.body.certificatePassword'],
                        censor: '[REDACTED]'
                    },
                    customProps: () => ({
                        context: 'HTTP',
                    }),
                },
            }),
            prisma_module_1.PrismaModule,
            icp_brasil_module_1.ICPBrasilModule,
            auth_module_1.AuthModule,
            documents_module_1.DocumentsModule,
            signatures_module_1.SignaturesModule,
            users_module_1.UsersModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_logger_interceptor_1.AuditLoggerInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: icp_exception_filter_1.ICPExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map