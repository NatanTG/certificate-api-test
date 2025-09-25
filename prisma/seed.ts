// prisma/seed.ts
import { PrismaClient, ValidationStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv', // hash fake (bcrypt)
    },
  });

  // Criar documento
  const document = await prisma.document.create({
    data: {
      userId: user.id,
      filename: 'contrato-assinado.pdf',
      originalFilename: 'contrato.pdf',
      filePath: '/uploads/contrato-assinado.pdf',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb924...', // SHA-256 fake
      fileSize: 102400,
      mimeType: 'application/pdf',
    },
  });

  // Criar assinatura ICP-Brasil
  const signature = await prisma.icpSignature.create({
    data: {
      documentId: document.id,
      signatureData: 'MIIC...FAKEPKCS7...',
      certificateSubject: 'CN=Fulano de Tal, O=Empresa X, C=BR',
      certificateIssuer: 'AC Raiz ICP-Brasil v10',
      certificateSerialNumber: randomUUID(),
      certificateNotBefore: new Date('2024-01-01T00:00:00Z'),
      certificateNotAfter: new Date('2027-01-01T00:00:00Z'),
      signerCpfCnpj: '12345678901',
      signatureAlgorithm: 'RSA-SHA256',
      hashAlgorithm: 'SHA-256',
      validationStatus: ValidationStatus.PENDING,
    },
  });

  // Criar logs de validação
  await prisma.validationLog.createMany({
    data: [
      {
        signatureId: signature.id,
        validationType: 'chain',
        isValid: true,
        validatorInfo: { engine: 'OpenSSL 3.0', version: '1.0' },
      },
      {
        signatureId: signature.id,
        validationType: 'revocation',
        isValid: false,
        errorMessage: 'Certificado revogado em 2025-03-01',
        validatorInfo: { crl: 'http://icpbrasil.gov.br/crl' },
      },
    ],
  });

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
