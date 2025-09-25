// Constantes específicas do ICP-Brasil
// Conforme especificações do ITI (Instituto Nacional de Tecnologia da Informação)

// OIDs específicos que DEVEM estar presentes em certificados ICP-Brasil
export const ICP_BRASIL_OIDS = {
  // Identificadores de pessoa física e jurídica
  CPF: '2.16.76.1.3.1',
  CNPJ: '2.16.76.1.3.2',

  // Políticas de certificado ICP-Brasil
  POLICY_A1: '2.16.76.1.2.1.1',  // Política A1 (certificado em software)
  POLICY_A3: '2.16.76.1.2.1.3',  // Política A3 (certificado em hardware)
  POLICY_A4: '2.16.76.1.2.1.4',  // Política A4 (certificado em hardware)

  // Políticas específicas de ACs credenciadas
  POLICY_SYNGULAR: '2.16.76.1.2.1.133', // Política SyngularID (AC credenciada)

  // Extensões específicas ICP-Brasil
  KEY_USAGE: '2.5.29.15',
  EXTENDED_KEY_USAGE: '2.5.29.37',
  CERTIFICATE_POLICIES: '2.5.29.32',

  // Atributos de certificado
  PESSOA_FISICA: '2.16.76.1.3.1',
  PESSOA_JURIDICA: '2.16.76.1.3.2',
  EQUIPAMENTO: '2.16.76.1.3.3',
  APLICACAO: '2.16.76.1.3.4',
} as const;

// URLs de LCR (Lista de Certificados Revogados) das principais ACs
export const CRL_URLS = {
  AC_RAIZ: 'http://acraiz.icpbrasil.gov.br/LCRacraiz.crl',
  SERPRO: 'http://repositorio.serpro.gov.br/lcr/acserpro/acserpro.crl',
  CERTISIGN: 'http://crl.certisign.com.br/certisignac.crl',
  SERASA: 'http://crl.serasa.com.br/serasacd.crl',
  VALID: 'http://ccd.valid.com.br/lcr/ac-valid-brasil-v5.crl',
  SAFENET: 'http://crl.safenet-inc.com/brazilian-ac-safenet.crl',
} as const;

// Códigos de erro específicos ICP-Brasil
export const ICP_ERROR_CODES = {
  // Erros de certificado
  INVALID_CERTIFICATE: 'CERT_001',
  CERTIFICATE_EXPIRED: 'CERT_002',
  CERTIFICATE_REVOKED: 'CERT_003',
  INVALID_CHAIN: 'CERT_004',
  INVALID_POLICY: 'CERT_005',
  CRL_UNAVAILABLE: 'CERT_006',
  CERTIFICATE_NOT_ICP_BRASIL: 'CERT_007',
  INVALID_CPF_CNPJ: 'CERT_008',

  // Erros de assinatura
  SIGNATURE_INVALID: 'SIGN_001',
  DOCUMENT_TAMPERED: 'SIGN_002',
  HASH_MISMATCH: 'SIGN_003',
  INVALID_SIGNATURE_FORMAT: 'SIGN_004',
  SIGNATURE_ALGORITHM_NOT_ALLOWED: 'SIGN_005',

  // Erros de validação
  VALIDATION_TIMEOUT: 'VALID_001',
  VALIDATION_FAILED: 'VALID_002',
  POLICY_VALIDATION_FAILED: 'VALID_003',

  // Erros de sistema
  FILE_TOO_LARGE: 'SYS_001',
  UNSUPPORTED_FORMAT: 'SYS_002',
  INTERNAL_ERROR: 'SYS_003',
} as const;

// Algoritmos de assinatura permitidos
export const ALLOWED_SIGNATURE_ALGORITHMS = [
  'SHA256withRSA',
  'SHA384withRSA',
  'SHA512withRSA',
  'SHA256withECDSA',
  'SHA384withECDSA',
  'SHA512withECDSA',
  // Formatos alternativos que podem aparecer internamente
  'SHA-256withRSA',
  'SHA-384withRSA',
  'SHA-512withRSA',
  'SHA-256withECDSA',
  'SHA-384withECDSA',
  'SHA-512withECDSA',
  // Formatos que aparecem no forge
  'sha256WithRSAEncryption',
  'sha384WithRSAEncryption',
  'sha512WithRSAEncryption',
  'sha256WithECDSAEncryption',
  'sha384WithECDSAEncryption',
  'sha512WithECDSAEncryption'
] as const;

// Algoritmos de hash permitidos
export const ALLOWED_HASH_ALGORITHMS = [
  'SHA-256',
  'SHA-384',
  'SHA-512',
] as const;

// Tamanhos mínimos de chave por algoritmo
export const MIN_KEY_SIZES = {
  RSA: 2048,
  ECDSA: 256,
} as const;

// Formatos de certificado suportados
export const SUPPORTED_CERTIFICATE_FORMATS = [
  '.p12',
  '.pfx',
] as const;

// Formatos de documento suportados
export const SUPPORTED_DOCUMENT_FORMATS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/xml',
  'text/xml',
] as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  CRL_CACHE_TIMEOUT: 3600, // 1 hora
  CERTIFICATE_VALIDATION_TIMEOUT: 30000, // 30 segundos
  MAX_FILE_SIZE: 52428800, // 50MB
  MAX_SIGNATURES_PER_DOCUMENT: 100,
  AUDIT_RETENTION_DAYS: 2555, // 7 anos conforme legislação
} as const;

// Padrões de regex para validação
export const VALIDATION_PATTERNS = {
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Estados de validação
export const VALIDATION_STATUS = {
  PENDING: 'PENDING',
  VALID: 'VALID',
  INVALID: 'INVALID',
  REVOKED: 'REVOKED',
} as const;

// Tipos de log de auditoria
export const AUDIT_LOG_TYPES = {
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  SIGNATURE_ATTEMPT: 'SIGNATURE_ATTEMPT',
  SIGNATURE_SUCCESS: 'SIGNATURE_SUCCESS',
  SIGNATURE_FAILURE: 'SIGNATURE_FAILURE',
  CERTIFICATE_VALIDATION: 'CERTIFICATE_VALIDATION',
  CRL_CONSULTATION: 'CRL_CONSULTATION',
  SIGNATURE_VERIFICATION: 'SIGNATURE_VERIFICATION',
  DOCUMENT_DOWNLOAD: 'DOCUMENT_DOWNLOAD',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
} as const;