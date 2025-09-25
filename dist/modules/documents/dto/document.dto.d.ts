export declare class DocumentUploadResponseDto {
    documentId: string;
    filename: string;
    hash: string;
    uploadedAt: Date;
    size: number;
}
export declare class DocumentVerificationResponseDto {
    documentId: string;
    documentHash: string;
    totalSignatures: number;
    signatures: Array<{
        signatureId: string;
        certificateInfo: {
            subject: string;
            issuer: string;
            serialNumber: string;
            validity: {
                notBefore: Date;
                notAfter: Date;
            };
            cpfCnpj?: string;
        };
        isValid: boolean;
        validationDetails: {
            chainValid: boolean;
            notRevoked: boolean;
            timeValid: boolean;
            policyValid: boolean;
        };
        signedAt: Date;
    }>;
}
export declare class UserDocumentsResponseDto {
    documents: Array<{
        id: string;
        filename: string;
        uploadedAt: Date;
        signaturesCount: number;
        isFullySigned: boolean;
        lastSignedAt?: Date;
    }>;
}
export declare class SignDocumentDto {
    certificatePassword: string;
    hashAlgorithm?: string;
}
export declare class DocumentSigningResponseDto {
    signatureId: string;
    documentId: string;
    certificateInfo: {
        subject: string;
        issuer: string;
        serialNumber: string;
        validity: {
            notBefore: Date;
            notAfter: Date;
        };
        cpfCnpj?: string;
    };
    signedAt: Date;
    standard: string;
}
