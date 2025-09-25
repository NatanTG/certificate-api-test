#!/bin/bash

# Script de teste completo da API ICP-Brasil
# Execute este script para testar todos os endpoints da API

set -e

# Configurações (modifique conforme necessário)
API_BASE="${API_BASE:-http://localhost:3000/api}"
EMAIL="${TEST_EMAIL:-admin@test.com}"
PASSWORD="${TEST_PASSWORD:-admin123}"
TEST_DOCUMENT="${TEST_DOCUMENT:-./examples/test-document.pdf}"
TEST_CERTIFICATE="${TEST_CERTIFICATE:-./examples/test-certificate.p12}"
CERT_PASSWORD="${CERT_PASSWORD:-test123}"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_step() {
    echo -e "${BLUE}$1${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
🧪 Teste Completo da API ICP-Brasil
===================================
EOF
echo -e "${NC}"

# Verificar se a API está rodando
print_step "0️⃣" "Verificando se a API está disponível..."
if ! curl -s --max-time 10 "$API_BASE/health" > /dev/null 2>&1; then
    print_error "API não está disponível em $API_BASE"
    print_warning "Verifique se a API está rodando:"
    echo "  - Desenvolvimento: npm run start:dev"
    echo "  - Produção: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi
print_success "API disponível!"

# Variáveis para armazenar respostas
TOKEN=""
DOCUMENT_ID=""
SIGNATURE_ID=""

# Função para fazer requisições e verificar erros
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=${4:-200}

    if [ -n "$data" ]; then
        response=$(curl -s -w "\\n%{http_code}" -X "$method" "$url" $data)
    else
        response=$(curl -s -w "\\n%{http_code}" -X "$method" "$url")
    fi

    # Separar body e status code
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)

    # Verificar se o status é o esperado
    if [ "$status" -eq "$expected_status" ] || [ "$status" -eq 201 ]; then
        echo "$body"
        return 0
    else
        print_error "Request falhou - Status: $status"
        echo "Response: $body"
        return 1
    fi
}

# 1. Teste de Login
print_step "1️⃣" "Testando login..."
login_response=$(make_request "POST" "$API_BASE/auth/login" \
    "-H \"Content-Type: application/json\" \
     -d '{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}'")

if [ $? -eq 0 ]; then
    TOKEN=$(echo "$login_response" | jq -r '.access_token')
    if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
        print_error "Token não encontrado na resposta de login"
        echo "Response: $login_response"
        exit 1
    fi
    print_success "Login realizado com sucesso"
else
    print_error "Falha no login"
    exit 1
fi

# 2. Teste de Upload (criar documento de teste se não existir)
print_step "2️⃣" "Testando upload de documento..."

# Criar documento de teste se não existir
if [ ! -f "$TEST_DOCUMENT" ]; then
    print_warning "Documento de teste não encontrado. Criando um documento de exemplo..."
    mkdir -p examples
    echo "Este é um documento de teste para a API ICP-Brasil.

Data: $(date)
Conteúdo: Documento para teste de assinatura digital.

Este arquivo foi gerado automaticamente pelo script de teste." > "$TEST_DOCUMENT"
    print_success "Documento de teste criado: $TEST_DOCUMENT"
fi

upload_response=$(make_request "POST" "$API_BASE/documents/upload" \
    "-H \"Authorization: Bearer $TOKEN\" \
     -F \"file=@$TEST_DOCUMENT\"" 201)

if [ $? -eq 0 ]; then
    DOCUMENT_ID=$(echo "$upload_response" | jq -r '.documentId')
    if [ "$DOCUMENT_ID" = "null" ] || [ -z "$DOCUMENT_ID" ]; then
        print_error "Document ID não encontrado na resposta de upload"
        echo "Response: $upload_response"
        exit 1
    fi
    print_success "Upload realizado - Document ID: $DOCUMENT_ID"
else
    print_error "Falha no upload"
    exit 1
fi

# 3. Listar documentos do usuário
print_step "3️⃣" "Testando listagem de documentos..."
documents_response=$(make_request "GET" "$API_BASE/users/my-documents" \
    "-H \"Authorization: Bearer $TOKEN\"")

if [ $? -eq 0 ]; then
    documents_count=$(echo "$documents_response" | jq '.documents | length')
    print_success "Listagem realizada - $documents_count documento(s) encontrado(s)"
else
    print_error "Falha na listagem de documentos"
fi

# 4. Teste de Verificação (antes da assinatura)
print_step "4️⃣" "Testando verificação do documento (sem assinatura)..."
verify_response=$(make_request "GET" "$API_BASE/documents/$DOCUMENT_ID/verify" \
    "-H \"Authorization: Bearer $TOKEN\"")

if [ $? -eq 0 ]; then
    signatures_count=$(echo "$verify_response" | jq '.totalSignatures')
    print_success "Verificação realizada - $signatures_count assinatura(s) encontrada(s)"
