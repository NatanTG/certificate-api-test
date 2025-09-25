"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLoggerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const icp_brasil_constants_1 = require("../../core/icp-brasil/constants/icp-brasil.constants");
let AuditLoggerInterceptor = class AuditLoggerInterceptor {
    constructor() {
        this.logger = new common_1.Logger('AUDIT');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const user = request['user'];
        const startTime = Date.now();
        const auditLog = {
            userId: user?.userId || null,
            method: request.method,
            url: request.url,
            userAgent: request.get('user-agent'),
            ipAddress: request.ip || request.socket?.remoteAddress,
            timestamp: new Date().toISOString(),
            resource: this.extractResource(request.url),
            action: this.mapMethodToAction(request.method, request.url),
        };
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const duration = Date.now() - startTime;
            this.logger.log({
                ...auditLog,
                success: true,
                statusCode: response.statusCode,
                duration: `${duration}ms`,
                responseSize: JSON.stringify(data || {}).length,
            });
        }), (0, operators_1.catchError)((error) => {
            const duration = Date.now() - startTime;
            this.logger.error({
                ...auditLog,
                success: false,
                statusCode: error.status || 500,
                errorMessage: error.message,
                duration: `${duration}ms`,
            });
            throw error;
        }));
    }
    extractResource(url) {
        if (url.includes('/auth/'))
            return 'auth';
        if (url.includes('/documents/'))
            return 'documents';
        if (url.includes('/signatures/'))
            return 'signatures';
        if (url.includes('/users/'))
            return 'users';
        return 'unknown';
    }
    mapMethodToAction(method, url) {
        if (url.includes('/login'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.USER_LOGIN;
        if (url.includes('/logout'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.USER_LOGOUT;
        if (url.includes('/upload'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.DOCUMENT_UPLOAD;
        if (url.includes('/sign-icp'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.SIGNATURE_ATTEMPT;
        if (url.includes('/verify'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.SIGNATURE_VERIFICATION;
        if (url.includes('/download'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.DOCUMENT_DOWNLOAD;
        if (url.includes('/validate-detailed'))
            return icp_brasil_constants_1.AUDIT_LOG_TYPES.CERTIFICATE_VALIDATION;
        return `${method}_${url}`;
    }
};
exports.AuditLoggerInterceptor = AuditLoggerInterceptor;
exports.AuditLoggerInterceptor = AuditLoggerInterceptor = __decorate([
    (0, common_1.Injectable)()
], AuditLoggerInterceptor);
//# sourceMappingURL=audit-logger.interceptor.js.map