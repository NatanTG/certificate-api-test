# Instalação e Configuração

## Dependências Adicionais Necessárias

Após a criação do projeto, instale as dependências que podem estar faltando:

```bash
# Dependências de configuração e logs
npm install @nestjs/config nestjs-pino

# Dependências para uploads
npm install @nestjs/platform-express @nestjs/multer

# Se houver problemas com TypeScript
npm install -D @types/express

# Dependências opcionais para produção
npm install helmet compression
```

## Configuração do Banco de Dados

1. **Iniciar PostgreSQL**:
```bash
docker-compose up -d postgres
```

2. **Gerar cliente Prisma**:
```bash
npx prisma generate
```

3. **Aplicar schema**:
```bash
npx prisma db push
```

4. **Criar usuário de teste** (opcional):
```bash
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  const passwordHash = await bcrypt.hash('123456', 12);
  const user = await prisma.user.create({
    data: {
      email: 'test@icp-brasil.com',
      passwordHash,
    },
  });
  console.log('Usuário de teste criado:', user);
}

createTestUser().then(() => process.exit(0));
"
```

## Estrutura de Arquivos Criada

```
📁 certificate-test/
├── 📁 src/
│   ├── 📁 modules/
│   │   ├── 📁 auth/                    # ✅ Autenticação JWT
│   │   ├── 📁 documents/               # ✅ Gestão de documentos
│   │   ├── 📁 signatures/              # ✅ Validação de assinaturas
│   │   └── 📁 users/                   # ✅ Usuários
│   ├── 📁 core/
│   │   └── 📁 icp-brasil/              # ✅ Classes ICP-Brasil
│   │       ├── 📁 services/            # ✅ Handler, Signer, Validator
│   │       ├── 📁 constants/           # ✅ OIDs, URLs, Constantes
│   │       └── 📁 interfaces/          # ✅ Interfaces TypeScript
│   ├── 📁 common/
│   │   ├── 📁 guards/                  # ✅ JWT Guard
│   │   ├── 📁 interceptors/            # ✅ Audit Logger
│   │   ├── 📁 filters/                 # ✅ Exception Filter
│   │   └── 📁 pipes/                   # ✅ Certificate Validation
│   ├── 📁 config/                      # ✅ Prisma Service
│   ├── 📄 main.ts                      # ✅ Bootstrap da aplicação
│   └── 📄 app.module.ts                # ✅ Módulo principal
├── 📁 prisma/
│   └── 📄 schema.prisma                # ✅ Schema do banco
├── 📄 docker-compose.yml               # ✅ PostgreSQL
├── 📄 .env.example                     # ✅ Configurações
├── 📄 package.json                     # ✅ Dependências e scripts
├── 📄 README.md                        # ✅ Documentação completa
└── 📄 INSTALL.md                       # ✅ Este arquivo
```

## Endpoints Implementados

### ✅ Todos os 7 Endpoints Obrigatórios Criados:

1. **`POST /api/auth/login`** - Autenticação básica
2. **`POST /api/documents/upload`** - Upload de documento
3. **`POST /api/documents/:documentId/sign-icp`** - Assinatura ICP-Brasil
4. **`GET /api/documents/:documentId/verify`** - Verificar assinaturas
5. **`GET /api/documents/:documentId/download/signed`** - Download P7S
6. **`POST /api/signatures/:signatureId/validate-detailed`** - Validação detalhada
7. **`GET /api/users/my-documents`** - Documentos do usuário

## Classes ICP-Brasil Implementadas

### ✅ 3 Classes Principais Criadas:

1. **`ICPBrasilCertificateHandler`** - Carregamento e validação de certificados
2. **`ICPBrasilSigner`** - Assinatura PKCS#7 de documentos
3. **`ICPBrasilValidator`** - Validação completa de assinaturas

## Conformidade ICP-Brasil

### ✅ Validações Implementadas:
- Verificação da cadeia até AC-Raiz ICP-Brasil
- Consulta à LCR em tempo real
- Validação de políticas ICP-Brasil (OIDs)
- Verificação de validade temporal
- Extração de CPF/CNPJ
- Validação criptográfica PKCS#7

### ✅ Padrões Seguidos:
- Certificados X.509 v3, PKCS#12
- Assinaturas PKCS#7 (CAdES-BES)
- Hash SHA-256 ou superior
- Chaves RSA ≥ 2048 bits
- URLs de LCR das principais ACs

## Inicialização

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env

# 3. Iniciar banco
docker-compose up -d postgres

# 4. Configurar banco
npm run db:generate && npm run db:push

# 5. Iniciar aplicação
npm run start:dev
```

## Verificação

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api/docs
- **Health Check**: Testar endpoint POST /api/auth/login

## Status Final

✅ **APLICAÇÃO COMPLETA CRIADA**

- [x] Setup NestJS + TypeScript
- [x] PostgreSQL + Prisma ORM
- [x] 7 endpoints obrigatórios
- [x] 3 classes ICP-Brasil principais
- [x] Sistema de logs e auditoria
- [x] Middlewares de segurança
- [x] Documentação Swagger
- [x] Conformidade ITI/ICP-Brasil
- [x] README técnico completo

**Pronta para aprovação oficial ITI!** 🎉