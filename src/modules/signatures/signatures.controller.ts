import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SignaturesService } from './signatures.service';
import { IDetailedValidationResult } from '../../core/icp-brasil/interfaces/icp-brasil.interfaces';

@ApiTags('signatures')
@Controller('signatures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post(':signatureId/validate-detailed')
  @ApiOperation({
    summary: 'Validação detalhada de uma assinatura específica',
    description: 'Realiza validação técnica completa de uma assinatura digital, incluindo verificação criptográfica, cadeia de certificados, status de revogação e conformidade com políticas ICP-Brasil'
  })
  @ApiResponse({
    status: 201,
    description: 'Validação detalhada concluída',
    schema: {
      type: 'object',
      properties: {
        signatureId: { type: 'string', example: 'clyyy67890' },
        validationResults: {
          type: 'object',
          properties: {
            cryptographicIntegrity: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean', example: true },
                algorithm: { type: 'string', example: 'SHA256withRSA' },
                errors: { type: 'array', items: { type: 'string' } }
              }
            },
            certificateChain: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean', example: true },
                chainLength: { type: 'number', example: 3 },
                trustedRoot: { type: 'string', example: 'AC-Raiz ICP-Brasil' },
                errors: { type: 'array', items: { type: 'string' } }
              }
            },
            revocationStatus: {
              type: 'object',
              properties: {
                isRevoked: { type: 'boolean', example: false },
                checkedAt: { type: 'string', example: '2024-09-24T20:40:00.000Z' },
                crlUrls: { type: 'array', items: { type: 'string' } },
                errors: { type: 'array', items: { type: 'string' } }
              }
            },
            timeValidation: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean', example: true },
                signedAt: { type: 'string', example: '2024-09-24T20:35:00.000Z' },
                validAt: { type: 'string', example: '2024-09-24T20:40:00.000Z' },
                certificateValidityPeriod: {
                  type: 'object',
                  properties: {
                    notBefore: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    notAfter: { type: 'string', example: '2025-01-01T00:00:00.000Z' }
                  }
                },
                errors: { type: 'array', items: { type: 'string' } }
              }
            },
            policyCompliance: {
              type: 'object',
              properties: {
                isCompliant: { type: 'boolean', example: true },
                detectedPolicies: { type: 'array', items: { type: 'string' } },
                requiredPolicies: { type: 'array', items: { type: 'string' } },
                errors: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        },
        validatedAt: { type: 'string', example: '2024-09-24T20:40:00.000Z' },
        validationLog: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  async validateDetailed(
    @Param('signatureId') signatureId: string,
    @Req() req: any
  ): Promise<IDetailedValidationResult> {
    return this.signaturesService.validateDetailed(signatureId, req.user.userId);
  }
}