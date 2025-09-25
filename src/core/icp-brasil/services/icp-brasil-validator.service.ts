import { Injectable, Logger } from '@nestjs/common';
import * as forge from 'node-forge';
import {
  IValidationResult,
  IDetailedValidationResult,
  ISignatureValidationOptions,
  IPKCS7SignatureData,
  ICertificateInfo
} from '../interfaces/icp-brasil.interfaces';
import {
  ICP_ERROR_CODES,
  VALIDATION_CONFIG,
  VALIDATION_STATUS
} from '../constants/icp-brasil.constants';
import { ICPBrasilCertificateHandler } from './icp-brasil-certificate-handler.service';
import { ICPBrasilSigner } from './icp-brasil-signer.service';

@Injectable()
export class ICPBrasilValidator {
  private readonly logger = new Logger(ICPBrasilValidator.name);

  constructor(
    private readonly certificateHandler: ICPBrasilCertificateHandler,
    private readonly signer: ICPBrasilSigner,
  ) {}

  /**
   * Validação completa de assinatura ICP-Brasil
   * @param signature Dados da assinatura PKCS#7
   * @param originalDocument Documento original
   * @param options Opções de validação
   * @returns Resultado completo da validação
   */
  async fullValidation(
    signature: IPKCS7SignatureData,
    originalDocument: Buffer,
    options: ISignatureValidationOptions = {}
  ): Promise<IValidationResult> {
    const startTime = Date.now();
    const validationLog: string[] = [];

    this.logger.debug('Iniciando validação completa da assinatura ICP-Brasil');

    const result: IValidationResult = {
      cryptographicIntegrity: false,
      certificateChain: false,
      revocationStatus: false,
      timeValidation: false,
      policyCompliance: false,
      errors: [],
      warnings: [],
      validatedAt: new Date()
    };

    try {
      // Aplicar timeout se especificado
      const timeout = options.timeout || VALIDATION_CONFIG.CERTIFICATE_VALIDATION_TIMEOUT;
      const validationPromise = this.performValidation(signature, originalDocument, options, validationLog);

      const timeoutPromise = new Promise<IValidationResult>((_, reject) =>
        setTimeout(() => reject(new Error(ICP_ERROR_CODES.VALIDATION_TIMEOUT)), timeout)
      );

      const validationResult = await Promise.race([validationPromise, timeoutPromise]);
      Object.assign(result, validationResult);

    } catch (error) {
      this.logger.error(`Erro na validação completa: ${error.message}`);
      result.errors.push(error.message);
    }

    const duration = Date.now() - startTime;
    this.logger.debug(`Validação completa concluída em ${duration}ms`);

    return result;
  }

