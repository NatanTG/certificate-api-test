import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ICPBrasilValidator } from '../../core/icp-brasil/services/icp-brasil-validator.service';
import { IDetailedValidationResult } from '../../core/icp-brasil/interfaces/icp-brasil.interfaces';

@Injectable()
export class SignaturesService {
  private readonly logger = new Logger(SignaturesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: ICPBrasilValidator,
  ) {}

  async validateDetailed(signatureId: string, userId: string): Promise<IDetailedValidationResult> {
    try {
      this.logger.debug(`Validação detalhada da assinatura ${signatureId}`);

      // Buscar assinatura e documento
      const signature = await this.prisma.icpSignature.findFirst({
        where: {
          id: signatureId,
          document: { userId },
        },
        include: {
          document: true,
        },
      });

      if (!signature) {
        throw new NotFoundException('Assinatura não encontrada');
      }

      // Preparar dados da assinatura para validação
      const signatureData = {
        signatureData: signature.signatureData,
        signerCertificate: Buffer.from(''), // Em produção, armazenar o certificado
        signatureAlgorithm: signature.signatureAlgorithm,
        hashAlgorithm: signature.hashAlgorithm,
        signedAttributes: {},
      };

      // Ler documento original
      const fs = require('fs');
      const documentBuffer = fs.readFileSync(signature.document.filePath);

      // Realizar validação completa
      const validationResult = await this.validator.fullValidation(signatureData, documentBuffer);

      // Gerar relatório detalhado
      const detailedResult = this.validator.generateValidationReport(validationResult, signatureId);

      // Atualizar status da assinatura
      await this.prisma.icpSignature.update({
        where: { id: signatureId },
        data: {
          validationStatus: validationResult.cryptographicIntegrity &&
                           validationResult.certificateChain &&
                           validationResult.revocationStatus &&
                           validationResult.timeValidation &&
                           validationResult.policyCompliance ? 'VALID' : 'INVALID',
          lastValidationAt: new Date(),
          validationErrors: validationResult.errors.length > 0 ? validationResult.errors : null,
        },
      });

      this.logger.log(`Validação detalhada concluída para assinatura ${signatureId}`);

      return detailedResult;

    } catch (error) {
      this.logger.error(`Erro na validação detalhada: ${error.message}`);
      throw error;
    }
  }
}