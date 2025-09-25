-- Script de inicialização do banco de dados ICP-Brasil
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Garantir que o banco está usando UTF-8
SET client_encoding = 'UTF8';

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comentários informativos
COMMENT ON DATABASE icp_signatures IS 'Banco de dados para API de Assinatura Digital ICP-Brasil';

-- Configurações de timezone
SET timezone = 'America/Sao_Paulo';

-- Log das configurações
DO $$
BEGIN
    RAISE NOTICE 'ICP-Brasil Database initialized successfully';
    RAISE NOTICE 'Encoding: %', current_setting('server_encoding');
    RAISE NOTICE 'Timezone: %', current_setting('TimeZone');
END $$;