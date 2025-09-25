"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ICPExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICPExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const icp_brasil_constants_1 = require("../../core/icp-brasil/constants/icp-brasil.constants");
let ICPExceptionFilter = ICPExceptionFilter_1 = class ICPExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(ICPExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erro interno do servidor';
        let errorCode = 'INTERNAL_ERROR';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
                message = exceptionResponse['message'];
            }
        }
        else if (exception.message) {
            message = exception.message;
            if (message.includes(icp_brasil_constants_1.ICP_ERROR_CODES.INVALID_CERTIFICATE)) {
                status = common_1.HttpStatus.BAD_REQUEST;
                errorCode = icp_brasil_constants_1.ICP_ERROR_CODES.INVALID_CERTIFICATE;
            }
            else if (message.includes(icp_brasil_constants_1.ICP_ERROR_CODES.CERTIFICATE_EXPIRED)) {
                status = common_1.HttpStatus.BAD_REQUEST;
                errorCode = icp_brasil_constants_1.ICP_ERROR_CODES.CERTIFICATE_EXPIRED;
            }
            else if (message.includes(icp_brasil_constants_1.ICP_ERROR_CODES.CERTIFICATE_REVOKED)) {
                status = common_1.HttpStatus.BAD_REQUEST;
                errorCode = icp_brasil_constants_1.ICP_ERROR_CODES.CERTIFICATE_REVOKED;
            }
            else if (message.includes(icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_INVALID)) {
                status = common_1.HttpStatus.BAD_REQUEST;
                errorCode = icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_INVALID;
            }
            else if (message.includes(icp_brasil_constants_1.ICP_ERROR_CODES.FILE_TOO_LARGE)) {
                status = common_1.HttpStatus.PAYLOAD_TOO_LARGE;
                errorCode = icp_brasil_constants_1.ICP_ERROR_CODES.FILE_TOO_LARGE;
            }
        }
        this.logger.error({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            errorCode,
            message,
            stack: exception.stack,
            userId: request.user?.userId,
        });
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            errorCode,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
        };
        response.status(status).json(errorResponse);
    }
};
exports.ICPExceptionFilter = ICPExceptionFilter;
exports.ICPExceptionFilter = ICPExceptionFilter = ICPExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], ICPExceptionFilter);
//# sourceMappingURL=icp-exception.filter.js.map