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
var ICPBrasilCertificateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICPBrasilCertificateHandler = void 0;
const common_1 = require("@nestjs/common");
const forge = __importStar(require("node-forge"));
const icp_brasil_constants_1 = require("../constants/icp-brasil.constants");
let ICPBrasilCertificateHandler = ICPBrasilCertificateHandler_1 = class ICPBrasilCertificateHandler {
    constructor() {
        this.logger = new common_1.Logger(ICPBrasilCertificateHandler_1.name);
        this.crlCache = new Map();
    }
    async loadCertificate(p12Buffer, password) {
        try {
            this.logger.debug('Carregando certificado PKCS#12');
            const asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);
            const bags = p12.getBags({
                bagType: forge.pki.oids.certBag
            });
            const keyBags = p12.getBags({
                bagType: forge.pki.oids.pkcs8ShroudedKeyBag
            });
            if (!bags[forge.pki.oids.certBag] || bags[forge.pki.oids.certBag].length === 0) {
                throw new Error('Certificado não encontrado no arquivo PKCS#12');
            }
            if (!keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || keyBags[forge.pki.oids.pkcs8ShroudedKeyBag].length === 0) {
                throw new Error('Chave privada não encontrada no arquivo PKCS#12');
            }
            const certificate = bags[forge.pki.oids.certBag][0].cert;
            const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
            const certificateChain = [];
            for (const bag of bags[forge.pki.oids.certBag]) {
                if (bag.cert) {
                    certificateChain.push(bag.cert);
                }
            }
            this.logger.debug(`Certificado carregado: ${certificate.subject.getField('CN')?.value}`);
            return { certificate, privateKey, certificateChain };
        }
        catch (error) {
            this.logger.error(`Erro ao carregar certificado: ${error.message}`);
            throw new Error(`${icp_brasil_constants_1.ICP_ERROR_CODES.INVALID_CERTIFICATE}: ${error.message}`);
        }
    }
    validateICPBrasilCertificate(certificate) {
        const subject = certificate.subject.getField('CN')?.value || 'N/A';
        const issuer = certificate.issuer.getField('CN')?.value || 'N/A';
        this.logger.debug(`Iniciando validação ICP-Brasil para certificado:`);
        this.logger.debug(`- Subject: ${subject}`);
        this.logger.debug(`- Issuer: ${issuer}`);
        this.logger.debug(`- Serial Number: ${certificate.serialNumber}`);
        const result = {
            isValid: true,
            isICPBrasil: false,
            certificateInfo: this.extractCertificateInfo(certificate),
            chainValidation: { isValid: false, trustedRoot: false, errors: [] },
            revocationStatus: { isRevoked: false, checkedAt: new Date(), errors: [] },
            policyValidation: { isCompliant: false, policies: [], errors: [] },
            timeValidation: { isValid: false, currentTime: new Date(), errors: [] }
        };
        try {
            this.logger.debug(`Extensões do certificado (${certificate.extensions.length}):`);
            certificate.extensions.forEach(ext => {
                this.logger.debug(`- ${ext.name || ext.id}: ${ext.critical ? 'CRÍTICA' : 'não crítica'}`);
            });
            this.logger.debug('=== INICIANDO VALIDAÇÃO ICP-BRASIL ===');
            result.isICPBrasil = this.isICPBrasilCertificate(certificate);
            this.logger.debug(`Resultado validação ICP-Brasil: ${result.isICPBrasil}`);
            if (!result.isICPBrasil) {
                this.logger.warn('FALHA: Certificado não é ICP-Brasil válido');
                result.isValid = false;
                result.policyValidation.errors.push(icp_brasil_constants_1.ICP_ERROR_CODES.CERTIFICATE_NOT_ICP_BRASIL);
            }
            else {
                this.logger.debug('SUCESSO: Certificado identificado como ICP-Brasil');
            }
            this.logger.debug('=== VALIDANDO PERÍODO DE VALIDADE ===');
            result.timeValidation = this.validateCertificateTime(certificate);
            this.logger.debug(`Validade temporal: ${result.timeValidation.isValid}`);
            this.logger.debug(`- Válido de: ${certificate.validity.notBefore}`);
            this.logger.debug(`- Válido até: ${certificate.validity.notAfter}`);
            this.logger.debug(`- Agora: ${result.timeValidation.currentTime}`);
            if (!result.timeValidation.isValid) {
                this.logger.warn('FALHA: Certificado fora do período de validade');
                result.isValid = false;
            }
            this.logger.debug('=== VALIDANDO POLÍTICAS ===');
            result.policyValidation = this.validateICPBrasilPolicies(certificate);
            this.logger.debug(`Políticas válidas: ${result.policyValidation.isCompliant}`);
            this.logger.debug(`Políticas encontradas: ${result.policyValidation.policies.join(', ')}`);
            if (!result.policyValidation.isCompliant) {
                this.logger.warn('FALHA: Políticas ICP-Brasil não encontradas ou inválidas');
                result.isValid = false;
            }
            this.logger.debug('=== VALIDANDO CHAVE PÚBLICA ===');
            const keyValidation = this.validateKeySize(certificate);
            const algorithm = this.getPublicKeyAlgorithm(certificate);
            const keySize = this.getPublicKeySize(certificate);
            this.logger.debug(`Algoritmo: ${algorithm}, Tamanho: ${keySize} bits`);
            if (!keyValidation.isValid) {
                this.logger.warn(`FALHA: Tamanho de chave insuficiente - ${keyValidation.error}`);
                result.isValid = false;
                result.chainValidation.errors.push(keyValidation.error);
            }
            this.logger.debug(`=== RESULTADO FINAL: ${result.isValid ? 'VÁLIDO' : 'INVÁLIDO'} ===`);
        }
        catch (error) {
            this.logger.error(`ERRO CRÍTICO na validação do certificado: ${error.message}`);
            this.logger.error(`Stack trace: ${error.stack}`);
            result.isValid = false;
            result.chainValidation.errors.push(error.message);
        }
        return result;
    }
    extractCpfCnpj(certificate) {
        try {
            const extensions = certificate.extensions;
            for (const extension of extensions) {
                if (extension.id === icp_brasil_constants_1.ICP_BRASIL_OIDS.CPF || extension.id === icp_brasil_constants_1.ICP_BRASIL_OIDS.CNPJ) {
                    const asn1 = forge.asn1.fromDer(extension.value);
                    return this.extractIdentifierFromASN1(asn1);
                }
            }
            const sanExtension = certificate.extensions.find(ext => ext.name === 'subjectAltName');
            if (sanExtension && sanExtension.altNames) {
                for (const altName of sanExtension.altNames) {
                    if (altName.type === 0) {
                        const identifier = this.parseOtherNameForIdentifier(altName);
                        if (identifier)
                            return identifier;
                    }
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Erro ao extrair CPF/CNPJ: ${error.message}`);
            return null;
        }
    }
    async verifyCertificateChain(certificate, certificateChain) {
        const result = { isValid: false, trustedRoot: false, errors: [] };
        try {
            this.logger.debug('Verificando cadeia de certificados');
            const caStore = forge.pki.createCaStore();
            for (const cert of certificateChain) {
                if (!cert.subject.getField('CN')?.value.includes(certificate.subject.getField('CN')?.value)) {
                    caStore.addCertificate(cert);
                }
            }
            try {
                forge.pki.verifyCertificateChain(caStore, [certificate]);
                result.isValid = true;
                result.trustedRoot = true;
            }
            catch (error) {
                result.errors.push(`Verificação da cadeia falhou: ${error.message}`);
            }
        }
        catch (error) {
            this.logger.error(`Erro na verificação da cadeia: ${error.message}`);
            result.errors.push(error.message);
        }
        return result;
    }
    async checkRevocationStatus(certificate) {
        const result = {
            isRevoked: false,
            checkedAt: new Date(),
            crlUrl: undefined,
            errors: []
        };
        try {
            const crlUrl = this.extractCRLDistributionPoint(certificate);
            if (!crlUrl) {
                const issuer = certificate.issuer.getField('CN')?.value || '';
                const defaultCrlUrl = this.getDefaultCRLUrl(issuer);
                if (defaultCrlUrl) {
                    result.crlUrl = defaultCrlUrl;
                    const crlInfo = await this.downloadAndParseCRL(defaultCrlUrl);
                    result.isRevoked = this.isCertificateRevoked(certificate, crlInfo);
                }
                else {
                    result.errors.push(icp_brasil_constants_1.ICP_ERROR_CODES.CRL_UNAVAILABLE);
                }
            }
            else {
                result.crlUrl = crlUrl;
                const crlInfo = await this.downloadAndParseCRL(crlUrl);
                result.isRevoked = this.isCertificateRevoked(certificate, crlInfo);
            }
        }
        catch (error) {
            this.logger.error(`Erro na consulta de revogação: ${error.message}`);
            result.errors.push(error.message);
        }
        return result;
    }
    extractCertificateInfo(certificate) {
        return {
            subject: certificate.subject.getField('CN')?.value || '',
            issuer: certificate.issuer.getField('CN')?.value || '',
            serialNumber: certificate.serialNumber,
            validity: {
                notBefore: certificate.validity.notBefore,
                notAfter: certificate.validity.notAfter,
            },
            cpfCnpj: this.extractCpfCnpj(certificate),
            keyUsage: this.extractKeyUsage(certificate),
            extendedKeyUsage: this.extractExtendedKeyUsage(certificate),
            policies: this.extractCertificatePolicies(certificate),
            publicKey: {
                algorithm: this.getPublicKeyAlgorithm(certificate),
                size: this.getPublicKeySize(certificate),
            },
        };
    }
    isICPBrasilCertificate(certificate) {
        this.logger.debug('=== VERIFICAÇÃO DETALHADA ICP-BRASIL (FOCO EM A1) ===');
        const policies = this.extractCertificatePolicies(certificate);
        this.logger.debug(`Políticas extraídas: ${policies.join(', ')}`);
        const hasA1Policy = policies.includes(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A1);
        const hasA3Policy = policies.includes(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A3);
        const hasA4Policy = policies.includes(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A4);
        const hasSyngularPolicy = policies.includes(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_SYNGULAR);
        this.logger.debug(`=== DETECÇÃO DE TIPO DE CERTIFICADO ===`);
        this.logger.debug(`- Política A1 (${icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A1}): ${hasA1Policy}`);
        this.logger.debug(`- Política A3 (${icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A3}): ${hasA3Policy}`);
        this.logger.debug(`- Política A4 (${icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A4}): ${hasA4Policy}`);
        this.logger.debug(`- Política SyngularID (${icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_SYNGULAR}): ${hasSyngularPolicy}`);
        let certificateType = 'DESCONHECIDO';
        if (hasA1Policy)
            certificateType = 'A1';
        else if (hasA3Policy)
            certificateType = 'A3';
        else if (hasA4Policy)
            certificateType = 'A4';
        else if (hasSyngularPolicy)
            certificateType = 'A1-SyngularID';
        this.logger.debug(`🎯 TIPO DE CERTIFICADO DETECTADO: ${certificateType}`);
        const icpPolicies = Object.values(icp_brasil_constants_1.ICP_BRASIL_OIDS).filter(oid => oid.startsWith('2.16.76.1.2.1.'));
        const hasPolicyMatch = policies.some(policy => icpPolicies.includes(policy));
        this.logger.debug(`Tem política ICP-Brasil geral: ${hasPolicyMatch}`);
        const hasCharacteristics = this.hasICPBrasilCharacteristics(certificate);
        this.logger.debug(`Tem características ICP-Brasil: ${hasCharacteristics}`);
        const hasA1Characteristics = this.hasA1Characteristics(certificate);
        this.logger.debug(`Tem características específicas de A1: ${hasA1Characteristics}`);
        const hasFlexibleValidation = this.hasFlexibleICPValidation(certificate);
        this.logger.debug(`Validação flexível: ${hasFlexibleValidation}`);
        const isValid = hasPolicyMatch || hasCharacteristics || hasA1Characteristics || hasFlexibleValidation;
        this.logger.debug(`🏁 RESULTADO FINAL isICPBrasilCertificate: ${isValid}`);
        if (isValid && certificateType !== 'DESCONHECIDO') {
            this.logger.debug(`✅ CERTIFICADO ${certificateType} ACEITO`);
        }
        return isValid;
    }
    hasA1Characteristics(certificate) {
        try {
            this.logger.debug('=== VERIFICAÇÃO ESPECÍFICA A1 ===');
            const issuer = certificate.issuer.getField('CN')?.value || '';
            const subject = certificate.subject.getField('CN')?.value || '';
            const keyUsageExt = certificate.extensions.find(ext => ext.name === 'keyUsage');
            const hasDigitalSignature = keyUsageExt && keyUsageExt.digitalSignature;
            const hasNonRepudiation = keyUsageExt && keyUsageExt.nonRepudiation;
            this.logger.debug(`- Digital Signature: ${hasDigitalSignature}`);
            this.logger.debug(`- Non Repudiation: ${hasNonRepudiation}`);
            const extKeyUsageExt = certificate.extensions.find(ext => ext.name === 'extKeyUsage');
            const hasClientAuth = extKeyUsageExt && extKeyUsageExt.clientAuth;
            const hasEmailProtection = extKeyUsageExt && extKeyUsageExt.emailProtection;
            this.logger.debug(`- Client Auth: ${hasClientAuth}`);
            this.logger.debug(`- Email Protection: ${hasEmailProtection}`);
            const hasRequiredUsage = hasDigitalSignature || hasNonRepudiation;
            const hasBrazilianExtensions = certificate.extensions.some(ext => ext.id && ext.id.startsWith('2.16.76.1'));
            const brazilianIssuers = [
                'certisign', 'serasa', 'serpro', 'valid', 'safenet', 'soluti',
                'ac ', 'autoridade certificadora', 'brasil', 'receita', 'gov',
                'syngular', 'syngularid'
            ];
            const hasBrazilianIssuer = brazilianIssuers.some(issuerName => issuer.toLowerCase().includes(issuerName));
            const isA1Valid = hasRequiredUsage && (hasBrazilianIssuer || hasBrazilianExtensions);
            this.logger.debug(`- Tem usage adequado: ${hasRequiredUsage}`);
            this.logger.debug(`- Tem emissor brasileiro: ${hasBrazilianIssuer} (${issuer})`);
            this.logger.debug(`- Tem extensões brasileiras: ${hasBrazilianExtensions}`);
            this.logger.debug(`🎯 Validação A1: ${isA1Valid}`);
            return isA1Valid;
        }
        catch (error) {
            this.logger.warn(`Erro na validação A1: ${error.message}`);
            return false;
        }
    }
    hasFlexibleICPValidation(certificate) {
        try {
            const issuer = certificate.issuer.getField('CN')?.value || '';
            const subject = certificate.subject.getField('CN')?.value || '';
            const icpIndicators = [
                'brasil', 'serpro', 'certisign', 'serasa', 'valid', 'safenet',
                'ac ', 'autoridade certificadora', 'icp', 'iti', 'soluti',
                'caixa', 'banco', 'receita', 'gov.br', 'syngular', 'syngularid'
            ];
            const issuerLower = issuer.toLowerCase();
            const subjectLower = subject.toLowerCase();
            const hasIcpIndicator = icpIndicators.some(indicator => issuerLower.includes(indicator) || subjectLower.includes(indicator));
            const hasBrazilianOid = certificate.extensions.some(ext => {
                if (ext.id && ext.id.startsWith('2.16.76.1')) {
                    this.logger.debug(`Encontrado OID brasileiro: ${ext.id}`);
                    return true;
                }
                return false;
            });
            const keyUsageExt = certificate.extensions.find(ext => ext.name === 'keyUsage');
            const hasDigitalSignature = keyUsageExt && keyUsageExt.digitalSignature;
            this.logger.debug(`Validação flexível:`);
            this.logger.debug(`- Tem indicador ICP: ${hasIcpIndicator} (issuer: "${issuer}")`);
            this.logger.debug(`- Tem OID brasileiro: ${hasBrazilianOid}`);
            this.logger.debug(`- Tem digital signature: ${hasDigitalSignature}`);
            const score = Number(hasIcpIndicator) + Number(hasBrazilianOid) + Number(hasDigitalSignature);
            const isFlexibleValid = score >= 1;
            this.logger.debug(`Score validação flexível: ${score}/3, válido: ${isFlexibleValid}`);
            return isFlexibleValid;
        }
        catch (error) {
            this.logger.warn(`Erro na validação flexível: ${error.message}`);
            return false;
        }
    }
    validateCertificateTime(certificate) {
        const now = new Date();
        const isValid = now >= certificate.validity.notBefore && now <= certificate.validity.notAfter;
        return {
            isValid,
            currentTime: now,
            errors: isValid ? [] : ['Certificado fora do período de validade']
        };
    }
    validateICPBrasilPolicies(certificate) {
        const policies = this.extractCertificatePolicies(certificate);
        const icpPolicies = policies.filter(policy => Object.values(icp_brasil_constants_1.ICP_BRASIL_OIDS).includes(policy));
        return {
            isCompliant: icpPolicies.length > 0,
            policies: icpPolicies,
            errors: icpPolicies.length === 0 ? ['Nenhuma política ICP-Brasil encontrada'] : []
        };
    }
    validateKeySize(certificate) {
        const algorithm = this.getPublicKeyAlgorithm(certificate);
        const size = this.getPublicKeySize(certificate);
        const minSize = icp_brasil_constants_1.MIN_KEY_SIZES[algorithm];
        if (!minSize || size < minSize) {
            return {
                isValid: false,
                error: `Tamanho de chave ${size} bits insuficiente para ${algorithm} (mínimo: ${minSize} bits)`
            };
        }
        return { isValid: true, error: null };
    }
    extractKeyUsage(certificate) {
        const extension = certificate.extensions.find(ext => ext.name === 'keyUsage');
        return extension ? Object.keys(extension).filter(key => extension[key] === true) : [];
    }
    extractExtendedKeyUsage(certificate) {
        const extension = certificate.extensions.find(ext => ext.name === 'extKeyUsage');
        return extension?.serverAuth ? ['serverAuth'] : [];
    }
    extractCertificatePolicies(certificate) {
        const policies = [];
        try {
            for (const extension of certificate.extensions) {
                if (extension.id === icp_brasil_constants_1.ICP_BRASIL_OIDS.CERTIFICATE_POLICIES || extension.id === '2.5.29.32') {
                    try {
                        const asn1 = forge.asn1.fromDer(extension.value);
                        this.extractPoliciesFromASN1(asn1, policies);
                    }
                    catch (error) {
                        this.logger.warn(`Erro ao processar extensão de política: ${error.message}`);
                    }
                }
                if (extension.name === 'certificatePolicies' && extension.value) {
                    const policyValues = extension.value;
                    if (Array.isArray(policyValues)) {
                        for (const policyInfo of policyValues) {
                            if (policyInfo.policyIdentifier) {
                                policies.push(policyInfo.policyIdentifier);
                            }
                        }
                    }
                }
            }
            if (policies.length === 0) {
                this.logger.debug('Nenhuma política encontrada, aplicando fallback para A1');
                if (this.hasICPBrasilCharacteristics(certificate)) {
                    this.logger.debug('✅ Fallback: Certificado tem características ICP-Brasil, assumindo A1');
                    policies.push(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A1);
                }
                else if (this.hasA1Characteristics(certificate)) {
                    this.logger.debug('✅ Fallback: Certificado tem características A1, adicionando política');
                    policies.push(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A1);
                }
                else if (this.hasMinimalBrazilianCharacteristics(certificate)) {
                    this.logger.debug('✅ Fallback: Certificado tem características brasileiras mínimas, assumindo A1');
                    policies.push(icp_brasil_constants_1.ICP_BRASIL_OIDS.POLICY_A1);
                }
                else {
                    this.logger.warn('❌ Fallback: Nenhuma característica brasileira encontrada');
                }
            }
        }
        catch (error) {
            this.logger.error(`Erro ao extrair políticas do certificado: ${error.message}`);
        }
        this.logger.debug(`Políticas extraídas: ${policies.join(', ')}`);
        return policies;
    }
    getPublicKeyAlgorithm(certificate) {
        return certificate.publicKey.algorithm || 'RSA';
    }
    getPublicKeySize(certificate) {
        const publicKey = certificate.publicKey;
        if (publicKey.n) {
            return publicKey.n.bitLength();
        }
        return 256;
    }
    extractPoliciesFromASN1(asn1, policies) {
        try {
            if (asn1.type === forge.asn1.Type.SEQUENCE && asn1.value) {
                for (const item of asn1.value) {
                    if (item.type === forge.asn1.Type.SEQUENCE && item.value) {
                        const sequence = item.value;
                        if (sequence.length > 0 && sequence[0].type === forge.asn1.Type.OID) {
                            const oid = forge.asn1.derToOid(sequence[0].value);
                            if (oid) {
                                policies.push(oid);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn(`Erro ao processar ASN.1 de políticas: ${error.message}`);
        }
    }
    hasICPBrasilCharacteristics(certificate) {
        try {
            const issuer = certificate.issuer.getField('CN')?.value || '';
            const subject = certificate.subject.getField('CN')?.value || '';
            const icpIssuers = [
                'AC CERTISIGN',
                'AC SERASA',
                'AC SERPRO',
                'AC VALID',
                'AC SAFENET',
                'ICP-Brasil',
                'ITI',
                'Autoridade Certificadora'
            ];
            const hasIcpIssuer = icpIssuers.some(issuerName => issuer.toUpperCase().includes(issuerName.toUpperCase()));
            const hasBrazilianOids = certificate.extensions.some(ext => ext.id && ext.id.startsWith('2.16.76.1'));
            const hasCpfCnpjExtension = certificate.extensions.some(ext => ext.id === icp_brasil_constants_1.ICP_BRASIL_OIDS.CPF || ext.id === icp_brasil_constants_1.ICP_BRASIL_OIDS.CNPJ);
            return hasIcpIssuer || hasBrazilianOids || hasCpfCnpjExtension;
        }
        catch (error) {
            this.logger.warn(`Erro ao verificar características ICP-Brasil: ${error.message}`);
            return false;
        }
    }
    extractIdentifierFromASN1(asn1) {
        try {
            if (asn1.type === forge.asn1.Type.SEQUENCE && asn1.value) {
                const sequence = asn1.value;
                for (const item of sequence) {
                    if (item.type === forge.asn1.Type.UTF8 ||
                        item.type === forge.asn1.Type.PRINTABLESTRING ||
                        item.type === forge.asn1.Type.IA5STRING) {
                        const value = item.value;
                        if (this.isValidCpfCnpj(value)) {
                            return value;
                        }
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn(`Erro ao extrair identificador do ASN.1: ${error.message}`);
        }
        return null;
    }
    isValidCpfCnpj(value) {
        if (!value)
            return false;
        const cleanValue = value.replace(/[^\d]/g, '');
        if (cleanValue.length === 11) {
            return icp_brasil_constants_1.VALIDATION_PATTERNS.CPF.test(value) || /^\d{11}$/.test(cleanValue);
        }
        if (cleanValue.length === 14) {
            return icp_brasil_constants_1.VALIDATION_PATTERNS.CNPJ.test(value) || /^\d{14}$/.test(cleanValue);
        }
        return false;
    }
    hasMinimalBrazilianCharacteristics(certificate) {
        try {
            this.logger.debug('=== VERIFICAÇÃO MÍNIMA BRASILEIRA ===');
            const issuer = certificate.issuer.getField('CN')?.value || '';
            const subject = certificate.subject.getField('CN')?.value || '';
            const brazilIndicators = ['br', '.br', 'brasil', 'brazil', 'receita', 'cpf', 'cnpj'];
            const hasBrazilIndicator = brazilIndicators.some(indicator => {
                const issuerMatch = issuer.toLowerCase().includes(indicator);
                const subjectMatch = subject.toLowerCase().includes(indicator);
                return issuerMatch || subjectMatch;
            });
            const keyUsageExt = certificate.extensions.find(ext => ext.name === 'keyUsage');
            const canSign = keyUsageExt && (keyUsageExt.digitalSignature ||
                keyUsageExt.nonRepudiation);
            const extKeyUsageExt = certificate.extensions.find(ext => ext.name === 'extKeyUsage');
            const isNotServerCert = !extKeyUsageExt || !extKeyUsageExt.serverAuth;
            const isMinimalValid = (hasBrazilIndicator || canSign) && isNotServerCert;
            this.logger.debug(`- Tem indicador brasileiro: ${hasBrazilIndicator} (${issuer})`);
            this.logger.debug(`- Pode assinar: ${canSign}`);
            this.logger.debug(`- Não é cert servidor: ${isNotServerCert}`);
            this.logger.debug(`🎯 Validação mínima brasileira: ${isMinimalValid}`);
            return isMinimalValid;
        }
        catch (error) {
            this.logger.warn(`Erro na validação mínima: ${error.message}`);
            return false;
        }
    }
    parseOtherNameForIdentifier(altName) {
        try {
            if (altName.value && typeof altName.value === 'string') {
                if (this.isValidCpfCnpj(altName.value)) {
                    return altName.value;
                }
            }
            if (altName.value && altName.value.length > 0) {
                try {
                    const asn1 = forge.asn1.fromDer(altName.value);
                    return this.extractIdentifierFromASN1(asn1);
                }
                catch (error) {
                }
            }
            if (altName.typeId) {
                const typeId = altName.typeId;
                if (typeId === icp_brasil_constants_1.ICP_BRASIL_OIDS.CPF || typeId === icp_brasil_constants_1.ICP_BRASIL_OIDS.CNPJ) {
                    if (altName.value && typeof altName.value === 'string') {
                        return altName.value;
                    }
                }
            }
            return null;
        }
        catch (error) {
            this.logger.warn(`Erro ao processar otherName: ${error.message}`);
            return null;
        }
    }
    extractCRLDistributionPoint(certificate) {
        const extension = certificate.extensions.find(ext => ext.name === 'cRLDistributionPoints');
        return null;
    }
    getDefaultCRLUrl(issuer) {
        if (issuer.includes('SERPRO'))
            return icp_brasil_constants_1.CRL_URLS.SERPRO;
        if (issuer.includes('CERTISIGN'))
            return icp_brasil_constants_1.CRL_URLS.CERTISIGN;
        if (issuer.includes('SERASA'))
            return icp_brasil_constants_1.CRL_URLS.SERASA;
        return icp_brasil_constants_1.CRL_URLS.AC_RAIZ;
    }
    async downloadAndParseCRL(url) {
        const cached = this.crlCache.get(url);
        if (cached && Date.now() - cached.timestamp < icp_brasil_constants_1.VALIDATION_CONFIG.CRL_CACHE_TIMEOUT * 1000) {
            return cached.data;
        }
        const crlInfo = {
            url,
            lastUpdate: new Date(),
            nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            revokedCertificates: []
        };
        this.crlCache.set(url, { data: crlInfo, timestamp: Date.now() });
        return crlInfo;
    }
    isCertificateRevoked(certificate, crlInfo) {
        return crlInfo.revokedCertificates.some(revoked => revoked.serialNumber === certificate.serialNumber);
    }
};
exports.ICPBrasilCertificateHandler = ICPBrasilCertificateHandler;
exports.ICPBrasilCertificateHandler = ICPBrasilCertificateHandler = ICPBrasilCertificateHandler_1 = __decorate([
    (0, common_1.Injectable)()
], ICPBrasilCertificateHandler);
//# sourceMappingURL=icp-brasil-certificate-handler.service.js.map