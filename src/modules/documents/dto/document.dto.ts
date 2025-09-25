import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class DocumentUploadResponseDto {
  @ApiProperty({
    description: 'ID único do documento',
    example: 'clxxx12345'
  })
  documentId: string;

  @ApiProperty({
    description: 'Nome do arquivo',
    example: 'contrato.pdf'
  })
  filename: string;

  @ApiProperty({
    description: 'Hash SHA-256 do documento',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  })
  hash: string;

  @ApiProperty({
    description: 'Data e hora do upload',
    example: '2024-09-24T20:30:00.000Z'
  })
  uploadedAt: Date;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1024000
  })
  size: number;
}

export class DocumentVerificationResponseDto {
  @ApiProperty({
    description: 'ID do documento',
    example: 'clxxx12345'
  })
  documentId: string;

  @ApiProperty({
    description: 'Hash SHA-256 do documento',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  })
  documentHash: string;

  @ApiProperty({
    description: 'Número total de assinaturas no documento',
    example: 2
  })
  totalSignatures: number;

  @ApiProperty({
    description: 'Lista de assinaturas do documento',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        signatureId: { type: 'string', example: 'clyyy67890' },
        certificateInfo: {
          type: 'object',
          properties: {
            subject: { type: 'string', example: 'João Silva:12345678901' },
            issuer: { type: 'string', example: 'AC CERTISIGN RFB G5' },
            serialNumber: { type: 'string', example: '123456789' },
            validity: {
              type: 'object',
              properties: {
                notBefore: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                notAfter: { type: 'string', example: '2025-01-01T00:00:00.000Z' }
              }
            },
            cpfCnpj: { type: 'string', example: '12345678901' }
          }
        },
        isValid: { type: 'boolean', example: true },
        validationDetails: {
          type: 'object',
          properties: {
            chainValid: { type: 'boolean', example: true },
            notRevoked: { type: 'boolean', example: true },
            timeValid: { type: 'boolean', example: true },
            policyValid: { type: 'boolean', example: true }
          }
        },
        signedAt: { type: 'string', example: '2024-09-24T20:30:00.000Z' }
      }
    }
  })
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

export class UserDocumentsResponseDto {
  @ApiProperty({
    description: 'Lista de documentos do usuário',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clxxx12345' },
        filename: { type: 'string', example: 'contrato.pdf' },
        uploadedAt: { type: 'string', example: '2024-09-24T20:30:00.000Z' },
        signaturesCount: { type: 'number', example: 2 },
        isFullySigned: { type: 'boolean', example: true },
        lastSignedAt: { type: 'string', example: '2024-09-24T20:35:00.000Z' }
      }
    }
  })
  documents: Array<{
    id: string;
    filename: string;
    uploadedAt: Date;
    signaturesCount: number;
    isFullySigned: boolean;
    lastSignedAt?: Date;
  }>;
}

export class SignDocumentDto {
  @ApiProperty({
    description: 'Senha do certificado digital (.p12/.pfx)',
    example: 'minhasenha123'
  })
  @IsString({ message: 'Senha do certificado deve ser uma string' })
  certificatePassword: string;

  @ApiProperty({
    description: 'Algoritmo de hash (opcional, padrão SHA-256)',
    example: 'SHA-256',
    required: false
  })
  @IsOptional()
  @IsString()
  hashAlgorithm?: string = 'SHA-256';
}

export class DocumentSigningResponseDto {
  @ApiProperty({
    description: 'ID da assinatura criada',
    example: 'clyyy67890'
  })
  signatureId: string;

  @ApiProperty({
    description: 'ID do documento assinado',
    example: 'clxxx12345'
  })
  documentId: string;

  @ApiProperty({
    description: 'Informações do certificado usado na assinatura',
    type: 'object',
    properties: {
      subject: { type: 'string', example: 'João Silva:12345678901' },
      issuer: { type: 'string', example: 'AC CERTISIGN RFB G5' },
      serialNumber: { type: 'string', example: '123456789' },
      validity: {
        type: 'object',
        properties: {
          notBefore: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          notAfter: { type: 'string', example: '2025-01-01T00:00:00.000Z' }
        }
      },
      cpfCnpj: { type: 'string', example: '12345678901' }
    }
  })
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

  @ApiProperty({
    description: 'Data e hora da assinatura',
    example: '2024-09-24T20:35:00.000Z'
  })
  signedAt: Date;

  @ApiProperty({
    description: 'Padrão de assinatura utilizado',
    example: 'ICP-Brasil'
  })
  standard: string;
}