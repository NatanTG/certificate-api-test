import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { DocumentUploadResponseDto, DocumentVerificationResponseDto, DocumentSigningResponseDto, SignDocumentDto, UserDocumentsResponseDto } from './dto/document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(file: Express.Multer.File, req: any): Promise<DocumentUploadResponseDto>;
    signDocument(documentId: string, certificate: Express.Multer.File, signDto: SignDocumentDto, req: any): Promise<DocumentSigningResponseDto>;
    verifyDocument(documentId: string, req: any): Promise<DocumentVerificationResponseDto>;
    downloadSignedDocument(documentId: string, req: any, res: Response): Promise<void>;
}
export declare class UsersController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getMyDocuments(req: any): Promise<UserDocumentsResponseDto>;
}
