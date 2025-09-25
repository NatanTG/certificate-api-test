import * as forge from 'node-forge';
import { IPKCS7SignatureData } from '../interfaces/icp-brasil.interfaces';
export declare class ICPBrasilSignerSimple {
    private readonly logger;
    signDocument(documentBuffer: Buffer, certificate: forge.pki.Certificate, privateKey: forge.pki.PrivateKey, hashAlgorithm?: string): Promise<IPKCS7SignatureData>;
    verifySignature(signatureData: string, originalDocument: Buffer): Promise<{
        isValid: boolean;
        signerCertificate: forge.pki.Certificate | null;
        signedAt: Date;
        errors: string[];
    }>;
    extractSignatures(signedDocument: Buffer): IPKCS7SignatureData[];
    createSignedDocument(originalDocument: Buffer, signatures: IPKCS7SignatureData[]): Buffer;
}
