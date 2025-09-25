/**
 * Cliente JavaScript para API de Assinatura Digital ICP-Brasil
 *
 * Este arquivo demonstra como integrar com a API usando Node.js
 *
 * Instalação das dependências:
 * npm install axios form-data
 *
 * Uso:
 * node examples/api-client.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class ICPBrasilAPIClient {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.token = null;

        // Configurar interceptors para logging
        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor
        axios.interceptors.request.use(
            (config) => {
                console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Erro na requisição:', error.message);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        axios.interceptors.response.use(
            (response) => {
                console.log(`✅ ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                const status = error.response?.status;
                const message = error.response?.data?.message || error.message;
                console.error(`❌ ${status} - ${message}`);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Realizar login na API
     */
    async login(email, password) {
        try {
            console.log('\n🔐 Realizando login...');

            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email,
                password
            });

            this.token = response.data.access_token;

            console.log('✅ Login realizado com sucesso');
            console.log('👤 Usuário:', response.data.user.name);

            return response.data;
        } catch (error) {
            throw new Error(`Erro no login: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Fazer upload de um documento
     */
    async uploadDocument(filePath) {
        try {
            console.log('\n📤 Fazendo upload do documento...');

            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }

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

            console.log('✅ Upload realizado com sucesso');
            console.log('📄 Document ID:', response.data.documentId);
            console.log('📊 Tamanho:', response.data.size, 'bytes');

            return response.data;
        } catch (error) {
            throw new Error(`Erro no upload: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Assinar documento com certificado ICP-Brasil
     */
    async signDocument(documentId, certificatePath, password, hashAlgorithm = 'SHA-256') {
        try {
            console.log('\n🔏 Assinando documento...');

            if (!fs.existsSync(certificatePath)) {
                throw new Error(`Certificado não encontrado: ${certificatePath}`);
            }

            const form = new FormData();
            form.append('certificate', fs.createReadStream(certificatePath));
            form.append('certificatePassword', password);
            form.append('hashAlgorithm', hashAlgorithm);

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

            console.log('✅ Documento assinado com sucesso');
            console.log('🆔 Signature ID:', response.data.signatureId);
            console.log('👤 Signatário:', response.data.certificateInfo.subject);
            console.log('🏢 Emissor:', response.data.certificateInfo.issuer);

            return response.data;
        } catch (error) {
            throw new Error(`Erro na assinatura: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Verificar assinaturas de um documento
     */
    async verifyDocument(documentId) {
        try {
            console.log('\n🔍 Verificando assinaturas...');

            const response = await axios.get(
                `${this.baseURL}/documents/${documentId}/verify`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            console.log('✅ Verificação concluída');
            console.log('📊 Total de assinaturas:', response.data.totalSignatures);

            response.data.signatures.forEach((sig, index) => {
                console.log(`\n🔐 Assinatura ${index + 1}:`);
                console.log('  👤 Signatário:', sig.certificateInfo.subject);
                console.log('  ✅ Válida:', sig.isValid ? 'Sim' : 'Não');
                console.log('  📅 Data:', new Date(sig.signedAt).toLocaleString('pt-BR'));

                if (sig.validationDetails) {
                    console.log('  🔗 Cadeia válida:', sig.validationDetails.chainValid);
                    console.log('  ❌ Revogado:', !sig.validationDetails.notRevoked);
                    console.log('  ⏰ Tempo válido:', sig.validationDetails.timeValid);
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Erro na verificação: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Baixar documento assinado
     */
    async downloadSignedDocument(documentId, outputPath) {
        try {
            console.log('\n📥 Baixando documento assinado...');

            const response = await axios.get(
                `${this.baseURL}/documents/${documentId}/download/signed`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    responseType: 'stream'
                }
            );

            // Criar stream de escrita
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    const stats = fs.statSync(outputPath);
                    console.log('✅ Download concluído');
                    console.log('📁 Arquivo:', outputPath);
                    console.log('📊 Tamanho:', stats.size, 'bytes');
                    resolve(outputPath);
                });

                writer.on('error', (error) => {
                    reject(new Error(`Erro ao salvar arquivo: ${error.message}`));
                });
            });
        } catch (error) {
            throw new Error(`Erro no download: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Listar documentos do usuário
     */
    async getMyDocuments() {
        try {
            console.log('\n📋 Listando meus documentos...');

            const response = await axios.get(
                `${this.baseURL}/users/my-documents`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            console.log('✅ Documentos encontrados:', response.data.documents.length);

            response.data.documents.forEach((doc, index) => {
                console.log(`\n📄 Documento ${index + 1}:`);
                console.log('  🆔 ID:', doc.id);
                console.log('  📝 Nome:', doc.filename);
                console.log('  📅 Upload:', new Date(doc.uploadedAt).toLocaleString('pt-BR'));
                console.log('  🔐 Assinaturas:', doc.signaturesCount);
                console.log('  ✅ Assinado:', doc.isFullySigned ? 'Sim' : 'Não');
            });

            return response.data;
        } catch (error) {
            throw new Error(`Erro ao listar documentos: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Realizar logout
     */
    async logout() {
        try {
            console.log('\n🚪 Realizando logout...');

            await axios.post(
                `${this.baseURL}/auth/logout`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            this.token = null;
            console.log('✅ Logout realizado com sucesso');
        } catch (error) {
            throw new Error(`Erro no logout: ${error.response?.data?.message || error.message}`);
        }
    }
}

// Exemplo de uso completo
async function exemploCompleto() {
    const api = new ICPBrasilAPIClient();

    try {
        console.log('🚀 Iniciando exemplo completo da API ICP-Brasil');
        console.log('================================================');

        // 1. Login
        await api.login('admin@test.com', 'admin123');

        // 2. Listar documentos existentes
        await api.getMyDocuments();

        // 3. Upload de documento
        const documentPath = path.join(__dirname, 'test-document.pdf');
        const upload = await api.uploadDocument(documentPath);

        // 4. Verificar documento (antes da assinatura)
        await api.verifyDocument(upload.documentId);

        // 5. Assinar documento (se certificado estiver disponível)
        const certificatePath = path.join(__dirname, 'test-certificate.p12');
        if (fs.existsSync(certificatePath)) {
            const signature = await api.signDocument(
                upload.documentId,
                certificatePath,
                'test123'
            );

            // 6. Verificar após assinatura
            await api.verifyDocument(upload.documentId);

            // 7. Download do documento assinado
            const outputPath = `documento_assinado_${upload.documentId}.p7s`;
            await api.downloadSignedDocument(upload.documentId, outputPath);
        } else {
            console.log('\n⚠️  Certificado de teste não encontrado, pulando assinatura');
            console.log('   Esperado em:', certificatePath);
        }

        // 8. Logout
        await api.logout();

        console.log('\n🎉 Exemplo concluído com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante a execução:', error.message);
        process.exit(1);
    }
}

// Exemplo simples de login e listagem
async function exemploSimples() {
    const api = new ICPBrasilAPIClient();

    try {
        console.log('🔓 Exemplo simples - Login e listagem de documentos');
        console.log('===================================================');

        // Login
        await api.login('admin@test.com', 'admin123');

        // Listar documentos
        await api.getMyDocuments();

        // Logout
        await api.logout();

        console.log('\n✅ Exemplo simples concluído!');

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    }
}

// Executar exemplo baseado nos argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--simples') || args.includes('-s')) {
    exemploSimples();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📖 Uso do cliente da API ICP-Brasil:

  node examples/api-client.js [opções]

Opções:
  --simples, -s     Executar apenas exemplo simples (login + listagem)
  --help, -h        Mostrar esta ajuda

Exemplos:
  node examples/api-client.js                # Exemplo completo
  node examples/api-client.js --simples      # Exemplo simples

Pré-requisitos:
  - API rodando em http://localhost:3000
  - Usuário admin@test.com com senha admin123 criado
  - Para assinatura: certificado test-certificate.p12 com senha test123

Instalar dependências:
  npm install axios form-data
`);
} else {
    exemploCompleto();
}

// Exportar classe para uso em outros módulos
module.exports = ICPBrasilAPIClient;