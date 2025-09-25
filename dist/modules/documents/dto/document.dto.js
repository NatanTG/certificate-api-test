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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSigningResponseDto = exports.SignDocumentDto = exports.UserDocumentsResponseDto = exports.DocumentVerificationResponseDto = exports.DocumentUploadResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DocumentUploadResponseDto {
}
exports.DocumentUploadResponseDto = DocumentUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID único do documento',
        example: 'clxxx12345'
    }),
    __metadata("design:type", String)
], DocumentUploadResponseDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do arquivo',
        example: 'contrato.pdf'
    }),
    __metadata("design:type", String)
], DocumentUploadResponseDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash SHA-256 do documento',
        example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    }),
    __metadata("design:type", String)
], DocumentUploadResponseDto.prototype, "hash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data e hora do upload',
        example: '2024-09-24T20:30:00.000Z'
    }),
    __metadata("design:type", Date)
], DocumentUploadResponseDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tamanho do arquivo em bytes',
        example: 1024000
    }),
    __metadata("design:type", Number)
], DocumentUploadResponseDto.prototype, "size", void 0);
class DocumentVerificationResponseDto {
}
exports.DocumentVerificationResponseDto = DocumentVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do documento',
        example: 'clxxx12345'
    }),
    __metadata("design:type", String)
], DocumentVerificationResponseDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash SHA-256 do documento',
        example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    }),
    __metadata("design:type", String)
], DocumentVerificationResponseDto.prototype, "documentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número total de assinaturas no documento',
        example: 2
    }),
    __metadata("design:type", Number)
], DocumentVerificationResponseDto.prototype, "totalSignatures", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de assinaturas do documento',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                signatureId: { type: 'string', example: 'clyyy67890' },
                certificateInfo: {
                    type: 'object',
                    properties: {
                        subject: { type: 'string', example: 'João Silva:12345678901' },
                        issuer: { type: 'string', example: 'AC CERTISIGN RFB G5' },
                        serialNumber: { type: 'string', example: '123456789' },
                        validity: {
                            type: 'object',
                            properties: {
                                notBefore: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                                notAfter: { type: 'string', example: '2025-01-01T00:00:00.000Z' }
                            }
                        },
                        cpfCnpj: { type: 'string', example: '12345678901' }
                    }
                },
                isValid: { type: 'boolean', example: true },
                validationDetails: {
                    type: 'object',
                    properties: {
                        chainValid: { type: 'boolean', example: true },
                        notRevoked: { type: 'boolean', example: true },
                        timeValid: { type: 'boolean', example: true },
                        policyValid: { type: 'boolean', example: true }
                    }
                },
                signedAt: { type: 'string', example: '2024-09-24T20:30:00.000Z' }
            }
        }
    }),
    __metadata("design:type", Array)
], DocumentVerificationResponseDto.prototype, "signatures", void 0);
class UserDocumentsResponseDto {
}
exports.UserDocumentsResponseDto = UserDocumentsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lista de documentos do usuário',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'clxxx12345' },
                filename: { type: 'string', example: 'contrato.pdf' },
                uploadedAt: { type: 'string', example: '2024-09-24T20:30:00.000Z' },
                signaturesCount: { type: 'number', example: 2 },
                isFullySigned: { type: 'boolean', example: true },
                lastSignedAt: { type: 'string', example: '2024-09-24T20:35:00.000Z' }
            }
        }
    }),
    __metadata("design:type", Array)
], UserDocumentsResponseDto.prototype, "documents", void 0);
class SignDocumentDto {
    constructor() {
        this.hashAlgorithm = 'SHA-256';
    }
}
exports.SignDocumentDto = SignDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Senha do certificado digital (.p12/.pfx)',
        example: 'minhasenha123'
    }),
    (0, class_validator_1.IsString)({ message: 'Senha do certificado deve ser uma string' }),
    __metadata("design:type", String)
], SignDocumentDto.prototype, "certificatePassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Algoritmo de hash (opcional, padrão SHA-256)',
        example: 'SHA-256',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignDocumentDto.prototype, "hashAlgorithm", void 0);
class DocumentSigningResponseDto {
}
exports.DocumentSigningResponseDto = DocumentSigningResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da assinatura criada',
        example: 'clyyy67890'
    }),
    __metadata("design:type", String)
], DocumentSigningResponseDto.prototype, "signatureId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do documento assinado',
        example: 'clxxx12345'
    }),
    __metadata("design:type", String)
], DocumentSigningResponseDto.prototype, "documentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Informações do certificado usado na assinatura',
        type: 'object',
        properties: {
            subject: { type: 'string', example: 'João Silva:12345678901' },
            issuer: { type: 'string', example: 'AC CERTISIGN RFB G5' },
            serialNumber: { type: 'string', example: '123456789' },
            validity: {
                type: 'object',
                properties: {
                    notBefore: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    notAfter: { type: 'string', example: '2025-01-01T00:00:00.000Z' }
                }
            },
            cpfCnpj: { type: 'string', example: '12345678901' }
        }
    }),
    __metadata("design:type", Object)
], DocumentSigningResponseDto.prototype, "certificateInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data e hora da assinatura',
        example: '2024-09-24T20:35:00.000Z'
    }),
    __metadata("design:type", Date)
], DocumentSigningResponseDto.prototype, "signedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Padrão de assinatura utilizado',
        example: 'ICP-Brasil'
    }),
    __metadata("design:type", String)
], DocumentSigningResponseDto.prototype, "standard", void 0);
//# sourceMappingURL=document.dto.js.map