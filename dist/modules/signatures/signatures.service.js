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
var SignaturesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignaturesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const icp_brasil_validator_service_1 = require("../../core/icp-brasil/services/icp-brasil-validator.service");
let SignaturesService = SignaturesService_1 = class SignaturesService {
    constructor(prisma, validator) {
        this.prisma = prisma;
        this.validator = validator;
        this.logger = new common_1.Logger(SignaturesService_1.name);
    }
    async validateDetailed(signatureId, userId) {
        try {
            this.logger.debug(`Validação detalhada da assinatura ${signatureId}`);
            const signature = await this.prisma.icpSignature.findFirst({
                where: {
                    id: signatureId,
                    document: { userId },
                },
                include: {
                    document: true,
                },
            });
            if (!signature) {
                throw new common_1.NotFoundException('Assinatura não encontrada');
            }
            const signatureData = {
                signatureData: signature.signatureData,
                signerCertificate: Buffer.from(''),
                signatureAlgorithm: signature.signatureAlgorithm,
                hashAlgorithm: signature.hashAlgorithm,
                signedAttributes: {},
            };
            const fs = require('fs');
            const documentBuffer = fs.readFileSync(signature.document.filePath);
            const validationResult = await this.validator.fullValidation(signatureData, documentBuffer);
            const detailedResult = this.validator.generateValidationReport(validationResult, signatureId);
            await this.prisma.icpSignature.update({
                where: { id: signatureId },
                data: {
                    validationStatus: validationResult.cryptographicIntegrity &&
                        validationResult.certificateChain &&
                        validationResult.revocationStatus &&
                        validationResult.timeValidation &&
                        validationResult.policyCompliance ? 'VALID' : 'INVALID',
                    lastValidationAt: new Date(),
                    validationErrors: validationResult.errors.length > 0 ? validationResult.errors : null,
                },
            });
            this.logger.log(`Validação detalhada concluída para assinatura ${signatureId}`);
            return detailedResult;
        }
        catch (error) {
            this.logger.error(`Erro na validação detalhada: ${error.message}`);
            throw error;
        }
    }
};
exports.SignaturesService = SignaturesService;
exports.SignaturesService = SignaturesService = SignaturesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        icp_brasil_validator_service_1.ICPBrasilValidator])
], SignaturesService);
//# sourceMappingURL=signatures.service.js.map