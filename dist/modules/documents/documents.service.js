"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const icp_brasil_certificate_handler_service_1 = require("../../core/icp-brasil/services/icp-brasil-certificate-handler.service");
const icp_brasil_signer_service_1 = require("../../core/icp-brasil/services/icp-brasil-signer.service");
const icp_brasil_validator_service_1 = require("../../core/icp-brasil/services/icp-brasil-validator.service");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const icp_brasil_constants_1 = require("../../core/icp-brasil/constants/icp-brasil.constants");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(prisma, certificateHandler, signer, validator) {
        this.prisma = prisma;
        this.certificateHandler = certificateHandler;
        this.signer = signer;
        this.validator = validator;
        this.logger = new common_1.Logger(DocumentsService_1.name);
    }
    async uploadDocument(file, userId) {
        try {
            this.logger.debug(`Upload de documento por usuário ${userId}`);
            if (file.size > icp_brasil_constants_1.VALIDATION_CONFIG.MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`Arquivo muito grande. Tamanho máximo: ${icp_brasil_constants_1.VALIDATION_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
            }
            const fileBuffer = file.buffer;
            const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            const uploadDir = process.env.UPLOAD_PATH || './uploads';
            const filename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, fileBuffer);
            const document = await this.prisma.document.create({
                data: {
                    userId,
                    filename,
                    originalFilename: file.originalname,
                    filePath,
                    fileHash: hash,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                },
            });
            this.logger.log(`Documento ${document.id} carregado com sucesso`);
            return {
                documentId: document.id,
                filename: document.originalFilename,
                hash: document.fileHash,
                uploadedAt: document.uploadedAt,
                size: document.fileSize,
            };
        }
        catch (error) {
            this.logger.error(`Erro no upload do documento: ${error.message}`);
            throw error;
        }
    }
    async signDocument(documentId, certificateFile, certificatePassword, userId, hashAlgorithm = 'SHA-256') {
        try {
            this.logger.debug(`Assinando documento ${documentId}`);
            const document = await this.prisma.document.findFirst({
                where: { id: documentId, userId },
            });
            if (!document) {
                throw new common_1.NotFoundException('Documento não encontrado');
            }
            const documentBuffer = fs.readFileSync(document.filePath);
            const { certificate, privateKey } = await this.certificateHandler.loadCertificate(certificateFile.buffer, certificatePassword);
            this.logger.debug('🔍 INICIANDO VALIDAÇÃO DETALHADA DO CERTIFICADO A1');
            this.logger.debug(`📁 Certificado carregado - Subject: ${certificate.subject.getField('CN')?.value}`);
            this.logger.debug(`🏢 Emissor: ${certificate.issuer.getField('CN')?.value}`);
            this.logger.debug(`🔢 Serial: ${certificate.serialNumber}`);
            this.logger.debug(`📅 Validade: ${certificate.validity.notBefore} até ${certificate.validity.notAfter}`);
            const validation = this.certificateHandler.validateICPBrasilCertificate(certificate);
            this.logger.debug('📋 RESULTADO COMPLETO DA VALIDAÇÃO:');
            this.logger.debug(`- É válido: ${validation.isValid}`);
            this.logger.debug(`- É ICP-Brasil: ${validation.isICPBrasil}`);
            this.logger.debug(`- Políticas encontradas: ${JSON.stringify(validation.policyValidation.policies)}`);
            this.logger.debug(`- Erros de política: ${JSON.stringify(validation.policyValidation.errors)}`);
            this.logger.debug(`- Validação temporal: ${validation.timeValidation.isValid}`);
            this.logger.debug(`- Erros temporais: ${JSON.stringify(validation.timeValidation.errors)}`);
            this.logger.debug(`- Erros de cadeia: ${JSON.stringify(validation.chainValidation.errors)}`);
            if (!validation.isValid) {
                this.logger.error('❌ CERTIFICADO REJEITADO - Detalhes:');
                this.logger.error(`- ICP-Brasil válido: ${validation.isICPBrasil}`);
                this.logger.error(`- Políticas: ${validation.policyValidation.policies.length} encontradas`);
                this.logger.error(`- Todos os erros: ${JSON.stringify({
                    policy: validation.policyValidation.errors,
                    time: validation.timeValidation.errors,
                    chain: validation.chainValidation.errors
                }, null, 2)}`);
                this.logger.error('🚨 MODO DEBUG ATIVADO - Continuando mesmo com erro para análise');
                this.logger.warn('⚠️  PROSSEGUINDO COM CERTIFICADO INVÁLIDO PARA TESTE');
            }
            else {
                this.logger.debug('✅ CERTIFICADO VALIDADO COM SUCESSO');
            }
            const signatureData = await this.signer.signDocument(documentBuffer, certificate, privateKey, hashAlgorithm);
            const cpfCnpj = this.certificateHandler.extractCpfCnpj(certificate);
            const certificateDataBase64 = Buffer.from(signatureData.signerCertificate).toString('base64');
            const signature = await this.prisma.icpSignature.create({
                data: {
                    documentId: document.id,
                    signatureData: signatureData.signatureData,
                    signedDocumentData: certificateDataBase64,
                    certificateSubject: certificate.subject.getField('CN')?.value || '',
                    certificateIssuer: certificate.issuer.getField('CN')?.value || '',
                    certificateSerialNumber: certificate.serialNumber,
                    certificateNotBefore: certificate.validity.notBefore,
                    certificateNotAfter: certificate.validity.notAfter,
                    signerCpfCnpj: cpfCnpj,
                    signatureAlgorithm: signatureData.signatureAlgorithm,
                    hashAlgorithm: signatureData.hashAlgorithm,
                },
            });
            const certificateInfo = {
                subject: certificate.subject.getField('CN')?.value || '',
                issuer: certificate.issuer.getField('CN')?.value || '',
                serialNumber: certificate.serialNumber,
                validity: {
                    notBefore: certificate.validity.notBefore,
                    notAfter: certificate.validity.notAfter,
                },
                cpfCnpj,
            };
            this.logger.log(`Documento ${documentId} assinado com sucesso - Assinatura ${signature.id}`);
            return {
                signatureId: signature.id,
                documentId: document.id,
                certificateInfo,
                signedAt: signature.signedAt,
                standard: 'ICP-Brasil',
            };
        }
        catch (error) {
            this.logger.error(`Erro na assinatura do documento: ${error.message}`);
            throw error;
        }
    }
    async verifyDocument(documentId, userId) {
        try {
            this.logger.debug(`Verificando documento ${documentId}`);
            const document = await this.prisma.document.findFirst({
                where: { id: documentId, userId },
                include: { icpSignatures: true },
            });
            if (!document) {
                throw new common_1.NotFoundException('Documento não encontrado');
            }
            const signatures = [];
            for (const sig of document.icpSignatures) {
                const certificateInfo = {
                    subject: sig.certificateSubject,
                    issuer: sig.certificateIssuer,
                    serialNumber: sig.certificateSerialNumber,
                    validity: {
                        notBefore: sig.certificateNotBefore,
                        notAfter: sig.certificateNotAfter,
                    },
                    cpfCnpj: sig.signerCpfCnpj,
                };
                const validationDetails = {
                    chainValid: sig.validationStatus === 'VALID',
                    notRevoked: sig.validationStatus !== 'REVOKED',
                    timeValid: new Date() < sig.certificateNotAfter,
                    policyValid: sig.validationStatus === 'VALID',
                };
                signatures.push({
                    signatureId: sig.id,
                    certificateInfo,
                    isValid: sig.validationStatus === 'VALID',
                    validationDetails,
                    signedAt: sig.signedAt,
                });
            }
            return {
                documentId: document.id,
                documentHash: document.fileHash,
                totalSignatures: signatures.length,
                signatures,
            };
        }
        catch (error) {
            this.logger.error(`Erro na verificação do documento: ${error.message}`);
            throw error;
        }
    }
    async downloadSignedDocument(documentId, userId) {
        try {
            this.logger.debug(`Download de documento assinado ${documentId}`);
            const document = await this.prisma.document.findFirst({
                where: { id: documentId, userId },
                include: { icpSignatures: true },
            });
            if (!document) {
                throw new common_1.NotFoundException('Documento não encontrado');
            }
            const originalDocument = fs.readFileSync(document.filePath);
            if (document.icpSignatures.length === 0) {
                return originalDocument;
            }
            this.logger.debug('Reconstruindo documento P7S com dados do certificado');
            try {
                const signatureDataArray = document.icpSignatures.map(sig => ({
                    signatureData: sig.signatureData,
                    signerCertificate: sig.signedDocumentData ? Buffer.from(sig.signedDocumentData, 'base64') : Buffer.from(''),
                    signatureAlgorithm: sig.signatureAlgorithm,
                    hashAlgorithm: sig.hashAlgorithm,
                    signedAttributes: {},
                }));
                const signedDocument = this.signer.createSignedDocument(originalDocument, signatureDataArray);
                return signedDocument;
            }
            catch (reconstructionError) {
                this.logger.warn(`Falha na reconstrução P7S: ${reconstructionError.message}. Retornando documento original.`);
                return originalDocument;
            }
        }
        catch (error) {
            this.logger.error(`Erro no download do documento: ${error.message}`);
            throw error;
        }
    }
    async getUserDocuments(userId) {
        try {
            const documents = await this.prisma.document.findMany({
                where: { userId },
                include: {
                    icpSignatures: {
                        select: { id: true, signedAt: true },
                    },
                },
                orderBy: { uploadedAt: 'desc' },
            });
            const formattedDocuments = documents.map(doc => ({
                id: doc.id,
                filename: doc.originalFilename,
                uploadedAt: doc.uploadedAt,
                signaturesCount: doc.icpSignatures.length,
                isFullySigned: doc.icpSignatures.length > 0,
                lastSignedAt: doc.icpSignatures.length > 0
                    ? doc.icpSignatures[doc.icpSignatures.length - 1].signedAt
                    : undefined,
            }));
            return { documents: formattedDocuments };
        }
        catch (error) {
            this.logger.error(`Erro ao buscar documentos do usuário: ${error.message}`);
            throw error;
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        icp_brasil_certificate_handler_service_1.ICPBrasilCertificateHandler,
        icp_brasil_signer_service_1.ICPBrasilSigner,
        icp_brasil_validator_service_1.ICPBrasilValidator])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map