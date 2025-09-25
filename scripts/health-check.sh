#!/bin/bash

# Script de health check da API ICP-Brasil
# Verifica o status de todos os serviços e componentes

set -e

# Configurações
API_BASE="${API_BASE:-http://localhost:3000/api}"
TIMEOUT=10

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para imprimir com cores
print_header() {
    echo -e "${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..40})"
}

print_check() {
    echo -n "Verificando $1... "
}

print_ok() {
    echo -e "${GREEN}✅ OK${NC}"
}

print_fail() {
    echo -e "${RED}❌ FALHOU${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para verificar URL
check_url() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    print_check "$name"

    if response=$(curl -s --max-time $TIMEOUT -w "%{http_code}" -o /dev/null "$url" 2>/dev/null); then
        if [ "$response" -eq "$expected_status" ]; then
            print_ok
            return 0
        else
            print_fail
            echo "  Status: $response (esperado: $expected_status)"
            return 1
        fi
    else
        print_fail
        echo "  Erro: Não foi possível conectar"
        return 1
    fi
}

# Função para verificar container Docker
check_container() {
    local name=$1
    local container_name=$2

    print_check "$name"

    if docker ps --format "table {{.Names}}" | grep -q "^$container_name$" 2>/dev/null; then
        status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
        if [ "$status" = "running" ]; then
            print_ok
            return 0
        else
            print_fail
            echo "  Status: $status"
            return 1
        fi
    else
        print_fail
        echo "  Container não encontrado ou não está rodando"
        return 1
    fi
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
🏥 Health Check - API ICP-Brasil
================================
EOF
echo -e "${NC}"

# 1. Verificar serviços HTTP/HTTPS
print_header "🌐 Serviços Web"

# API Principal
check_url "API Principal" "$API_BASE/health" || api_failed=1

# Documentação Swagger
check_url "Documentação Swagger" "$(echo $API_BASE | sed 's|/api||')/api/docs" || docs_failed=1

# pgAdmin (desenvolvimento)
if curl -s --max-time 5 "http://localhost:8080" > /dev/null 2>&1; then
    check_url "pgAdmin (Dev)" "http://localhost:8080" 200
elif curl -s --max-time 5 "http://localhost/pgadmin" > /dev/null 2>&1; then
    check_url "pgAdmin (Prod)" "http://localhost/pgadmin" 200
else
    print_check "pgAdmin"
    print_warning "Não disponível (normal se não estiver configurado)"
fi

echo ""

# 2. Verificar containers Docker
print_header "🐳 Containers Docker"

if command -v docker &> /dev/null; then
    # Verificar containers comuns
    containers=(
        "API:icp-brasil-api"
        "PostgreSQL (Dev):icp-brasil-postgres-dev"
        "PostgreSQL (Prod):icp-brasil-postgres"
        "Nginx:icp-brasil-nginx"
        "Redis (Dev):icp-brasil-redis-dev"
        "Redis (Prod):icp-brasil-redis"
    )

    for container in "${containers[@]}"; do
        name=$(echo "$container" | cut -d: -f1)
        container_name=$(echo "$container" | cut -d: -f2)

        if docker ps --format "table {{.Names}}" | grep -q "^$container_name$" 2>/dev/null; then
            check_container "$name" "$container_name"
        fi
    done

    # Listar todos os containers relacionados ao projeto
    echo ""
    print_info "Containers do projeto em execução:"
    if docker ps --filter "name=icp-brasil" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tail -n +2 | grep -q .; then
        docker ps --filter "name=icp-brasil" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "  Nenhum container do projeto em execução"
    fi
else
    print_warning "Docker não encontrado - pulando verificação de containers"
fi

echo ""

# 3. Verificar conectividade de banco de dados
print_header "🗄️  Conectividade de Banco"

# PostgreSQL (porta 5432)
print_check "PostgreSQL (5432)"
if nc -z localhost 5432 2>/dev/null; then
    print_ok
else
    print_fail
    echo "  PostgreSQL não está acessível na porta 5432"
fi

# Redis (porta 6379)
print_check "Redis (6379)"
if nc -z localhost 6379 2>/dev/null; then
    print_ok
else
    print_warning "Redis não está acessível na porta 6379 (opcional)"
fi

echo ""

# 4. Verificar funcionalidades da API
print_header "🔧 Funcionalidades da API"

if [ -z "${api_failed:-}" ]; then
    # Endpoint de documentação OpenAPI
    print_check "OpenAPI/Swagger JSON"
    check_url "OpenAPI Spec" "$(echo $API_BASE | sed 's|/api||')/api/docs-json" || swagger_failed=1

    # Endpoint de health específico (se existir)
    print_check "Health Endpoint"
    if response=$(curl -s --max-time $TIMEOUT "$API_BASE/health" 2>/dev/null); then
        if echo "$response" | grep -q "healthy\|ok\|up" 2>/dev/null; then
            print_ok
        else
            print_warning "Resposta inesperada: $response"
        fi
    else
        print_warning "Health endpoint não disponível"
    fi

    # Verificar autenticação (deve dar 401)
    print_check "Autenticação (endpoint protegido)"
    if response=$(curl -s -w "%{http_code}" -o /dev/null "$API_BASE/users/my-documents" 2>/dev/null); then
        if [ "$response" -eq 401 ]; then
            print_ok
        else
            print_warning "Status inesperado: $response (esperado: 401)"
        fi
    else
        print_fail
        echo "  Erro na requisição"
    fi
else
    print_warning "API não disponível - pulando testes funcionais"
fi

echo ""

# 5. Verificar arquivos e diretórios importantes
print_header "📁 Arquivos e Diretórios"

important_paths=(
    ".env:Arquivo de configuração"
    "uploads:Diretório de uploads"
    "temp:Diretório temporário"
    "logs:Diretório de logs"
    "docker-compose.yml:Docker Compose (dev)"
    "docker-compose.prod.yml:Docker Compose (prod)"
    "Dockerfile:Dockerfile da API"
)

for path_info in "${important_paths[@]}"; do
    path=$(echo "$path_info" | cut -d: -f1)
    description=$(echo "$path_info" | cut -d: -f2)

    print_check "$description"
    if [ -e "$path" ]; then
        print_ok
    else
        print_warning "Não encontrado: $path"
    fi
done

echo ""

# 6. Informações do sistema
print_header "💻 Informações do Sistema"

print_info "Data/Hora: $(date)"
print_info "Uptime: $(uptime -p 2>/dev/null || echo "N/A")"

if command -v docker &> /dev/null; then
    print_info "Docker: $(docker --version | cut -d' ' -f3)"
fi

if command -v docker-compose &> /dev/null; then
    print_info "Docker Compose: $(docker-compose --version | cut -d' ' -f3)"
fi

if command -v node &> /dev/null; then
    print_info "Node.js: $(node --version)"
fi

# Uso de disco (diretórios importantes)
if command -v du &> /dev/null; then
    echo ""
    print_info "Uso de espaço em disco:"
    for dir in uploads logs temp; do
        if [ -d "$dir" ]; then
            size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            echo "  $dir: $size"
        fi
    done
fi

echo ""

# Resumo final
print_header "📊 Resumo"

# Contar sucessos e falhas
total_checks=0
failed_checks=0

if [ -n "${api_failed:-}" ]; then
    failed_checks=$((failed_checks + 1))
fi

if [ -n "${docs_failed:-}" ]; then
    failed_checks=$((failed_checks + 1))
fi

if [ -n "${swagger_failed:-}" ]; then
    failed_checks=$((failed_checks + 1))
fi

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os serviços principais estão funcionando!${NC}"
    exit_code=0
else
    echo -e "${RED}❌ Encontrados $failed_checks problema(s)${NC}"
    exit_code=1
fi

echo ""
print_info "Comandos úteis para diagnóstico:"
echo "  docker-compose ps                  # Status dos containers"
echo "  docker-compose logs -f api         # Logs da API"
echo "  docker-compose logs -f nginx       # Logs do Nginx"
echo "  curl $API_BASE/health              # Testar API diretamente"
echo ""
print_info "Para mais informações:"
echo "  ./scripts/test-api.sh              # Teste completo da API"
echo "  ./scripts/setup.sh                 # Reconfigurar ambiente"

exit $exit_code