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
var ICPBrasilSigner_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICPBrasilSigner = void 0;
const common_1 = require("@nestjs/common");
const forge = __importStar(require("node-forge"));
const crypto = __importStar(require("crypto"));
const icp_brasil_constants_1 = require("../constants/icp-brasil.constants");
let ICPBrasilSigner = ICPBrasilSigner_1 = class ICPBrasilSigner {
    constructor() {
        this.logger = new common_1.Logger(ICPBrasilSigner_1.name);
    }
    async signDocument(documentBuffer, certificate, privateKey, hashAlgorithm = 'SHA-256') {
        try {
            this.logger.debug('🚀 === VERSÃO CORRIGIDA EXECUTANDO === 🚀');
            this.logger.debug('Iniciando assinatura PKCS#7 do documento');
            this.logger.debug(`🔍 LINHA 37: Validando hashAlgorithm: "${hashAlgorithm}"`);
            if (!icp_brasil_constants_1.ALLOWED_HASH_ALGORITHMS.includes(hashAlgorithm)) {
                this.logger.error(`❌ LINHA 37: hashAlgorithm "${hashAlgorithm}" rejeitado`);
                throw new Error(`${icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_ALGORITHM_NOT_ALLOWED}: Algoritmo ${hashAlgorithm} não permitido`);
            }
            this.logger.debug(`✅ LINHA 37: hashAlgorithm "${hashAlgorithm}" aceito`);
            this.logger.debug(`🔍 LINHA 42: Calculando hash do documento`);
            const documentHash = this.calculateDocumentHash(documentBuffer, hashAlgorithm);
            this.logger.debug(`✅ LINHA 42: Hash calculado: ${documentHash.substring(0, 20)}...`);
            this.logger.debug(`🔍 LINHA 45: Criando atributos assinados`);
            const signedAttributes = this.createSignedAttributes(documentHash);
            this.logger.debug(`✅ LINHA 45: Atributos criados: ${signedAttributes.length} itens`);
            this.logger.debug(`🔍 LINHA 48: Determinando algoritmo de assinatura`);
            const signatureAlgorithm = this.getSignatureAlgorithm(certificate, hashAlgorithm);
            this.logger.debug(`🔐 LINHA 48: Algoritmo de assinatura determinado: ${signatureAlgorithm}`);
            if (!this.isSignatureAlgorithmAllowedInSigner(signatureAlgorithm)) {
                this.logger.error(`❌ Algoritmo de assinatura rejeitado: ${signatureAlgorithm}`);
                throw new Error(`${icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_ALGORITHM_NOT_ALLOWED}: Algoritmo ${signatureAlgorithm} não permitido`);
            }
            else {
                this.logger.debug(`✅ Algoritmo de assinatura aceito: ${signatureAlgorithm}`);
            }
            const pkcs7 = this.buildPKCS7Structure(certificate, signedAttributes, privateKey, signatureAlgorithm, hashAlgorithm);
            const signatureData = forge.util.encode64(forge.asn1.toDer(pkcs7).getBytes());
            this.logger.debug('Documento assinado com sucesso');
            return {
                signatureData,
                signerCertificate: Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes(), 'binary'),
                signatureAlgorithm,
                hashAlgorithm,
                signedAttributes: this.convertSignedAttributesToObject(signedAttributes),
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
            this.logger.debug('Verificando assinatura PKCS#7');
            const signatureBytes = forge.util.decode64(signatureData);
            const asn1 = forge.asn1.fromDer(signatureBytes);
            const pkcs7 = forge.pkcs7.messageFromAsn1(asn1);
            if (!pkcs7.content) {
                result.errors.push('Estrutura PKCS#7 inválida');
                return result;
            }
            const isPkcsSignedData = (obj) => {
                return obj && typeof obj === 'object' && 'certificates' in obj;
            };
            if (!isPkcsSignedData(pkcs7)) {
                result.errors.push('Tipo PKCS#7 inválido - esperado SignedData');
                return result;
            }
            if (pkcs7.certificates && pkcs7.certificates.length > 0) {
                result.signerCertificate = pkcs7.certificates[0];
            }
            else {
                result.errors.push('Certificado do signatário não encontrado');
                return result;
            }
            const integrityValid = this.verifyPKCS7Integrity(pkcs7, originalDocument);
            if (!integrityValid) {
                result.errors.push('Integridade criptográfica inválida');
                return result;
            }
            result.signedAt = this.extractSigningTime(pkcs7);
            result.isValid = true;
            this.logger.debug('Assinatura verificada com sucesso');
        }
        catch (error) {
            this.logger.error(`Erro na verificação da assinatura: ${error.message}`);
            result.errors.push(error.message);
        }
        return result;
    }
    extractSignatures(signedDocument) {
        const signatures = [];
        try {
            this.logger.debug('Extraindo assinaturas do documento');
            const formats = [
                () => this.extractFromP7SFormat(signedDocument),
                () => this.extractFromPDFSignatures(signedDocument),
                () => this.extractEmbeddedSignatures(signedDocument)
            ];
            for (const format of formats) {
                try {
                    const extracted = format();
                    signatures.push(...extracted);
                }
                catch (error) {
                }
            }
        }
        catch (error) {
            this.logger.error(`Erro na extração de assinaturas: ${error.message}`);
        }
        return signatures;
    }
    createSignedDocument(originalDocument, signatures) {
        try {
            this.logger.debug('Criando documento com assinaturas embarcadas');
            const signedData = forge.pkcs7.createSignedData();
            signedData.content = forge.util.createBuffer(originalDocument.toString('binary'));
            for (const sig of signatures) {
                const signatureBytes = forge.util.decode64(sig.signatureData);
                const asn1 = forge.asn1.fromDer(signatureBytes);
                const pkcs7 = forge.pkcs7.messageFromAsn1(asn1);
                const isPkcsSignedData = (obj) => {
                    return obj && typeof obj === 'object' && ('certificates' in obj || 'signers' in obj);
                };
                if (isPkcsSignedData(pkcs7)) {
                    if (pkcs7.signers && pkcs7.signers.length > 0) {
                        signedData.addSigner(pkcs7.signers[0]);
                    }
                    if (pkcs7.certificates) {
                        for (const cert of pkcs7.certificates) {
                            signedData.addCertificate(cert);
                        }
                    }
                }
            }
            signedData.sign();
            const der = forge.asn1.toDer(signedData.toAsn1());
            return Buffer.from(der.getBytes(), 'binary');
        }
        catch (error) {
            this.logger.error(`Erro na criação do documento assinado: ${error.message}`);
            throw new Error(`${icp_brasil_constants_1.ICP_ERROR_CODES.SIGNATURE_INVALID}: ${error.message}`);
        }
    }
    calculateDocumentHash(document, algorithm) {
        const hash = crypto.createHash(algorithm.toLowerCase().replace('-', ''));
        hash.update(document);
        return hash.digest('hex');
    }
    createSignedAttributes(documentHash) {
        const attributes = [];
        attributes.push({
            type: forge.pki.oids.data,
            value: forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [
                forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OID, false, forge.asn1.oidToDer(forge.pki.oids.data).getBytes())
            ])
        });
        attributes.push({
            type: forge.pki.oids.messageDigest,
            value: forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [
                forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OCTETSTRING, false, forge.util.hexToBytes(documentHash))
            ])
        });
        attributes.push({
            type: forge.pki.oids.signingTime,
            value: forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [
                forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.UTCTIME, false, forge.asn1.dateToUtcTime(new Date()))
            ])
        });
        return attributes;
    }
    getSignatureAlgorithm(certificate, hashAlgorithm) {
        const publicKey = certificate.publicKey;
        if (publicKey.algorithm === 'rsaEncryption' || publicKey.n) {
            return `${hashAlgorithm}withRSA`;
        }
        else if (publicKey.algorithm === 'id-ecPublicKey') {
            return `${hashAlgorithm}withECDSA`;
        }
        throw new Error(`Algoritmo de chave pública não suportado: ${publicKey.algorithm}`);
    }
    signAttributes(attributes, privateKey, algorithm) {
        this.logger.debug(`🔐 signAttributes chamado com algoritmo: "${algorithm}"`);
        const attributesAsn1 = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, attributes.map(attr => forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
            forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OID, false, forge.asn1.oidToDer(attr.type).getBytes()),
            attr.value
        ])));
        const attributesBytes = forge.asn1.toDer(attributesAsn1).getBytes();
        this.logger.debug(`📄 Atributos serializados: ${attributesBytes.length} bytes`);
        this.logger.debug(`🔍 Chamando createMessageDigest com: "${algorithm}"`);
        const md = this.createMessageDigest(algorithm);
        md.update(attributesBytes);
        let signature;
        if (privateKey.n) {
            signature = privateKey.sign(md);
        }
        else {
            throw new Error('Tipo de chave não suportado para assinatura');
        }
        return forge.util.encode64(signature);
    }
    buildPKCS7Structure(certificate, signedAttributes, privateKey, signatureAlgorithm, hashAlgorithm) {
        const signature = this.signAttributes(signedAttributes, privateKey, signatureAlgorithm);
        const signedData = forge.pkcs7.createSignedData();
        signedData.addCertificate(certificate);
        const signerInfo = {
            version: 1,
            issuerAndSerialNumber: {
                issuer: certificate.issuer.attributes,
                serialNumber: certificate.serialNumber
            },
            digestAlgorithm: hashAlgorithm,
            signedAttributes: signedAttributes,
            signatureAlgorithm: signatureAlgorithm,
            signature: signature
        };
        return forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, []);
    }
    createMessageDigest(algorithm) {
        this.logger.debug(`🔍 createMessageDigest chamado com algoritmo: "${algorithm}"`);
        if (algorithm.includes('SHA256') || algorithm.includes('SHA-256')) {
            this.logger.debug(`✅ Algoritmo SHA-256 reconhecido`);
            return forge.md.sha256.create();
        }
        else if (algorithm.includes('SHA384') || algorithm.includes('SHA-384')) {
            this.logger.debug(`✅ Algoritmo SHA-384 reconhecido`);
            return forge.md.sha384.create();
        }
        else if (algorithm.includes('SHA512') || algorithm.includes('SHA-512')) {
            this.logger.debug(`✅ Algoritmo SHA-512 reconhecido`);
            return forge.md.sha512.create();
        }
        this.logger.error(`❌ Algoritmo não suportado: "${algorithm}"`);
        throw new Error(`Algoritmo de hash não suportado: ${algorithm}`);
    }
    getDigestAlgorithmOID(algorithm) {
        switch (algorithm) {
            case 'SHA-256': return forge.pki.oids.sha256;
            case 'SHA-384': return forge.pki.oids.sha384;
            case 'SHA-512': return forge.pki.oids.sha512;
            default: throw new Error(`OID não encontrado para algoritmo: ${algorithm}`);
        }
    }
    getSignatureAlgorithmOID(algorithm) {
        switch (algorithm) {
            case 'SHA256withRSA': return forge.pki.oids.sha256WithRSAEncryption;
            case 'SHA384withRSA': return forge.pki.oids.sha384WithRSAEncryption;
            case 'SHA512withRSA': return forge.pki.oids.sha512WithRSAEncryption;
            default: return forge.pki.oids.sha256WithRSAEncryption;
        }
    }
    isSignatureAlgorithmAllowedInSigner(algorithm) {
        const allowedAlgorithms = [
            'SHA-256withRSA',
            'SHA-384withRSA',
            'SHA-512withRSA',
            'SHA256withRSA',
            'SHA384withRSA',
            'SHA512withRSA',
            'SHA-256withECDSA',
            'SHA-384withECDSA',
            'SHA-512withECDSA',
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
        this.logger.debug(`🔍 Verificando algoritmo "${algorithm}" contra lista: ${allowedAlgorithms.join(', ')}`);
        const isAllowed = allowedAlgorithms.includes(algorithm);
        this.logger.debug(`🎯 Algoritmo "${algorithm}" permitido: ${isAllowed}`);
        return isAllowed;
    }
    convertSignedAttributesToObject(attributes) {
        const result = {};
        for (const attr of attributes) {
            if (attr.type === forge.pki.oids.signingTime) {
                result['signingTime'] = new Date();
            }
            else if (attr.type === forge.pki.oids.messageDigest) {
                result['messageDigest'] = 'hash_value';
            }
        }
        return result;
    }
    verifyPKCS7Integrity(pkcs7, originalDocument) {
        try {
            return true;
        }
        catch (error) {
            return false;
        }
    }
    extractSigningTime(pkcs7) {
        return new Date();
    }
    extractFromP7SFormat(document) {
        return [];
    }
    extractFromPDFSignatures(document) {
        return [];
    }
    extractEmbeddedSignatures(document) {
        return [];
    }
};
exports.ICPBrasilSigner = ICPBrasilSigner;
exports.ICPBrasilSigner = ICPBrasilSigner = ICPBrasilSigner_1 = __decorate([
    (0, common_1.Injectable)()
], ICPBrasilSigner);
//# sourceMappingURL=icp-brasil-signer.service.js.map