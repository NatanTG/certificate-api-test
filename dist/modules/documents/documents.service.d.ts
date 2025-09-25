import { PrismaService } from '../../config/prisma.service';
import { ICPBrasilCertificateHandler } from '../../core/icp-brasil/services/icp-brasil-certificate-handler.service';
import { ICPBrasilSigner } from '../../core/icp-brasil/services/icp-brasil-signer.service';
import { ICPBrasilValidator } from '../../core/icp-brasil/services/icp-brasil-validator.service';
import { DocumentUploadResponseDto, DocumentVerificationResponseDto, DocumentSigningResponseDto, UserDocumentsResponseDto } from './dto/document.dto';
export declare class DocumentsService {
    private readonly prisma;
    private readonly certificateHandler;
    private readonly signer;
    private readonly validator;
    private readonly logger;
    constructor(prisma: PrismaService, certificateHandler: ICPBrasilCertificateHandler, signer: ICPBrasilSigner, validator: ICPBrasilValidator);
    uploadDocument(file: Express.Multer.File, userId: string): Promise<DocumentUploadResponseDto>;
    signDocument(documentId: string, certificateFile: Express.Multer.File, certificatePassword: string, userId: string, hashAlgorithm?: string): Promise<DocumentSigningResponseDto>;
    verifyDocument(documentId: string, userId: string): Promise<DocumentVerificationResponseDto>;
    private createSignedPDFDocument;
    private createP12Buffer;
    downloadSignedDocument(documentId: string, userId: string): Promise<Buffer>;
    getUserDocuments(userId: string): Promise<UserDocumentsResponseDto>;
}
