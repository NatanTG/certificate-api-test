"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignaturesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const signatures_service_1 = require("./signatures.service");
let SignaturesController = class SignaturesController {
    constructor(signaturesService) {
        this.signaturesService = signaturesService;
    }
    async validateDetailed(signatureId, req) {
        return this.signaturesService.validateDetailed(signatureId, req.user.userId);
    }
};
exports.SignaturesController = SignaturesController;
__decorate([
    (0, common_1.Post)(':signatureId/validate-detailed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validação detalhada de uma assinatura específica',
        description: 'Realiza validação técnica completa de uma assinatura digital, incluindo verificação criptográfica, cadeia de certificados, status de revogação e conformidade com políticas ICP-Brasil'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Validação detalhada concluída',
        schema: {
            type: 'object',
            properties: {
                signatureId: { type: 'string', example: 'clyyy67890' },
                validationResults: {
                    type: 'object',
                    properties: {
                        cryptographicIntegrity: {
                            type: 'object',
                            properties: {
                                isValid: { type: 'boolean', example: true },
                                algorithm: { type: 'string', example: 'SHA256withRSA' },
                                errors: { type: 'array', items: { type: 'string' } }
                            }
                        },
                        certificateChain: {
                            type: 'object',
                            properties: {
                                isValid: { type: 'boolean', example: true },
                                chainLength: { type: 'number', example: 3 },
                                trustedRoot: { type: 'string', example: 'AC-Raiz ICP-Brasil' },
                                errors: { type: 'array', items: { type: 'string' } }
                            }
                        },
                        revocationStatus: {
                            type: 'object',
                            properties: {
                                isRevoked: { type: 'boolean', example: false },
                                checkedAt: { type: 'string', example: '2024-09-24T20:40:00.000Z' },
                                crlUrls: { type: 'array', items: { type: 'string' } },
                                errors: { type: 'array', items: { type: 'string' } }
                            }
                        },
                        timeValidation: {
                            type: 'object',
                            properties: {
                                isValid: { type: 'boolean', example: true },
                                signedAt: { type: 'string', example: '2024-09-24T20:35:00.000Z' },
                                validAt: { type: 'string', example: '2024-09-24T20:40:00.000Z' },
                                certificateValidityPeriod: {
                                    type: 'object',
                                    properties: {
                                        notBefore: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                                        notAfter: { type: 'string', example: '2025-01-01T00:00:00.000Z' }
                                    }
                                },
                                errors: { type: 'array', items: { type: 'string' } }
                            }
                        },
                        policyCompliance: {
                            type: 'object',
                            properties: {
                                isCompliant: { type: 'boolean', example: true },
                                detectedPolicies: { type: 'array', items: { type: 'string' } },
                                requiredPolicies: { type: 'array', items: { type: 'string' } },
                                errors: { type: 'array', items: { type: 'string' } }
                            }
                        }
                    }
                },
                validatedAt: { type: 'string', example: '2024-09-24T20:40:00.000Z' },
                validationLog: { type: 'array', items: { type: 'string' } }
            }
        }
    }),
    __param(0, (0, common_1.Param)('signatureId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SignaturesController.prototype, "validateDetailed", null);
exports.SignaturesController = SignaturesController = __decorate([
    (0, swagger_1.ApiTags)('signatures'),
    (0, common_1.Controller)('signatures'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [signatures_service_1.SignaturesService])
], SignaturesController);
//# sourceMappingURL=signatures.controller.js.map