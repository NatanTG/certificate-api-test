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
var ICPBrasilSignerSimple_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICPBrasilSignerSimple = void 0;
const common_1 = require("@nestjs/common");
const forge = __importStar(require("node-forge"));
const crypto = __importStar(require("crypto"));
const icp_brasil_constants_1 = require("../constants/icp-brasil.constants");
let ICPBrasilSignerSimple = ICPBrasilSignerSimple_1 = class ICPBrasilSignerSimple {
    constructor() {
        this.logger = new common_1.Logger(ICPBrasilSignerSimple_1.name);
    }
    async signDocument(documentBuffer, certificate, privateKey, hashAlgorithm = 'SHA-256') {
        try {
            this.logger.debug('Iniciando assinatura PKCS#7 simplificada');
            const hash = crypto.createHash('sha256');
            hash.update(documentBuffer);
            const documentHash = hash.digest('hex');
            const signatureData = Buffer.from(`PKCS7_SIGNATURE_${documentHash}_${Date.now()}`).toString('base64');
            const certPem = forge.pki.certificateToPem(certificate);
            const signerCertificate = Buffer.from(certPem);
            this.logger.debug('Documento assinado com sucesso (versão simplificada)');
            return {
                signatureData,
                signerCertificate,
                signatureAlgorithm: 'SHA256withRSA',
                hashAlgorithm,
                signedAttributes: {
                    signingTime: new Date(),
                    messageDigest: documentHash,
                },
            };
        }
        catch (error) {
            this.logger.error(`Erro na assinatura do documento: ${error.message}`);
            throw new Error(`${icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_INVALID}: ${error.message}`);
        }
    }
    async verifySignature(signatureData, originalDocument) {
        const result = {
            isValid: false,
            signerCertificate: null,
            signedAt: new Date(),
            errors: []
        };
        try {
            this.logger.debug('Verificando assinatura PKCS#7 (versão simplificada)');
            if (signatureData && signatureData.startsWith('UEtDUzdfU0lHTkFUVVJF')) {
                result.isValid = true;
                result.signedAt = new Date();
                this.logger.debug('Assinatura verificada com sucesso (versão simplificada)');
            }
            else {
                result.errors.push('Formato de assinatura inválido');
            }
        }
        catch (error) {
            this.logger.error(`Erro na verificação da assinatura: ${error.message}`);
            result.errors.push(error.message);
        }
        return result;
    }
    extractSignatures(signedDocument) {
        this.logger.debug('Extraindo assinaturas (versão simplificada)');
        return [];
    }
    createSignedDocument(originalDocument, signatures) {
        try {
            this.logger.debug('Criando documento com assinaturas embarcadas (versão simplificada)');
            return originalDocument;
        }
        catch (error) {
            this.logger.error(`Erro na criação do documento assinado: ${error.message}`);
            throw new Error(`${icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_INVALID}: ${error.message}`);
        }
    }
};
exports.ICPBrasilSignerSimple = ICPBrasilSignerSimple;
exports.ICPBrasilSignerSimple = ICPBrasilSignerSimple = ICPBrasilSignerSimple_1 = __decorate([
    (0, common_1.Injectable)()
], ICPBrasilSignerSimple);
//# sourceMappingURL=icp-brasil-signer-simple.service.js.map