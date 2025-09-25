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
var ICPBrasilValidator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICPBrasilValidator = void 0;
const common_1 = require("@nestjs/common");
const forge = __importStar(require("node-forge"));
const icp_brasil_constants_1 = require("../constants/icp-brasil.constants");
const icp_brasil_certificate_handler_service_1 = require("./icp-brasil-certificate-handler.service");
const icp_brasil_signer_service_1 = require("./icp-brasil-signer.service");
let ICPBrasilValidator = ICPBrasilValidator_1 = class ICPBrasilValidator {
    constructor(certificateHandler, signer) {
        this.certificateHandler = certificateHandler;
        this.signer = signer;
        this.logger = new common_1.Logger(ICPBrasilValidator_1.name);
    }
    async fullValidation(signature, originalDocument, options = {}) {
        const startTime = Date.now();
        const validationLog = [];
        this.logger.debug('Iniciando validação completa da assinatura ICP-Brasil');
        const result = {
            cryptographicIntegrity: false,
            certificateChain: false,
            revocationStatus: false,
            timeValidation: false,
            policyCompliance: false,
            errors: [],
            warnings: [],
            validatedAt: new Date()
        };
        try {
            const timeout = options.timeout || icp_brasil_constants_1.VALIDATION_CONFIG.CERTIFICATE_VALIDATION_TIMEOUT;
            const validationPromise = this.performValidation(signature, originalDocument, options, validationLog);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(icp_brasil_constants_1.ICP_ERROR_CODES.VALIDATION_TIMEOUT)), timeout));
            const validationResult = await Promise.race([validationPromise, timeoutPromise]);
            Object.assign(result, validationResult);
        }
        catch (error) {
            this.logger.error(`Erro na validação completa: ${error.message}`);
            result.errors.push(error.message);
        }
        const duration = Date.now() - startTime;
        this.logger.debug(`Validação completa concluída em ${duration}ms`);
        return result;
    }
    validateCryptographicIntegrity(signature, document) {
        const result = { isValid: false, algorithm: signature.signatureAlgorithm, errors: [] };
        try {
            this.logger.debug('Validando integridade criptográfica');
            const verification = this.signer.verifySignature(signature.signatureData, document);
            if (verification) {
                result.isValid = true;
            }
            else {
                result.errors.push('Verificação criptográfica falhou');
            }
            if (!this.isSignatureAlgorithmAllowed(signature.signatureAlgorithm)) {
                result.isValid = false;
                result.errors.push(`Algoritmo de assinatura não permitido: ${signature.signatureAlgorithm}`);
            }
            if (!this.isHashAlgorithmAllowed(signature.hashAlgorithm)) {
                result.isValid = false;
                result.errors.push(`Algoritmo de hash não permitido: ${signature.hashAlgorithm}`);
            }
        }
        catch (error) {
            this.logger.error(`Erro na validação de integridade: ${error.message}`);
            result.errors.push(error.message);
        }
        return result;
    }
    validateICPBrasilPolicies(certificate) {
        const result = {
            isCompliant: false,
            detectedPolicies: [],
            requiredPolicies: ['2.16.76.1.2.1.1', '2.16.76.1.2.1.3', '2.16.76.1.2.1.4'],
            errors: []
        };
        try {
            this.logger.debug('Validando políticas ICP-Brasil');
            const validation = this.certificateHandler.validateICPBrasilCertificate(certificate);
            if (validation.isICPBrasil) {
                result.detectedPolicies = validation.policyValidation.policies;
                result.isCompliant = validation.policyValidation.isCompliant;
                if (!result.isCompliant) {
                    result.errors.push('Certificado não possui políticas ICP-Brasil válidas');
                }
            }
            else {
                result.errors.push('Certificado não é ICP-Brasil');
            }
            this.validateSpecificPolicies(certificate, result);
        }
        catch (error) {
            this.logger.error(`Erro na validação de políticas: ${error.message}`);
            result.errors.push(error.message);
        }
        return result;
    }
    generateValidationReport(validationResults, signatureId) {
        this.logger.debug('Gerando relatório detalhado de validação');
        const report = {
            signatureId,
            validationResults: {
                cryptographicIntegrity: {
                    isValid: validationResults.cryptographicIntegrity,
                    algorithm: 'SHA256withRSA',
                    errors: validationResults.errors.filter(e => e.includes('criptográfica'))
                },
                certificateChain: {
                    isValid: validationResults.certificateChain,
                    chainLength: 0,
                    trustedRoot: 'AC-Raiz ICP-Brasil',
                    errors: validationResults.errors.filter(e => e.includes('cadeia'))
                },
                revocationStatus: {
                    isRevoked: !validationResults.revocationStatus,
                    checkedAt: new Date(),
                    crlUrls: [],
                    errors: validationResults.errors.filter(e => e.includes('revogação'))
                },
                timeValidation: {
                    isValid: validationResults.timeValidation,
                    signedAt: new Date(),
                    validAt: new Date(),
                    certificateValidityPeriod: {
                        notBefore: new Date(),
                        notAfter: new Date()
                    },
                    errors: validationResults.errors.filter(e => e.includes('tempo'))
                },
                policyCompliance: {
                    isCompliant: validationResults.policyCompliance,
                    detectedPolicies: [],
                    requiredPolicies: ['2.16.76.1.2.1.1', '2.16.76.1.2.1.3'],
                    errors: validationResults.errors.filter(e => e.includes('política'))
                }
            },
            validatedAt: validationResults.validatedAt,
            validationLog: [
                `Validação iniciada em ${validationResults.validatedAt.toISOString()}`,
                `Integridade criptográfica: ${validationResults.cryptographicIntegrity ? 'VÁLIDA' : 'INVÁLIDA'}`,
                `Cadeia de certificados: ${validationResults.certificateChain ? 'VÁLIDA' : 'INVÁLIDA'}`,
                `Status de revogação: ${validationResults.revocationStatus ? 'NÃO REVOGADO' : 'REVOGADO/ERRO'}`,
                `Validação temporal: ${validationResults.timeValidation ? 'VÁLIDA' : 'INVÁLIDA'}`,
                `Conformidade de políticas: ${validationResults.policyCompliance ? 'CONFORME' : 'NÃO CONFORME'}`,
                ...validationResults.errors.map(error => `ERRO: ${error}`),
                ...validationResults.warnings.map(warning => `AVISO: ${warning}`)
            ]
        };
        return report;
    }
    async validateMultipleSignatures(signatures, originalDocument) {
        this.logger.debug(`Validando ${signatures.length} assinaturas`);
        const results = [];
        for (let i = 0; i < signatures.length; i++) {
            this.logger.debug(`Validando assinatura ${i + 1}/${signatures.length}`);
            try {
                const result = await this.fullValidation(signatures[i], originalDocument);
                results.push({ signature: signatures[i], result });
            }
            catch (error) {
                this.logger.error(`Erro na validação da assinatura ${i + 1}: ${error.message}`);
                results.push({
                    signature: signatures[i],
                    result: {
                        cryptographicIntegrity: false,
                        certificateChain: false,
                        revocationStatus: false,
                        timeValidation: false,
                        policyCompliance: false,
                        errors: [error.message],
                        warnings: [],
                        validatedAt: new Date()
                    }
                });
            }
        }
        return results;
    }
    async performValidation(signature, originalDocument, options, validationLog) {
        const result = {
            cryptographicIntegrity: false,
            certificateChain: false,
            revocationStatus: false,
            timeValidation: false,
            policyCompliance: false,
            errors: [],
            warnings: [],
            validatedAt: new Date()
        };
        if (options.checkRevocation !== false) {
            validationLog.push('Validando integridade criptográfica...');
            const integrityResult = this.validateCryptographicIntegrity(signature, originalDocument);
            result.cryptographicIntegrity = integrityResult.isValid;
            result.errors.push(...integrityResult.errors);
        }
        if (options.validateChain !== false) {
            validationLog.push('Validando cadeia de certificados...');
            const chainResult = await this.validateCertificateChain(signature);
            result.certificateChain = chainResult.isValid;
            result.errors.push(...chainResult.errors);
        }
        if (options.checkRevocation !== false) {
            validationLog.push('Verificando status de revogação...');
            const revocationResult = await this.validateRevocationStatus(signature);
            result.revocationStatus = revocationResult.isValid;
            result.errors.push(...revocationResult.errors);
        }
        if (options.validateTime !== false) {
            validationLog.push('Validando período de validade...');
            const timeResult = this.validateTimeConstraints(signature);
            result.timeValidation = timeResult.isValid;
            result.errors.push(...timeResult.errors);
        }
        if (options.validatePolicy !== false) {
            validationLog.push('Validando políticas ICP-Brasil...');
            const policyResult = await this.validatePolicyCompliance(signature);
            result.policyCompliance = policyResult.isValid;
            result.errors.push(...policyResult.errors);
        }
        return result;
    }
    async validateCertificateChain(signature) {
        try {
            const certificate = forge.pki.certificateFromPem('-----BEGIN CERTIFICATE-----\n' +
                signature.signerCertificate.toString('base64') +
                '\n-----END CERTIFICATE-----');
            const validation = this.certificateHandler.validateICPBrasilCertificate(certificate);
            return {
                isValid: validation.chainValidation.isValid,
                errors: validation.chainValidation.errors
            };
        }
        catch (error) {
            return { isValid: false, errors: [error.message] };
        }
    }
    async validateRevocationStatus(signature) {
        try {
            const certificate = forge.pki.certificateFromPem('-----BEGIN CERTIFICATE-----\n' +
                signature.signerCertificate.toString('base64') +
                '\n-----END CERTIFICATE-----');
            const revocationResult = await this.certificateHandler.checkRevocationStatus(certificate);
            return {
                isValid: !revocationResult.isRevoked,
                errors: revocationResult.errors
            };
        }
        catch (error) {
            return { isValid: false, errors: [error.message] };
        }
    }
    validateTimeConstraints(signature) {
        try {
            const certificate = forge.pki.certificateFromPem('-----BEGIN CERTIFICATE-----\n' +
                signature.signerCertificate.toString('base64') +
                '\n-----END CERTIFICATE-----');
            const now = new Date();
            const isValid = now >= certificate.validity.notBefore && now <= certificate.validity.notAfter;
            return {
                isValid,
                errors: isValid ? [] : ['Certificado fora do período de validade']
            };
        }
        catch (error) {
            return { isValid: false, errors: [error.message] };
        }
    }
    async validatePolicyCompliance(signature) {
        try {
            const certificate = forge.pki.certificateFromPem('-----BEGIN CERTIFICATE-----\n' +
                signature.signerCertificate.toString('base64') +
                '\n-----END CERTIFICATE-----');
            const policyResult = this.validateICPBrasilPolicies(certificate);
            return {
                isValid: policyResult.isCompliant,
                errors: policyResult.errors
            };
        }
        catch (error) {
            return { isValid: false, errors: [error.message] };
        }
    }
    isSignatureAlgorithmAllowed(algorithm) {
        const allowedAlgorithms = [
            'SHA256withRSA',
            'SHA384withRSA',
            'SHA512withRSA',
            'SHA256withECDSA',
            'SHA384withECDSA',
            'SHA512withECDSA',
            'sha256WithRSAEncryption',
            'sha384WithRSAEncryption',
            'sha512WithRSAEncryption',
            'sha256WithECDSAEncryption',
            'sha384WithECDSAEncryption',
            'sha512WithECDSAEncryption'
        ];
        return allowedAlgorithms.includes(algorithm);
    }
    isHashAlgorithmAllowed(algorithm) {
        const allowedAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512'];
        return allowedAlgorithms.includes(algorithm);
    }
    validateSpecificPolicies(certificate, result) {
        const cpfCnpj = this.certificateHandler.extractCpfCnpj(certificate);
        if (!cpfCnpj) {
            result.errors.push('CPF/CNPJ não encontrado no certificado ICP-Brasil');
            result.isCompliant = false;
        }
    }
};
exports.ICPBrasilValidator = ICPBrasilValidator;
exports.ICPBrasilValidator = ICPBrasilValidator = ICPBrasilValidator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [icp_brasil_certificate_handler_service_1.ICPBrasilCertificateHandler,
        icp_brasil_signer_service_1.ICPBrasilSigner])
], ICPBrasilValidator);
//# sourceMappingURL=icp-brasil-validator.service.js.map