  /**
   * Valida integridade criptográfica da assinatura
   * @param signature Dados da assinatura
   * @param document Documento original
   * @returns Resultado da validação de integridade
   */
  validateCryptographicIntegrity(
    signature: IPKCS7SignatureData,
    document: Buffer
  ): { isValid: boolean; algorithm: string; errors: string[] } {
    const result = { isValid: false, algorithm: signature.signatureAlgorithm, errors: [] };

    try {
      this.logger.debug('Validando integridade criptográfica');

      // Verificar assinatura PKCS#7
      const verification = this.signer.verifySignature(signature.signatureData, document);

      if (verification) {
        result.isValid = true;
      } else {
        result.errors.push('Verificação criptográfica falhou');
      }

      // Validar algoritmos utilizados
      if (!this.isSignatureAlgorithmAllowed(signature.signatureAlgorithm)) {
        result.isValid = false;
        result.errors.push(`Algoritmo de assinatura não permitido: ${signature.signatureAlgorithm}`);
      }

      if (!this.isHashAlgorithmAllowed(signature.hashAlgorithm)) {
        result.isValid = false;
        result.errors.push(`Algoritmo de hash não permitido: ${signature.hashAlgorithm}`);
      }

    } catch (error) {
      this.logger.error(`Erro na validação de integridade: ${error.message}`);
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Valida políticas ICP-Brasil do certificado
   * @param certificate Certificado a ser validado
   * @returns Resultado da validação de políticas
   */
  validateICPBrasilPolicies(
    certificate: forge.pki.Certificate
  ): { isCompliant: boolean; detectedPolicies: string[]; requiredPolicies: string[]; errors: string[] } {
    const result = {
      isCompliant: false,
      detectedPolicies: [] as string[],
      requiredPolicies: ['2.16.76.1.2.1.1', '2.16.76.1.2.1.3', '2.16.76.1.2.1.4'],
      errors: [] as string[]
    };

    try {
      this.logger.debug('Validando políticas ICP-Brasil');

      const validation = this.certificateHandler.validateICPBrasilCertificate(certificate);

      if (validation.isICPBrasil) {
        result.detectedPolicies = validation.policyValidation.policies;
        result.isCompliant = validation.policyValidation.isCompliant;

        if (!result.isCompliant) {
          result.errors.push('Certificado não possui políticas ICP-Brasil válidas');
        }
      } else {
        result.errors.push('Certificado não é ICP-Brasil');
      }

      // Validações adicionais de políticas específicas
      this.validateSpecificPolicies(certificate, result);

    } catch (error) {
      this.logger.error(`Erro na validação de políticas: ${error.message}`);
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Gera relatório detalhado de validação
   * @param validationResults Resultados das validações
   * @param signatureId ID da assinatura
   * @returns Relatório detalhado
   */
  generateValidationReport(
    validationResults: IValidationResult,
    signatureId: string
  ): IDetailedValidationResult {
    this.logger.debug('Gerando relatório detalhado de validação');

    const report: IDetailedValidationResult = {
      signatureId,
      validationResults: {
        cryptographicIntegrity: {
          isValid: validationResults.cryptographicIntegrity,
          algorithm: 'SHA256withRSA', // Extrair do resultado real
          errors: validationResults.errors.filter(e => e.includes('criptográfica'))
        },
        certificateChain: {
          isValid: validationResults.certificateChain,
          chainLength: 0, // Calcular cadeia real
          trustedRoot: 'AC-Raiz ICP-Brasil',
          errors: validationResults.errors.filter(e => e.includes('cadeia'))
        },
        revocationStatus: {
          isRevoked: !validationResults.revocationStatus,
          checkedAt: new Date(),
          crlUrls: [], // URLs das LCR consultadas
          errors: validationResults.errors.filter(e => e.includes('revogação'))
        },
        timeValidation: {
          isValid: validationResults.timeValidation,
          signedAt: new Date(), // Data real da assinatura
          validAt: new Date(),
          certificateValidityPeriod: {
            notBefore: new Date(),
            notAfter: new Date()
          },
          errors: validationResults.errors.filter(e => e.includes('tempo'))
        },
        policyCompliance: {
          isCompliant: validationResults.policyCompliance,
          detectedPolicies: [],
          requiredPolicies: ['2.16.76.1.2.1.1', '2.16.76.1.2.1.3'],
          errors: validationResults.errors.filter(e => e.includes('política'))
        }
      },
      validatedAt: validationResults.validatedAt,
      validationLog: [
        `Validação iniciada em ${validationResults.validatedAt.toISOString()}`,
        `Integridade criptográfica: ${validationResults.cryptographicIntegrity ? 'VÁLIDA' : 'INVÁLIDA'}`,
        `Cadeia de certificados: ${validationResults.certificateChain ? 'VÁLIDA' : 'INVÁLIDA'}`,
        `Status de revogação: ${validationResults.revocationStatus ? 'NÃO REVOGADO' : 'REVOGADO/ERRO'}`,
        `Validação temporal: ${validationResults.timeValidation ? 'VÁLIDA' : 'INVÁLIDA'}`,
        `Conformidade de políticas: ${validationResults.policyCompliance ? 'CONFORME' : 'NÃO CONFORME'}`,
        ...validationResults.errors.map(error => `ERRO: ${error}`),
        ...validationResults.warnings.map(warning => `AVISO: ${warning}`)
      ]
    };

    return report;
  }

  /**
   * Valida múltiplas assinaturas de um documento
   * @param signatures Array de assinaturas
   * @param originalDocument Documento original
   * @returns Resultados de validação para cada assinatura
   */
  async validateMultipleSignatures(
    signatures: IPKCS7SignatureData[],
    originalDocument: Buffer
  ): Promise<Array<{ signature: IPKCS7SignatureData; result: IValidationResult }>> {
    this.logger.debug(`Validando ${signatures.length} assinaturas`);

    const results = [];

    for (let i = 0; i < signatures.length; i++) {
      this.logger.debug(`Validando assinatura ${i + 1}/${signatures.length}`);

      try {
        const result = await this.fullValidation(signatures[i], originalDocument);
        results.push({ signature: signatures[i], result });
      } catch (error) {
        this.logger.error(`Erro na validação da assinatura ${i + 1}: ${error.message}`);
        results.push({
          signature: signatures[i],
          result: {
            cryptographicIntegrity: false,
            certificateChain: false,
            revocationStatus: false,
            timeValidation: false,
            policyCompliance: false,
            errors: [error.message],
            warnings: [],
            validatedAt: new Date()
          }
        });
      }
    }

    return results;
  }

  // Métodos privados auxiliares

  private async performValidation(
    signature: IPKCS7SignatureData,
    originalDocument: Buffer,
    options: ISignatureValidationOptions,
    validationLog: string[]
  ): Promise<IValidationResult> {
    const result: IValidationResult = {
      cryptographicIntegrity: false,
      certificateChain: false,
      revocationStatus: false,
      timeValidation: false,
      policyCompliance: false,
      errors: [],
      warnings: [],
      validatedAt: new Date()
    };

    // 1. Validar integridade criptográfica
    if (options.checkRevocation !== false) {
      validationLog.push('Validando integridade criptográfica...');
      const integrityResult = this.validateCryptographicIntegrity(signature, originalDocument);
      result.cryptographicIntegrity = integrityResult.isValid;
      result.errors.push(...integrityResult.errors);
    }

    // 2. Validar cadeia de certificados
    if (options.validateChain !== false) {
      validationLog.push('Validando cadeia de certificados...');
      const chainResult = await this.validateCertificateChain(signature);
      result.certificateChain = chainResult.isValid;
      result.errors.push(...chainResult.errors);
    }

    // 3. Verificar status de revogação
    if (options.checkRevocation !== false) {
      validationLog.push('Verificando status de revogação...');
      const revocationResult = await this.validateRevocationStatus(signature);
      result.revocationStatus = revocationResult.isValid;
      result.errors.push(...revocationResult.errors);
    }

    // 4. Validar tempo
    if (options.validateTime !== false) {
      validationLog.push('Validando período de validade...');
      const timeResult = this.validateTimeConstraints(signature);
      result.timeValidation = timeResult.isValid;
      result.errors.push(...timeResult.errors);
    }

    // 5. Validar políticas ICP-Brasil
    if (options.validatePolicy !== false) {
      validationLog.push('Validando políticas ICP-Brasil...');
      const policyResult = await this.validatePolicyCompliance(signature);
      result.policyCompliance = policyResult.isValid;
      result.errors.push(...policyResult.errors);
    }

    return result;
  }

  private async validateCertificateChain(signature: IPKCS7SignatureData): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      // Extrair certificado da assinatura
      const certificate = forge.pki.certificateFromPem(
        '-----BEGIN CERTIFICATE-----\n' +
        signature.signerCertificate.toString('base64') +
        '\n-----END CERTIFICATE-----'
      );

      const validation = this.certificateHandler.validateICPBrasilCertificate(certificate);
      return {
        isValid: validation.chainValidation.isValid,
        errors: validation.chainValidation.errors
      };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  private async validateRevocationStatus(signature: IPKCS7SignatureData): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const certificate = forge.pki.certificateFromPem(
        '-----BEGIN CERTIFICATE-----\n' +
        signature.signerCertificate.toString('base64') +
        '\n-----END CERTIFICATE-----'
      );

      const revocationResult = await this.certificateHandler.checkRevocationStatus(certificate);
      return {
        isValid: !revocationResult.isRevoked,
        errors: revocationResult.errors
      };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  private validateTimeConstraints(signature: IPKCS7SignatureData): { isValid: boolean; errors: string[] } {
    try {
      const certificate = forge.pki.certificateFromPem(
        '-----BEGIN CERTIFICATE-----\n' +
        signature.signerCertificate.toString('base64') +
        '\n-----END CERTIFICATE-----'
      );

      const now = new Date();
      const isValid = now >= certificate.validity.notBefore && now <= certificate.validity.notAfter;

      return {
        isValid,
        errors: isValid ? [] : ['Certificado fora do período de validade']
      };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  private async validatePolicyCompliance(signature: IPKCS7SignatureData): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const certificate = forge.pki.certificateFromPem(
        '-----BEGIN CERTIFICATE-----\n' +
        signature.signerCertificate.toString('base64') +
        '\n-----END CERTIFICATE-----'
      );

      const policyResult = this.validateICPBrasilPolicies(certificate);
      return {
        isValid: policyResult.isCompliant,
        errors: policyResult.errors
      };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  private isSignatureAlgorithmAllowed(algorithm: string): boolean {
    const allowedAlgorithms = [
      'SHA256withRSA',
      'SHA384withRSA',
      'SHA512withRSA',
      'SHA256withECDSA',
      'SHA384withECDSA',
      'SHA512withECDSA',
      // Formatos alternativos que podem aparecer (forge vs outros libs)
      'sha256WithRSAEncryption',
      'sha384WithRSAEncryption',
      'sha512WithRSAEncryption',
      'sha256WithECDSAEncryption',
      'sha384WithECDSAEncryption',
      'sha512WithECDSAEncryption'
    ];

    return allowedAlgorithms.includes(algorithm);
  }

  private isHashAlgorithmAllowed(algorithm: string): boolean {
    const allowedAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512'];
    return allowedAlgorithms.includes(algorithm);
  }

  private validateSpecificPolicies(
    certificate: forge.pki.Certificate,
    result: { isCompliant: boolean; detectedPolicies: string[]; errors: string[] }
  ): void {
    // Validações específicas para políticas A1, A3, A4
    const cpfCnpj = this.certificateHandler.extractCpfCnpj(certificate);

    if (!cpfCnpj) {
      result.errors.push('CPF/CNPJ não encontrado no certificado ICP-Brasil');
      result.isCompliant = false;
    }

    // Outras validações específicas de políticas...
  }
}