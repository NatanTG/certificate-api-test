export interface ICertificateInfo {
    subject: string;
    issuer: string;
    serialNumber: string;
    validity: {
        notBefore: Date;
        notAfter: Date;
    };
    cpfCnpj?: string;
    keyUsage: string[];
    extendedKeyUsage: string[];
    policies: string[];
    publicKey: {
        algorithm: string;
        size: number;
    };
}
export interface ISignatureInfo {
    signatureId: string;
    documentId: string;
    certificateInfo: ICertificateInfo;
    signedAt: Date;
    signatureAlgorithm: string;
    hashAlgorithm: string;
    isValid: boolean;
    validationDetails: IValidationResult;
}
export interface IValidationResult {
    cryptographicIntegrity: boolean;
    certificateChain: boolean;
    revocationStatus: boolean;
    timeValidation: boolean;
    policyCompliance: boolean;
    errors: string[];
    warnings: string[];
    validatedAt: Date;
}
export interface IDocumentSigningRequest {
    documentId: string;
    certificate: Buffer;
    certificatePassword: string;
}
export interface IDocumentSigningResponse {
    signatureId: string;
    documentId: string;
    certificateInfo: ICertificateInfo;
    signedAt: Date;
    standard: string;
}
export interface ICertificateValidationResult {
    isValid: boolean;
    isICPBrasil: boolean;
    certificateInfo: ICertificateInfo;
    chainValidation: {
        isValid: boolean;
        trustedRoot: boolean;
        errors: string[];
    };
    revocationStatus: {
        isRevoked: boolean;
        checkedAt: Date;
        crlUrl?: string;
        errors: string[];
    };
    policyValidation: {
        isCompliant: boolean;
        policies: string[];
        errors: string[];
    };
    timeValidation: {
        isValid: boolean;
        currentTime: Date;
        errors: string[];
    };
}
export interface IPKCS7SignatureData {
    signatureData: string;
    signerCertificate: Buffer;
    timestampData?: string;
    signatureAlgorithm: string;
    hashAlgorithm: string;
    signedAttributes: any;
    unsignedAttributes?: any;
}
export interface IDocumentVerificationResult {
    documentId: string;
    documentHash: string;
    totalSignatures: number;
    signatures: Array<{
        signatureId: string;
        certificateInfo: ICertificateInfo;
        isValid: boolean;
        validationDetails: IValidationResult;
        signedAt: Date;
    }>;
    overallValid: boolean;
}
export interface IAuditLogEntry {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    success: boolean;
    errorMessage?: string;
}
export interface ICRLInfo {
    url: string;
    lastUpdate: Date;
    nextUpdate: Date;
    revokedCertificates: Array<{
        serialNumber: string;
        revocationDate: Date;
        reason?: string;
    }>;
}
export interface ISignatureValidationOptions {
    checkRevocation?: boolean;
    validateChain?: boolean;
    validatePolicy?: boolean;
    validateTime?: boolean;
    timeout?: number;
}
export interface IICPBrasilValidationConfig {
    crlUrls: Record<string, string>;
    cacheTimeout: number;
    validationTimeout: number;
    trustedRootCertificates: Buffer[];
    allowedPolicies: string[];
    requiredKeyUsages: string[];
}
export interface IDocumentUploadResult {
    documentId: string;
    filename: string;
    hash: string;
    uploadedAt: Date;
    size: number;
}
export interface IDetailedValidationResult {
    signatureId: string;
    validationResults: {
        cryptographicIntegrity: {
            isValid: boolean;
            algorithm: string;
            errors: string[];
        };
        certificateChain: {
            isValid: boolean;
            chainLength: number;
            trustedRoot: string;
            errors: string[];
        };
        revocationStatus: {
            isRevoked: boolean;
            checkedAt: Date;
            crlUrls: string[];
            errors: string[];
        };
        timeValidation: {
            isValid: boolean;
            signedAt: Date;
            validAt: Date;
            certificateValidityPeriod: {
                notBefore: Date;
                notAfter: Date;
            };
            errors: string[];
        };
        policyCompliance: {
            isCompliant: boolean;
            detectedPolicies: string[];
            requiredPolicies: string[];
            errors: string[];
        };
    };
    validatedAt: Date;
    validationLog: string[];
}
export interface IUserDocument {
    id: string;
    filename: string;
    uploadedAt: Date;
    signaturesCount: number;
    isFullySigned: boolean;
    lastSignedAt?: Date;
}
