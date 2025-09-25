import { PrismaService } from '../../config/prisma.service';
import { ICPBrasilValidator } from '../../core/icp-brasil/services/icp-brasil-validator.service';
import { IDetailedValidationResult } from '../../core/icp-brasil/interfaces/icp-brasil.interfaces';
export declare class SignaturesService {
    private readonly prisma;
    private readonly validator;
    private readonly logger;
    constructor(prisma: PrismaService, validator: ICPBrasilValidator);
    validateDetailed(signatureId: string, userId: string): Promise<IDetailedValidationResult>;
}
