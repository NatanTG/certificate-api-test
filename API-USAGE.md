# 🔐 API de Assinatura Digital ICP-Brasil - Guia Completo de Uso

> **API compatível com padrões ITI/ICP-Brasil para assinatura digital de documentos usando PKCS#7**

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Setup Rápido com Docker](#setup-rápido-com-docker)
3. [Endpoints da API](#endpoints-da-api)
4. [Fluxo Completo de Uso](#fluxo-completo-de-uso)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Autenticação](#autenticação)
7. [Códigos de Erro](#códigos-de-erro)
8. [Troubleshooting](#troubleshooting)
9. [Scripts de Teste](#scripts-de-teste)

---

## 🎯 Visão Geral

Esta API oferece funcionalidades completas para:

- ✅ **Upload de documentos** (PDF, DOC, TXT)
- ✅ **Assinatura digital** com certificados ICP-Brasil (.p12/.pfx)
- ✅ **Verificação de assinaturas** digitais
- ✅ **Download de documentos assinados** (formato P7S)
- ✅ **Gestão de documentos** por usuário

### 🏗️ Arquitetura

```
Client → Nginx → NestJS API → PostgreSQL
                      ↓
               Validação ICP-Brasil
```

---

## 🚀 Setup Rápido com Docker

### 1. Pré-requisitos

```bash
# Instalar Docker e Docker Compose
docker --version
docker-compose --version
```

### 2. Desenvolvimento (Rápido)

```bash
# 1. Clonar o repositório
git clone <seu-repositorio>
cd certificate-test

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Subir serviços básicos (PostgreSQL + pgAdmin)
docker-compose up -d

# 4. Instalar dependências
npm install

# 5. Executar migrations do banco
npx prisma generate
npx prisma db push

# 6. Criar usuário de teste
npm run db:seed

# 7. Iniciar API em desenvolvimento
npm run start:dev
```

**🎉 API disponível em:**
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:8080 (admin@dev.local / admin123)

### 3. Produção (Completo)

```bash
# 1. Configurar variáveis de ambiente para produção
cp .env.example .env.prod
# Editar .env.prod com valores de produção

# 2. Subir todos os serviços
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 3. Executar migrations
docker exec icp-brasil-api npx prisma db push

# 4. Criar usuários iniciais
docker exec icp-brasil-api npm run db:seed
```

**🎉 Produção disponível em:**
- **API**: http://localhost (via Nginx)
- **Documentação**: http://localhost/api/docs
- **pgAdmin**: http://localhost/pgadmin

---

## 📡 Endpoints da API

### Base URL
- **Desenvolvimento**: `http://localhost:3000/api`
- **Produção**: `http://localhost/api`

### 🔐 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/login` | Login com email/senha |
| `POST` | `/auth/logout` | Logout (requer autenticação) |

### 📄 Documentos

| Método | Endpoint | Descrição | Auth Required |
|--------|----------|-----------|---------------|
| `POST` | `/documents/upload` | Upload de documento | ✅ |
| `POST` | `/documents/{id}/sign-icp` | Assinar com ICP-Brasil | ✅ |
| `GET` | `/documents/{id}/verify` | Verificar assinaturas | ✅ |
| `GET` | `/documents/{id}/download/signed` | Download documento assinado | ✅ |

### 👥 Usuários

| Método | Endpoint | Descrição | Auth Required |
|--------|----------|-----------|---------------|
| `GET` | `/users/my-documents` | Listar meus documentos | ✅ |

---

## 🔄 Fluxo Completo de Uso

### 1️⃣ Autenticação

```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx12345",
    "email": "admin@test.com",
    "name": "Admin User"
  }
}
```

### 2️⃣ Upload de Documento

```bash
curl -X POST http://localhost:3000/api/documents/upload \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -F "file=@/caminho/para/documento.pdf"
```

**Resposta:**
```json
{
  "documentId": "clyyy67890",
  "filename": "documento.pdf",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "uploadedAt": "2024-09-25T10:30:00.000Z",
  "size": 1024000
}
```

### 3️⃣ Assinatura Digital

```bash
curl -X POST http://localhost:3000/api/documents/clyyy67890/sign-icp \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -F "certificate=@/caminho/para/certificado.p12" \\
  -F "certificatePassword=senha123" \\
  -F "hashAlgorithm=SHA-256"
```

**Resposta:**
```json
{
  "signatureId": "clzzz11111",
  "documentId": "clyyy67890",
  "certificateInfo": {
    "subject": "João Silva:12345678901",
    "issuer": "AC CERTISIGN RFB G5",
    "serialNumber": "123456789",
    "validity": {
      "notBefore": "2024-01-01T00:00:00.000Z",
      "notAfter": "2025-01-01T00:00:00.000Z"
    },
    "cpfCnpj": "12345678901"
  },
  "signedAt": "2024-09-25T10:35:00.000Z",
  "standard": "ICP-Brasil"
}
```

### 4️⃣ Verificação de Assinaturas

```bash
curl -X GET http://localhost:3000/api/documents/clyyy67890/verify \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta:**
```json
{
  "documentId": "clyyy67890",
  "documentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "totalSignatures": 1,
  "signatures": [
    {
      "signatureId": "clzzz11111",
      "certificateInfo": {
        "subject": "João Silva:12345678901",
        "issuer": "AC CERTISIGN RFB G5",
        "serialNumber": "123456789",
        "validity": {
          "notBefore": "2024-01-01T00:00:00.000Z",
          "notAfter": "2025-01-01T00:00:00.000Z"
        },
        "cpfCnpj": "12345678901"
      },
      "isValid": true,
      "validationDetails": {
        "chainValid": true,
        "notRevoked": true,
        "timeValid": true,
        "policyValid": true
      },
      "signedAt": "2024-09-25T10:35:00.000Z"
    }
  ]
}
```

### 5️⃣ Download do Documento Assinado

```bash
curl -X GET http://localhost:3000/api/documents/clyyy67890/download/signed \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -o documento_assinado.p7s
```

---

## 💻 Exemplos Práticos

### JavaScript (Node.js)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ICPBrasilAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(email, password) {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password
    });

    this.token = response.data.access_token;
    return response.data;
  }

  async uploadDocument(filePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      `${this.baseURL}/documents/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    return response.data;
  }

  async signDocument(documentId, certificatePath, password) {
    const form = new FormData();
    form.append('certificate', fs.createReadStream(certificatePath));
    form.append('certificatePassword', password);
    form.append('hashAlgorithm', 'SHA-256');

    const response = await axios.post(
      `${this.baseURL}/documents/${documentId}/sign-icp`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    return response.data;
  }

  async verifyDocument(documentId) {
    const response = await axios.get(
      `${this.baseURL}/documents/${documentId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    return response.data;
  }
}

// Exemplo de uso
async function exemplo() {
  const api = new ICPBrasilAPI();

  try {
    // 1. Login
    await api.login('admin@test.com', 'admin123');
    console.log('✅ Login realizado');

    // 2. Upload documento
    const upload = await api.uploadDocument('./documento.pdf');
    console.log('✅ Upload realizado:', upload.documentId);

    // 3. Assinar documento
    const signature = await api.signDocument(
      upload.documentId,
      './certificado.p12',
      'senha123'
    );
    console.log('✅ Documento assinado:', signature.signatureId);

    // 4. Verificar assinaturas
    const verification = await api.verifyDocument(upload.documentId);
    console.log('✅ Verificação:', verification.totalSignatures, 'assinaturas');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

exemplo();
```

### Python

```python
import requests
import json

class ICPBrasilAPI:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
        self.token = None

    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        response.raise_for_status()

        data = response.json()
        self.token = data['access_token']
        return data

    def upload_document(self, file_path):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            headers = {'Authorization': f'Bearer {self.token}'}

            response = requests.post(
                f'{self.base_url}/documents/upload',
                files=files,
                headers=headers
            )
            response.raise_for_status()
            return response.json()

    def sign_document(self, document_id, certificate_path, password):
        with open(certificate_path, 'rb') as f:
            files = {'certificate': f}
            data = {
                'certificatePassword': password,
                'hashAlgorithm': 'SHA-256'
            }
            headers = {'Authorization': f'Bearer {self.token}'}

            response = requests.post(
                f'{self.base_url}/documents/{document_id}/sign-icp',
                files=files,
                data=data,
                headers=headers
            )
            response.raise_for_status()
            return response.json()

    def verify_document(self, document_id):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(
            f'{self.base_url}/documents/{document_id}/verify',
            headers=headers
        )
        response.raise_for_status()
        return response.json()

# Exemplo de uso
def exemplo():
    api = ICPBrasilAPI()

    try:
        # 1. Login
        api.login('admin@test.com', 'admin123')
        print('✅ Login realizado')

        # 2. Upload documento
        upload = api.upload_document('./documento.pdf')
        print(f'✅ Upload realizado: {upload["documentId"]}')

        # 3. Assinar documento
        signature = api.sign_document(
            upload['documentId'],
            './certificado.p12',
            'senha123'
        )
        print(f'✅ Documento assinado: {signature["signatureId"]}')

        # 4. Verificar assinaturas
        verification = api.verify_document(upload['documentId'])
        print(f'✅ Verificação: {verification["totalSignatures"]} assinaturas')

    except requests.exceptions.RequestException as e:
        print(f'❌ Erro: {e.response.json() if e.response else e}')

exemplo()
```

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação.

### Headers Necessários

```
Authorization: Bearer {seu_token_jwt}
```

### Token Expiry

- **Padrão**: 24 horas
- **Configurável** via variável `JWT_EXPIRES_IN`

### Renovação

Atualmente não há endpoint de refresh. Faça login novamente quando o token expirar.

---

## ⚠️ Códigos de Erro

### HTTP Status Codes

| Código | Descrição | Ação |
|--------|-----------|------|
| `200` | Sucesso | ✅ |
| `201` | Criado com sucesso | ✅ |
| `400` | Dados inválidos | Verificar payload |
| `401` | Não autorizado | Fazer login / token inválido |
| `403` | Acesso negado | Verificar permissões |
| `404` | Não encontrado | Verificar ID do recurso |
| `413` | Arquivo muito grande | Max: 50MB |
| `429` | Rate limit excedido | Aguardar antes de nova tentativa |
| `500` | Erro interno | Contatar suporte |

### Erros Específicos de ICP-Brasil

```json
{
  "statusCode": 400,
  "message": "Certificado ICP-Brasil inválido",
  "error": "Bad Request",
  "details": {
    "code": "CERT_INVALID",
    "reason": "Certificado expirado"
  }
}
```

**Códigos de erro ICP-Brasil:**

- `CERT_INVALID`: Certificado inválido
- `CERT_EXPIRED`: Certificado expirado
- `CERT_REVOKED`: Certificado revogado
- `CHAIN_INVALID`: Cadeia de certificação inválida
- `SIGNATURE_INVALID`: Assinatura inválida
- `CRL_UNAVAILABLE`: Lista de revogação indisponível

---

## 🔧 Troubleshooting

### Problema: "Token inválido"

**Solução:**
1. Verificar se o token não expirou
2. Confirmar formato do header: `Authorization: Bearer {token}`
3. Fazer novo login

### Problema: "Certificado ICP-Brasil inválido"

**Possíveis causas:**
1. Certificado expirado
2. Senha incorreta
3. Arquivo corrompido
4. Não é certificado ICP-Brasil

**Solução:**
```bash
# Verificar certificado com OpenSSL
openssl pkcs12 -info -in certificado.p12 -passin pass:sua_senha
```

### Problema: Upload falha

**Verificar:**
1. Tamanho do arquivo (máx 50MB)
2. Formato suportado (PDF, DOC, TXT)
3. Permissões de arquivo

### Problema: API não responde

**Debug:**
```bash
# Verificar status dos containers
docker-compose ps

# Verificar logs da API
docker-compose logs api

# Verificar logs do Nginx
docker-compose logs nginx

# Verificar conexão com banco
docker-compose logs postgres
```

---

## 🧪 Scripts de Teste

### Teste Completo (Bash)

```bash
#!/bin/bash

# Configurações
API_BASE="http://localhost:3000/api"
EMAIL="admin@test.com"
PASSWORD="admin123"
DOCUMENT_PATH="./test-document.pdf"
CERTIFICATE_PATH="./test-certificate.p12"
CERT_PASSWORD="test123"

# Cores para output
GREEN='\\033[0;32m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

echo "🚀 Iniciando teste completo da API ICP-Brasil..."

# 1. Login
echo "1️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \\
  -H "Content-Type: application/json" \\
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Erro no login${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"

# 2. Upload documento
echo "2️⃣ Fazendo upload do documento..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/documents/upload" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@$DOCUMENT_PATH")

DOCUMENT_ID=$(echo $UPLOAD_RESPONSE | jq -r '.documentId')

if [ "$DOCUMENT_ID" = "null" ]; then
  echo -e "${RED}❌ Erro no upload${NC}"
  echo $UPLOAD_RESPONSE
  exit 1
fi

echo -e "${GREEN}✅ Upload realizado: $DOCUMENT_ID${NC}"

# 3. Assinatura
echo "3️⃣ Assinando documento..."
SIGN_RESPONSE=$(curl -s -X POST "$API_BASE/documents/$DOCUMENT_ID/sign-icp" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "certificate=@$CERTIFICATE_PATH" \\
  -F "certificatePassword=$CERT_PASSWORD" \\
  -F "hashAlgorithm=SHA-256")

SIGNATURE_ID=$(echo $SIGN_RESPONSE | jq -r '.signatureId')

if [ "$SIGNATURE_ID" = "null" ]; then
  echo -e "${RED}❌ Erro na assinatura${NC}"
  echo $SIGN_RESPONSE
  exit 1
fi

echo -e "${GREEN}✅ Documento assinado: $SIGNATURE_ID${NC}"

# 4. Verificação
echo "4️⃣ Verificando assinaturas..."
VERIFY_RESPONSE=$(curl -s -X GET "$API_BASE/documents/$DOCUMENT_ID/verify" \\
  -H "Authorization: Bearer $TOKEN")

TOTAL_SIGNATURES=$(echo $VERIFY_RESPONSE | jq -r '.totalSignatures')

if [ "$TOTAL_SIGNATURES" = "null" ]; then
  echo -e "${RED}❌ Erro na verificação${NC}"
  echo $VERIFY_RESPONSE
  exit 1
fi

echo -e "${GREEN}✅ Verificação concluída: $TOTAL_SIGNATURES assinatura(s)${NC}"

# 5. Download
echo "5️⃣ Fazendo download do documento assinado..."
curl -s -X GET "$API_BASE/documents/$DOCUMENT_ID/download/signed" \\
  -H "Authorization: Bearer $TOKEN" \\
  -o "documento_assinado_$DOCUMENT_ID.p7s"

if [ -f "documento_assinado_$DOCUMENT_ID.p7s" ]; then
  echo -e "${GREEN}✅ Download realizado: documento_assinado_$DOCUMENT_ID.p7s${NC}"
else
  echo -e "${RED}❌ Erro no download${NC}"
  exit 1
fi

echo ""
echo "🎉 Teste completo finalizado com sucesso!"
echo "📄 Documento ID: $DOCUMENT_ID"
echo "🔏 Assinatura ID: $SIGNATURE_ID"
echo "📥 Arquivo baixado: documento_assinado_$DOCUMENT_ID.p7s"
```

### Health Check Script

```bash
#!/bin/bash

# Health check da API
echo "🔍 Verificando status da API..."

# Função para verificar serviço
check_service() {
  local name=$1
  local url=$2

  if curl -s --max-time 10 "$url" > /dev/null; then
    echo "✅ $name: OK"
    return 0
  else
    echo "❌ $name: Falhou"
    return 1
  fi
}

# Verificar serviços
check_service "API Principal" "http://localhost:3000/api/health"
check_service "Documentação" "http://localhost:3000/api/docs"
check_service "PostgreSQL" "http://localhost:5432" || echo "⚠️  PostgreSQL: Use 'docker-compose ps' para verificar"
check_service "pgAdmin" "http://localhost:8080"

echo ""
echo "🐳 Status dos containers:"
docker-compose ps
```

---

## 📚 Recursos Adicionais

### Documentação Swagger
- **URL**: `http://localhost:3000/api/docs` (desenvolvimento)
- **Descrição**: Interface interativa para testar todos os endpoints

### pgAdmin
- **URL**: `http://localhost:8080` (desenvolvimento)
- **Usuário**: `admin@dev.local`
- **Senha**: `admin123`

### Logs da Aplicação
```bash
# Logs em tempo real
docker-compose logs -f api

# Logs do Nginx
docker-compose logs -f nginx

# Todos os logs
docker-compose logs -f
```

### Backup do Banco de Dados
```bash
# Backup
docker exec icp-brasil-postgres-dev pg_dump -U postgres icp_signatures > backup.sql

# Restore
docker exec -i icp-brasil-postgres-dev psql -U postgres icp_signatures < backup.sql
```

---

## 🤝 Suporte

- **Documentação**: Swagger UI em `/api/docs`
- **Logs**: `docker-compose logs -f`
- **Issues**: Abra uma issue no repositório

---

**🎉 Pronto! Sua API de Assinatura Digital ICP-Brasil está configurada e documentada.**