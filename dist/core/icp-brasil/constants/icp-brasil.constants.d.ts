export declare const ICP_BRASIL_OIDS: {
    readonly CPF: "2.16.76.1.3.1";
    readonly CNPJ: "2.16.76.1.3.2";
    readonly POLICY_A1: "2.16.76.1.2.1.1";
    readonly POLICY_A3: "2.16.76.1.2.1.3";
    readonly POLICY_A4: "2.16.76.1.2.1.4";
    readonly POLICY_SYNGULAR: "2.16.76.1.2.1.133";
    readonly KEY_USAGE: "2.5.29.15";
    readonly EXTENDED_KEY_USAGE: "2.5.29.37";
    readonly CERTIFICATE_POLICIES: "2.5.29.32";
    readonly PESSOA_FISICA: "2.16.76.1.3.1";
    readonly PESSOA_JURIDICA: "2.16.76.1.3.2";
    readonly EQUIPAMENTO: "2.16.76.1.3.3";
    readonly APLICACAO: "2.16.76.1.3.4";
};
export declare const CRL_URLS: {
    readonly AC_RAIZ: "http://acraiz.icpbrasil.gov.br/LCRacraiz.crl";
    readonly SERPRO: "http://repositorio.serpro.gov.br/lcr/acserpro/acserpro.crl";
    readonly CERTISIGN: "http://crl.certisign.com.br/certisignac.crl";
    readonly SERASA: "http://crl.serasa.com.br/serasacd.crl";
    readonly VALID: "http://ccd.valid.com.br/lcr/ac-valid-brasil-v5.crl";
    readonly SAFENET: "http://crl.safenet-inc.com/brazilian-ac-safenet.crl";
};
export declare const ICP_ERROR_CODES: {
    readonly INVALID_CERTIFICATE: "CERT_001";
    readonly CERTIFICATE_EXPIRED: "CERT_002";
    readonly CERTIFICATE_REVOKED: "CERT_003";
    readonly INVALID_CHAIN: "CERT_004";
    readonly INVALID_POLICY: "CERT_005";
    readonly CRL_UNAVAILABLE: "CERT_006";
    readonly CERTIFICATE_NOT_ICP_BRASIL: "CERT_007";
    readonly INVALID_CPF_CNPJ: "CERT_008";
    readonly SIGNATURE_INVALID: "SIGN_001";
    readonly DOCUMENT_TAMPERED: "SIGN_002";
    readonly HASH_MISMATCH: "SIGN_003";
    readonly INVALID_SIGNATURE_FORMAT: "SIGN_004";
    readonly SIGNATURE_ALGORITHM_NOT_ALLOWED: "SIGN_005";
    readonly VALIDATION_TIMEOUT: "VALID_001";
    readonly VALIDATION_FAILED: "VALID_002";
    readonly POLICY_VALIDATION_FAILED: "VALID_003";
    readonly FILE_TOO_LARGE: "SYS_001";
    readonly UNSUPPORTED_FORMAT: "SYS_002";
    readonly INTERNAL_ERROR: "SYS_003";
};
export declare const ALLOWED_SIGNATURE_ALGORITHMS: readonly ["SHA256withRSA", "SHA384withRSA", "SHA512withRSA", "SHA256withECDSA", "SHA384withECDSA", "SHA512withECDSA", "SHA-256withRSA", "SHA-384withRSA", "SHA-512withRSA", "SHA-256withECDSA", "SHA-384withECDSA", "SHA-512withECDSA", "sha256WithRSAEncryption", "sha384WithRSAEncryption", "sha512WithRSAEncryption", "sha256WithECDSAEncryption", "sha384WithECDSAEncryption", "sha512WithECDSAEncryption"];
export declare const ALLOWED_HASH_ALGORITHMS: readonly ["SHA-256", "SHA-384", "SHA-512"];
export declare const MIN_KEY_SIZES: {
    readonly RSA: 2048;
    readonly ECDSA: 256;
};
export declare const SUPPORTED_CERTIFICATE_FORMATS: readonly [".p12", ".pfx"];
export declare const SUPPORTED_DOCUMENT_FORMATS: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/xml", "text/xml"];
export declare const VALIDATION_CONFIG: {
    readonly CRL_CACHE_TIMEOUT: 3600;
    readonly CERTIFICATE_VALIDATION_TIMEOUT: 30000;
    readonly MAX_FILE_SIZE: 52428800;
    readonly MAX_SIGNATURES_PER_DOCUMENT: 100;
    readonly AUDIT_RETENTION_DAYS: 2555;
};
export declare const VALIDATION_PATTERNS: {
    readonly CPF: RegExp;
    readonly CNPJ: RegExp;
    readonly EMAIL: RegExp;
};
export declare const VALIDATION_STATUS: {
    readonly PENDING: "PENDING";
    readonly VALID: "VALID";
    readonly INVALID: "INVALID";
    readonly REVOKED: "REVOKED";
};
export declare const AUDIT_LOG_TYPES: {
    readonly DOCUMENT_UPLOAD: "DOCUMENT_UPLOAD";
    readonly SIGNATURE_ATTEMPT: "SIGNATURE_ATTEMPT";
    readonly SIGNATURE_SUCCESS: "SIGNATURE_SUCCESS";
    readonly SIGNATURE_FAILURE: "SIGNATURE_FAILURE";
    readonly CERTIFICATE_VALIDATION: "CERTIFICATE_VALIDATION";
    readonly CRL_CONSULTATION: "CRL_CONSULTATION";
    readonly SIGNATURE_VERIFICATION: "SIGNATURE_VERIFICATION";
    readonly DOCUMENT_DOWNLOAD: "DOCUMENT_DOWNLOAD";
    readonly USER_LOGIN: "USER_LOGIN";
    readonly USER_LOGOUT: "USER_LOGOUT";
};
