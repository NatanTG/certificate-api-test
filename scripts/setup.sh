#!/bin/bash

# Script de configuração da API ICP-Brasil
# Execute este script para configurar rapidamente o ambiente

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
 _____ _____ ____      ____                _ _
|_   _/ ____|  _ \    |  _ \              (_) |
  | || |    | |_) |___| |_) |_ __ __ _ ___ _| |
  | || |    |  _ <_____|  _ <| '__/ _` / __| | |
 _| || |____| |_) |    | |_) | | | (_| \__ \ | |
|_____\_____|____/     |____/|_|  \__,_|___/_|_|

🔐 API de Assinatura Digital ICP-Brasil
EOF
echo -e "${NC}"

print_status "Iniciando configuração do ambiente..."

# Verificar pré-requisitos
print_status "Verificando pré-requisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker não encontrado. Instale o Docker antes de continuar."
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não encontrado. Instale o Docker Compose antes de continuar."
    exit 1
fi

# Verificar Node.js (para desenvolvimento)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js encontrado: $NODE_VERSION"
else
    print_warning "Node.js não encontrado. Necessário para desenvolvimento local."
fi

print_success "Pré-requisitos verificados!"

# Escolher modo de instalação
echo ""
echo "Escolha o modo de instalação:"
echo "1) Desenvolvimento (API local + Docker para serviços)"
echo "2) Produção (Tudo via Docker)"
echo "3) Apenas serviços (PostgreSQL, pgAdmin, Redis)"
echo -n "Digite sua escolha (1-3): "
read -r INSTALL_MODE

# Configurar variáveis de ambiente
print_status "Configurando variáveis de ambiente..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Arquivo .env criado a partir do .env.example"
else
    print_warning "Arquivo .env já existe. Mantendo configurações atuais."
fi

# Gerar JWT_SECRET se não existir
if ! grep -q "JWT_SECRET=sua_chave_jwt_super_secreta_aqui_mude_em_producao" .env; then
    NEW_JWT_SECRET=$(openssl rand -base64 64 | tr -d "\\n")
    sed -i "s/JWT_SECRET=sua_chave_jwt_super_secreta_aqui_mude_em_producao/JWT_SECRET=$NEW_JWT_SECRET/" .env
    print_success "JWT_SECRET gerado automaticamente"
fi

# Função para executar modo desenvolvimento
setup_development() {
    print_status "Configurando ambiente de desenvolvimento..."

    # Subir apenas os serviços de infraestrutura
    print_status "Subindo serviços Docker (PostgreSQL, pgAdmin, Redis)..."
    docker-compose up -d

    # Aguardar PostgreSQL ficar pronto
    print_status "Aguardando PostgreSQL ficar disponível..."
    sleep 10

    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        print_status "Instalando dependências npm..."
        npm install
    fi

    # Executar Prisma setup
    print_status "Configurando banco de dados..."
    npx prisma generate
    npx prisma db push

    # Executar seed se o arquivo existir
    if [ -f "prisma/seed.ts" ] || [ -f "scripts/seed.js" ]; then
        print_status "Executando seed do banco de dados..."
        npm run db:seed 2>/dev/null || print_warning "Seed não executado (comando não encontrado)"
    fi

    print_success "Ambiente de desenvolvimento configurado!"
    echo ""
    echo "Para iniciar a API em desenvolvimento:"
    echo "  npm run start:dev"
    echo ""
    echo "URLs disponíveis:"
    echo "  - API: http://localhost:3000"
    echo "  - Documentação: http://localhost:3000/api/docs"
    echo "  - pgAdmin: http://localhost:8080 (admin@dev.local / admin123)"
}

# Função para executar modo produção
setup_production() {
    print_status "Configurando ambiente de produção..."

    # Criar .env.prod se não existir
    if [ ! -f ".env.prod" ]; then
        cp .env.example .env.prod
        print_status "Arquivo .env.prod criado. Configure as variáveis de produção!"
    fi

    # Build e subir todos os serviços
    print_status "Fazendo build e subindo todos os serviços..."
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

    # Aguardar serviços ficarem prontos
    print_status "Aguardando serviços ficarem disponíveis..."
    sleep 30

    # Executar migrations via container
    print_status "Executando migrations do banco de dados..."
    docker exec icp-brasil-api npx prisma db push

    # Executar seed via container
    print_status "Executando seed do banco de dados..."
    docker exec icp-brasil-api npm run db:seed 2>/dev/null || print_warning "Seed não executado"

    print_success "Ambiente de produção configurado!"
    echo ""
    echo "URLs disponíveis:"
    echo "  - API: http://localhost"
    echo "  - Documentação: http://localhost/api/docs"
    echo "  - pgAdmin: http://localhost/pgadmin"
}

# Função para executar apenas serviços
setup_services() {
    print_status "Subindo apenas serviços de infraestrutura..."
    docker-compose up -d postgres pgadmin redis

    print_success "Serviços configurados!"
    echo ""
    echo "Serviços disponíveis:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - pgAdmin: http://localhost:8080"
    echo "  - Redis: localhost:6379"
}

# Executar modo selecionado
case $INSTALL_MODE in
    1)
        setup_development
        ;;
    2)
        setup_production
        ;;
    3)
        setup_services
        ;;
    *)
        print_error "Opção inválida. Execute o script novamente."
        exit 1
        ;;
esac

# Criar diretórios necessários
print_status "Criando diretórios necessários..."
mkdir -p uploads temp logs ssl examples

print_success "Diretórios criados!"

# Status final
echo ""
print_status "Verificando status dos serviços..."
docker-compose ps

echo ""
print_success "🎉 Configuração concluída com sucesso!"
echo ""
print_status "Comandos úteis:"
echo "  docker-compose ps                    # Ver status dos serviços"
echo "  docker-compose logs -f               # Ver logs em tempo real"
echo "  docker-compose logs -f api           # Ver logs da API"
echo "  docker-compose down                  # Parar todos os serviços"
echo "  docker-compose up -d                 # Subir serviços novamente"
echo ""
print_status "Para mais informações, consulte:"
echo "  - README.md"
echo "  - API-USAGE.md"
echo "  - Documentação Swagger: http://localhost:3000/api/docs"