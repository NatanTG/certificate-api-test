# 🔐 API de Assinatura Digital ICP-Brasil

> **API REST completa para assinatura digital de documentos usando certificados ICP-Brasil compatível com padrões PKCS#7/CAdES**

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-red.svg)](https://nestjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![ICP-Brasil](https://img.shields.io/badge/ICP--Brasil-Compatible-yellow.svg)](https://www.iti.gov.br/)

## 📖 Documentação Completa

**👉 [API-USAGE.md](API-USAGE.md) - GUIA COMPLETO DE USO**

## ⚡ Quick Start

### Opção 1: Setup Automático
```bash
# Clone o repositório
git clone <seu-repositorio>
cd certificate-test

# Execute o setup automático
make setup

# Escolha opção 1 (Desenvolvimento) ou 2 (Produção)
```

### Opção 2: Setup Manual
```bash
# 1. Subir serviços
docker-compose up -d

# 2. Instalar dependências
npm install

# 3. Configurar banco
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Iniciar API
npm run start:dev
```

## 🌐 URLs

- **API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:8080 (admin@dev.local / admin123)

## Stack Tecnológica

- **Backend**: Node.js + NestJS
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Criptografia**: node-forge + pkijs + asn1js
- **Upload**: multer
- **Validação**: class-validator
- **Logs**: pino + winston
- **Documentação**: Swagger/OpenAPI

## Características ICP-Brasil

### Formatos Suportados
- **Certificados**: X.509 v3, PKCS#12 (.p12/.pfx)
- **Assinaturas**: PKCS#7 (CAdES-BES mínimo)
- **Hash**: SHA-256 ou superior
- **Chaves**: RSA mínimo 2048 bits

### Validações Implementadas
- ✅ Verificação da cadeia de certificação até AC-Raiz ICP-Brasil
- ✅ Consulta à LCR (Lista de Certificados Revogados) em tempo real
- ✅ Validação de políticas de certificado ICP-Brasil (OID 2.16.76.1.2.1.x)
- ✅ Verificação de validade temporal do certificado
- ✅ Extração de CPF/CNPJ do certificado
- ✅ Validação de integridade criptográfica

## Instalação

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (via Docker ou local)

### Passos

1. **Clone o repositório**
```bash
git clone <repository>
cd certificate-test
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

4. **Iniciar banco de dados**
```bash
docker-compose up -d postgres
```

5. **Configurar banco de dados**
```bash
npm run db:generate
npm run db:push
```

6. **Iniciar aplicação**
```bash
npm run start:dev
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário

### Documentos
- `POST /api/documents/upload` - Upload de documento
- `POST /api/documents/:id/sign-icp` - Assinatura ICP-Brasil
- `GET /api/documents/:id/verify` - Verificar assinaturas
- `GET /api/documents/:id/download/signed` - Download P7S

### Assinaturas
- `POST /api/signatures/:id/validate-detailed` - Validação detalhada

### Usuários
- `GET /api/users/my-documents` - Documentos do usuário

## Uso da API

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

### 2. Upload de Documento
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@documento.pdf"
```

### 3. Assinatura Digital
```bash
curl -X POST http://localhost:3000/api/documents/{documentId}/sign-icp \
  -H "Authorization: Bearer <token>" \
  -F "certificate=@certificado.p12" \
  -F "certificatePassword=senha123"
```

### 4. Verificar Assinaturas
```bash
curl -X GET http://localhost:3000/api/documents/{documentId}/verify \
  -H "Authorization: Bearer <token>"
```

## Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/                 # Autenticação JWT
│   ├── documents/            # Gestão de documentos
│   ├── signatures/           # Validação de assinaturas
│   └── users/                # Usuários
├── core/
│   └── icp-brasil/           # Classes principais ICP-Brasil
│       ├── services/
│       │   ├── icp-brasil-certificate-handler.service.ts
│       │   ├── icp-brasil-signer.service.ts
│       │   └── icp-brasil-validator.service.ts
│       ├── constants/
│       └── interfaces/
├── common/
│   ├── guards/               # Autenticação
│   ├── interceptors/         # Logs de auditoria
│   ├── filters/              # Tratamento de erros
│   └── pipes/                # Validações
└── config/                   # Configuração Prisma
```

## Variáveis de Ambiente

```env
# Servidor
PORT=3000
JWT_SECRET=sua_chave_jwt_super_secreta
JWT_EXPIRES_IN=24h

# Banco de dados
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/icp_signatures

# Caminhos
UPLOAD_PATH=./uploads
TEMP_PATH=./temp
LOGS_PATH=./logs

# ICP-Brasil
AC_RAIZ_CRL_URL=http://acraiz.icpbrasil.gov.br/LCRacraiz.crl
CRL_CACHE_TIMEOUT=3600
CERTIFICATE_VALIDATION_TIMEOUT=30000
MAX_FILE_SIZE=52428800

# Logs
LOG_LEVEL=info
AUDIT_RETENTION_DAYS=2555
```

## Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento
npm run start:prod     # Produção
npm run build          # Build da aplicação
npm run test           # Testes
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar schema
npm run db:migrate     # Criar migração
```

## Documentação API

Acesse `http://localhost:3000/api/docs` para documentação Swagger interativa.

## Conformidade ICP-Brasil

### Algoritmos Permitidos
- **Assinatura**: SHA256withRSA, SHA384withRSA, SHA512withRSA
- **Hash**: SHA-256, SHA-384, SHA-512
- **Chaves**: RSA ≥ 2048 bits, ECDSA ≥ 256 bits

### Políticas Suportadas
- **A1**: Certificado em software
- **A3**: Certificado em hardware (token/smartcard)
- **A4**: Certificado em hardware (HSM)

### Validações Obrigatórias
1. Verificação da cadeia até AC-Raiz ICP-Brasil
2. Consulta às LCRs das ACs
3. Validação de políticas OID 2.16.76.1.2.1.x
4. Extração e validação de CPF/CNPJ
5. Verificação de período de validade

## Logs de Auditoria

Todos os eventos são logados conforme exigência legal (7 anos):

- Upload/download de documentos
- Tentativas de assinatura
- Validações de certificado
- Consultas de revogação
- Acessos de usuário

## Segurança

### Implementadas
- Autenticação JWT
- Redação de senhas em logs
- Validação de certificados
- Rate limiting por arquivo
- Sanitização de inputs

### Recomendações de Produção
- HTTPS obrigatório
- Firewall para APIs de LCR
- Backup de logs de auditoria
- Monitoramento de performance
- HSM para chaves de aplicação

## Troubleshooting

### Erro: "Certificado ICP-Brasil inválido"
- Verificar se é certificado A1, A3 ou A4
- Confirmar se não está expirado
- Validar senha do certificado

### Erro: "LCR indisponível"
- Verificar conectividade com URLs de LCR
- Aguardar timeout e tentar novamente
- Certificar que AC está funcionando

### Performance lenta
- Verificar tamanho dos arquivos (máx 50MB)
- Otimizar consultas de LCR (cache)
- Monitorar banco de dados

## Contato e Suporte

Para questões técnicas sobre conformidade ICP-Brasil, consulte:
- [ITI - Instituto Nacional de Tecnologia da Informação](https://iti.gov.br)
- [Padrões ICP-Brasil](https://www.gov.br/iti/pt-br)

---

**Importante**: Esta implementação segue os padrões técnicos ITI para aprovação oficial. Para uso em produção, recomenda-se auditoria de segurança independente.