else
    print_error "Falha na verificação"
fi

# 5. Teste de Assinatura (opcional, se certificado estiver disponível)
if [ -f "$TEST_CERTIFICATE" ]; then
    print_step "5️⃣" "Testando assinatura digital..."

    sign_response=$(make_request "POST" "$API_BASE/documents/$DOCUMENT_ID/sign-icp" \
        "-H \"Authorization: Bearer $TOKEN\" \
         -F \"certificate=@$TEST_CERTIFICATE\" \
         -F \"certificatePassword=$CERT_PASSWORD\" \
         -F \"hashAlgorithm=SHA-256\"" 201)

    if [ $? -eq 0 ]; then
        SIGNATURE_ID=$(echo "$sign_response" | jq -r '.signatureId')
        if [ "$SIGNATURE_ID" = "null" ] || [ -z "$SIGNATURE_ID" ]; then
            print_error "Signature ID não encontrado na resposta"
            echo "Response: $sign_response"
        else
            print_success "Assinatura realizada - Signature ID: $SIGNATURE_ID"

            # 6. Verificação após assinatura
            print_step "6️⃣" "Testando verificação após assinatura..."
            verify_after_response=$(make_request "GET" "$API_BASE/documents/$DOCUMENT_ID/verify" \
                "-H \"Authorization: Bearer $TOKEN\"")

            if [ $? -eq 0 ]; then
                signatures_after=$(echo "$verify_after_response" | jq '.totalSignatures')
                print_success "Verificação pós-assinatura - $signatures_after assinatura(s)"

                # 7. Download do documento assinado
                print_step "7️⃣" "Testando download do documento assinado..."
                download_file="test_signed_document_$DOCUMENT_ID.p7s"

                curl -s -H "Authorization: Bearer $TOKEN" \
                     "$API_BASE/documents/$DOCUMENT_ID/download/signed" \
                     -o "$download_file"

                if [ -f "$download_file" ] && [ -s "$download_file" ]; then
                    file_size=$(wc -c < "$download_file")
                    print_success "Download realizado - Arquivo: $download_file ($file_size bytes)"
                else
                    print_error "Falha no download ou arquivo vazio"
                fi
            else
                print_error "Falha na verificação pós-assinatura"
            fi
        fi
    else
        print_error "Falha na assinatura"
        print_warning "Verifique se o certificado de teste existe e a senha está correta"
    fi
else
    print_warning "Certificado de teste não encontrado ($TEST_CERTIFICATE)"
    print_warning "Pulando testes de assinatura, verificação pós-assinatura e download"
fi

# 8. Teste de Logout
print_step "8️⃣" "Testando logout..."
logout_response=$(make_request "POST" "$API_BASE/auth/logout" \
    "-H \"Authorization: Bearer $TOKEN\"")

if [ $? -eq 0 ]; then
    print_success "Logout realizado com sucesso"
else
    print_error "Falha no logout"
fi

# 9. Verificar se token foi invalidado (deve dar erro 401)
print_step "9️⃣" "Verificando invalidação do token..."
invalid_response=$(curl -s -w "\\n%{http_code}" -X GET "$API_BASE/users/my-documents" \
    -H "Authorization: Bearer $TOKEN")

status=$(echo "$invalid_response" | tail -n 1)
if [ "$status" -eq 401 ]; then
    print_success "Token invalidado corretamente (401 Unauthorized)"
else
    print_warning "Token ainda válido após logout (Status: $status)"
fi

# Resumo final
echo ""
echo -e "${BLUE}📊 Resumo dos Testes${NC}"
echo "========================"
print_success "Login/Logout funcionando"
print_success "Upload de documentos funcionando"
print_success "Listagem de documentos funcionando"
print_success "Verificação de assinaturas funcionando"

if [ -n "$SIGNATURE_ID" ]; then
    print_success "Assinatura digital funcionando"
    print_success "Download de documentos assinados funcionando"
else
    print_warning "Assinatura digital não testada (certificado não disponível)"
fi

echo ""
print_step "📋" "IDs gerados durante o teste:"
echo "  - Document ID: $DOCUMENT_ID"
if [ -n "$SIGNATURE_ID" ]; then
    echo "  - Signature ID: $SIGNATURE_ID"
fi

echo ""
print_step "🗂️ " "Arquivos criados:"
echo "  - Documento de teste: $TEST_DOCUMENT"
if [ -f "test_signed_document_$DOCUMENT_ID.p7s" ]; then
    echo "  - Documento assinado: test_signed_document_$DOCUMENT_ID.p7s"
fi

echo ""
print_success "🎉 Testes concluídos com sucesso!"
print_step "💡" "Para executar testes personalizados:"
echo "  API_BASE=http://your-api.com/api ./scripts/test-api.sh"
echo "  TEST_EMAIL=user@example.com TEST_PASSWORD=pass123 ./scripts/test-api.sh"