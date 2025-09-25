import * as forge from 'node-forge';
import { IValidationResult, IDetailedValidationResult, ISignatureValidationOptions, IPKCS7SignatureData } from '../interfaces/icp-brasil.interfaces';
import { ICPBrasilCertificateHandler } from './icp-brasil-certificate-handler.service';
import { ICPBrasilSigner } from './icp-brasil-signer.service';
export declare class ICPBrasilValidator {
    private readonly certificateHandler;
    private readonly signer;
    private readonly logger;
    constructor(certificateHandler: ICPBrasilCertificateHandler, signer: ICPBrasilSigner);
    fullValidation(signature: IPKCS7SignatureData, originalDocument: Buffer, options?: ISignatureValidationOptions): Promise<IValidationResult>;
    validateCryptographicIntegrity(signature: IPKCS7SignatureData, document: Buffer): {
        isValid: boolean;
        algorithm: string;
        errors: string[];
    };
    validateICPBrasilPolicies(certificate: forge.pki.Certificate): {
        isCompliant: boolean;
        detectedPolicies: string[];
        requiredPolicies: string[];
        errors: string[];
    };
    generateValidationReport(validationResults: IValidationResult, signatureId: string): IDetailedValidationResult;
    validateMultipleSignatures(signatures: IPKCS7SignatureData[], originalDocument: Buffer): Promise<Array<{
        signature: IPKCS7SignatureData;
        result: IValidationResult;
    }>>;
    private performValidation;
    private validateCertificateChain;
    private validateRevocationStatus;
    private validateTimeConstraints;
    private validatePolicyCompliance;
    private isSignatureAlgorithmAllowed;
    private isHashAlgorithmAllowed;
    private validateSpecificPolicies;
}
