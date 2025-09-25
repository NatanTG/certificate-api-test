# Makefile para API ICP-Brasil
# Comandos úteis para desenvolvimento e produção

# Cores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Variáveis
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.prod.yml

.PHONY: help setup dev prod test clean logs status health backup restore

# Comando padrão
help: ## Mostrar ajuda
	@echo "$(BLUE)🔐 API de Assinatura Digital ICP-Brasil$(NC)"
	@echo "======================================"
	@echo ""
	@echo "$(YELLOW)Comandos disponíveis:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Exemplos:$(NC)"
	@echo "  make setup          # Configuração inicial completa"
	@echo "  make dev            # Ambiente de desenvolvimento"
	@echo "  make prod           # Ambiente de produção"
	@echo "  make logs           # Ver logs em tempo real"
	@echo "  make test           # Executar testes da API"

setup: ## Configuração inicial completa
	@echo "$(BLUE)🚀 Configurando ambiente...$(NC)"
	@chmod +x scripts/*.sh
	@./scripts/setup.sh

dev: ## Iniciar ambiente de desenvolvimento
	@echo "$(BLUE)🔧 Iniciando ambiente de desenvolvimento...$(NC)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Serviços iniciados!$(NC)"
	@echo ""
	@echo "$(YELLOW)URLs disponíveis:$(NC)"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - pgAdmin: http://localhost:8080"
	@echo "  - Redis: localhost:6379"
	@echo ""
	@echo "$(YELLOW)Para iniciar a API:$(NC)"
	@echo "  npm run start:dev"

dev-full: ## Iniciar desenvolvimento com API
	@echo "$(BLUE)🔧 Iniciando desenvolvimento completo...$(NC)"
	@$(DOCKER_COMPOSE) up -d
	@sleep 5
	@echo "$(YELLOW)Instalando dependências...$(NC)"
	@npm install
	@echo "$(YELLOW)Configurando banco de dados...$(NC)"
	@npx prisma generate
	@npx prisma db push
	@echo "$(YELLOW)Executando seed...$(NC)"
	@npm run db:seed || true
	@echo "$(GREEN)✅ Desenvolvimento pronto!$(NC)"
	@echo ""
	@echo "$(YELLOW)Iniciar API:$(NC) npm run start:dev"

prod: ## Iniciar ambiente de produção
	@echo "$(BLUE)🚀 Iniciando ambiente de produção...$(NC)"
	@$(DOCKER_COMPOSE_PROD) up -d --build
	@echo "$(YELLOW)Aguardando serviços ficarem prontos...$(NC)"
	@sleep 30
	@echo "$(YELLOW)Configurando banco de dados...$(NC)"
	@docker exec icp-brasil-api npx prisma db push || true
	@docker exec icp-brasil-api npm run db:seed || true
	@echo "$(GREEN)✅ Produção iniciada!$(NC)"
	@echo ""
	@echo "$(YELLOW)URLs disponíveis:$(NC)"
	@echo "  - API: http://localhost"
	@echo "  - Documentação: http://localhost/api/docs"
	@echo "  - pgAdmin: http://localhost/pgadmin"

stop: ## Parar todos os serviços
	@echo "$(YELLOW)🛑 Parando serviços...$(NC)"
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE_PROD) down 2>/dev/null || true
	@echo "$(GREEN)✅ Serviços parados$(NC)"

restart: ## Reiniciar serviços
	@echo "$(YELLOW)🔄 Reiniciando serviços...$(NC)"
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Serviços reiniciados$(NC)"

restart-prod: ## Reiniciar produção
	@echo "$(YELLOW)🔄 Reiniciando produção...$(NC)"
	@$(DOCKER_COMPOSE_PROD) down
	@$(DOCKER_COMPOSE_PROD) up -d
	@echo "$(GREEN)✅ Produção reiniciada$(NC)"

test: ## Executar testes da API
	@echo "$(BLUE)🧪 Executando testes da API...$(NC)"
	@chmod +x scripts/test-api.sh
	@./scripts/test-api.sh

test-simple: ## Executar teste simples
	@echo "$(BLUE)🧪 Executando teste simples...$(NC)"
	@chmod +x scripts/test-api.sh
	@API_BASE=http://localhost:3000/api ./scripts/test-api.sh --simple || true

health: ## Verificar saúde dos serviços
	@echo "$(BLUE)🏥 Verificando saúde dos serviços...$(NC)"
	@chmod +x scripts/health-check.sh
	@./scripts/health-check.sh

logs: ## Ver logs em tempo real
	@echo "$(BLUE)📋 Logs em tempo real (Ctrl+C para sair)...$(NC)"
	@$(DOCKER_COMPOSE) logs -f

logs-api: ## Ver logs da API
	@echo "$(BLUE)📋 Logs da API...$(NC)"
	@$(DOCKER_COMPOSE) logs -f api 2>/dev/null || docker logs -f icp-brasil-api 2>/dev/null || echo "$(RED)API não encontrada$(NC)"

logs-nginx: ## Ver logs do Nginx
	@echo "$(BLUE)📋 Logs do Nginx...$(NC)"
	@$(DOCKER_COMPOSE_PROD) logs -f nginx 2>/dev/null || echo "$(RED)Nginx não encontrado$(NC)"

logs-postgres: ## Ver logs do PostgreSQL
	@echo "$(BLUE)📋 Logs do PostgreSQL...$(NC)"
	@$(DOCKER_COMPOSE) logs -f postgres 2>/dev/null || echo "$(RED)PostgreSQL não encontrado$(NC)"

status: ## Ver status dos serviços
	@echo "$(BLUE)📊 Status dos serviços:$(NC)"
	@echo ""
	@echo "$(YELLOW)Desenvolvimento:$(NC)"
	@$(DOCKER_COMPOSE) ps || true
	@echo ""
	@echo "$(YELLOW)Produção:$(NC)"
	@$(DOCKER_COMPOSE_PROD) ps || true

clean: ## Limpar containers e volumes
	@echo "$(YELLOW)🧹 Limpando containers e volumes...$(NC)"
	@$(DOCKER_COMPOSE) down -v
	@$(DOCKER_COMPOSE_PROD) down -v 2>/dev/null || true
	@docker system prune -f
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

clean-all: ## Limpeza completa (CUIDADO: remove tudo!)
	@echo "$(RED)⚠️  ATENÇÃO: Isso vai remover TODOS os dados!$(NC)"
	@echo "$(YELLOW)Pressione Ctrl+C nos próximos 10 segundos para cancelar...$(NC)"
	@sleep 10
	@echo "$(YELLOW)🧹 Fazendo limpeza completa...$(NC)"
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@$(DOCKER_COMPOSE_PROD) down -v --remove-orphans 2>/dev/null || true
	@docker system prune -af --volumes
	@sudo rm -rf uploads/* temp/* logs/* 2>/dev/null || true
	@echo "$(GREEN)✅ Limpeza completa finalizada$(NC)"

backup: ## Fazer backup do banco de dados
	@echo "$(BLUE)💾 Fazendo backup do banco de dados...$(NC)"
	@mkdir -p backups
	@docker exec $$(docker ps -qf "name=postgres") pg_dump -U postgres icp_signatures > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup salvo em backups/$(NC)"

restore: ## Restaurar backup do banco (USE: make restore FILE=backup.sql)
	@echo "$(BLUE)📥 Restaurando backup do banco de dados...$(NC)"
	@if [ -z "$(FILE)" ]; then echo "$(RED)❌ Use: make restore FILE=backup.sql$(NC)"; exit 1; fi
	@if [ ! -f "$(FILE)" ]; then echo "$(RED)❌ Arquivo $(FILE) não encontrado$(NC)"; exit 1; fi
	@docker exec -i $$(docker ps -qf "name=postgres") psql -U postgres icp_signatures < $(FILE)
	@echo "$(GREEN)✅ Backup restaurado$(NC)"

build: ## Build da imagem Docker
	@echo "$(BLUE)🏗️  Fazendo build da imagem...$(NC)"
	@docker build -t icp-brasil-api .
	@echo "$(GREEN)✅ Build concluído$(NC)"

install: ## Instalar dependências
	@echo "$(BLUE)📦 Instalando dependências...$(NC)"
	@npm install
	@echo "$(GREEN)✅ Dependências instaladas$(NC)"

db-reset: ## Resetar banco de dados
	@echo "$(YELLOW)🗄️  Resetando banco de dados...$(NC)"
	@npx prisma db push --force-reset
	@npm run db:seed || true
	@echo "$(GREEN)✅ Banco resetado$(NC)"

db-migrate: ## Executar migrations
	@echo "$(BLUE)🗄️  Executando migrations...$(NC)"
	@npx prisma generate
	@npx prisma db push
	@echo "$(GREEN)✅ Migrations executadas$(NC)"

db-seed: ## Executar seed do banco
	@echo "$(BLUE)🌱 Executando seed...$(NC)"
	@npm run db:seed
	@echo "$(GREEN)✅ Seed executado$(NC)"

update: ## Atualizar dependências
	@echo "$(BLUE)⬆️  Atualizando dependências...$(NC)"
	@npm update
	@echo "$(GREEN)✅ Dependências atualizadas$(NC)"

lint: ## Executar linter
	@echo "$(BLUE)🔍 Executando linter...$(NC)"
	@npm run lint
	@echo "$(GREEN)✅ Lint concluído$(NC)"

format: ## Formatar código
	@echo "$(BLUE)✨ Formatando código...$(NC)"
	@npm run format
	@echo "$(GREEN)✅ Código formatado$(NC)"

docs: ## Gerar documentação
	@echo "$(BLUE)📚 Abrindo documentação...$(NC)"
	@echo "$(YELLOW)URLs da documentação:$(NC)"
	@echo "  - Swagger UI: http://localhost:3000/api/docs"
	@echo "  - API Usage: file://$(PWD)/API-USAGE.md"
	@if command -v xdg-open >/dev/null; then xdg-open http://localhost:3000/api/docs; fi
	@if command -v open >/dev/null; then open http://localhost:3000/api/docs; fi

env: ## Configurar arquivo .env
	@echo "$(BLUE)⚙️  Configurando arquivo .env...$(NC)"
	@if [ ! -f .env ]; then cp .env.example .env; echo "$(GREEN)✅ Arquivo .env criado$(NC)"; else echo "$(YELLOW)⚠️  Arquivo .env já existe$(NC)"; fi
	@echo "$(YELLOW)Edite o arquivo .env conforme necessário$(NC)"

ssl: ## Gerar certificados SSL para desenvolvimento
	@echo "$(BLUE)🔒 Gerando certificados SSL...$(NC)"
	@mkdir -p ssl
	@openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout ssl/key.pem -out ssl/cert.pem \
		-subj "/C=BR/ST=SP/L=SaoPaulo/O=ICP-Brasil-API/CN=localhost"
	@echo "$(GREEN)✅ Certificados SSL gerados em ssl/$(NC)"

# Comandos para desenvolvimento
dev-install: env install db-migrate db-seed ## Configuração completa para desenvolvimento

# Comandos para produção
prod-deploy: env build prod ## Deploy completo para produção

# Comando para CI/CD
ci: install lint test ## Pipeline de CI/CD