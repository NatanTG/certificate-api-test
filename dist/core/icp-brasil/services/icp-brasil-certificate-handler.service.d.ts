import * as forge from 'node-forge';
import { ICertificateValidationResult } from '../interfaces/icp-brasil.interfaces';
export declare class ICPBrasilCertificateHandler {
    private readonly logger;
    private crlCache;
    loadCertificate(p12Buffer: Buffer, password: string): Promise<{
        certificate: forge.pki.Certificate;
        privateKey: forge.pki.PrivateKey;
        certificateChain: forge.pki.Certificate[];
    }>;
    validateICPBrasilCertificate(certificate: forge.pki.Certificate): ICertificateValidationResult;
    extractCpfCnpj(certificate: forge.pki.Certificate): string | null;
    verifyCertificateChain(certificate: forge.pki.Certificate, certificateChain: forge.pki.Certificate[]): Promise<{
        isValid: boolean;
        trustedRoot: boolean;
        errors: string[];
    }>;
    checkRevocationStatus(certificate: forge.pki.Certificate): Promise<{
        isRevoked: boolean;
        checkedAt: Date;
        crlUrl?: string;
        errors: string[];
    }>;
    private extractCertificateInfo;
    private isICPBrasilCertificate;
    private hasA1Characteristics;
    private hasFlexibleICPValidation;
    private validateCertificateTime;
    private validateICPBrasilPolicies;
    private validateKeySize;
    private extractKeyUsage;
    private extractExtendedKeyUsage;
    private extractCertificatePolicies;
    private getPublicKeyAlgorithm;
    private getPublicKeySize;
    private extractPoliciesFromASN1;
    private hasICPBrasilCharacteristics;
    private extractIdentifierFromASN1;
    private isValidCpfCnpj;
    private hasMinimalBrazilianCharacteristics;
    private parseOtherNameForIdentifier;
    private extractCRLDistributionPoint;
    private getDefaultCRLUrl;
    private downloadAndParseCRL;
    private isCertificateRevoked;
}
