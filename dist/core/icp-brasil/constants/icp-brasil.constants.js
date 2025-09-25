"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_LOG_TYPES = exports.VALIDATION_STATUS = exports.VALIDATION_PATTERNS = exports.VALIDATION_CONFIG = exports.SUPPORTED_DOCUMENT_FORMATS = exports.SUPPORTED_CERTIFICATE_FORMATS = exports.MIN_KEY_SIZES = exports.ALLOWED_HASH_ALGORITHMS = exports.ALLOWED_SIGNATURE_ALGORITHMS = exports.ICP_ERROR_CODES = exports.CRL_URLS = exports.ICP_BRASIL_OIDS = void 0;
exports.ICP_BRASIL_OIDS = {
    CPF: '2.16.76.1.3.1',
    CNPJ: '2.16.76.1.3.2',
    POLICY_A1: '2.16.76.1.2.1.1',
    POLICY_A3: '2.16.76.1.2.1.3',
    POLICY_A4: '2.16.76.1.2.1.4',
    POLICY_SYNGULAR: '2.16.76.1.2.1.133',
    KEY_USAGE: '2.5.29.15',
    EXTENDED_KEY_USAGE: '2.5.29.37',
    CERTIFICATE_POLICIES: '2.5.29.32',
    PESSOA_FISICA: '2.16.76.1.3.1',
    PESSOA_JURIDICA: '2.16.76.1.3.2',
    EQUIPAMENTO: '2.16.76.1.3.3',
    APLICACAO: '2.16.76.1.3.4',
};
exports.CRL_URLS = {
    AC_RAIZ: 'http://acraiz.icpbrasil.gov.br/LCRacraiz.crl',
    SERPRO: 'http://repositorio.serpro.gov.br/lcr/acserpro/acserpro.crl',
    CERTISIGN: 'http://crl.certisign.com.br/certisignac.crl',
    SERASA: 'http://crl.serasa.com.br/serasacd.crl',
    VALID: 'http://ccd.valid.com.br/lcr/ac-valid-brasil-v5.crl',
    SAFENET: 'http://crl.safenet-inc.com/brazilian-ac-safenet.crl',
};
exports.ICP_ERROR_CODES = {
    INVALID_CERTIFICATE: 'CERT_001',
    CERTIFICATE_EXPIRED: 'CERT_002',
    CERTIFICATE_REVOKED: 'CERT_003',
    INVALID_CHAIN: 'CERT_004',
    INVALID_POLICY: 'CERT_005',
    CRL_UNAVAILABLE: 'CERT_006',
    CERTIFICATE_NOT_ICP_BRASIL: 'CERT_007',
    INVALID_CPF_CNPJ: 'CERT_008',
    SIGNATURE_INVALID: 'SIGN_001',
    DOCUMENT_TAMPERED: 'SIGN_002',
    HASH_MISMATCH: 'SIGN_003',
    INVALID_SIGNATURE_FORMAT: 'SIGN_004',
    SIGNATURE_ALGORITHM_NOT_ALLOWED: 'SIGN_005',
    VALIDATION_TIMEOUT: 'VALID_001',
    VALIDATION_FAILED: 'VALID_002',
    POLICY_VALIDATION_FAILED: 'VALID_003',
    FILE_TOO_LARGE: 'SYS_001',
    UNSUPPORTED_FORMAT: 'SYS_002',
    INTERNAL_ERROR: 'SYS_003',
};
exports.ALLOWED_SIGNATURE_ALGORITHMS = [
    'SHA256withRSA',
    'SHA384withRSA',
    'SHA512withRSA',
    'SHA256withECDSA',
    'SHA384withECDSA',
    'SHA512withECDSA',
    'SHA-256withRSA',
    'SHA-384withRSA',
    'SHA-512withRSA',
    'SHA-256withECDSA',
    'SHA-384withECDSA',
    'SHA-512withECDSA',
    'sha256WithRSAEncryption',
    'sha384WithRSAEncryption',
    'sha512WithRSAEncryption',
    'sha256WithECDSAEncryption',
    'sha384WithECDSAEncryption',
    'sha512WithECDSAEncryption'
];
exports.ALLOWED_HASH_ALGORITHMS = [
    'SHA-256',
    'SHA-384',
    'SHA-512',
];
exports.MIN_KEY_SIZES = {
    RSA: 2048,
    ECDSA: 256,
};
exports.SUPPORTED_CERTIFICATE_FORMATS = [
    '.p12',
    '.pfx',
];
exports.SUPPORTED_DOCUMENT_FORMATS = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/xml',
    'text/xml',
];
exports.VALIDATION_CONFIG = {
    CRL_CACHE_TIMEOUT: 3600,
    CERTIFICATE_VALIDATION_TIMEOUT: 30000,
    MAX_FILE_SIZE: 52428800,
    MAX_SIGNATURES_PER_DOCUMENT: 100,
    AUDIT_RETENTION_DAYS: 2555,
};
exports.VALIDATION_PATTERNS = {
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
exports.VALIDATION_STATUS = {
    PENDING: 'PENDING',
    VALID: 'VALID',
    INVALID: 'INVALID',
    REVOKED: 'REVOKED',
};
exports.AUDIT_LOG_TYPES = {
    DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
    SIGNATURE_ATTEMPT: 'SIGNATURE_ATTEMPT',
    SIGNATURE_SUCCESS: 'SIGNATURE_SUCCESS',
    SIGNATURE_FAILURE: 'SIGNATURE_FAILURE',
    CERTIFICATE_VALIDATION: 'CERTIFICATE_VALIDATION',
    CRL_CONSULTATION: 'CRL_CONSULTATION',
    SIGNATURE_VERIFICATION: 'SIGNATURE_VERIFICATION',
    DOCUMENT_DOWNLOAD: 'DOCUMENT_DOWNLOAD',
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
};
//# sourceMappingURL=icp-brasil.constants.js.map