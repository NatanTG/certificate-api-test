import { SignaturesService } from './signatures.service';
import { IDetailedValidationResult } from '../../core/icp-brasil/interfaces/icp-brasil.interfaces';
export declare class SignaturesController {
    private readonly signaturesService;
    constructor(signaturesService: SignaturesService);
    validateDetailed(signatureId: string, req: any): Promise<IDetailedValidationResult>;
}
